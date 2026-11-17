/**
 * Umbrella CRM: o lead vai direto ao webhook de entrada (regra "Site / Snippet", que valida a origem).
 *
 * Não usamos `window.UmbrellaTrack.submit` do script do index.html por dois motivos:
 *  - ele envia por sendBeacon, que sempre leva cookies; o webhook não responde
 *    `Access-Control-Allow-Credentials`, então o navegador descarta o envio sem erro;
 *  - ele dispara um `fbq('track', 'Lead')` próprio, duplicando o Lead que o App já envia.
 *
 * `keepalive` mantém o envio mesmo se a página sair (ex.: redirecionamento ao WhatsApp).
 * A atribuição vem do rastreamento do próprio quiz, com as chaves que o snippet do Umbrella usa.
 */
import { UMBRELLA_ENDPOINT } from '../config/env';
import { buildQuizAnswers } from './crm';
import type { LeadPayload } from './lead';
import { readSession, writeSession } from './storage';
import { isCampaignKey, isCampaignValue } from './utm';

const SENT_KEY = 'mz3_umbrella_sent';
const TIMEOUT_MS = 10_000;

export function buildUmbrellaPayload(p: LeadPayload): Record<string, string> {
  const phone = p.contact.whatsapp.replace(/\D/g, '');
  const email = p.contact.email?.trim();
  const attribution = Object.fromEntries(
    Object.entries(p.tracking).filter(([key, value]) => isCampaignKey(key) && isCampaignValue(key, value)),
  );
  return {
    name: p.contact.name,
    // Mesmo formato do campo "WhatsApp (com DDD)": sem o DDI 55.
    whatsapp: /^55\d{10,11}$/.test(phone) ? phone.slice(2) : phone,
    ...(email && { email }),
    ...(p.contact.business_name && { company: p.contact.business_name }),
    // "document" é o campo que dispara a consulta automática de CNPJ no Umbrella.
    ...(p.contact.cnpj && { document: p.contact.cnpj }),
    ...(p.location.city && { city: p.location.city }),
    ...(p.location.uf && { state: p.location.uf }),
    ...buildQuizAnswers(p),
    source: p.source,
    lead_id: p.lead_id,
    event_id: p.lead_id,
    ...attribution,
    ...(p.tracking.fbc && { _fbc: p.tracking.fbc }),
    ...(p.tracking.fbp && { _fbp: p.tracking.fbp }),
    landingUrl: p.tracking.event_source_url,
    referrer: p.tracking.referrer,
  };
}

/** Envia uma vez por conjunto de dados; só marca como enviado após resposta 2xx. */
export async function sendToUmbrella(p: LeadPayload, signature: string): Promise<boolean> {
  if (!UMBRELLA_ENDPOINT || readSession<string>(SENT_KEY) === signature) return false;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(UMBRELLA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildUmbrellaPayload(p)),
      keepalive: true,
      signal: controller.signal,
    });
    if (res.ok) writeSession(SENT_KEY, signature);
    if (import.meta.env.DEV) console.info('[crm] Umbrella:', res.status);
    return res.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}
