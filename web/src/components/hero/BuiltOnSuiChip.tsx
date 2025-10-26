import { Link } from 'react-router-dom';

export default function BuiltOnSuiChip() {
  return (
    <div className="flex justify-center">
      <a
        href="https://sui.io"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 backdrop-blur-sm transition-all hover:bg-white/[0.06] hover:text-white/90 hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DA2FF]/50"
      >
        {/* Micro-gloss highlight */}
        <div 
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-hidden="true"
        />
        
        {/* Cyan inner glow on hover */}
        <div 
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: 'inset 0 0 8px rgba(90, 224, 229, 0.15)',
          }}
          aria-hidden="true"
        />
        
        <svg className="relative h-4 w-4" viewBox="0 0 200 200" fill="currentColor">
          <circle cx="100" cy="100" r="90" fill="currentColor" opacity="0.15" />
          <path d="M100 20 L180 100 L100 180 L20 100 Z" fill="currentColor" />
        </svg>
        <span className="relative">Built on Sui</span>
      </a>
    </div>
  );
}
