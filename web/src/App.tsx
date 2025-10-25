import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { Landing } from './pages/Landing';
import { BuyerApp } from './pages/BuyerApp';
import { AppConsole } from './pages/AppConsole';
import { MyTickets } from './pages/MyTickets';

// Configure Sui network
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

// Create React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <BrowserRouter>
            <div className="min-h-screen">
              <Header />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/app" element={<BuyerApp />} />
                <Route path="/console" element={<AppConsole />} />
                <Route path="/tickets" element={<MyTickets />} />
              </Routes>
            </div>
          </BrowserRouter>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
