import { m } from 'framer-motion';

interface ProgressBarProps {
  /** 0 a 1 */
  value: number;
  label: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10"
    >
      <m.div
        className="h-full rounded-full bg-gradient-to-r from-ink via-copper to-copper-light shadow-[0_0_10px_rgba(198,120,67,0.6)]"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
