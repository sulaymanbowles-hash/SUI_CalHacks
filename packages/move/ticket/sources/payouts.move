module ticket::payouts {
    use std::vector;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::vec_map::{Self, VecMap};

    /// Invalid number of recipients (must be 1-4)
    const E_INVALID_RECIPIENT_COUNT: u64 = 1;
    /// Total basis points exceed 10000 (100%)
    const E_INVALID_BPS_SUM: u64 = 2;
    /// Duplicate recipient address
    const E_DUPLICATE_RECIPIENT: u64 = 3;
    /// Not authorized (sender is not event owner)
    const E_NOT_AUTHORIZED: u64 = 4;
    /// Payouts not configured
    const E_PAYOUTS_NOT_CONFIGURED: u64 = 5;

    /// Maximum basis points (100%)
    const MAX_BPS: u16 = 10000;

    /// Payout recipient configuration
    public struct Recipient has store, copy, drop {
        to: address,
        bps: u16,
    }

    /// Payouts configuration for an event
    /// Defines how sale proceeds are split between recipients
    public struct Payouts has key, store {
        id: UID,
        event_id: ID,
        recipients: vector<Recipient>,
        total_bps: u16,
    }

    /// Create or update payouts configuration
    /// - event_id: ID of the event these payouts apply to
    /// - recipients: Vector of (address, bps) pairs
    /// Validates:
    /// - 1-4 recipients
    /// - sum(bps) <= 10000
    /// - no duplicate addresses
    public fun new(
        event_id: ID,
        recipients: vector<Recipient>,
        ctx: &mut TxContext
    ): Payouts {
        let len = vector::length(&recipients);
        assert!(len > 0 && len <= 4, E_INVALID_RECIPIENT_COUNT);

        // Validate no duplicates and sum BPS
        let mut total_bps: u16 = 0;
        let mut seen = vec_map::empty<address, bool>();
        let mut i = 0;
        while (i < len) {
            let recipient = vector::borrow(&recipients, i);
            assert!(!vec_map::contains(&seen, &recipient.to), E_DUPLICATE_RECIPIENT);
            vec_map::insert(&mut seen, recipient.to, true);
            total_bps = total_bps + recipient.bps;
            i = i + 1;
        };
        
        assert!(total_bps <= MAX_BPS, E_INVALID_BPS_SUM);

        Payouts {
            id: object::new(ctx),
            event_id,
            recipients,
            total_bps,
        }
    }

    /// Split payment according to payout configuration
    /// Sends coins to recipients and returns remaining coin
    public fun split_payment(
        payouts: &Payouts,
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext
    ): Coin<SUI> {
        let total_amount = coin::value(payment);
        let mut i = 0;
        let len = vector::length(&payouts.recipients);
        
        while (i < len) {
            let recipient = vector::borrow(&payouts.recipients, i);
            // Calculate split: (amount * bps) / 10000
            let split_amount = ((total_amount as u128) * (recipient.bps as u128) / (MAX_BPS as u128) as u64);
            
            if (split_amount > 0) {
                let split_coin = coin::split(payment, split_amount, ctx);
                transfer::public_transfer(split_coin, recipient.to);
            };
            
            i = i + 1;
        };
        
        // Return remaining coin (calculate remaining value first to avoid double borrow)
        let remaining = coin::value(payment);
        coin::split(payment, remaining, ctx)
    }

    /// Entry function to create and share payouts configuration
    public entry fun create_and_share(
        event_id: ID,
        recipient_addresses: vector<address>,
        recipient_bps: vector<u16>,
        ctx: &mut TxContext
    ) {
        let len = vector::length(&recipient_addresses);
        assert!(len == vector::length(&recipient_bps), E_INVALID_RECIPIENT_COUNT);
        
        let mut recipients = vector::empty<Recipient>();
        let mut i = 0;
        while (i < len) {
            vector::push_back(&mut recipients, Recipient {
                to: *vector::borrow(&recipient_addresses, i),
                bps: *vector::borrow(&recipient_bps, i),
            });
            i = i + 1;
        };
        
        let payouts = new(event_id, recipients, ctx);
        transfer::share_object(payouts);
    }

    // Accessors
    
    public fun event_id(payouts: &Payouts): ID {
        payouts.event_id
    }

    public fun recipients(payouts: &Payouts): &vector<Recipient> {
        &payouts.recipients
    }

    public fun total_bps(payouts: &Payouts): u16 {
        payouts.total_bps
    }

    public fun recipient_address(recipient: &Recipient): address {
        recipient.to
    }

    public fun recipient_bps(recipient: &Recipient): u16 {
        recipient.bps
    }

    /// Check if payouts are properly configured (sum to 100%)
    public fun is_complete(payouts: &Payouts): bool {
        payouts.total_bps == MAX_BPS
    }
}
