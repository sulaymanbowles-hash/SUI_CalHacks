module ticket::channel {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use ticket::event::Event;
    use ticket::payouts::Payouts;

    /// Channel not active
    const E_CHANNEL_NOT_ACTIVE: u64 = 1;
    /// Channel not started yet
    const E_NOT_STARTED: u64 = 2;
    /// Channel has ended
    const E_ENDED: u64 = 3;
    /// Per-wallet limit exceeded
    const E_WALLET_LIMIT_EXCEEDED: u64 = 4;
    /// Channel sold out
    const E_SOLD_OUT: u64 = 5;
    /// Incorrect payment amount
    const E_INCORRECT_PAYMENT: u64 = 6;
    /// Event not live
    const E_EVENT_NOT_LIVE: u64 = 7;
    /// Payouts not configured
    const E_PAYOUTS_MISSING: u64 = 8;
    /// Not authorized
    const E_NOT_AUTHORIZED: u64 = 9;

    /// Channel kind: Primary sale
    const KIND_PRIMARY: u8 = 0;
    /// Future: Presale/allowlist
    const KIND_PRESALE: u8 = 1;
    /// Future: Box office
    const KIND_BOX_OFFICE: u8 = 2;
    /// Future: Affiliate
    const KIND_AFFILIATE: u8 = 3;

    /// Sales channel configuration
    /// Controls pricing, timing, and limits for ticket sales
    public struct Channel has key, store {
        id: UID,
        event_id: ID,
        kind: u8,
        price_mist: u64,
        start_ts: u64,
        end_ts: u64,
        per_wallet_limit: u16,
        active: bool,
        sold: u64,
        cap: u64,
        /// Track purchases per wallet
        purchases: Table<address, u16>,
    }

    /// Create a new sales channel
    public fun new(
        event_id: ID,
        kind: u8,
        price_mist: u64,
        start_ts: u64,
        end_ts: u64,
        per_wallet_limit: u16,
        cap: u64,
        ctx: &mut TxContext
    ): Channel {
        Channel {
            id: object::new(ctx),
            event_id,
            kind,
            price_mist,
            start_ts,
            end_ts,
            per_wallet_limit,
            active: false,
            sold: 0,
            cap,
            purchases: table::new(ctx),
        }
    }

    /// Activate or deactivate a channel
    public fun set_active(channel: &mut Channel, active: bool) {
        channel.active = active;
    }

    /// Check if channel can process a purchase
    public fun can_purchase(
        channel: &Channel,
        buyer: address,
        clock: &Clock
    ): bool {
        if (!channel.active) return false;
        
        let now = clock::timestamp_ms(clock) / 1000;
        if (now < channel.start_ts || now > channel.end_ts) return false;
        
        if (channel.sold >= channel.cap) return false;
        
        // Check per-wallet limit
        if (table::contains(&channel.purchases, buyer)) {
            let purchased = *table::borrow(&channel.purchases, buyer);
            if (purchased >= channel.per_wallet_limit) return false;
        };
        
        true
    }

    /// Record a purchase (increments counters)
    public fun record_purchase(
        channel: &mut Channel,
        buyer: address,
    ) {
        channel.sold = channel.sold + 1;
        
        if (table::contains(&channel.purchases, buyer)) {
            let count_mut = table::borrow_mut(&mut channel.purchases, buyer);
            *count_mut = *count_mut + 1;
        } else {
            table::add(&mut channel.purchases, buyer, 1);
        };
    }

    /// Entry function: Create and share a channel
    public entry fun create_and_activate(
        event_id: ID,
        kind: u8,
        price_mist: u64,
        start_ts: u64,
        end_ts: u64,
        per_wallet_limit: u16,
        cap: u64,
        ctx: &mut TxContext
    ) {
        let mut channel = new(
            event_id,
            kind,
            price_mist,
            start_ts,
            end_ts,
            per_wallet_limit,
            cap,
            ctx
        );
        channel.active = true;
        transfer::share_object(channel);
    }

    /// Entry function: Toggle channel active status
    public entry fun toggle_active(
        channel: &mut Channel,
        active: bool,
        _ctx: &TxContext
    ) {
        channel.active = active;
    }

    // Accessors

    public fun event_id(channel: &Channel): ID {
        channel.event_id
    }

    public fun kind(channel: &Channel): u8 {
        channel.kind
    }

    public fun price_mist(channel: &Channel): u64 {
        channel.price_mist
    }

    public fun start_ts(channel: &Channel): u64 {
        channel.start_ts
    }

    public fun end_ts(channel: &Channel): u64 {
        channel.end_ts
    }

    public fun per_wallet_limit(channel: &Channel): u16 {
        channel.per_wallet_limit
    }

    public fun is_active(channel: &Channel): bool {
        channel.active
    }

    public fun sold(channel: &Channel): u64 {
        channel.sold
    }

    public fun cap(channel: &Channel): u64 {
        channel.cap
    }

    public fun remaining(channel: &Channel): u64 {
        channel.cap - channel.sold
    }

    public fun wallet_purchased(channel: &Channel, buyer: address): u16 {
        if (table::contains(&channel.purchases, buyer)) {
            *table::borrow(&channel.purchases, buyer)
        } else {
            0
        }
    }
}
