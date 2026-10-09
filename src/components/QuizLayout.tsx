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
    <div className="relative min-h-dvh overflow-x-clip bg-navy">
      <BrandBackground />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[620px] flex-col px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:justify-center sm:px-6 sm:py-10">
        <div className="flex flex-1 flex-col sm:flex-none sm:rounded-[28px] sm:border sm:border-white/10 sm:bg-navy-soft/55 sm:p-8 sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] sm:backdrop-blur-xl">
          <header className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2">
            <div>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Voltar para a etapa anterior"
                  className="focus-ring grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-colors duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
            {/* Parceria MZ3 + Rio Piranhas */}
            <div className="flex min-w-0 items-center justify-center gap-3 sm:gap-4">
              <img
                src="/brand/mz3-logo.png"
                alt="MZ3 Cosméticos"
                width={950}
                height={445}
                className="h-9 w-auto shrink-0 select-none sm:h-11"
                draggable={false}
              />
              <span className="h-7 w-px shrink-0 bg-white/25 sm:h-8" aria-hidden="true" />
              <img
                src="/brand/rio-piranhas-logo.png"
                alt="DEC Rio Piranhas"
                width={518}
                height={119}
                className="h-6 w-auto min-w-0 select-none sm:h-8"
                draggable={false}
              />
            </div>
            <div />
          </header>

          {progress !== null && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-white/60">
                <span aria-live="polite">{stepLabel}</span>
                <span className="tabular-nums">{Math.round(progress * 100)}%</span>
              </div>
              <ProgressBar value={progress} label="Progresso do questionário" />
            </div>
          )}

          <main className="relative mt-6 flex flex-1 flex-col sm:mt-8">{children}</main>
        </div>

        <footer className="mt-6 text-center text-[11px] text-white/35">
          © {new Date().getFullYear()} MZ3 Cosméticos · Indústria brasileira de cosméticos
        </footer>
      </div>
    </div>
  );
}
