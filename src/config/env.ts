/**
 * Configurações de ambiente. Defina os valores no arquivo `.env` (veja `.env.example`).
 * Tudo neste arquivo vai para o navegador. Use apenas URLs de captação destinadas ao site;
 * credenciais privadas do CRM devem ficar no backend.
 */

const digits = (v?: string) => (v ?? '').replace(/\D/g, '');

/**
 * WhatsApp comercial por estado: apenas dígitos, com DDI 55 + DDD.
 * Pode ser sobrescrito via VITE_WHATSAPP_NUMBER_PI / VITE_WHATSAPP_NUMBER_MA.
 */
export const WHATSAPP_NUMBERS: Record<'PI' | 'MA', string> = {
  PI: digits(import.meta.env.VITE_WHATSAPP_NUMBER_PI) || '5586993271298',
  MA: digits(import.meta.env.VITE_WHATSAPP_NUMBER_MA) || '5586995319157',
};

/** Endpoint (seu backend/proxy) que recebe o lead via POST JSON e repassa ao CRM. */
export const CRM_ENDPOINT: string = (import.meta.env.VITE_CRM_ENDPOINT ?? '').trim();

/** Webhooks de captação por estado. O envio acontece ao concluir o formulário de contato. */
export const CRM_ENDPOINTS: Record<'PI' | 'MA', string> = {
  // Piauí → Henrique.
  PI: (import.meta.env.VITE_CRM_ENDPOINT_PI ?? '').trim()
    || 'https://mpajmwwwexxnrsyocppb.supabase.co/functions/v1/api-webhook-receiver?token=d5dbf406f7c24611a4dc161308b5c643e0406d6cad7f428d83ea04be8b20703b',
  // Maranhão → Francisca.
  MA: (import.meta.env.VITE_CRM_ENDPOINT_MA ?? '').trim()
    || 'https://mpajmwwwexxnrsyocppb.supabase.co/functions/v1/api-webhook-receiver?token=bbf7d3b92e024aab8a113bd16d071e35a142de1c377a412ebb582596f2c4ce65',
};

/** Estados atendidos sempre usam seu webhook; o endpoint genérico é apenas um fallback. */
export function crmEndpointFor(uf: string): string {
  if (uf === 'PI' || uf === 'MA') return CRM_ENDPOINTS[uf];
  return CRM_ENDPOINT;
}

/** ID do Meta Pixel. Vazio = eventos desativados. */
export const META_PIXEL_ID: string = (import.meta.env.VITE_META_PIXEL_ID ?? '').trim();

export const IS_DEV = import.meta.env.DEV;

/** Identificador da origem do lead enviado ao CRM. */
export const LEAD_SOURCE = 'quiz-lojistas-keratex';
