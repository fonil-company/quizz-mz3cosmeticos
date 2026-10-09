import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { STEP_ORDER, type ChoiceQuestionId, type StepId } from '../config/quiz';
import { generateId, readSession, writeSession } from '../lib/storage';
import { validateCity } from '../lib/validation';
import type { ContactData, LocationAnswer, QuizState, SubmissionStatus } from '../types';

const STORAGE_KEY = 'mz3_quiz_state_v1';

type Action =
  | { type: 'GO_TO'; index: number }
  | { type: 'SET_ANSWER'; id: ChoiceQuestionId; value: string }
  | { type: 'SET_LOCATION'; patch: Partial<LocationAnswer> }
  | { type: 'SET_CONTACT'; patch: Partial<ContactData> }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_DONE'; status: SubmissionStatus; signature?: string };

function freshState(): QuizState {
  return {
    stepIndex: 0,
    direction: 1,
    answers: {},
    location: { state: null, uf: '', city: '' },
    contact: { name: '', business: '', whatsapp: '', cnpj: '', consent: false },
    leadId: generateId(),
    startedAt: new Date().toISOString(),
    submission: { status: 'idle' },
  };
}

function isStepComplete(state: QuizState, step: StepId): boolean {
  switch (step) {
    case 'welcome':
      return true;
    case 'location':
      return !!state.location.state && !!state.location.uf && !validateCity(state.location.city);
    case 'contact':
      return ['ok', 'not_configured', 'failed'].includes(state.submission.status);
    case 'success':
      return true;
    default:
      return !!state.answers[step];
  }
}

/** Maior índice que o usuário pode acessar (impede pular etapas via botão "avançar" do navegador). */
function maxReachableIndex(state: QuizState): number {
  for (let i = 0; i < STEP_ORDER.length; i++) {
    if (!isStepComplete(state, STEP_ORDER[i])) return i;
  }
  return STEP_ORDER.length - 1;
}

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'GO_TO': {
      const index = Math.max(0, Math.min(action.index, maxReachableIndex(state)));
      if (index === state.stepIndex) return state;
      return { ...state, stepIndex: index, direction: index > state.stepIndex ? 1 : -1 };
    }
    case 'SET_ANSWER':
      return { ...state, answers: { ...state.answers, [action.id]: action.value } };
    case 'SET_LOCATION':
      return { ...state, location: { ...state.location, ...action.patch } };
    case 'SET_CONTACT':
      return { ...state, contact: { ...state.contact, ...action.patch } };
    case 'SUBMIT_START':
      return { ...state, submission: { ...state.submission, status: 'sending' } };
    case 'SUBMIT_DONE':
      return {
        ...state,
        submission: {
          status: action.status,
          submittedAt: new Date().toISOString(),
          signature: action.status === 'ok' ? action.signature : state.submission.signature,
        },
      };
    default:
      return state;
  }
}

function loadInitialState(): QuizState {
  const stored = readSession<QuizState>(STORAGE_KEY);
  if (!stored || typeof stored.stepIndex !== 'number' || !stored.leadId) return freshState();
  const restored: QuizState = {
    ...freshState(),
    ...stored,
    direction: 1,
    submission:
      stored.submission?.status === 'sending' ? { ...stored.submission, status: 'idle' } : stored.submission,
  };
  return { ...restored, stepIndex: Math.min(restored.stepIndex, maxReachableIndex(restored)) };
}

interface QuizContextValue {
  state: QuizState;
  step: StepId;
  dispatch: React.Dispatch<Action>;
  goTo: (index: number) => void;
  next: () => void;
  back: () => void;
  goToStep: (id: StepId) => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

/** Garante que o histórico do navegador só é preparado uma vez (React StrictMode monta 2x em dev). */
let historyPrepared = false;

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);
  const stepRef = useRef(state.stepIndex);
  stepRef.current = state.stepIndex;

  // Persiste respostas na sessão (sobrevive a recarregamento, some ao fechar a aba).
  useEffect(() => {
    writeSession(STORAGE_KEY, state);
  }, [state]);

  // Espelha as etapas no histórico: o "voltar" do celular/navegador volta uma etapa
  // em vez de sair do quiz. A URL (com UTMs) é preservada.
  useEffect(() => {
    if (historyPrepared) return;
    historyPrepared = true;
    window.history.replaceState({ ...(window.history.state ?? {}), mz3Step: 0 }, '');
    for (let i = 1; i <= stepRef.current; i++) window.history.pushState({ mz3Step: i }, '');
  }, []);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const target = (e.state as { mz3Step?: unknown } | null)?.mz3Step;
      dispatch({ type: 'GO_TO', index: typeof target === 'number' ? target : 0 });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const goTo = useCallback((index: number) => {
    const current = stepRef.current;
    if (index === current) return;
    if (index < current) {
      // As entradas do histórico são lineares (0..current): volta pelo próprio histórico.
      window.history.go(index - current);
      return;
    }
    window.history.pushState({ mz3Step: index }, '');
    dispatch({ type: 'GO_TO', index });
  }, []);

  const value = useMemo<QuizContextValue>(
    () => ({
      state,
      step: STEP_ORDER[state.stepIndex],
      dispatch,
      goTo,
      next: () => goTo(stepRef.current + 1),
      back: () => goTo(Math.max(0, stepRef.current - 1)),
      goToStep: (id: StepId) => goTo(STEP_ORDER.indexOf(id)),
    }),
    [state, goTo],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz deve ser usado dentro de <QuizProvider>');
  return ctx;
}
