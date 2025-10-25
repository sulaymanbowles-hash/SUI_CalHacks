module ticket::policy_admin {
    use sui::tx_context::TxContext;
    use sui::transfer;
    use sui::transfer_policy::{Self, TransferPolicyCap};
    use sui::package::{Self, Publisher};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use ticket::ticket::Ticket;

    /// One-time witness for publisher creation
    public struct POLICY_ADMIN has drop {}

    /// Initialize function - called once when package is published
    fun init(otw: POLICY_ADMIN, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        transfer::public_transfer(publisher, ctx.sender());
    }

    /// Create and share a TransferPolicy<Ticket> for royalty enforcement
    /// 
    /// This policy will be referenced in PTBs during Kiosk purchases to ensure
    /// royalties are paid on every transfer (primary sale and resales).
    /// 
    /// - publisher: Publisher object created during package init
    /// - artist: Primary royalty recipient address (unused for now)
    /// - organizer: Secondary recipient (event organizer) (unused for now)
    /// - platform: Platform fee recipient (unused for now)
    /// 
    /// Note: The current Sui framework TransferPolicy doesn't support multi-recipient
    /// splits directly in the constructor. For M1, we create the policy object and
    /// share it. In M2/M3, we'll add royalty rules via the TransferPolicyCap.
    public entry fun create_policy(
        publisher: &Publisher,
        _artist: address,
        _organizer: address,
        _platform: address,
        ctx: &mut TxContext
    ) {
        // Create TransferPolicy and capability
        let (policy, policy_cap) = transfer_policy::new<Ticket>(
            publisher,
            ctx
        );

        // Share the policy so Kiosk purchases can reference it
        transfer::public_share_object(policy);
        
        // Transfer policy cap to sender for later rule additions
        transfer::public_transfer(policy_cap, ctx.sender());
    }

    /// Destroy the policy and withdraw any accumulated fees
    /// Returns the collected SUI to the caller
    public entry fun destroy_policy(
        policy: transfer_policy::TransferPolicy<Ticket>,
        cap: TransferPolicyCap<Ticket>,
        ctx: &mut TxContext
    ) {
        let coin = transfer_policy::destroy_and_withdraw(policy, cap, ctx);
        transfer::public_transfer(coin, ctx.sender());
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(POLICY_ADMIN {}, ctx);
    }
}
