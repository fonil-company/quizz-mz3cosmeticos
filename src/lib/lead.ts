import { LEAD_SOURCE } from '../config/env';
import { CONTACT_COPY } from '../config/quiz';
import type { QuizState } from '../types';
import { locationOptionLabel, optionLabel, stateName } from './answers';
import { qualifyLead, type LeadPriority, type RelationshipTag } from './qualification';
import { getTracking, type TrackingData } from './utm';
import { maskPhone, normalizeCnpj, onlyDigits } from './validation';

interface AnswerValue {
  id: string;
  label: string;
}

/** Contrato enviado ao endpoint de CRM (POST application/json). */
export interface LeadPayload {
  lead_id: string;
  source: string;
  started_at: string;
  submitted_at: string;
  submitted_at_local: string;
  contact: {
    name: string;
    business_name: string;
    whatsapp: string;
    whatsapp_formatted: string;
    cnpj: string | null;
  };
  location: { state_option: string; uf: string; state_name: string; city: string };
  answers: {
    establishment: AnswerValue;
    resale: AnswerValue;
    budget: AnswerValue;
    relationship: AnswerValue;
    timing: AnswerValue;
  };
  qualification: {
    priority: LeadPriority;
    priority_label: string;
    relationship_tag: RelationshipTag;
    score: number;
    tags: string[];
    reasons: string[];
  };
  consent: { accepted: boolean; text: string; accepted_at: string };
  tracking: TrackingData & { user_agent: string };
}

const answer = (q: Parameters<typeof optionLabel>[0], id?: string): AnswerValue => ({
  id: id ?? '',
  label: optionLabel(q, id),
});

export function buildLeadPayload(state: QuizState, now = new Date()): LeadPayload {
  const { answers, contact, location } = state;
  const q = qualifyLead(answers, location);
  const phone = onlyDigits(contact.whatsapp);
  const cnpj = normalizeCnpj(contact.cnpj);
  const iso = now.toISOString();

  return {
    lead_id: state.leadId,
    source: LEAD_SOURCE,
    started_at: state.startedAt,
    submitted_at: iso,
    submitted_at_local: new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
      timeZone: 'America/Fortaleza',
    }).format(now),
    contact: {
      name: contact.name.trim().replace(/\s+/g, ' '),
      business_name: contact.business.trim(),
      whatsapp: `55${phone}`,
      whatsapp_formatted: maskPhone(phone),
      cnpj: cnpj || null,
    },
    location: {
      state_option: locationOptionLabel(location),
      uf: location.uf,
      state_name: stateName(location.uf),
      city: location.city.trim(),
    },
    answers: {
      establishment: answer('establishment', answers.establishment),
      resale: answer('resale', answers.resale),
      budget: answer('budget', answers.budget),
      relationship: answer('relationship', answers.relationship),
      timing: answer('timing', answers.timing),
    },
    qualification: {
      priority: q.priority,
      priority_label: q.priorityLabel,
      relationship_tag: q.relationshipTag,
      score: q.score,
      tags: q.tags,
      reasons: q.reasons,
    },
    consent: { accepted: contact.consent, text: CONTACT_COPY.consent, accepted_at: iso },
    tracking: { ...getTracking(), user_agent: navigator.userAgent },
  };
}

/** Assinatura dos dados relevantes — usada para não reenviar um lead idêntico já confirmado. */
export function leadSignature(p: LeadPayload): string {
  return JSON.stringify([p.contact, p.location, p.answers]);
}
