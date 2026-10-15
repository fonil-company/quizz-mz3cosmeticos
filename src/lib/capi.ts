/**
 * Meta API de Conversões (CAPI).
 *
 * Cada evento do Pixel é reenviado pelo servidor com o mesmo `event_id`, para a Meta deduplicar.
 * O navegador posta em `META_CAPI_PATH` (mesmo domínio); o servidor (Caddyfile / vite.config.ts)
 * repassa à Graph API acrescentando o token — que nunca chega ao navegador.
 *
 * Dados pessoais só vão em `user_data`, normalizados e com hash SHA-256, conforme a Meta exige.
 */
import { IS_DEV, META_CAPI_PATH } from '../config/env';
import { getTracking } from './utm';

export interface CapiUser {
  /** Telefone com DDI (ex.: 5586999999999). */
  phone?: string;
  name?: string;
  city?: string;
  /** UF, ex.: PI. */
  state?: string;
  /** ID estável do visitante/lead (sem dados pessoais). */
  externalId?: string;
}

const plain = (v: string) =>
  v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

async function sha256(value: string): Promise<string | undefined> {
  if (!value || !crypto?.subtle) return undefined;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

function cookie(name: string): string {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : '';
}

/** `_fbc` do Pixel; se ainda não existir, monta a partir do fbclid capturado na entrada. */
function fbc(): string {
  const c = cookie('_fbc');
  if (c) return c;
  const { fbclid } = getTracking();
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : '';
}

async function userData(u: CapiUser): Promise<Record<string, unknown>> {
  const words = plain(u.name ?? '').trim().split(/\s+/).filter(Boolean);
  const [ph, fn, ln, ct, st, country, externalId] = await Promise.all([
    sha256((u.phone ?? '').replace(/\D/g, '')),
    sha256(words[0] ?? ''),
    sha256(words.length > 1 ? words[words.length - 1] : ''),
    sha256(plain(u.city ?? '').replace(/[^a-z]/g, '')),
    sha256(plain(u.state ?? '').replace(/[^a-z]/g, '')),
    sha256(u.phone || u.state ? 'br' : ''),
    sha256(u.externalId ?? ''),
  ]);
  const data: Record<string, unknown> = {
    client_user_agent: navigator.userAgent,
    fbp: cookie('_fbp') || undefined,
    fbc: fbc() || undefined,
    ph: ph && [ph],
    fn: fn && [fn],
    ln: ln && [ln],
    ct: ct && [ct],
    st: st && [st],
    country: country && [country],
    external_id: externalId && [externalId],
  };
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v));
}

export async function sendCapiEvent(
  eventName: string,
  eventId: string,
  customData: Record<string, string | number>,
  user: CapiUser = {},
): Promise<void> {
  if (!META_CAPI_PATH) return;
  try {
    const body = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: 'website',
          event_source_url: window.location.href,
          user_data: await userData(user),
          custom_data: customData,
        },
      ],
    };
    const res = await fetch(META_CAPI_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true, // conclui mesmo se a pessoa sair para o WhatsApp
    });
    if (IS_DEV) console.info(`[capi] ${eventName} → HTTP ${res.status}`, await res.clone().json().catch(() => ''));
  } catch (err) {
    if (IS_DEV) console.info(`[capi] ${eventName} falhou`, err);
  }
}
