/**
 * Classificação interna e automática dos leads. Nunca exibida ao usuário.
 *
 * Alta prioridade:     tem estabelecimento + PI/MA + já vende capilares + compra imediata ou em 7 dias.
 * Média prioridade:    tem estabelecimento + PI/MA, mas não cumpre todos os critérios de alta.
 * Fora do perfil:      não tem estabelecimento OU está fora de PI/MA (não é bloqueado — vai para triagem).
 *
 * O `score` (0–100) é complementar e considera também o volume de compras,
 * permitindo ordenar leads dentro de uma mesma prioridade no CRM.
 */
import type { Answers, LocationAnswer } from '../types';

export type LeadPriority = 'alta' | 'media' | 'fora_do_perfil';

export const PRIORITY_LABEL: Record<LeadPriority, string> = {
  alta: 'Alta prioridade',
  media: 'Média prioridade',
  fora_do_perfil: 'Fora do perfil inicial',
};

export type RelationshipTag = 'Cliente atual MZ3' | 'Reativação MZ3' | 'Novo cliente potencial';

export interface Qualification {
  priority: LeadPriority;
  priorityLabel: string;
  relationshipTag: RelationshipTag;
  score: number;
  tags: string[];
  reasons: string[];
}

const SERVED_UFS = new Set(['PI', 'MA']);

const SCORE = {
  establishment: { has: 20, none: 0 },
  region: { inside: 20, outside: 0 },
  resale: { frequent: 20, little: 12, starting: 5 } as Record<string, number>,
  timing: { asap: 20, '7days': 16, '30days': 8, researching: 2 } as Record<string, number>,
  budget: { above3000: 20, '1501to3000': 15, '501to1500': 10, upto500: 5, none: 0 } as Record<string, number>,
};

export function relationshipTagFor(relationship?: string): RelationshipTag {
  if (relationship === 'current') return 'Cliente atual MZ3';
  if (relationship === 'stopped') return 'Reativação MZ3';
  return 'Novo cliente potencial';
}

export function qualifyLead(answers: Answers, location: LocationAnswer): Qualification {
  const hasEstablishment = !!answers.establishment && answers.establishment !== 'none';
  const inRegion = SERVED_UFS.has(location.uf);
  const sellsHairCare = answers.resale === 'frequent' || answers.resale === 'little';
  const buysSoon = answers.timing === 'asap' || answers.timing === '7days';

  const reasons: string[] = [];
  reasons.push(hasEstablishment ? 'Possui estabelecimento comercial' : 'Não possui estabelecimento');
  reasons.push(inRegion ? `Localizado em ${location.uf} (região atendida)` : `Fora da região inicial (${location.uf || 'UF não informada'})`);
  reasons.push(sellsHairCare ? 'Já comercializa produtos capilares' : 'Ainda não vende produtos capilares');
  reasons.push(buysSoon ? 'Compra imediata ou em até 7 dias' : 'Sem compra imediata prevista');

  let priority: LeadPriority;
  if (!hasEstablishment || !inRegion) priority = 'fora_do_perfil';
  else if (sellsHairCare && buysSoon) priority = 'alta';
  else priority = 'media';

  const score =
    (hasEstablishment ? SCORE.establishment.has : SCORE.establishment.none) +
    (inRegion ? SCORE.region.inside : SCORE.region.outside) +
    (SCORE.resale[answers.resale ?? ''] ?? 0) +
    (SCORE.timing[answers.timing ?? ''] ?? 0) +
    (SCORE.budget[answers.budget ?? ''] ?? 0);

  const relationshipTag = relationshipTagFor(answers.relationship);

  const tags = [PRIORITY_LABEL[priority], relationshipTag];
  if (location.uf) tags.push(`UF ${location.uf}`);
  if (!hasEstablishment) tags.push('Sem estabelecimento');
  if (!inRegion) tags.push('Fora da região inicial');
  if (answers.timing === 'researching') tags.push('Pesquisando fornecedores');

  return {
    priority,
    priorityLabel: PRIORITY_LABEL[priority],
    relationshipTag,
    score,
    tags,
    reasons,
  };
}
