module ticket::class {
    use std::string::String;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use ticket::event::Event;

    /// Zero supply not allowed
    const E_ZERO_SUPPLY: u64 = 1;
    /// Sold out
    const E_SOLD_OUT: u64 = 2;

    /// Ticket class defines pricing, supply, and royalty splits for an event
    /// All prices are in SUI mist (1 SUI = 1_000_000_000 mist)
    public struct TicketClass has key {
        id: UID,
        event: ID,
        name: String,
        color: String,
        face_price_mist: u64,
        supply: u64,
        sold: u64,
        artist_address: address,
        organizer_address: address,
        artist_bps: u16,      // Basis points (10000 = 100%)
        organizer_bps: u16,   // Basis points
    }

    /// Create a new ticket class for an event with royalty config
    /// - event: Reference to parent event
    /// - name: Ticket type name (e.g., "General Admission", "VIP")
    /// - color: Hex color code for UI display (e.g., "#4DA2FF")
    /// - face_price_mist: Face value in mist (e.g., 250_000_000 = 0.25 SUI)
    /// - supply: Total tickets available (general admission, no seats)
    /// - artist_address: Primary royalty recipient
    /// - organizer_address: Secondary royalty recipient
    /// - artist_bps: Artist royalty in basis points (9000 = 90%)
    /// - organizer_bps: Organizer royalty in basis points (800 = 8%)
    public entry fun new(
        event: &Event,
        name: String,
        color: String,
        face_price_mist: u64,
        supply: u64,
        artist_address: address,
        organizer_address: address,
        artist_bps: u16,
        organizer_bps: u16,
        ctx: &mut TxContext
    ) {
        assert!(supply > 0, E_ZERO_SUPPLY);
        let class = TicketClass {
            id: object::new(ctx),
            event: event.id(),
            name,
            color,
            face_price_mist,
            supply,
            sold: 0,
            artist_address,
            organizer_address,
            artist_bps,
            organizer_bps,
        };
        transfer::transfer(class, ctx.sender());
    }

    /// Increment sold counter (called during minting)
    public fun increment_sold(class: &mut TicketClass) {
        assert!(class.sold < class.supply, E_SOLD_OUT);
        class.sold = class.sold + 1;
    }

    /// Public accessor for class ID (used by ticket module)
    public fun id(class: &TicketClass): object::ID {
        object::uid_to_inner(&class.id)
    }

    /// Public accessor for event ID
    public fun event_id(class: &TicketClass): ID {
        class.event
    }

    /// Public accessor for name
    public fun name(class: &TicketClass): &String {
        &class.name
    }

    /// Public accessor for color
    public fun color(class: &TicketClass): &String {
        &class.color
    }

    /// Public accessor for face price in mist
    public fun face_price_mist(class: &TicketClass): u64 {
        class.face_price_mist
    }

    /// Public accessor for supply
    public fun supply(class: &TicketClass): u64 {
        class.supply
    }

    /// Public accessor for sold count
    public fun sold(class: &TicketClass): u64 {
        class.sold
    }

    /// Public accessor for artist address
    public fun artist_address(class: &TicketClass): address {
        class.artist_address
    }

    /// Public accessor for organizer address
    public fun organizer_address(class: &TicketClass): address {
        class.organizer_address
    }

    /// Public accessor for artist BPS
    public fun artist_bps(class: &TicketClass): u16 {
        class.artist_bps
    }

    /// Public accessor for organizer BPS
    public fun organizer_bps(class: &TicketClass): u16 {
        class.organizer_bps
    }

    /// Check if ticket class is sold out
    public fun is_sold_out(class: &TicketClass): bool {
        class.sold >= class.supply
    }

    /// Get remaining supply
    public fun remaining(class: &TicketClass): u64 {
        class.supply - class.sold
    }
}
