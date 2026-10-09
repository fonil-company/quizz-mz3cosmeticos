/**
 * Meta Pixel. Nunca envie nome, telefone, CNPJ, cidade ou qualquer dado pessoal nos parâmetros.
 *
 * PageView     – acesso à página (1x por carregamento)
 * ViewContent  – visualização inicial do quiz (1x por sessão)
 * Lead         – cadastro confirmado pelo backend (1x por lead_id; eventID = lead_id para deduplicar com a CAPI)
 * Contact      – clique no botão de WhatsApp (1x por lead_id)
 */
import { IS_DEV, META_PIXEL_ID } from '../config/env';
import { readSession, writeSession } from './storage';

type PixelEvent = 'PageView' | 'ViewContent' | 'Lead' | 'Contact';
type SafeParams = Record<string, string | number>;

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const FIRED_KEY = 'mz3_pixel_fired';
const firedThisPage = new Set<string>();
let initialized = false;

function loadPixelScript(): void {
  if (window.fbq) return;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
}

export function initPixel(): void {
  if (initialized || !META_PIXEL_ID) return;
  loadPixelScript();
  window.fbq?.('init', META_PIXEL_ID);
  initialized = true;
}

/**
 * @param onceKey  chave de deduplicação. `scope: 'session'` persiste no sessionStorage
 *                 (sobrevive a recarregamentos); `scope: 'page'` vale só para este carregamento.
 */
export function trackPixel(
  event: PixelEvent,
  params: SafeParams = {},
  opts: { onceKey?: string; scope?: 'page' | 'session'; eventID?: string } = {},
): void {
  const key = opts.onceKey ?? event;
  const scope = opts.scope ?? 'session';
  const sessionFired = readSession<string[]>(FIRED_KEY) ?? [];

  if (firedThisPage.has(key) || (scope === 'session' && sessionFired.includes(key))) return;
  firedThisPage.add(key);
  if (scope === 'session') writeSession(FIRED_KEY, [...sessionFired, key]);

  if (!initialized || !window.fbq) {
    if (IS_DEV) console.info(`[pixel] ${event} (não enviado: VITE_META_PIXEL_ID ausente)`);
    return;
  }
  window.fbq('track', event, params, opts.eventID ? { eventID: opts.eventID } : undefined);
}
