import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, MapPin } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CITY_SUGGESTIONS, LOCATION_STEP as C, type StateOptionId } from '../config/quiz';
import { validateCity } from '../lib/validation';
import type { LocationAnswer } from '../types';
import { FormField } from './FormField';
import { OptionCard } from './OptionCard';
import { PrimaryButton } from './PrimaryButton';
import { StepHeading } from './StepHeading';

interface LocationStepProps {
  value: LocationAnswer;
  onChange: (patch: Partial<LocationAnswer>) => void;
  onContinue: () => void;
}

export function LocationStep({ value, onChange, onContinue }: LocationStepProps) {
  const [submitted, setSubmitted] = useState(false);
  const [cityTouched, setCityTouched] = useState(false);
  const cityRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const justSelected = useRef(false);

  const cityError = validateCity(value.city);
  const showCityError = (submitted || cityTouched) && cityError;

  useEffect(() => {
    if (!justSelected.current) return;
    justSelected.current = false;
    const t = window.setTimeout(() => cityRef.current?.focus(), 260);
    return () => window.clearTimeout(t);
  }, [value.state]);

  const selectState = (id: string) => {
    const state = id as StateOptionId;
    if (state === value.state) return;
    justSelected.current = true;
    setSubmitted(false);
    setCityTouched(false);
    onChange({ state, uf: state, city: '' });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!value.state) return;
    if (cityError) return cityRef.current?.focus();
    onChange({ city: value.city.trim().replace(/\s+/g, ' ') });
    onContinue();
  };

  const suggestions = value.state ? CITY_SUGGESTIONS[value.state] : [];

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col">
      <StepHeading title={C.title} subtitle={C.subtitle} />

      <div role="group" aria-label={C.title} className="mt-6 flex flex-col gap-3">
        {C.options.map((opt) => (
          <OptionCard key={opt.id} option={opt} selected={value.state === opt.id} onSelect={selectState} />
        ))}
      </div>

      {submitted && !value.state && (
        <p role="alert" className="mt-3 flex items-center gap-1.5 text-[13px] text-red-300">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> Selecione o estado do seu estabelecimento.
        </p>
      )}

      <AnimatePresence initial={false}>
        {value.state && (
          <motion.div
            key="city"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-0.5 pb-1 pt-6">
              <FormField
                ref={cityRef}
                label={C.cityLabel}
                icon={MapPin}
                name="city"
                autoComplete="address-level2"
                placeholder={value.state === 'MA' ? 'Ex.: São Luís' : 'Ex.: Teresina'}
                list={listId}
                value={value.city}
                maxLength={80}
                onChange={(e) => onChange({ city: e.target.value })}
                onBlur={() => value.city && setCityTouched(true)}
                error={showCityError ? cityError : null}
                valid={!cityError}
                required
              />
              <datalist id={listId}>
                {suggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6">
        <PrimaryButton type="submit">
          {C.cta}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </PrimaryButton>
      </div>
    </form>
  );
}
