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
            n <= level ? (active ? 'bg-white' : 'bg-brand') : active ? 'bg-white/30' : 'bg-white/15'
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
          ? 'border-brand bg-brand/12 shadow-[0_0_0_1px_var(--color-brand),0_10px_30px_-12px_rgba(255,121,0,0.55)]'
          : 'border-white/12 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.08]'
      }`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors duration-200 ${
          selected ? 'bg-brand text-white' : 'bg-white/[0.07] text-brand group-hover:bg-white/10'
        }`}
      >
        {Icon ? (
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        ) : (
          <LevelBars level={option.level ?? 0} active={selected} />
        )}
      </span>

      <span className="flex-1 font-display text-[15px] font-semibold leading-snug text-white sm:text-base">
        {option.label}
      </span>

      <span
        aria-hidden="true"
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all duration-200 ${
          selected ? 'border-brand bg-brand' : 'border-white/25 group-hover:border-white/50'
        }`}
      >
        <motion.span initial={false} animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }} transition={{ duration: 0.2 }}>
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        </motion.span>
      </span>
    </motion.button>
  );
}
