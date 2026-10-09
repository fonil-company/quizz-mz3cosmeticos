/**
 * Camada de integração com o CRM.
 *
 * Envia o lead via POST JSON para `VITE_CRM_ENDPOINT`, que deve ser um backend/proxy seu
 * (ex.: função serverless) responsável por autenticar no CRM. Nunca coloque tokens aqui.
 *
 * O header `Idempotency-Key` (= lead_id) permite ao backend descartar envios duplicados.
 * Só retorna `ok` quando o endpoint responde 2xx — nunca simula sucesso.
 */
import { CRM_ENDPOINT } from '../config/env';
import type { SubmissionStatus } from '../types';
import type { LeadPayload } from './lead';

export type SubmitResult = { status: Extract<SubmissionStatus, 'ok' | 'not_configured' | 'failed'>; httpStatus?: number };

const TIMEOUT_MS = 10_000;
const inFlight = new Map<string, Promise<SubmitResult>>();

async function postOnce(payload: LeadPayload): Promise<SubmitResult> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(CRM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': payload.lead_id },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return res.ok ? { status: 'ok', httpStatus: res.status } : { status: 'failed', httpStatus: res.status };
  } catch {
    return { status: 'failed' };
  } finally {
    window.clearTimeout(timer);
  }
}

async function submitWithRetry(payload: LeadPayload): Promise<SubmitResult> {
  const first = await postOnce(payload);
  if (first.status === 'ok') return first;
  // Não repete em erros do cliente (exceto timeout/rate limit).
  const s = first.httpStatus;
  if (s && s >= 400 && s < 500 && s !== 408 && s !== 429) return first;
  await new Promise((r) => window.setTimeout(r, 800));
  return postOnce(payload);
}

export function submitLead(payload: LeadPayload): Promise<SubmitResult> {
  if (!CRM_ENDPOINT) return Promise.resolve({ status: 'not_configured' });

  const existing = inFlight.get(payload.lead_id);
  if (existing) return existing;

  const promise = submitWithRetry(payload).finally(() => inFlight.delete(payload.lead_id));
  inFlight.set(payload.lead_id, promise);
  return promise;
}
