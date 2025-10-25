module ticket::event {
    use std::string::String;
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use sui::transfer;

    /// Invalid time window (starts_at must be before ends_at)
    const E_INVALID_WINDOW: u64 = 1;

    /// Event metadata with Walrus poster CID and time window
    public struct Event has key {
        id: UID,
        name: String,
        starts_at: u64,
        ends_at: u64,
        poster_cid: String,
    }

    /// Create a new event with time validation
    /// - name: Event name (e.g., "Taylor Swift Concert")
    /// - starts_at: Unix timestamp (seconds)
    /// - ends_at: Unix timestamp (seconds)
    /// - poster_cid: Walrus content ID for event poster
    public entry fun new(
        name: String,
        starts_at: u64,
        ends_at: u64,
        poster_cid: String,
        ctx: &mut TxContext
    ) {
        assert!(starts_at < ends_at, E_INVALID_WINDOW);
        let event = Event {
            id: object::new(ctx),
            name,
            starts_at,
            ends_at,
            poster_cid,
        };
        transfer::transfer(event, ctx.sender());
    }

    /// Public accessor for event ID (used by class module)
    public fun id(event: &Event): object::ID {
        object::uid_to_inner(&event.id)
    }

    /// Public accessor for event name
    public fun name(event: &Event): &String {
        &event.name
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
}
