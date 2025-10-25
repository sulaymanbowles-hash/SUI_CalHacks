/**
 * Poster Upload Component - Upload images to Walrus
 */
import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { walrusUpload, toWalrusUri } from '../lib/walrus';

interface PosterUploadProps {
  onUploadComplete: (cid: string) => void;
  currentCid?: string;
}

export function PosterUpload({ onUploadComplete, currentCid }: PosterUploadProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>();
  const [preview, setPreview] = useState<string>();
  const [manualCid, setManualCid] = useState(currentCid || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Walrus
    setStatus('uploading');
    setError(undefined);

    try {
      const blobId = await walrusUpload(file);
      const walrusUri = toWalrusUri(blobId);
      setStatus('success');
      onUploadComplete(walrusUri);
      setManualCid(walrusUri);
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Upload failed');
    }
  };

  const handleManualSubmit = () => {
    if (manualCid.trim()) {
      onUploadComplete(manualCid.trim());
      setStatus('success');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
          Event Poster (Optional)
        </label>
        
        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={status === 'uploading'}
          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/20 bg-white/[0.02] px-4 py-6 text-[var(--muted)] transition-colors hover:border-white/30 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'uploading' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Uploading to Walrus...
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              Uploaded successfully
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              Click to upload or drag & drop
            </>
          )}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <p className="mt-2 text-xs text-white/50">
          PNG, JPG, GIF up to 10MB. Stored on Walrus (decentralized).
        </p>
      </div>

      {/* Preview */}
      {preview && (
        <div className="overflow-hidden rounded-lg border border-white/12">
          <img src={preview} alt="Poster preview" className="h-48 w-full object-cover" />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
          <div>
            <div className="font-bold text-red-400">Upload failed</div>
            <div className="text-red-300">{error}</div>
            {error.includes('authentication') && (
              <div className="mt-2 text-xs text-red-400">
                You can paste a Walrus CID manually below instead.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual CID Input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
          Or paste Walrus CID manually
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualCid}
            onChange={(e) => setManualCid(e.target.value)}
            placeholder="walrus://..."
            className="grow rounded-xl border border-white/12 bg-white/[0.02] px-4 py-2 font-mono text-sm text-[#DCE7F0] transition-colors focus:border-[#4DA2FF] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleManualSubmit}
            disabled={!manualCid.trim()}
            className="rounded-xl border border-white/14 px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use
          </button>
        </div>
      </div>
    </div>
  );
}
