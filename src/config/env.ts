/**
 * Configurações de ambiente. Defina os valores no arquivo `.env` (veja `.env.example`).
 * Nenhuma credencial privada deve ser colocada aqui — tudo neste arquivo vai para o navegador.
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

/** ID do Meta Pixel. Vazio = eventos desativados. */
export const META_PIXEL_ID: string = (import.meta.env.VITE_META_PIXEL_ID ?? '').trim();

export const IS_DEV = import.meta.env.DEV;

/** Identificador da origem do lead enviado ao CRM. */
export const LEAD_SOURCE = 'quiz-lojistas-keratex';
