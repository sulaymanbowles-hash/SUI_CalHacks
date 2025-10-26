import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const PACKAGE_ID = '0xbab930f22032026668a650f16bd23e594bc8c69c8e86c4b2ec495dc02f93bbcf';
const PRIVATE_KEY = 'suiprivkey1qqwksvl9nlvzjddrjpsnz5zh0hyllzrxsd2jjwell4uvq6ervqyy72xnery';

async function testEventCreation() {
  const client = new SuiClient({ url: getFullnodeUrl('testnet') });
  const keypair = Ed25519Keypair.fromSecretKey(PRIVATE_KEY);
  const address = keypair.getPublicKey().toSuiAddress();
  
  console.log('🧪 Testing Event Creation (Separate Transactions)');
  console.log('Wallet:', address);
  
  // Check balance
  const balance = await client.getBalance({ owner: address });
  console.log('Balance:', Number(balance.totalBalance) / 1e9, 'SUI\n');
  
  if (Number(balance.totalBalance) < 1e8) {
    console.error('❌ Insufficient balance (need at least 0.1 SUI)');
    return;
  }
  
  const now = Math.floor(Date.now() / 1000);
  const startsAt = now + 86400; // Tomorrow
  const endsAt = now + 90000; // Tomorrow + 1 hour
  
  // Transaction 1: Create Event
  console.log('📝 Step 1: Creating event...');
  const tx1 = new Transaction();
  tx1.moveCall({
    target: `${PACKAGE_ID}::event::new`,
    arguments: [
      tx1.pure.string('Test Event'),
      tx1.pure.string('Test Venue'),
      tx1.pure.u64(startsAt),
      tx1.pure.u64(endsAt),
      tx1.pure.string('walrus://test'),
      tx1.pure.u64(100), // supply_total
    ],
  });
  tx1.setGasBudget(10_000_000);
  
  try {
    const result1 = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx1,
      options: { showEffects: true, showObjectChanges: true },
    });
    
    if (result1.effects?.status?.status !== 'success') {
      console.error('❌ Event creation failed:', result1.effects?.status?.error);
      return;
    }
    
    // Find Event object (not EventCap!)
    const eventChange = result1.objectChanges?.find((c: any) => 
      c.type === 'created' && 
      c.objectType?.includes('::event::Event') &&
      !c.objectType?.includes('::event::EventCap') &&
      !c.objectType?.includes('::event::GateKeeperCap')
    );
    const eventId = eventChange?.objectId;
    
    const gateKeeperCapId = result1.objectChanges?.find((c: any) => 
      c.type === 'created' && c.objectType?.includes('::event::GateKeeperCap')
    )?.objectId;
    
    const eventCapId = result1.objectChanges?.find((c: any) => 
      c.type === 'created' && c.objectType?.includes('::event::EventCap')
    )?.objectId;
    
    if (!eventId) {
      console.error('❌ Failed to extract event ID');
      console.log('Object changes:', JSON.stringify(result1.objectChanges, null, 2));
      return;
    }
    
    console.log('✅ Event created:', eventId);
    console.log('   GateKeeperCap:', gateKeeperCapId);
    console.log('   EventCap:', eventCapId);
    
    // Wait for finalization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Transaction 2: Create TicketClass
    console.log('\n📝 Step 2: Creating ticket class...');
    const tx2 = new Transaction();
    tx2.moveCall({
      target: `${PACKAGE_ID}::class::new`,
      arguments: [
        tx2.object(eventId),
        tx2.pure.string('General Admission'),
        tx2.pure.string('#4DA2FF'),
        tx2.pure.u64(500_000_000), // 0.5 SUI
        tx2.pure.u64(100),
        tx2.pure.address(address),
        tx2.pure.address(address),
        tx2.pure.u16(9000),
        tx2.pure.u16(800),
      ],
    });
    tx2.setGasBudget(5_000_000);
    
    const result2 = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx2,
      options: { showEffects: true, showObjectChanges: true },
    });
    
    if (result2.effects?.status?.status !== 'success') {
      console.error('❌ Class creation failed:', result2.effects?.status?.error);
      return;
    }
    
    const classId = result2.objectChanges?.find((c: any) => 
      c.type === 'created' && c.objectType?.includes('::class::TicketClass')
    )?.objectId;
    
    if (!classId) {
      console.error('❌ Failed to extract class ID');
      return;
    }
    
    console.log('✅ TicketClass created:', classId);
    
    // Wait for finalization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Transaction 3: Mint ticket
    console.log('\n📝 Step 3: Minting ticket...');
    const tx3 = new Transaction();
    tx3.moveCall({
      target: `${PACKAGE_ID}::ticket::mint`,
      arguments: [tx3.object(classId)],
    });
    tx3.setGasBudget(5_000_000);
    
    const result3 = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx3,
      options: { showEffects: true, showObjectChanges: true },
    });
    
    if (result3.effects?.status?.status !== 'success') {
      console.error('❌ Ticket minting failed:', result3.effects?.status?.error);
      return;
    }
    
    const ticketId = result3.objectChanges?.find((c: any) => 
      c.type === 'created' && c.objectType?.includes('::ticket::Ticket')
    )?.objectId;
    
    if (!ticketId) {
      console.error('❌ Failed to extract ticket ID');
      return;
    }
    
    console.log('✅ Ticket minted:', ticketId);
    
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\n📦 Summary:');
    console.log('Event ID:', eventId);
    console.log('TicketClass ID:', classId);
    console.log('Ticket ID:', ticketId);
    console.log('GateKeeperCap ID:', gateKeeperCapId);
    console.log('EventCap ID:', eventCapId);
    
    console.log('\n🔗 Explorer Links:');
    console.log(`Event TX: https://testnet.suivision.xyz/txblock/${result1.digest}`);
    console.log(`Class TX: https://testnet.suivision.xyz/txblock/${result2.digest}`);
    console.log(`Ticket TX: https://testnet.suivision.xyz/txblock/${result3.digest}`);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

testEventCreation().catch(console.error);
