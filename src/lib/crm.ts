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
 * `crmOk` indica a confirmação do CRM Fonil, que é o que libera o evento Lead do Pixel/CAPI.
 */
import { CRM_ENDPOINTS, FONIL_CONSULTANTS, FONIL_CRM_PATH, FONIL_PIPELINE_STAGE, crmEndpointFor } from '../config/env';
import { LOCATION_STEP, QUESTIONS, STEP_ORDER, type ChoiceQuestionId } from '../config/quiz';
import type { SubmissionStatus } from '../types';
import type { LeadPayload } from './lead';
import { isCampaignKey, isCampaignValue } from './utm';

export type SubmitResult = { status: Extract<SubmissionStatus, 'ok' | 'not_configured' | 'failed'>; httpStatus?: number };
export type LeadSubmitResult = SubmitResult & { stateOk: boolean; crmOk: boolean };
/** Destinos a enviar — permite reenviar só o que ainda não confirmou. */
export type LeadTargets = { state: boolean; crm: boolean };

const SKIPPED: SubmitResult = { status: 'not_configured' };

const TIMEOUT_MS = 10_000;
const inFlight = new Map<string, Promise<LeadSubmitResult>>();

/** Contrato do webhook do CRM Fonil (POST /api/webhooks/leads/{token}). */
export interface FonilCrmPayload {
  [key: string]: string | undefined;
  phone: string;
  name: string;
  email?: string;
  document?: string;
  city?: string;
  state?: string;
  pipeline_stage?: string;
  consultant?: string;
  event_source_url: string;
  fbc?: string;
  fbp?: string;
}

/**
 * Observações do CRM: o Fonil lista cada campo extra como "chave: valor", então cada
 * pergunta respondida vai como chave própria (texto da pergunta → resposta), na ordem das telas.
 */
export function buildQuizAnswers(p: LeadPayload): Record<string, string> {
  const result: Record<string, string> = {};
  const add = (question: string, answer: string) => { if (answer) result[question] = answer; };
  for (const step of STEP_ORDER) {
    if (step === 'location') {
      const { state_option, city, uf } = p.location;
      add(LOCATION_STEP.title, city && uf ? `${city}/${uf}` : state_option);
    } else if (step in QUESTIONS) {
      add(QUESTIONS[step as ChoiceQuestionId].title, p.answers[step as ChoiceQuestionId]?.label ?? '');
    }
  }
  return result;
}

export function buildFonilPayload(p: LeadPayload): FonilCrmPayload {
  const phone = p.contact.whatsapp.replace(/\D/g, '');
  const email = p.contact.email?.trim();
  const uf = p.location.uf.trim().toUpperCase();
  const city = p.location.city.trim();
  // Numérico sem máscara; mantém letras de CNPJs alfanuméricos já aceitos pelo formulário.
  const document = p.contact.cnpj?.replace(/[^a-z0-9]/gi, '').toUpperCase();
  const attribution = Object.fromEntries(
    Object.entries(p.tracking).filter(([key, value]) =>
      isCampaignKey(key) && isCampaignValue(key, value),
    ),
  );
  const consultant = uf === 'PI' || uf === 'MA' ? FONIL_CONSULTANTS[uf] : undefined;
  return {
    // Remove apenas o DDI; um telefone nacional com DDD 55 deve ser preservado.
    phone: /^55\d{10,11}$/.test(phone) ? phone.slice(2) : phone,
    name: p.contact.name.trim(),
    ...(email && { email }),
    ...(document && { document }),
    ...(city && { city }),
    ...(uf && { state: uf }),
    ...(FONIL_PIPELINE_STAGE && { pipeline_stage: FONIL_PIPELINE_STAGE }),
    ...(consultant && { consultant }),
    ...buildQuizAnswers(p),
    ...attribution,
    event_source_url: p.tracking.event_source_url,
    ...(p.tracking.fbc && { fbc: p.tracking.fbc }),
    ...(p.tracking.fbp && { fbp: p.tracking.fbp }),
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

async function submitAll(payload: LeadPayload, targets: LeadTargets): Promise<LeadSubmitResult> {
  const results = await Promise.all([
    targets.state ? submitToStateWebhook(payload) : SKIPPED,
    targets.crm ? submitToFonilCrm(payload) : SKIPPED,
  ]);
  if (import.meta.env.DEV) console.info('[crm] webhook estadual / CRM Fonil:', results);
  const overall =
    results.find((r) => r.status === 'ok') ??
    results.find((r) => r.status === 'failed') ??
    { status: 'not_configured' as const };
  return { ...overall, stateOk: results[0].status === 'ok', crmOk: results[1].status === 'ok' };
}

export function submitLead(payload: LeadPayload, targets: LeadTargets = { state: true, crm: true }): Promise<LeadSubmitResult> {
  const key = payload.lead_id;
  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = submitAll(payload, targets).finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}
