import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { BrandBackground } from './BrandBackground';
import { ProgressBar } from './ProgressBar';

interface QuizLayoutProps {
  children: ReactNode;
  /** null = sem indicador (tela de abertura). */
  progress: number | null;
  stepLabel: string | null;
  onBack?: () => void;
}

export function QuizLayout({ children, progress, stepLabel, onBack }: QuizLayoutProps) {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <BrandBackground />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[620px] flex-col px-3 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:justify-center sm:px-6 sm:py-10">
        <div className="flex flex-1 flex-col rounded-[24px] border border-white/60 bg-cream/[0.93] p-5 shadow-[0_30px_80px_-24px_rgba(75,16,8,0.6),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl sm:flex-none sm:rounded-[28px] sm:p-8">
          <header className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2">
            <div>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Voltar para a etapa anterior"
                  className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-ink/15 bg-white/50 text-ink/80 transition-colors duration-200 hover:border-copper/50 hover:bg-white/80 hover:text-ink active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
            {/* Parceria MZ3 + Rio Piranhas */}
            <div className="flex min-w-0 items-center justify-center gap-3 rounded-full bg-luxury px-4 py-2 shadow-[0_8px_20px_-10px_rgba(75,16,8,0.8)] sm:gap-4 sm:px-5">
              <img
                src="/brand/mz3-logo.webp"
                alt="MZ3 Cosméticos"
                width={260}
                height={122}
                className="h-7 w-auto shrink-0 select-none sm:h-9"
                draggable={false}
              />
              <span className="h-6 w-px shrink-0 bg-cream/35 sm:h-7" aria-hidden="true" />
              <img
                src="/brand/rio-piranhas-logo.webp"
                alt="DEC Rio Piranhas"
                width={400}
                height={92}
                className="h-5 w-auto min-w-0 select-none sm:h-7"
                draggable={false}
              />
            </div>
            <div />
          </header>

          {progress !== null && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-ink/60">
                <span aria-live="polite">{stepLabel}</span>
                <span className="tabular-nums">{Math.round(progress * 100)}%</span>
              </div>
              <ProgressBar value={progress} label="Progresso do questionário" />
            </div>
          )}

          <main className="relative mt-6 flex flex-1 flex-col sm:mt-8">{children}</main>
        </div>

        <footer className="mt-6 text-center text-[11px] font-semibold text-ink/70">
          © {new Date().getFullYear()} MZ3 Cosméticos · Indústria brasileira de cosméticos
        </footer>
      </div>
    </div>
  );
}
