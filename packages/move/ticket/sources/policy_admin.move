module ticket::policy_admin {
    use sui::tx_context::TxContext;
    use sui::transfer;
    use sui::transfer_policy::{Self, TransferPolicy, TransferPolicyCap};
    use sui::package::{Self, Publisher};
    use ticket::ticket::Ticket;

    /// One-time witness for publisher creation
    public struct POLICY_ADMIN has drop {}

    /// Create and share a TransferPolicy<Ticket> for royalty enforcement
    /// 
    /// This policy will be referenced in PTBs during Kiosk purchases to ensure
    /// royalties are paid on every transfer (primary sale and resales).
    /// 
    /// - artist: Primary royalty recipient address
    /// - organizer: Secondary recipient (event organizer)
    /// - platform: Platform fee recipient
    /// 
    /// Note: The current Sui framework TransferPolicy doesn't support multi-recipient
    /// splits directly in the constructor. For M1, we create the policy object and
    /// share it. In M2/M3, we'll add royalty rules via the TransferPolicyCap.
    public entry fun create_policy(
        _artist: address,
        _organizer: address,
        _platform: address,
        ctx: &mut TxContext
    ) {
        // Create a publisher claim (needed for TransferPolicy creation)
        // In production, this would be created via package::claim with OTW
        let publisher = package::test_claim<POLICY_ADMIN>(POLICY_ADMIN {}, ctx);
        
        // Create TransferPolicy and capability
        let (policy, policy_cap) = transfer_policy::new<Ticket>(
            &publisher,
            ctx
        );

        // Share the policy so Kiosk purchases can reference it
        transfer::public_share_object(policy);
        
        // Transfer policy cap to sender for later rule additions
        transfer::public_transfer(policy_cap, ctx.sender());
        
        // Transfer publisher to sender
        transfer::public_transfer(publisher, ctx.sender());
    }

    /// Destroy the policy cap (for testing only)
    public entry fun destroy_policy_cap(cap: TransferPolicyCap<Ticket>) {
        transfer_policy::destroy_and_withdraw(cap);
    }
}
