/**
 * zkLogin Button - Login with Google (OAuth wallet)
 */
import { useState } from 'react';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import {
  getZkLoginSession,
  clearZkLoginSession,
  startGoogleLogin,
  isGoogleOAuthConfigured,
} from '../lib/zklogin';

export function ZkLoginButton() {
  const [loading, setLoading] = useState(false);
  const session = getZkLoginSession();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await startGoogleLogin();
      // Will redirect to Google, so no need to setLoading(false)
    } catch (error) {
      console.error('Failed to start login:', error);
      setLoading(false);
      alert('Failed to start login. Check console for details.');
    }
  };

  const handleLogout = () => {
    clearZkLoginSession();
    window.location.reload();
  };

  // Don't show if OAuth not configured
  if (!isGoogleOAuthConfigured()) {
    return null;
  }

  // Logged in state
  if (session) {
    const shortAddress = `${session.address.slice(0, 6)}…${session.address.slice(-4)}`;
    
    return (
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm md:flex">
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <span className="font-mono text-green-400">{shortAddress}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-white/14 bg-white/[0.04] px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[#4DA2FF] focus:ring-offset-2 focus:ring-offset-[#071521]"
          style={{ minHeight: '44px' }}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    );
  }

  // Login button
  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#4DA2FF] to-[#5AE0E5] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#4DA2FF]/20 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#4DA2FF] focus:ring-offset-2 focus:ring-offset-[#071521]"
      style={{ minHeight: '44px' }}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Login with Google</span>
        </>
      )}
    </button>
  );
}
