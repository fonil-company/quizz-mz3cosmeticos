import { WHATSAPP_NUMBERS } from '../config/env';
import { QUESTIONS, WHATSAPP_INTRO } from '../config/quiz';
import type { QuizState } from '../types';
import { cityUf, optionLabel } from './answers';

export function buildWhatsAppMessage(state: QuizState): string {
  const { answers, contact, location } = state;
  const lines = [
    WHATSAPP_INTRO,
    '',
    `Nome: ${contact.name.trim()}`,
    `Empresa: ${contact.business.trim()}`,
    `Cidade/UF: ${cityUf(location)}`,
    `${QUESTIONS.establishment.summaryLabel}: ${optionLabel('establishment', answers.establishment)}`,
    `${QUESTIONS.resale.summaryLabel}: ${optionLabel('resale', answers.resale)}`,
    `${QUESTIONS.budget.summaryLabel}: ${optionLabel('budget', answers.budget)}`,
    `${QUESTIONS.relationship.summaryLabel}: ${optionLabel('relationship', answers.relationship)}`,
    `${QUESTIONS.timing.summaryLabel}: ${optionLabel('timing', answers.timing)}`,
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
