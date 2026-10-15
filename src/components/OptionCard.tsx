import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { QuizOption } from '../config/quiz';

interface OptionCardProps {
  option: QuizOption;
  selected: boolean;
  disabled?: boolean;
  onSelect: (id: string) => void;
}

function LevelBars({ level, active }: { level: number; active: boolean }) {
  return (
    <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={`w-[5px] rounded-sm transition-colors duration-200 ${
            n <= level ? (active ? 'bg-cream' : 'bg-copper') : active ? 'bg-cream/35' : 'bg-ink/15'
          }`}
          style={{ height: `${n * 25}%` }}
        />
      ))}
    </span>
  );
}

export function OptionCard({ option, selected, disabled, onSelect }: OptionCardProps) {
  const Icon = option.icon;
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect(option.id)}
      whileTap={{ scale: 0.985 }}
      className={`focus-ring group flex min-h-[64px] w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-[background-color,border-color,box-shadow] duration-200 disabled:cursor-default ${
        selected
          ? 'border-copper bg-glow/45 shadow-[0_0_0_1px_var(--color-copper),0_10px_30px_-12px_rgba(155,66,28,0.55)]'
          : 'border-ink/12 bg-white/55 hover:border-copper/45 hover:bg-white/85'
      }`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors duration-200 ${
          selected ? 'bg-luxury text-cream' : 'bg-peach/70 text-copper group-hover:bg-champagne/70'
        }`}
      >
        {Icon ? (
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        ) : (
          <LevelBars level={option.level ?? 0} active={selected} />
        )}
      </span>

      <span className="flex-1 font-sans text-[15px] font-bold leading-snug text-ink sm:text-base">
        {option.label}
      </span>

      <span
        aria-hidden="true"
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all duration-200 ${
          selected ? 'border-copper bg-copper' : 'border-ink/25 group-hover:border-copper/60'
        }`}
      >
        <motion.span initial={false} animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }} transition={{ duration: 0.2 }}>
          <Check className="h-3.5 w-3.5 text-cream" strokeWidth={3} />
        </motion.span>
      </span>
    </motion.button>
  );
}
