module ticket::ticket {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use ticket::class::TicketClass;

    /// Ticket already used for check-in
    const E_ALREADY_USED: u64 = 1;

    /// Ownable ticket NFT with check-in tracking
    /// Remains an owned object; Kiosk integration happens in PTBs
    public struct Ticket has key, store {
        id: UID,
        class: ID,
        used: bool,
    }

    /// Mint a new ticket from a ticket class
    /// Transfers ticket to sender by default
    public entry fun mint(
        class: &TicketClass,
        ctx: &mut TxContext
    ) {
        let ticket = Ticket {
            id: object::new(ctx),
            class: class.id(),
            used: false,
        };
        transfer::transfer(ticket, ctx.sender());
    }

    /// Mark ticket as used for check-in
    /// Can only be called once; subsequent calls abort
    public entry fun mark_used(ticket: &mut Ticket) {
        assert!(!ticket.used, E_ALREADY_USED);
        ticket.used = true;
    }

    /// Check if ticket has been used
    public fun is_used(ticket: &Ticket): bool {
        ticket.used
    }

    /// Public accessor for ticket ID
    public fun id(ticket: &Ticket): object::ID {
        object::uid_to_inner(&ticket.id)
    }

    /// Public accessor for class ID
    public fun class_id(ticket: &Ticket): ID {
        ticket.class
    }
}
