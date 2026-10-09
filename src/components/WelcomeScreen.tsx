import { ArrowRight, Check, Clock } from 'lucide-react';
import { WELCOME_COPY as C } from '../config/quiz';
import { HairOilVisual } from './HairOilVisual';
import { PrimaryButton } from './PrimaryButton';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative -mx-1 mb-2">
        <HairOilVisual />
        <div className="-mt-3 flex items-center justify-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Linha</span>
          <img src="/brand/keratex.png" alt="Keratex" width={548} height={256} className="h-8 w-auto" draggable={false} />
        </div>
      </div>

      <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
        {C.eyebrow}
      </p>

      <h1 className="headline mt-4 text-center text-[1.75rem] text-white sm:text-[2.2rem]">
        {C.headlineBefore}
        <span className="text-brand">{C.headlineHighlight}</span>
        {C.headlineAfter}
      </h1>

      <p className="mt-4 text-center text-[15px] leading-relaxed text-white/75 sm:text-base">{C.subheadline}</p>
      <p className="mt-2 text-center text-[15px] leading-relaxed text-white/75 sm:text-base">{C.support}</p>

      <ul className="mt-6 flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        {C.benefits.map((b) => (
          <li key={b} className="flex items-start gap-3 text-[15px] text-white/90">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
              <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
            </span>
            {b}
          </li>
        ))}
      </ul>

      {/* CTA fixo no rodapé no mobile para estar sempre ao alcance do polegar */}
      <div className="sticky bottom-0 -mx-4 mt-6 bg-gradient-to-t from-navy via-navy/95 to-transparent px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-6 sm:static sm:mx-0 sm:bg-none sm:p-0 sm:pt-2">
        <PrimaryButton type="button" onClick={onStart}>
          {C.cta}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </PrimaryButton>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/60">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {C.microcopy}
        </p>
      </div>
    </div>
  );
}
