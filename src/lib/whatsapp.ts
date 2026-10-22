import { WHATSAPP_NUMBERS } from '../config/env';
import { WHATSAPP_INTRO } from '../config/quiz';
import type { QuizState } from '../types';
import { maskCnpj, maskPhone } from './validation';

export function buildWhatsAppMessage(state: QuizState): string {
  const { contact, location } = state;
  const lines = [
    WHATSAPP_INTRO,
    '',
    `CNPJ: ${maskCnpj(contact.cnpj) || 'Não informado'}`,
    `Nome: ${contact.name.trim()}`,
    `WhatsApp: ${maskPhone(contact.whatsapp)}`,
    `E-mail: ${contact.email?.trim() || 'Não informado'}`,
    `Estado: ${location.uf}`,
  ];
  return lines.join('\n');
}

/** Piauí → consultor do PI; Maranhão → consultor do MA. */
export function whatsAppNumberFor(uf: string): string {
  return uf === 'MA' ? WHATSAPP_NUMBERS.MA : WHATSAPP_NUMBERS.PI;
}

/** https://wa.me/NUMERO?text=MENSAGEM */
export function buildWhatsAppUrl(message: string, number: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
