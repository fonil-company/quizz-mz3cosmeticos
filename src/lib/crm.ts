/**
 * Camada de integração com o CRM.
 *
 * Envia o lead via POST JSON para o webhook do estado escolhido no quiz.
 * `VITE_CRM_ENDPOINT` continua disponível como fallback para outras UFs.
 *
 * O `lead_id` no payload permite ao backend descartar envios duplicados.
 * O header `Idempotency-Key` é mantido apenas no backend/proxy genérico:
 * os webhooks estaduais não permitem esse header no CORS.
 * Só retorna `ok` quando o endpoint responde 2xx — nunca simula sucesso.
 */
import { CRM_ENDPOINTS, crmEndpointFor } from '../config/env';
import type { SubmissionStatus } from '../types';
import type { LeadPayload } from './lead';

export type SubmitResult = { status: Extract<SubmissionStatus, 'ok' | 'not_configured' | 'failed'>; httpStatus?: number };

const TIMEOUT_MS = 10_000;
const inFlight = new Map<string, Promise<SubmitResult>>();

async function postOnce(endpoint: string, payload: LeadPayload): Promise<SubmitResult> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (endpoint !== CRM_ENDPOINTS.PI && endpoint !== CRM_ENDPOINTS.MA) {
      headers['Idempotency-Key'] = payload.lead_id;
    }
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
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

async function submitWithRetry(endpoint: string, payload: LeadPayload): Promise<SubmitResult> {
  const first = await postOnce(endpoint, payload);
  if (first.status === 'ok') return first;
  // Não repete em erros do cliente (exceto timeout/rate limit).
  const s = first.httpStatus;
  if (s && s >= 400 && s < 500 && s !== 408 && s !== 429) return first;
  await new Promise((r) => window.setTimeout(r, 800));
  return postOnce(endpoint, payload);
}

export function submitLead(payload: LeadPayload): Promise<SubmitResult> {
  const endpoint = crmEndpointFor(payload.location.uf);
  if (!endpoint) return Promise.resolve({ status: 'not_configured' });

  const key = `${endpoint}:${payload.lead_id}`;
  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = submitWithRetry(endpoint, payload).finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}
