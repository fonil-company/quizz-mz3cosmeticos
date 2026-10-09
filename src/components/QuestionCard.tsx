import { useEffect, useRef, useState } from 'react';
import type { ChoiceQuestion } from '../config/quiz';
import { OptionCard } from './OptionCard';
import { StepHeading } from './StepHeading';

/** Tempo para o usuário ver a confirmação visual antes do avanço automático. */
export const AUTO_ADVANCE_MS = 320;

interface QuestionCardProps {
  question: ChoiceQuestion;
  value?: string;
  onAnswer: (optionId: string) => void;
  onAdvance: () => void;
}

export function QuestionCard({ question, value, onAnswer, onAdvance }: QuestionCardProps) {
  const [locked, setLocked] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleSelect = (id: string) => {
    if (locked) return; // evita clique duplo / avanço duplo
    setLocked(true);
    onAnswer(id);
    timer.current = window.setTimeout(onAdvance, AUTO_ADVANCE_MS);
  };

  return (
    <div className="flex flex-col">
      <StepHeading title={question.title} subtitle={question.subtitle} />
      <div role="group" aria-label={question.title} className="mt-6 flex flex-col gap-3">
        {question.options.map((opt) => (
          <OptionCard
            key={opt.id}
            option={opt}
            selected={value === opt.id}
            disabled={locked && value !== opt.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
