import { AnimatePresence, MotionConfig, motion, type Variants } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { ContactForm } from './components/ContactForm';
import { DevNotice } from './components/DevNotice';
import { LocationStep } from './components/LocationStep';
import { QuestionCard } from './components/QuestionCard';
import { QuizLayout } from './components/QuizLayout';
import { SuccessScreen } from './components/SuccessScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QUESTIONS, TOTAL_STEPS, type ChoiceQuestionId } from './config/quiz';
import { cityUf, optionLabel } from './lib/answers';
import { submitLead } from './lib/crm';
import { buildLeadPayload, leadSignature } from './lib/lead';
import { initPixel, trackPixel } from './lib/pixel';
import { qualifyLead } from './lib/qualification';
import { buildWhatsAppMessage, buildWhatsAppUrl, whatsAppNumberFor } from './lib/whatsapp';
import { QuizProvider, useQuiz } from './state/QuizContext';

const CONTENT_NAME = 'Quiz Lojistas Keratex';

const slide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 36 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -36 }),
};

function QuizFlow() {
  const { state, step, dispatch, next, back, goToStep } = useQuiz();
  const submitting = useRef(false);

  useEffect(() => {
    initPixel();
    trackPixel('PageView', {}, { scope: 'page' });
  }, []);

  useEffect(() => {
    if (step === 'establishment') {
      trackPixel('ViewContent', { content_name: CONTENT_NAME, content_category: 'Qualificação B2B' });
    }
    window.scrollTo({ top: 0 });
  }, [step]);

  const qualification = useMemo(() => qualifyLead(state.answers, state.location), [state.answers, state.location]);

  const whatsappUrl = useMemo(() => buildWhatsAppUrl(buildWhatsAppMessage(state), whatsAppNumberFor(state.location.uf)), [state]);

  const handleContactSubmit = async () => {
    if (submitting.current) return;
    submitting.current = true;
    try {
      const payload = buildLeadPayload(state);
      const signature = leadSignature(payload);

      // Já confirmado com os mesmos dados (ex.: voltou e avançou sem editar): não reenvia.
      if (state.submission.status === 'ok' && state.submission.signature === signature) {
        next();
        return;
      }

      dispatch({ type: 'SUBMIT_START' });
      const result = await submitLead(payload);
      dispatch({ type: 'SUBMIT_DONE', status: result.status, signature });

      if (result.status === 'ok') {
        trackPixel(
          'Lead',
          { content_name: CONTENT_NAME, lead_quality: payload.qualification.priority },
          { onceKey: `Lead:${state.leadId}`, eventID: state.leadId },
        );
      }
      // O quiz segue mesmo sem CRM: a mensagem do WhatsApp leva os dados à equipe comercial.
      next();
    } finally {
      submitting.current = false;
    }
  };

  const handleWhatsAppClick = () => {
    trackPixel('Contact', { content_name: CONTENT_NAME }, { onceKey: `Contact:${state.leadId}` });
  };

  const summary = useMemo(() => {
    const rows = [
      { label: 'Nome', value: state.contact.name.trim() },
      { label: 'Empresa', value: state.contact.business.trim() },
      { label: 'Cidade/UF', value: cityUf(state.location) },
    ];
    (['establishment', 'resale', 'budget', 'relationship', 'timing'] as ChoiceQuestionId[]).forEach((id) =>
      rows.push({ label: QUESTIONS[id].summaryLabel, value: optionLabel(id, state.answers[id]) }),
    );
    return rows;
  }, [state.contact, state.location, state.answers]);

  const progress = step === 'welcome' ? null : step === 'success' ? 1 : state.stepIndex / (TOTAL_STEPS + 1);
  const stepLabel =
    step === 'welcome' ? null : step === 'success' ? 'Concluído' : `Etapa ${state.stepIndex} de ${TOTAL_STEPS}`;

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeScreen onStart={next} />;
      case 'location':
        return (
          <LocationStep
            value={state.location}
            onChange={(patch) => dispatch({ type: 'SET_LOCATION', patch })}
            onContinue={next}
          />
        );
      case 'contact':
        return (
          <ContactForm
            value={state.contact}
            cityUf={cityUf(state.location)}
            sending={state.submission.status === 'sending'}
            onChange={(patch) => dispatch({ type: 'SET_CONTACT', patch })}
            onSubmit={handleContactSubmit}
            onEditLocation={() => goToStep('location')}
          />
        );
      case 'success':
        return (
          <SuccessScreen
            saved={state.submission.status === 'ok'}
            whatsappUrl={whatsappUrl}
            summary={summary}
            onWhatsAppClick={handleWhatsAppClick}
          />
        );
      default:
        return (
          <QuestionCard
            question={QUESTIONS[step]}
            value={state.answers[step]}
            onAnswer={(value) => dispatch({ type: 'SET_ANSWER', id: step, value })}
            onAdvance={next}
          />
        );
    }
  };

  return (
    <QuizLayout
      progress={progress}
      stepLabel={stepLabel}
      onBack={state.stepIndex > 0 && state.submission.status !== 'sending' ? back : undefined}
    >
      <AnimatePresence mode="wait" initial={false} custom={state.direction}>
        <motion.div
          key={step}
          custom={state.direction}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 flex-col"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <DevNotice
        submission={state.submission.status}
        priority={step === 'success' ? `${qualification.priorityLabel} · ${qualification.relationshipTag} · score ${qualification.score}` : undefined}
      />
    </QuizLayout>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <QuizProvider>
        <QuizFlow />
      </QuizProvider>
    </MotionConfig>
  );
}
