import { motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { SUCCESS_COPY as C } from '../config/quiz';
import { WhatsAppButton } from './WhatsAppButton';
import { StepHeading } from './StepHeading';

interface SuccessScreenProps {
  saved: boolean;
  whatsappUrl: string;
  summary: { label: string; value: string }[];
  onWhatsAppClick: () => void;
}

export function SuccessScreen({ saved, whatsappUrl, summary, onWhatsAppClick }: SuccessScreenProps) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="relative mb-6 grid h-20 w-20 place-items-center"
        aria-hidden="true"
      >
        <span className="absolute inset-0 rounded-full bg-brand/20" />
        <span className="absolute inset-2 rounded-full border border-brand/40" />
        <span className="relative grid h-12 w-12 place-items-center rounded-full bg-brand shadow-[0_10px_30px_-8px_rgba(255,121,0,0.8)]">
          <Check className="h-6 w-6 text-white" strokeWidth={3} />
        </span>
      </motion.div>

      <StepHeading title={C.title} subtitle={saved ? C.subtitleSaved : C.subtitleUnsaved} align="center" />

      <div className="mt-8 w-full">
        <WhatsAppButton href={whatsappUrl} label={C.cta} onClick={onWhatsAppClick} />
        <p className="mt-3 text-center text-xs text-white/55">{C.microcopy}</p>
      </div>

      <details className="group mt-8 w-full rounded-2xl border border-white/10 bg-white/[0.03]">
        <summary className="focus-ring flex cursor-pointer list-none items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold text-white/80 [&::-webkit-details-marker]:hidden">
          Resumo das suas respostas
          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
        </summary>
        <dl className="grid gap-x-4 gap-y-2.5 border-t border-white/10 px-4 py-4 text-sm sm:grid-cols-[auto_1fr]">
          {summary.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-white/50">{row.label}</dt>
              <dd className="-mt-2 font-medium text-white sm:mt-0">{row.value}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
