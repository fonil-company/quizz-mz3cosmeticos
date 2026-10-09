import { readSession, writeSession } from './storage';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const STORAGE_KEY = 'mz3_quiz_tracking';

export type UtmKey = (typeof UTM_KEYS)[number];

export type TrackingData = Record<UtmKey, string> & {
  fbclid: string;
  landing_page: string;
  referrer: string;
};

let cached: TrackingData | null = null;

/**
 * Captura as UTMs da URL de entrada e preserva durante todo o fluxo (sessionStorage).
 * Se a URL trouxer novas UTMs, elas substituem as anteriores (novo toque de campanha).
 */
export function captureTracking(): TrackingData {
  if (cached) return cached;
  const stored = readSession<TrackingData>(STORAGE_KEY);
  const params = new URLSearchParams(window.location.search);
  const hasNewUtm = UTM_KEYS.some((k) => params.get(k));

  const base: TrackingData = stored ?? {
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
    fbclid: '',
    landing_page: window.location.origin + window.location.pathname,
    referrer: document.referrer || '',
  };

  if (hasNewUtm) {
    for (const k of UTM_KEYS) base[k] = (params.get(k) ?? '').slice(0, 200);
  }
  const fbclid = params.get('fbclid');
  if (fbclid) base.fbclid = fbclid.slice(0, 500);

  cached = base;
  writeSession(STORAGE_KEY, base);
  return base;
}

export const getTracking = (): TrackingData => cached ?? captureTracking();
