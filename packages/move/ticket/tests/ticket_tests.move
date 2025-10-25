#[test_only]
module ticket::ticket_tests {
    use std::string;
    use sui::test_scenario::{Self as ts, Scenario};
    use ticket::event;
    use ticket::class;
    use ticket::ticket;

    const ADMIN: address = @0xAD;

    /// Test full flow: create event, create class, mint ticket, check-in
    #[test]
    fun test_mint_and_use_ticket() {
        let mut scenario = ts::begin(ADMIN);
        
        // Create event
        {
            let ctx = ts::ctx(&mut scenario);
            event::new(
                string::utf8(b"Rock Concert"),
                1000, // starts_at
                2000, // ends_at
                string::utf8(b"walrus://QmXYZ123"),
                ctx
            );
        };
        
        // Create ticket class
        ts::next_tx(&mut scenario, ADMIN);
        {
            let event_obj = ts::take_from_sender<event::Event>(&scenario);
            let ctx = ts::ctx(&mut scenario);
            class::new(
                &event_obj,
                250_000_000, // 0.25 SUI face price
                100, // supply
                ctx
            );
            ts::return_to_sender(&scenario, event_obj);
        };
        
        // Mint ticket
        ts::next_tx(&mut scenario, ADMIN);
        {
            let class_obj = ts::take_from_sender<class::TicketClass>(&scenario);
            let ctx = ts::ctx(&mut scenario);
            ticket::mint(&class_obj, ctx);
            ts::return_to_sender(&scenario, class_obj);
        };
        
        // Check-in: mark as used
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut ticket_obj = ts::take_from_sender<ticket::Ticket>(&scenario);
            assert!(!ticket::is_used(&ticket_obj), 0);
            ticket::mark_used(&mut ticket_obj);
            assert!(ticket::is_used(&ticket_obj), 1);
            ts::return_to_sender(&scenario, ticket_obj);
        };
        
        ts::end(scenario);
    }

    /// Test that marking a ticket as used twice aborts
    #[test]
    #[expected_failure(abort_code = 1)] // E_ALREADY_USED
    fun test_double_use_aborts() {
        let mut scenario = ts::begin(ADMIN);
        
        // Create event
        {
            let ctx = ts::ctx(&mut scenario);
            event::new(
                string::utf8(b"Test Event"),
                100,
                200,
                string::utf8(b"walrus://cid"),
                ctx
            );
        };
        
        // Create class
        ts::next_tx(&mut scenario, ADMIN);
        {
            let event_obj = ts::take_from_sender<event::Event>(&scenario);
            let ctx = ts::ctx(&mut scenario);
            class::new(&event_obj, 100_000_000, 50, ctx);
            ts::return_to_sender(&scenario, event_obj);
        };
        
        // Mint ticket
        ts::next_tx(&mut scenario, ADMIN);
        {
            let class_obj = ts::take_from_sender<class::TicketClass>(&scenario);
            let ctx = ts::ctx(&mut scenario);
            ticket::mint(&class_obj, ctx);
            ts::return_to_sender(&scenario, class_obj);
        };
        
        // Mark used twice (should abort on second call)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut ticket_obj = ts::take_from_sender<ticket::Ticket>(&scenario);
            ticket::mark_used(&mut ticket_obj);
            ticket::mark_used(&mut ticket_obj); // Should abort here
            ts::return_to_sender(&scenario, ticket_obj);
        };
        
        ts::end(scenario);
    }

    /// Test event time validation
    #[test]
    #[expected_failure(abort_code = 1)] // E_INVALID_WINDOW
    fun test_invalid_time_window_aborts() {
        let mut scenario = ts::begin(ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            // ends_at before starts_at should abort
            event::new(
                string::utf8(b"Invalid Event"),
                2000, // starts_at
                1000, // ends_at (invalid!)
                string::utf8(b"walrus://cid"),
                ctx
            );
        };
        ts::end(scenario);
    }

    /// Test zero supply validation
    #[test]
    #[expected_failure(abort_code = 1)] // E_ZERO_SUPPLY
    fun test_zero_supply_aborts() {
        let mut scenario = ts::begin(ADMIN);
        
        // Create event
        {
            let ctx = ts::ctx(&mut scenario);
            event::new(
                string::utf8(b"Test Event"),
                100,
                200,
                string::utf8(b"walrus://cid"),
                ctx
            );
        };
        
        // Try to create class with zero supply (should abort)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let event_obj = ts::take_from_sender<event::Event>(&scenario);
            let ctx = ts::ctx(&mut scenario);
            class::new(&event_obj, 100_000_000, 0, ctx); // Zero supply!
            ts::return_to_sender(&scenario, event_obj);
        };
        
        ts::end(scenario);
    }
}
