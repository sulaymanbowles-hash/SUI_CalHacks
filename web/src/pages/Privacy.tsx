import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] to-[#1a1f3a]">
      <div className="border-b border-white/10 bg-black/20">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link to="/" className="text-white/60 hover:text-white transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
      
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
            <p>
              This is a demo application running on Sui testnet. No real funds or personal data are collected or processed.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Data Collection</h2>
            <p>
              We do not collect, store, or process any personal information. Wallet connections are handled client-side through your browser wallet extension.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">On-Chain Data</h2>
            <p>
              All transactions are recorded on the Sui blockchain. This data is public and immutable by design. Wallet addresses and transaction history can be viewed by anyone using a blockchain explorer.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
            <p>
              For questions about this demo, please refer to the project documentation or contact the development team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}