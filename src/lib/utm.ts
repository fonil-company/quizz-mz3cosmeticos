import { readSession, writeSession } from './storage';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const STORAGE_KEY = 'mz3_quiz_tracking';
const CAMPAIGN_KEYS = new Set([
  'fbclid', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'ttclid',
  'campaign', 'campaign_id', 'adset_id', 'ad_id', 'placement',
]);

export const isCampaignKey = (key: string): boolean => /^utm_[a-z0-9_]+$/.test(key) || CAMPAIGN_KEYS.has(key);

/** Descarta macros de anúncios ainda não resolvidas e IDs usados como placeholder. */
export const isCampaignValue = (key: string, value: string): boolean =>
  !!value.trim() && !/\{[^}]*\}/.test(value) && value.trim().toLowerCase() !== key.toLowerCase();

export type UtmKey = (typeof UTM_KEYS)[number];

export type TrackingData = Record<UtmKey, string> & {
  [key: string]: string;
  fbclid: string;
  landing_page: string;
  referrer: string;
  event_source_url: string;
};

let cached: TrackingData | null = null;

/**
 * Captura as UTMs da URL de entrada e preserva durante todo o fluxo (sessionStorage).
 * Uma nova campanha na URL substitui a anterior, sem misturar identificadores de cliques.
 */
export function captureTracking(): TrackingData {
  if (cached) return cached;
  const stored = readSession<TrackingData>(STORAGE_KEY);
  const attribution = Object.fromEntries(
    [...new URL(window.location.href).searchParams].filter(([key, value]) =>
      isCampaignKey(key) && isCampaignValue(key, value),
    ),
  );
  const hasNewCampaign = Object.keys(attribution).length > 0;

  const base: TrackingData = stored?.event_source_url && !hasNewCampaign ? stored : {
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
    fbclid: '',
    landing_page: window.location.origin + window.location.pathname,
    referrer: document.referrer || '',
    event_source_url: window.location.href,
    ...attribution,
  };

  cached = base;
  writeSession(STORAGE_KEY, base);
  return base;
}

export const getTracking = (): TrackingData => cached ?? captureTracking();

/** Lê no envio, pois o Pixel pode criar os cookies depois da captura de entrada. */
export function getMetaCookies(): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    for (const part of document.cookie.split(';')) {
      const [name, ...rest] = part.trim().split('=');
      if (name !== '_fbc' && name !== '_fbp') continue;
      const raw = rest.join('=');
      if (!raw) continue;
      try { result[name.slice(1)] = decodeURIComponent(raw); }
      catch { result[name.slice(1)] = raw; }
    }
  } catch { /* cookies bloqueados: atribuição por URL continua disponível */ }
  return result;
}
