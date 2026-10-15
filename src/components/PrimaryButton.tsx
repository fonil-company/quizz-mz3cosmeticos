import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

const base =
  'focus-ring relative inline-flex min-h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-luxury px-6 py-4 font-sans text-[15px] font-extrabold uppercase tracking-wide text-cream shadow-[0_14px_34px_-12px_rgba(75,16,8,0.75),inset_0_1px_0_rgba(255,214,161,0.45)] transition-[filter,box-shadow] duration-200 hover:brightness-110 hover:shadow-[0_18px_40px_-12px_rgba(75,16,8,0.9),inset_0_1px_0_rgba(255,214,161,0.45)] disabled:cursor-not-allowed disabled:opacity-70 sm:text-base';

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
