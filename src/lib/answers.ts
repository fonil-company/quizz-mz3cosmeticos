import { LOCATION_STEP, QUESTIONS, type ChoiceQuestionId } from '../config/quiz';
import type { LocationAnswer } from '../types';

export function optionLabel(questionId: ChoiceQuestionId, optionId?: string): string {
  if (!optionId) return '';
  return QUESTIONS[questionId].options.find((o) => o.id === optionId)?.label ?? optionId;
}

export function stateName(uf: string): string {
  if (uf === 'PI') return 'Piauí';
  if (uf === 'MA') return 'Maranhão';
  return uf;
}

export function locationOptionLabel(loc: LocationAnswer): string {
  return LOCATION_STEP.options.find((o) => o.id === loc.state)?.label ?? '';
}

export const cityUf = (loc: LocationAnswer) =>
  loc.city.trim() && loc.uf ? `${loc.city.trim()}/${loc.uf}` : '';
