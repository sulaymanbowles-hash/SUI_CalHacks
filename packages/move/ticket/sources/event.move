module ticket::event {
    use std::string::String;
    use std::option;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use sui::dynamic_field as df;
    use ticket::payouts::{Self, Payouts, Recipient};
    use ticket::channel::{Self, Channel};

    /// Invalid time window (starts_at must be before ends_at)
    const E_INVALID_WINDOW: u64 = 1;
    /// Event is not live
    const E_NOT_LIVE: u64 = 2;
    /// Not authorized (sender is not organizer)
    const E_NOT_AUTHORIZED: u64 = 3;
    /// Cannot publish without payouts configured
    const E_PAYOUTS_REQUIRED: u64 = 4;
    /// Cannot publish without active sales channel
    const E_CHANNEL_REQUIRED: u64 = 5;

    /// Event status
    const STATUS_DRAFT: u8 = 0;
    const STATUS_LIVE: u8 = 1;
    const STATUS_PAUSED: u8 = 2;
    const STATUS_ENDED: u8 = 3;

    /// Dynamic field keys
    const KEY_PAYOUTS_ID: vector<u8> = b"payouts_id";
    const KEY_CHANNEL_COUNT: vector<u8> = b"channel_count";

    /// Event metadata with Walrus poster CID and time window
    public struct Event has key {
        id: UID,
        organizer: address,
        name: String,
        location: String,
        starts_at: u64,
        ends_at: u64,
        poster_cid: String,
        status: u8,
        supply_total: u64,
        supply_sold: u64,
    }

    /// Capability to authorize check-ins for an event
    /// Held by organizer or designated gate staff
    public struct GateKeeperCap has key, store {
        id: UID,
        event_id: ID,
    }

    /// Capability to manage event (create payouts, channels, publish)
    /// Held by event organizer
    public struct EventCap has key, store {
        id: UID,
        event_id: ID,
    }

    /// Create a new event with time validation and return capabilities
    /// - name: Event name (e.g., "Taylor Swift Concert")
    /// - location: Venue name or address
    /// - starts_at: Unix timestamp (seconds)
    /// - ends_at: Unix timestamp (seconds)
    /// - poster_cid: Walrus content ID for event poster
    /// - supply_total: Total ticket capacity
    public entry fun new(
        name: String,
        location: String,
        starts_at: u64,
        ends_at: u64,
        poster_cid: String,
        supply_total: u64,
        ctx: &mut TxContext
    ) {
        assert!(starts_at < ends_at, E_INVALID_WINDOW);
        let event_uid = object::new(ctx);
        let event_id = object::uid_to_inner(&event_uid);
        
        let event = Event {
            id: event_uid,
            organizer: ctx.sender(),
            name,
            location,
            starts_at,
            ends_at,
            poster_cid,
            status: STATUS_DRAFT,
            supply_total,
            supply_sold: 0,
        };
        
        // Create GateKeeperCap for check-in authorization
        let gate_cap = GateKeeperCap {
            id: object::new(ctx),
            event_id,
        };
        
        // Create EventCap for management
        let event_cap = EventCap {
            id: object::new(ctx),
            event_id,
        };
        
        transfer::transfer(event, ctx.sender());
        transfer::transfer(gate_cap, ctx.sender());
        transfer::transfer(event_cap, ctx.sender());
    }

    /// Create event with payouts and channel atomically
    /// This ensures the event is immediately publishable after creation
    public entry fun new_with_setup(
        // Event params
        name: String,
        location: String,
        starts_at: u64,
        ends_at: u64,
        poster_cid: String,
        supply_total: u64,
        // Payout params
        recipient_addresses: vector<address>,
        recipient_bps: vector<u16>,
        // Channel params
        channel_kind: u8,
        price_mist: u64,
        channel_start_ts: u64,
        channel_end_ts: u64,
        per_wallet_limit: u16,
        channel_cap: u64,
        ctx: &mut TxContext
    ) {
        assert!(starts_at < ends_at, E_INVALID_WINDOW);
        
        // Create event
        let event_uid = object::new(ctx);
        let event_id = object::uid_to_inner(&event_uid);
        
        let mut event = Event {
            id: event_uid,
            organizer: ctx.sender(),
            name,
            location,
            starts_at,
            ends_at,
            poster_cid,
            status: STATUS_DRAFT,
            supply_total,
            supply_sold: 0,
        };
        
        // Create payouts
        let len = recipient_addresses.length();
        assert!(len == recipient_bps.length(), E_PAYOUTS_REQUIRED);
        
        let mut recipients = vector::empty<Recipient>();
        let mut i = 0;
        while (i < len) {
            recipients.push_back(payouts::new_recipient(
                *recipient_addresses.borrow(i),
                *recipient_bps.borrow(i)
            ));
            i = i + 1;
        };
        
        let payouts_obj = payouts::new(event_id, recipients, ctx);
        let payouts_id = object::id(&payouts_obj);
        
        // Register payouts with event
        df::add(&mut event.id, KEY_PAYOUTS_ID, payouts_id);
        
        // Create and activate channel
        let mut channel = channel::new(
            event_id,
            channel_kind,
            price_mist,
            channel_start_ts,
            channel_end_ts,
            per_wallet_limit,
            channel_cap,
            ctx
        );
        channel::set_active(&mut channel, true);
        
        // Register channel count
        df::add(&mut event.id, KEY_CHANNEL_COUNT, 1u64);
        
        // Create capabilities
        let gate_cap = GateKeeperCap {
            id: object::new(ctx),
            event_id,
        };
        
        let event_cap = EventCap {
            id: object::new(ctx),
            event_id,
        };
        
        // Share/transfer objects
        transfer::public_share_object(payouts_obj);
        transfer::public_share_object(channel);
        transfer::transfer(event, ctx.sender());
        transfer::transfer(gate_cap, ctx.sender());
        transfer::transfer(event_cap, ctx.sender());
    }

    /// Register payouts configuration for this event
    public fun register_payouts(event: &mut Event, cap: &EventCap, payouts_id: ID) {
        assert!(object::uid_to_inner(&event.id) == cap.event_id, E_NOT_AUTHORIZED);
        if (!df::exists_(&event.id, KEY_PAYOUTS_ID)) {
            df::add(&mut event.id, KEY_PAYOUTS_ID, payouts_id);
        };
    }

    /// Register a new channel for this event
    public fun register_channel(event: &mut Event, cap: &EventCap) {
        assert!(object::uid_to_inner(&event.id) == cap.event_id, E_NOT_AUTHORIZED);
        
        if (df::exists_(&event.id, KEY_CHANNEL_COUNT)) {
            let count_mut = df::borrow_mut<vector<u8>, u64>(&mut event.id, KEY_CHANNEL_COUNT);
            *count_mut = *count_mut + 1;
        } else {
            df::add(&mut event.id, KEY_CHANNEL_COUNT, 1u64);
        };
    }

    /// Publish event (set to LIVE status)
    /// Enforces prerequisites:
    /// - Payouts must be configured
    /// - At least one sales channel must exist
    public entry fun publish(event: &mut Event, cap: &EventCap, ctx: &TxContext) {
        assert!(event.organizer == ctx.sender(), E_NOT_AUTHORIZED);
        assert!(object::uid_to_inner(&event.id) == cap.event_id, E_NOT_AUTHORIZED);
        
        // Check prerequisites
        assert!(df::exists_(&event.id, KEY_PAYOUTS_ID), E_PAYOUTS_REQUIRED);
        
        let channel_count = if (df::exists_(&event.id, KEY_CHANNEL_COUNT)) {
            *df::borrow<vector<u8>, u64>(&event.id, KEY_CHANNEL_COUNT)
        } else {
            0
        };
        assert!(channel_count > 0, E_CHANNEL_REQUIRED);
        
        event.status = STATUS_LIVE;
    }

    /// Pause event sales (can only be called by organizer)
    public entry fun pause(event: &mut Event, cap: &EventCap, ctx: &TxContext) {
        assert!(event.organizer == ctx.sender(), E_NOT_AUTHORIZED);
        assert!(object::uid_to_inner(&event.id) == cap.event_id, E_NOT_AUTHORIZED);
        event.status = STATUS_PAUSED;
    }

    /// Resume paused event (can only be called by organizer)
    public entry fun resume(event: &mut Event, cap: &EventCap, ctx: &TxContext) {
        assert!(event.organizer == ctx.sender(), E_NOT_AUTHORIZED);
        assert!(object::uid_to_inner(&event.id) == cap.event_id, E_NOT_AUTHORIZED);
        event.status = STATUS_LIVE;
    }

    /// Increment sold counter (called during ticket sales)
    public fun increment_sold(event: &mut Event) {
        event.supply_sold = event.supply_sold + 1;
    }

    /// Public accessor for event ID (used by class module)
    public fun id(event: &Event): ID {
        object::uid_to_inner(&event.id)
    }

    /// Public accessor for organizer address
    public fun organizer(event: &Event): address {
        event.organizer
    }

    /// Public accessor for event name
    public fun name(event: &Event): &String {
        &event.name
    }

    /// Public accessor for location
    public fun location(event: &Event): &String {
        &event.location
    }

    /// Public accessor for start time
    public fun starts_at(event: &Event): u64 {
        event.starts_at
    }

    /// Public accessor for end time
    public fun ends_at(event: &Event): u64 {
        event.ends_at
    }

    /// Public accessor for poster CID
    public fun poster_cid(event: &Event): &String {
        &event.poster_cid
    }

    /// Public accessor for status
    public fun status(event: &Event): u8 {
        event.status
    }

    /// Check if event is live
    public fun is_live(event: &Event): bool {
        event.status == STATUS_LIVE
    }

    /// Public accessor for total supply
    public fun supply_total(event: &Event): u64 {
        event.supply_total
    }

    /// Public accessor for sold count
    public fun supply_sold(event: &Event): u64 {
        event.supply_sold
    }

    /// Check if payouts are configured
    public fun has_payouts(event: &Event): bool {
        df::exists_(&event.id, KEY_PAYOUTS_ID)
    }

    /// Get payouts ID if configured
    public fun payouts_id(event: &Event): option::Option<ID> {
        if (df::exists_(&event.id, KEY_PAYOUTS_ID)) {
            option::some(*df::borrow<vector<u8>, ID>(&event.id, KEY_PAYOUTS_ID))
        } else {
            option::none()
        }
    }

    /// Check if channels are configured
    public fun has_channels(event: &Event): bool {
        if (df::exists_(&event.id, KEY_CHANNEL_COUNT)) {
            *df::borrow<vector<u8>, u64>(&event.id, KEY_CHANNEL_COUNT) > 0
        } else {
            false
        }
    }

    /// Verify GateKeeperCap belongs to this event
    public fun verify_cap(cap: &GateKeeperCap, event: &Event): bool {
        cap.event_id == object::uid_to_inner(&event.id)
    }

    /// Get event ID from GateKeeperCap
    public fun cap_event_id(cap: &GateKeeperCap): ID {
        cap.event_id
    }

    /// Verify EventCap belongs to this event
    public fun verify_event_cap(cap: &EventCap, event: &Event): bool {
        cap.event_id == object::uid_to_inner(&event.id)
    }

    /// Get event ID from EventCap
    public fun event_cap_event_id(cap: &EventCap): ID {
        cap.event_id
    }
}
