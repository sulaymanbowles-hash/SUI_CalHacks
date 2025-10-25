module ticket::class {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use ticket::event::Event;

    /// Zero supply not allowed
    const E_ZERO_SUPPLY: u64 = 1;

    /// Ticket class defines pricing and supply for an event
    /// All prices are in SUI mist (1 SUI = 1_000_000_000 mist)
    public struct TicketClass has key {
        id: UID,
        event: ID,
        face_price_mist: u64,
        supply: u64,
    }

    /// Create a new ticket class for an event
    /// - event: Reference to parent event
    /// - face_price_mist: Face value in mist (e.g., 250_000_000 = 0.25 SUI)
    /// - supply: Total tickets available (general admission, no seats)
    public entry fun new(
        event: &Event,
        face_price_mist: u64,
        supply: u64,
        ctx: &mut TxContext
    ) {
        assert!(supply > 0, E_ZERO_SUPPLY);
        let class = TicketClass {
            id: object::new(ctx),
            event: event.id(),
            face_price_mist,
            supply,
        };
        transfer::transfer(class, ctx.sender());
    }

    /// Public accessor for class ID (used by ticket module)
    public fun id(class: &TicketClass): object::ID {
        object::uid_to_inner(&class.id)
    }

    /// Public accessor for event ID
    public fun event_id(class: &TicketClass): ID {
        class.event
    }

    /// Public accessor for face price in mist
    public fun face_price_mist(class: &TicketClass): u64 {
        class.face_price_mist
    }

    /// Public accessor for supply
    public fun supply(class: &TicketClass): u64 {
        class.supply
    }
}
