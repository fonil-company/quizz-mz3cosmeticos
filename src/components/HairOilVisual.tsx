import { m } from 'framer-motion';

/**
 * Ilustração abstrata da linha capilar: gota de óleo em tons cobre e caramelo envolta por anéis de luz.
 * Propositalmente não representa nenhuma embalagem oficial.
 */
export function HairOilVisual() {
  return (
    <div className="relative mx-auto flex w-full items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 360 200" className="h-auto w-full max-w-[300px] sm:max-w-[360px]">
        <defs>
          <linearGradient id="oil" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0" stopColor="#F5C49A" />
            <stop offset="0.55" stopColor="#DC9464" />
            <stop offset="1" stopColor="#9B421C" />
          </linearGradient>
          <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFD6A1" stopOpacity="0.7" />
            <stop offset="1" stopColor="#FFD6A1" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="180" cy="112" r="92" fill="url(#glow)" />

        {/* fios de cabelo estilizados */}
        <g fill="none" strokeLinecap="round">
          <path d="M8 150 C 80 90, 150 170, 220 120 S 330 70, 356 96" stroke="#C67843" strokeOpacity="0.55" strokeWidth="1.6" />
          <path d="M4 164 C 90 110, 150 186, 230 136 S 330 92, 358 112" stroke="#9B421C" strokeOpacity="0.35" strokeWidth="1.2" />
          <path d="M14 136 C 70 80, 160 150, 210 104 S 320 56, 352 80" stroke="#DC9464" strokeOpacity="0.45" strokeWidth="1" />
        </g>

        {/* anel traseiro */}
        <m.ellipse
          cx="180" cy="122" rx="130" ry="34"
          fill="none" stroke="#4B1008" strokeOpacity="0.35" strokeWidth="2"
          transform="rotate(-10 180 122)"
          strokeDasharray="420 400"
          initial={{ strokeDashoffset: 820 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />

        {/* gota */}
        <m.g
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M180 22 C 180 22 136 82 136 114 a44 44 0 0 0 88 0 C 224 82 180 22 180 22 Z" fill="url(#oil)" />
          <path d="M162 92 C 158 104 158 118 164 130" stroke="#FFF7E0" strokeOpacity="0.75" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="166" cy="80" r="3.5" fill="#FFF7E0" fillOpacity="0.8" />
        </m.g>

        {/* anel frontal laranja */}
        <m.ellipse
          cx="180" cy="122" rx="150" ry="42"
          fill="none" stroke="#9B421C" strokeWidth="3" strokeLinecap="round"
          transform="rotate(8 180 122)"
          strokeDasharray="300 700"
          initial={{ strokeDashoffset: 300 }}
          animate={{ strokeDashoffset: -60 }}
          transition={{ duration: 1.3, ease: 'easeOut', delay: 0.15 }}
        />
      </svg>
    </div>
  );
}
