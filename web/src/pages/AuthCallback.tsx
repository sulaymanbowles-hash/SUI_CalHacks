/**
 * OAuth Callback Page - Complete zkLogin after Google redirect
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { completeGoogleLogin } from '../lib/zklogin';

export function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>();

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      setStatus('loading');
      
      // Complete zkLogin flow
      const session = await completeGoogleLogin();
      
      setStatus('success');
      
      // Redirect to app console after short delay
      setTimeout(() => {
        navigate('/app', { replace: true });
      }, 1500);
      
    } catch (err: any) {
      console.error('OAuth callback error:', err);
      setStatus('error');
      setError(err.message || 'Failed to complete login');
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-vignette noise">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
        <div className="card w-full text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#4DA2FF]" />
              <h2 className="mb-2 font-[Inter_Tight] text-xl tracking-tight text-[#DCE7F0]">
                Completing login...
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Generating your zkLogin wallet
              </p>
              <div className="mt-6 space-y-2 text-left text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#4DA2FF] animate-pulse" />
                  <span>Verifying OAuth token</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#4DA2FF] animate-pulse" />
                  <span>Generating ZK proof</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#4DA2FF] animate-pulse" />
                  <span>Creating wallet address</span>
                </div>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-400" />
              <h2 className="mb-2 font-[Inter_Tight] text-xl tracking-tight text-[#DCE7F0]">
                Login successful!
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Redirecting to app...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
              <h2 className="mb-2 font-[Inter_Tight] text-xl tracking-tight text-[#DCE7F0]">
                Login failed
              </h2>
              <p className="mb-6 text-sm text-[var(--muted)]">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/app')}
                  className="w-full rounded-xl bg-[#4DA2FF] px-6 py-3 font-medium text-white transition-transform hover:scale-[1.02]"
                >
                  Go to App
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full rounded-xl border border-white/14 px-6 py-3 font-medium text-white/85 transition-colors hover:bg-white/5"
                >
                  Try Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
