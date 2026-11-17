/**
 * Umbrella CRM: o script do index.html expõe `window.UmbrellaTrack`, que cuida da atribuição
 * (UTMs de primeiro/último toque, IDs de anúncio, _fbc/_fbp) e do envio via sendBeacon,
 * que sobrevive à saída da página. Equivale ao `<form data-umbrella>` com name/whatsapp/email.
 *
 * O submit do Umbrella dispara um `fbq('track', 'Lead')` próprio, com outro eventID. O Lead do quiz
 * já sai do App (Pixel + CAPI, só após o CRM Fonil confirmar), então o fbq fica oculto durante a
 * chamada para não contar o lead duas vezes na Meta.
 */
import { buildQuizAnswers } from './crm';
import type { LeadPayload } from './lead';
import { readSession, writeSession } from './storage';

type UmbrellaTrack = { submit: (data: Record<string, string>) => void };

declare global {
  interface Window {
    UmbrellaTrack?: UmbrellaTrack;
  }
}

const SENT_KEY = 'mz3_umbrella_sent';

export function buildUmbrellaPayload(p: LeadPayload): Record<string, string> {
  const phone = p.contact.whatsapp.replace(/\D/g, '');
  const email = p.contact.email?.trim();
  return {
    name: p.contact.name,
    // Mesmo formato do campo "WhatsApp (com DDD)": sem o DDI 55.
    whatsapp: /^55\d{10,11}$/.test(phone) ? phone.slice(2) : phone,
    ...(email && { email }),
    ...(p.contact.business_name && { company: p.contact.business_name }),
    ...(p.contact.cnpj && { cnpj: p.contact.cnpj }),
    ...(p.location.city && { city: p.location.city }),
    ...(p.location.uf && { state: p.location.uf }),
    ...buildQuizAnswers(p),
    source: p.source,
    lead_id: p.lead_id,
    landingUrl: p.tracking.event_source_url,
    referrer: p.tracking.referrer,
  };
}

/** Envia uma vez por conjunto de dados; retorna se o envio foi entregue ao script. */
export function sendToUmbrella(p: LeadPayload, signature: string): boolean {
  const umbrella = window.UmbrellaTrack;
  if (!umbrella || readSession<string>(SENT_KEY) === signature) return false;
  const fbq = window.fbq;
  try {
    window.fbq = undefined;
    umbrella.submit(buildUmbrellaPayload(p));
    writeSession(SENT_KEY, signature);
    return true;
  } catch {
    return false;
  } finally {
    window.fbq = fbq;
  }
}
