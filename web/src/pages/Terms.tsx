import { Link } from 'react-router-dom';

export default function Terms() {
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
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Testnet Demo</h2>
            <p>
              This application is a demonstration running on Sui testnet. No real value is exchanged. All tokens are for testing purposes only and have no monetary value.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Use at Your Own Risk</h2>
            <p>
              This software is provided "as is" without warranty of any kind. Use of this demo is at your own risk. The developers are not responsible for any loss of testnet tokens or data.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Smart Contract Interactions</h2>
            <p>
              By using this application, you acknowledge that you are interacting with smart contracts on the Sui blockchain. All transactions are final and cannot be reversed.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Intellectual Property</h2>
            <p>
              This demo application is for educational and demonstration purposes. All code and content are subject to the project's open source license.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}