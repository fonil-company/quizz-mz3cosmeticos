/** Fundo quente cobre/caramelo com ondas de luz dourada, brilho central e reflexo na base. */
export function BrandBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* brilho difuso central */}
      <div className="absolute left-1/2 top-[38%] h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,214,161,0.55)_0%,rgba(233,163,111,0.18)_45%,transparent_70%)]" />
      {/* sombra marrom avermelhada nos cantos superiores */}
      <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#4b1008]/35 blur-[120px]" />
      <div className="absolute -right-48 -top-24 h-[420px] w-[420px] rounded-full bg-[#87300f]/40 blur-[110px]" />

      {/* ondas luminosas curvas */}
      <svg
        className="absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 1000 1000"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="wave-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFD6A1" stopOpacity="0" />
            <stop offset="0.45" stopColor="#FFF0DB" stopOpacity="0.85" />
            <stop offset="1" stopColor="#FFD6A1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wave-copper" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#DC9464" stopOpacity="0" />
            <stop offset="0.5" stopColor="#F5C49A" stopOpacity="0.7" />
            <stop offset="1" stopColor="#DC9464" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M-40 560 C 180 420, 420 640, 640 500 S 940 380, 1040 430" stroke="url(#wave-gold)" strokeWidth="5" strokeLinecap="round" />
        <path d="M-40 590 C 200 470, 420 680, 660 540 S 950 430, 1040 470" stroke="url(#wave-copper)" strokeWidth="2" strokeLinecap="round" />
        <path d="M-40 620 C 220 520, 440 700, 680 580 S 960 480, 1040 510" stroke="url(#wave-gold)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M-40 300 C 260 220, 520 380, 1040 240" stroke="url(#wave-copper)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>

      {/* superfície inferior reflexiva */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#f8d4b1]/70 via-[#f5c49a]/25 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(75,16,8,0.28)_100%)]" />
    </div>
  );
}
