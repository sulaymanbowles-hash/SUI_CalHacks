/**
 * Transaction Timeline - Shows multi-step PTB progress
 */
interface TxTimelineItem {
  label: string;
  status: 'idle' | 'pending' | 'ok' | 'fail';
  hash?: string;
}

interface TxTimelineProps {
  items: TxTimelineItem[];
}

export function TxTimeline({ items }: TxTimelineProps) {
  return (
    <ul className="mt-3 space-y-2 text-sm">
      {items.map((it, i) => (
        <li key={i} className="flex items-center gap-2">
          <Dot status={it.status} />
          <span className="text-white/85">{it.label}</span>
          {it.hash && (
            <a
              className="text-white/70 underline transition-colors hover:text-white"
              href={`https://suiscan.xyz/testnet/tx/${it.hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              view
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

function Dot({ status }: { status: string }) {
  const cls =
    status === 'ok'
      ? 'bg-emerald-400'
      : status === 'pending'
      ? 'bg-[#4DA2FF] animate-pulse'
      : status === 'fail'
      ? 'bg-rose-400'
      : 'bg-white/30';
  return <span className={`h-2.5 w-2.5 rounded-full ${cls}`} />;
}
