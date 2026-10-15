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
        <div className="-mt-2 flex items-center justify-center">
          <img
            src="/brand/keratex-brown.webp"
            alt="Keratex by MZ3 Cosméticos"
            width={520}
            height={119}
            decoding="async"
            className="h-10 w-auto sm:h-12"
            draggable={false}
          />
        </div>
      </div>

      <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-copper/25 bg-peach/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink/85">
        <span className="h-1.5 w-1.5 rounded-full bg-copper" aria-hidden="true" />
        {C.eyebrow}
      </p>

      <h1 className="headline mt-4 text-center text-[2.1rem] text-ink sm:text-[2.7rem]">
        {C.headlineBefore}
        <span className="script text-[1.08em] leading-none text-script">{C.headlineHighlight}</span>
        {C.headlineAfter}
        <span className="mx-auto mt-4 block w-fit rounded-2xl bg-luxury px-5 py-2.5 text-[0.62em] leading-tight tracking-wide text-cream shadow-[0_12px_28px_-12px_rgba(75,16,8,0.85),inset_0_1px_0_rgba(255,214,161,0.5)]">
          <span className="text-glow">+ </span>
          {C.headlineOffer}
        </span>
      </h1>

      <p className="mt-5 text-center text-[15px] font-medium leading-relaxed text-ink/80 sm:text-base">{C.subheadline}</p>
      <p className="mt-2 text-center text-[15px] font-medium leading-relaxed text-ink/80 sm:text-base">{C.support}</p>

      <ul className="mt-6 flex flex-col gap-2.5 rounded-2xl border border-ink/10 bg-white/50 p-4">
        {C.benefits.map((b) => (
          <li key={b} className="flex items-start gap-3 text-[15px] font-semibold text-ink">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-copper/50 text-copper">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
            </span>
            {b}
          </li>
        ))}
      </ul>

      {/* CTA fixo no rodapé no mobile para estar sempre ao alcance do polegar */}
      <div className="sticky bottom-0 -mx-5 mt-6 rounded-b-[24px] bg-gradient-to-t from-cream via-cream/95 to-transparent px-5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-6 sm:static sm:mx-0 sm:bg-none sm:p-0 sm:pt-2">
        <PrimaryButton type="button" onClick={onStart}>
          {C.cta}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </PrimaryButton>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-ink/60">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {C.microcopy}
        </p>
      </div>
    </div>
  );
}
