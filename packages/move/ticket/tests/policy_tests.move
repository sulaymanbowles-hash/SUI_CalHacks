#[test_only]
module ticket::policy_tests {
    use sui::test_scenario::{Self as ts};
    use ticket::policy_admin;

    const ARTIST: address = @0x1;
    const ORGANIZER: address = @0x2;
    const PLATFORM: address = @0x3;

    /// Test that policy creation succeeds without aborting
    /// We don't assert on internal policy state (framework-dependent)
    /// but verify the entry function executes cleanly
    #[test]
    fun test_create_policy_succeeds() {
        let mut scenario = ts::begin(ARTIST);
        {
            let ctx = ts::ctx(&mut scenario);
            policy_admin::create_policy(
                ARTIST,
                ORGANIZER,
                PLATFORM,
                ctx
            );
        };
        ts::end(scenario);
    }

    /// Test that multiple policies can be created (not singleton)
    #[test]
    fun test_multiple_policies() {
        let mut scenario = ts::begin(ARTIST);
        
        // Create first policy
        {
            let ctx = ts::ctx(&mut scenario);
            policy_admin::create_policy(ARTIST, ORGANIZER, PLATFORM, ctx);
        };
        
        // Create second policy (different recipients)
        ts::next_tx(&mut scenario, ORGANIZER);
        {
            let ctx = ts::ctx(&mut scenario);
            policy_admin::create_policy(ORGANIZER, PLATFORM, ARTIST, ctx);
        };
        
        ts::end(scenario);
    }
}
