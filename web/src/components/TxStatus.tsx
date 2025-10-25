import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { getExplorerTxUrl, shortenAddress } from '../lib/explorer';

interface TxStatusProps {
  status: 'idle' | 'pending' | 'success' | 'error';
  digest?: string;
  error?: string;
}

export function TxStatus({ status, digest, error }: TxStatusProps) {
  if (status === 'idle') return null;

  return (
    <div className="mt-4 p-4 rounded-lg border">
      {status === 'pending' && (
        <div className="flex items-center gap-3 text-text-300">
          <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
          <span>Transaction in progress...</span>
        </div>
      )}

      {status === 'success' && digest && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-success-500">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Transaction successful!</span>
          </div>
          <a
            href={getExplorerTxUrl(digest)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-aqua-500 hover:text-aqua-500/80 transition-colors"
          >
            <span className="font-mono">{shortenAddress(digest, 8)}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-error-500">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Transaction failed</span>
          </div>
          {error && (
            <details className="text-sm text-text-300">
              <summary className="cursor-pointer hover:text-text-100">Show error details</summary>
              <pre className="mt-2 p-2 bg-brand-900 rounded text-xs overflow-x-auto">
                {error}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
