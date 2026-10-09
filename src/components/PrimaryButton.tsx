import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

const base =
  'focus-ring relative inline-flex min-h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-brand px-6 py-4 font-display text-[15px] font-extrabold uppercase tracking-wide text-white shadow-[0_14px_34px_-12px_rgba(255,121,0,0.75)] transition-[background-color,box-shadow] duration-200 hover:bg-brand-strong hover:shadow-[0_18px_40px_-12px_rgba(255,121,0,0.9)] disabled:cursor-not-allowed disabled:opacity-70 sm:text-base';

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & { children: ReactNode };

export function PrimaryButton({ children, className = '', ...props }: ButtonProps) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} className={`${base} ${className}`} {...props}>
      {children}
    </motion.button>
  );
}

type LinkProps = Omit<HTMLMotionProps<'a'>, 'children'> & { children: ReactNode };

export function PrimaryLink({ children, className = '', ...props }: LinkProps) {
  return (
    <motion.a whileTap={{ scale: 0.98 }} className={`${base} ${className}`} {...props}>
      {children}
    </motion.a>
  );
}
