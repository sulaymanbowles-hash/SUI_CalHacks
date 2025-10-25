export function spawnRipple(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget as HTMLElement;
  const r = el.getBoundingClientRect();
  const d = Math.max(r.width, r.height);
  const x = e.clientX - r.left - d / 2;
  const y = e.clientY - r.top - d / 2;
  const s = document.createElement("span");
  s.className = "ripple";
  s.style.width = s.style.height = `${d}px`;
  s.style.left = `${x}px`;
  s.style.top = `${y}px`;
  el.appendChild(s);
  s.addEventListener("animationend", () => s.remove());
}
