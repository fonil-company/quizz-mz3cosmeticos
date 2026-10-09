import { AlertCircle, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useId, type InputHTMLAttributes } from 'react';

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  icon?: LucideIcon;
  hint?: string;
  error?: string | null;
  valid?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, icon: Icon, hint, error, valid, className = '', ...props },
  ref,
) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between font-display text-sm font-semibold text-white/90">
        {label}
        {hint && <span className="font-sans text-xs font-normal text-white/45">{hint}</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className={`pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors ${
              error ? 'text-red-300' : valid ? 'text-brand' : 'text-white/40'
            }`}
            aria-hidden="true"
          />
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`h-14 w-full rounded-xl border bg-white/[0.06] text-white placeholder:text-white/35 transition-[border-color,background-color,box-shadow] duration-200 focus:bg-white/[0.09] focus:outline-none ${
            Icon ? 'pl-11' : 'pl-4'
          } pr-4 ${
            error
              ? 'border-red-400/80 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.25)]'
              : 'border-white/15 hover:border-white/30 focus:border-brand focus:shadow-[0_0_0_3px_rgba(255,121,0,0.25)]'
          }`}
          {...props}
        />
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 overflow-hidden pt-1.5 text-[13px] text-red-300"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});
