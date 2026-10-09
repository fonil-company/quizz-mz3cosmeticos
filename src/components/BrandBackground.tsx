/** Elementos geométricos discretos inspirados nos anéis elípticos da logo MZ3. */
export function BrandBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand/10 blur-[120px]" />
      <div className="absolute -bottom-48 -left-40 h-[480px] w-[480px] rounded-full bg-[#1b1fa8]/40 blur-[120px]" />
      <svg
        className="absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 1000 1000"
        fill="none"
      >
        <ellipse cx="500" cy="500" rx="470" ry="170" transform="rotate(-18 500 500)" stroke="white" strokeOpacity="0.05" strokeWidth="1.5" />
        <ellipse cx="500" cy="500" rx="420" ry="130" transform="rotate(-18 500 500)" stroke="white" strokeOpacity="0.035" strokeWidth="1" />
        <ellipse cx="500" cy="500" rx="360" ry="200" transform="rotate(24 500 500)" stroke="white" strokeOpacity="0.04" strokeWidth="1" />
        <path d="M120 640 C 260 820, 620 860, 880 600" stroke="#FF7900" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(1,2,47,0.55)_100%)]" />
    </div>
  );
}
