module ticket::ticket {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use ticket::class::TicketClass;
    use ticket::event::{Event, GateKeeperCap};

    /// Ticket already used for check-in
    const E_ALREADY_USED: u64 = 1;
    /// GateKeeperCap doesn't match ticket's event
    const E_WRONG_EVENT: u64 = 2;

    /// Ownable ticket NFT with check-in tracking
    /// Remains an owned object; Kiosk integration happens in PTBs
    public struct Ticket has key, store {
        id: UID,
        class: ID,
        event: ID,
        used: bool,
    }

    /// Mint a new ticket from a ticket class
    /// Transfers ticket to sender by default
    public entry fun mint(
        class: &mut TicketClass,
        ctx: &mut TxContext
    ) {
        class.increment_sold();
        let ticket = Ticket {
            id: object::new(ctx),
            class: class.id(),
            event: class.event_id(),
            used: false,
        };
        transfer::transfer(ticket, ctx.sender());
    }

    /// Mark ticket as used for check-in (requires GateKeeperCap)
    /// Can only be called once; subsequent calls abort with E_ALREADY_USED
    /// Cap must match the ticket's event (E_WRONG_EVENT)
    public entry fun check_in(
        cap: &GateKeeperCap,
        ticket: &mut Ticket,
    ) {
        assert!(!ticket.used, E_ALREADY_USED);
        assert!(cap.cap_event_id() == ticket.event, E_WRONG_EVENT);
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

    /// Public accessor for event ID
    public fun event_id(ticket: &Ticket): ID {
        ticket.event
    }
}
