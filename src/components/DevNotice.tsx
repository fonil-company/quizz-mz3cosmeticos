import { Wrench, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CRM_ENDPOINT, IS_DEV, META_PIXEL_ID } from '../config/env';
import type { SubmissionStatus } from '../types';

const STATUS_TEXT: Partial<Record<SubmissionStatus, { text: string; tone: 'ok' | 'warn' | 'error' }>> = {
  ok: { text: 'CRM confirmou o recebimento do lead (HTTP 2xx).', tone: 'ok' },
  not_configured: { text: 'Lead NÃO foi salvo: VITE_CRM_ENDPOINT não configurado.', tone: 'warn' },
  failed: { text: 'Lead NÃO foi salvo: o endpoint de CRM falhou ou não respondeu.', tone: 'error' },
};

/** Painel visível apenas em desenvolvimento (npm run dev). Nunca aparece no build de produção. */
export function DevNotice({ submission, priority }: { submission: SubmissionStatus; priority?: string }) {
  const [open, setOpen] = useState(false);
  // Abre automaticamente após o envio, para deixar claro se o lead foi ou não salvo.
  useEffect(() => {
    if (submission !== 'idle' && submission !== 'sending') setOpen(true);
  }, [submission]);
  if (!IS_DEV) return null;

  const issues = [
    !CRM_ENDPOINT && 'VITE_CRM_ENDPOINT vazio — os leads não serão enviados ao CRM.',
    !META_PIXEL_ID && 'VITE_META_PIXEL_ID vazio — eventos do Pixel desativados.',
  ].filter(Boolean) as string[];
  const status = STATUS_TEXT[submission];

  if (!issues.length && !status && !priority) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-3 top-3 z-50 grid h-9 w-9 place-items-center rounded-full bg-amber-300 text-navy shadow-lg"
        aria-label="Abrir avisos de desenvolvimento"
      >
        <Wrench className="h-4 w-4" />
      </button>
    );
  }

  return (
    <aside className="fixed right-3 top-3 z-50 max-w-[340px] rounded-xl border border-amber-300/60 bg-[#1a1a2e]/95 p-3 text-xs text-amber-100 shadow-2xl backdrop-blur">
      <div className="mb-1.5 flex items-center justify-between">
        <strong className="flex items-center gap-1.5 text-amber-300">
          <Wrench className="h-3.5 w-3.5" /> Modo desenvolvimento
        </strong>
        <button type="button" onClick={() => setOpen(false)} aria-label="Fechar avisos" className="text-amber-200/70 hover:text-amber-100">
          <X className="h-4 w-4" />
        </button>
      </div>
      <ul className="list-disc space-y-1 pl-4">
        {issues.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
      {status && (
        <p
          className={`mt-2 rounded-md px-2 py-1.5 font-semibold ${
            status.tone === 'ok' ? 'bg-emerald-500/20 text-emerald-200' : status.tone === 'warn' ? 'bg-amber-400/20 text-amber-200' : 'bg-red-500/20 text-red-200'
          }`}
        >
          {status.text}
        </p>
      )}
      {priority && <p className="mt-2 text-amber-100/80">Classificação interna: <strong>{priority}</strong></p>}
    </aside>
  );
}
