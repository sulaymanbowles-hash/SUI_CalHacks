import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const PACKAGE_ID = '0xbab930f22032026668a650f16bd23e594bc8c69c8e86c4b2ec495dc02f93bbcf';
const PRIVATE_KEY = 'suiprivkey1qqwksvl9nlvzjddrjpsnz5zh0hyllzrxsd2jjwell4uvq6ervqyy72xnery';

async function testEventCreation() {
  const client = new SuiClient({ url: getFullnodeUrl('testnet') });
  const keypair = Ed25519Keypair.fromSecretKey(PRIVATE_KEY);
  const address = keypair.getPublicKey().toSuiAddress();
  
  console.log('🧪 Testing Event Creation');
  console.log('Wallet:', address);
  
  // Check balance
  const balance = await client.getBalance({ owner: address });
  console.log('Balance:', Number(balance.totalBalance) / 1e9, 'SUI');
  
  if (Number(balance.totalBalance) < 1e8) {
    console.error('❌ Insufficient balance (need at least 0.1 SUI)');
    return;
  }
  
  // Create transaction
  const tx = new Transaction();
  
  const now = Math.floor(Date.now() / 1000);
  const startsAt = now + 86400; // Tomorrow
  const endsAt = now + 90000; // Tomorrow + 1 hour
  
  console.log('\n📝 Creating event transaction...');
  
  // Step 1: Create Event
  const [eventObj] = tx.moveCall({
    target: `${PACKAGE_ID}::event::new`,
    arguments: [
      tx.pure.string('Test Event'),
      tx.pure.string('Test Venue'),
      tx.pure.u64(startsAt),
      tx.pure.u64(endsAt),
      tx.pure.string('walrus://test'),
      tx.pure.u64(100), // supply_total
    ],
  });
  
  console.log('✓ Event creation command added');
  
  // Step 2: Create TicketClass
  const [classObj] = tx.moveCall({
    target: `${PACKAGE_ID}::class::new`,
    arguments: [
      eventObj,
      tx.pure.string('General Admission'),
      tx.pure.string('#4DA2FF'),
      tx.pure.u64(500_000_000), // 0.5 SUI
      tx.pure.u64(100),
      tx.pure.address(address),
      tx.pure.address(address),
      tx.pure.u16(9000),
      tx.pure.u16(800),
    ],
  });
  
  console.log('✓ TicketClass creation command added');
  
  // Step 3: Mint a ticket
  tx.moveCall({
    target: `${PACKAGE_ID}::ticket::mint`,
    arguments: [classObj],
  });
  
  console.log('✓ Ticket mint command added');
  
  tx.setGasBudget(50_000_000);
  
  console.log('\n🚀 Executing transaction...');
  
  try {
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });
    
    if (result.effects?.status?.status !== 'success') {
      console.error('❌ Transaction failed:', result.effects?.status?.error);
      return;
    }
    
    console.log('✅ Transaction successful!');
    console.log('Digest:', result.digest);
    
    // Extract created objects
    const eventId = result.objectChanges?.find((c: any) => 
      c.type === 'created' && c.objectType?.includes('::event::Event')
    )?.objectId;
    
    const classId = result.objectChanges?.find((c: any) => 
      c.type === 'created' && c.objectType?.includes('::class::TicketClass')
    )?.objectId;
    
    const ticketId = result.objectChanges?.find((c: any) => 
      c.type === 'created' && c.objectType?.includes('::ticket::Ticket')
    )?.objectId;
    
    const gateKeeperCapId = result.objectChanges?.find((c: any) => 
      c.type === 'created' && c.objectType?.includes('::event::GateKeeperCap')
    )?.objectId;
    
    const eventCapId = result.objectChanges?.find((c: any) => 
      c.type === 'created' && c.objectType?.includes('::event::EventCap')
    )?.objectId;
    
    console.log('\n📦 Created Objects:');
    console.log('Event ID:', eventId);
    console.log('TicketClass ID:', classId);
    console.log('Ticket ID:', ticketId);
    console.log('GateKeeperCap ID:', gateKeeperCapId);
    console.log('EventCap ID:', eventCapId);
    
    console.log('\n🔗 Explorer:');
    console.log(`https://testnet.suivision.xyz/txblock/${result.digest}`);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

testEventCreation().catch(console.error);
