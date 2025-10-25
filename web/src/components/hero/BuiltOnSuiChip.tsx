export default function BuiltOnSuiChip() {
  return (
    <div className="mx-auto w-fit rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] text-white/80 focus-within:ring-2 focus-within:ring-brand/40 focus-within:ring-offset-2 focus-within:ring-offset-[#061522]">
      <span className="inline-flex items-center gap-1.5">
        <img src="/brand/sui/glyph.svg" alt="" className="h-3.5 w-3.5 opacity-80" draggable="false" />
        Built on Sui
      </span>
    </div>
  );
}
