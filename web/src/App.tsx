import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { ScrollProgress } from './components/motion/ScrollProgress';
import { Landing } from './pages/Landing';
import { AppConsole } from './pages/AppConsole';
import { MyTickets } from './pages/MyTickets';
import { Collections } from './pages/Collections';
import { CheckIn } from './pages/CheckIn';
import { AuthCallback } from './pages/AuthCallback';
import { Events } from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

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
            <ScrollProgress />
            <div className="min-h-screen">
              <Header />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/events" element={<Events />} />
                <Route path="/create" element={<CreateEvent />} />
                <Route path="/my-tickets" element={<MyTickets />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/console" element={<AppConsole />} />
                <Route path="/checkin" element={<CheckIn />} />
                <Route path="/auth" element={<AuthCallback />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
              </Routes>
            </div>
          </BrowserRouter>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;