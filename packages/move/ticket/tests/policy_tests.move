#[test_only]
module ticket::policy_tests {
    use sui::test_scenario::{Self as ts};
    use sui::package::Publisher;
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
        
        // Initialize the module to get Publisher
        {
            let ctx = ts::ctx(&mut scenario);
            policy_admin::init_for_testing(ctx);
        };
        
        // Create policy using the Publisher
        ts::next_tx(&mut scenario, ARTIST);
        {
            let publisher = ts::take_from_sender<Publisher>(&scenario);
            let ctx = ts::ctx(&mut scenario);
            policy_admin::create_policy(
                &publisher,
                ARTIST,
                ORGANIZER,
                PLATFORM,
                ctx
            );
            ts::return_to_sender(&scenario, publisher);
        };
        
        ts::end(scenario);
    }

    /// Test that multiple policies can be created (not singleton)
    #[test]
    fun test_multiple_policies() {
        let mut scenario = ts::begin(ARTIST);
        
        // Initialize the module to get Publisher
        {
            let ctx = ts::ctx(&mut scenario);
            policy_admin::init_for_testing(ctx);
        };
        
        // Create first policy
        ts::next_tx(&mut scenario, ARTIST);
        {
            let publisher = ts::take_from_sender<Publisher>(&scenario);
            let ctx = ts::ctx(&mut scenario);
            policy_admin::create_policy(&publisher, ARTIST, ORGANIZER, PLATFORM, ctx);
            ts::return_to_sender(&scenario, publisher);
        };
        
        // Create second policy (different recipients)
        ts::next_tx(&mut scenario, ARTIST);
        {
            let publisher = ts::take_from_sender<Publisher>(&scenario);
            let ctx = ts::ctx(&mut scenario);
            policy_admin::create_policy(&publisher, ORGANIZER, PLATFORM, ARTIST, ctx);
            ts::return_to_sender(&scenario, publisher);
        };
        
        ts::end(scenario);
    }
}
