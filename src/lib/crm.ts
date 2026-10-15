/**
 * Camada de integração com o CRM.
 *
 * Cada lead vai, em paralelo, para:
 *  1. o webhook do estado escolhido no quiz (`VITE_CRM_ENDPOINT` é fallback para outras UFs);
 *  2. o CRM Fonil, via rota do próprio site (`FONIL_CRM_PATH`) que o servidor repassa ao webhook.
 *
 * O `lead_id` no payload permite ao backend descartar envios duplicados.
 * O header `Idempotency-Key` é mantido apenas no backend/proxy genérico:
 * os webhooks estaduais não permitem esse header no CORS.
 * Só retorna `ok` quando ao menos um destino responde 2xx — nunca simula sucesso.
 */
import { CRM_ENDPOINTS, FONIL_CRM_PATH, crmEndpointFor } from '../config/env';
import type { SubmissionStatus } from '../types';
import type { LeadPayload } from './lead';

export type SubmitResult = { status: Extract<SubmissionStatus, 'ok' | 'not_configured' | 'failed'>; httpStatus?: number };

const TIMEOUT_MS = 10_000;
const inFlight = new Map<string, Promise<SubmitResult>>();

/** Contrato do webhook do CRM Fonil (POST /api/webhooks/leads/{token}). */
export interface FonilCrmPayload {
  phone: string;
  name: string;
  document?: string;
  city?: string;
  state?: string;
}

export function buildFonilPayload(p: LeadPayload): FonilCrmPayload {
  return {
    phone: p.contact.whatsapp.replace(/^55/, ''), // DDD + número, como no exemplo do CRM
    name: p.contact.name,
    ...(p.contact.cnpj && { document: p.contact.cnpj }),
    ...(p.location.city && { city: p.location.city }),
    ...(p.location.uf && { state: p.location.uf }),
  };
}

async function postOnce(endpoint: string, body: unknown, headers: Record<string, string>): Promise<SubmitResult> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return res.ok ? { status: 'ok', httpStatus: res.status } : { status: 'failed', httpStatus: res.status };
  } catch {
    return { status: 'failed' };
  } finally {
    window.clearTimeout(timer);
  }
}

async function submitWithRetry(endpoint: string, body: unknown, headers: Record<string, string> = {}): Promise<SubmitResult> {
  const first = await postOnce(endpoint, body, headers);
  if (first.status === 'ok') return first;
  // Não repete em erros do cliente (exceto timeout/rate limit).
  const s = first.httpStatus;
  if (s && s >= 400 && s < 500 && s !== 408 && s !== 429) return first;
  await new Promise((r) => window.setTimeout(r, 800));
  return postOnce(endpoint, body, headers);
}

function submitToStateWebhook(payload: LeadPayload): Promise<SubmitResult> {
  const endpoint = crmEndpointFor(payload.location.uf);
  if (!endpoint) return Promise.resolve({ status: 'not_configured' });
  const headers: Record<string, string> =
    endpoint !== CRM_ENDPOINTS.PI && endpoint !== CRM_ENDPOINTS.MA ? { 'Idempotency-Key': payload.lead_id } : {};
  return submitWithRetry(endpoint, payload, headers);
}

function submitToFonilCrm(payload: LeadPayload): Promise<SubmitResult> {
  if (!FONIL_CRM_PATH) return Promise.resolve({ status: 'not_configured' });
  return submitWithRetry(FONIL_CRM_PATH, buildFonilPayload(payload));
}

async function submitAll(payload: LeadPayload): Promise<SubmitResult> {
  const results = await Promise.all([submitToStateWebhook(payload), submitToFonilCrm(payload)]);
  if (import.meta.env.DEV) console.info('[crm] webhook estadual / CRM Fonil:', results);
  return (
    results.find((r) => r.status === 'ok') ??
    results.find((r) => r.status === 'failed') ??
    { status: 'not_configured' }
  );
}

export function submitLead(payload: LeadPayload): Promise<SubmitResult> {
  const key = payload.lead_id;
  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = submitAll(payload).finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}
