import type { ChoiceQuestionId, StateOptionId } from './config/quiz';

export type Answers = Partial<Record<ChoiceQuestionId, string>>;

export interface LocationAnswer {
  state: StateOptionId | null;
  /** UF final: 'PI', 'MA' ou a UF escolhida quando "Outro estado". */
  uf: string;
  city: string;
}

export interface ContactData {
  name: string;
  business: string;
  whatsapp: string;
  cnpj: string;
  consent: boolean;
}

/**
 * idle            – ainda não enviado
 * sending         – envio em andamento
 * ok              – CRM confirmou o recebimento (HTTP 2xx)
 * not_configured  – endpoint de CRM ausente: nada foi salvo
 * failed          – endpoint configurado, mas o envio falhou
 */
export type SubmissionStatus = 'idle' | 'sending' | 'ok' | 'not_configured' | 'failed';

export interface QuizState {
  stepIndex: number;
  direction: 1 | -1;
  answers: Answers;
  location: LocationAnswer;
  contact: ContactData;
  leadId: string;
  startedAt: string;
  submission: {
    status: SubmissionStatus;
    submittedAt?: string;
    /** Assinatura dos dados enviados com sucesso — evita reenvio idêntico. */
    signature?: string;
  };
}
