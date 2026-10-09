import { useEffect, useRef } from 'react';

interface StepHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

/** Título de etapa. Recebe o foco ao montar, para leitores de tela anunciarem a nova pergunta. */
export function StepHeading({ title, subtitle, align = 'left' }: StepHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      <h1 ref={ref} tabIndex={-1} className="headline text-[1.6rem] text-white outline-none sm:text-[1.9rem]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-[15px] leading-relaxed text-white/70 sm:text-base">{subtitle}</p>
      )}
    </div>
  );
}
