export default function BrandWatermark() {
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-[58%] -z-10 -translate-x-1/2 opacity-[.025]">
      {/* Large ticket watermark - pushed down below headline baseline */}
      <svg className="w-[72vmin] max-w-[900px] mix-blend-overlay" viewBox="0 0 200 200" fill="currentColor">
        <path d="M170 40H30c-5.5 0-10 4.5-10 10v30c8.3 0 15 6.7 15 15s-6.7 15-15 15v30c0 5.5 4.5 10 10 10h140c5.5 0 10-4.5 10-10v-30c-8.3 0-15-6.7-15-15s6.7-15 15-15V50c0-5.5-4.5-10-10-10zm-20 20v10h-10V60h10zm0 30v10h-10V90h10zm0 30v10h-10v-10h10z" />
      </svg>
    </div>
  );
}
