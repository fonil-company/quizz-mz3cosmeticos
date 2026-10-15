/**
 * Meta Pixel + API de Conversões. Nunca envie nome, telefone, CNPJ, cidade ou qualquer dado
 * pessoal nos parâmetros: dados pessoais só vão à CAPI em `user_data`, com hash (ver capi.ts).
 * Todo evento sai pelos dois canais com o mesmo `eventID`, para a Meta deduplicar.
 *
 * PageView     – acesso à página (1x por carregamento)
 * ViewContent  – visualização inicial do quiz (1x por sessão)
 * Lead         – cadastro confirmado pelo backend (1x por lead_id; eventID = lead_id)
 * Contact      – clique no botão de WhatsApp (1x por lead_id)
 */
import { IS_DEV, META_PIXEL_ID } from '../config/env';
import { sendCapiEvent, type CapiUser } from './capi';
import { generateId, readSession, writeSession } from './storage';

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
    /** eventID do PageView disparado pelo Pixel inline do index.html. */
    __mz3PageViewId?: string;
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
  // O index.html já carrega o Pixel e faz o init; repetir o init geraria aviso de ID duplicado.
  if (!window.__mz3PageViewId) {
    loadPixelScript();
    window.fbq?.('init', META_PIXEL_ID);
  }
  initialized = true;
}

/**
 * PageView: o index.html já o envia ao Pixel logo no carregamento; aqui só falta a CAPI,
 * com o mesmo eventID. Sem o Pixel inline (ex.: HTML alterado), dispara pelos dois canais.
 */
export function trackPageView(user: CapiUser): void {
  const id = window.__mz3PageViewId;
  if (!id) return trackPixel('PageView', {}, { scope: 'page', user });
  if (firedThisPage.has('PageView')) return;
  firedThisPage.add('PageView');
  void sendCapiEvent('PageView', id, {}, user);
}

/**
 * @param onceKey  chave de deduplicação. `scope: 'session'` persiste no sessionStorage
 *                 (sobrevive a recarregamentos); `scope: 'page'` vale só para este carregamento.
 */
export function trackPixel(
  event: PixelEvent,
  params: SafeParams = {},
  opts: { onceKey?: string; scope?: 'page' | 'session'; eventID?: string; user?: CapiUser } = {},
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
  const eventID = opts.eventID ?? `${event}.${generateId()}`;
  window.fbq('track', event, params, { eventID });
  void sendCapiEvent(event, eventID, params, opts.user);
}
