import { m } from 'framer-motion';
import { AlertCircle, ArrowRight, Check, FileText, Loader2, Lock, Mail, MapPin, Phone, Store, User } from 'lucide-react';
import { useId, useRef, useState, type FormEvent } from 'react';
import { CONTACT_COPY as C } from '../config/quiz';
import {
  maskCnpj,
  maskPhone,
  validateBusiness,
  validateCnpj,
  validateEmail,
  validateFullName,
  validatePhone,
} from '../lib/validation';
import type { ContactData } from '../types';
import { FormField } from './FormField';
import { PrimaryButton } from './PrimaryButton';
import { StepHeading } from './StepHeading';

type FieldKey = 'name' | 'business' | 'whatsapp' | 'email' | 'cnpj' | 'consent';

interface ContactFormProps {
  value: ContactData;
  cityUf: string;
  sending: boolean;
  submitFailed: boolean;
  onChange: (patch: Partial<ContactData>) => void;
  onSubmit: () => void;
  onEditLocation: () => void;
}

function validateAll(v: ContactData): Record<FieldKey, string | null> {
  return {
    name: validateFullName(v.name),
    business: validateBusiness(v.business),
    whatsapp: validatePhone(v.whatsapp),
    email: validateEmail(v.email),
    cnpj: validateCnpj(v.cnpj),
    consent: v.consent ? null : 'Para continuar, autorize o contato comercial.',
  };
}

const ORDER: FieldKey[] = ['name', 'business', 'whatsapp', 'email', 'cnpj', 'consent'];

export function ContactForm({ value, cityUf, sending, submitFailed, onChange, onSubmit, onEditLocation }: ContactFormProps) {
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const refs = {
    name: useRef<HTMLInputElement>(null),
    business: useRef<HTMLInputElement>(null),
    whatsapp: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    cnpj: useRef<HTMLInputElement>(null),
    consent: useRef<HTMLInputElement>(null),
  };
  const consentId = useId();

  const errors = validateAll(value);
  const shown = (k: FieldKey) => ((submitted || touched[k]) && errors[k]) || null;
  const touch = (k: FieldKey) => () => setTouched((t) => ({ ...t, [k]: true }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (sending) return; // evita envio duplicado
    setSubmitted(true);
    const firstInvalid = ORDER.find((k) => errors[k]);
    if (firstInvalid) {
      refs[firstInvalid].current?.focus();
      return;
    }
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col" aria-busy={sending}>
      <StepHeading title={C.title} subtitle={C.subtitle} />

      {cityUf && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-peach/45 px-4 py-3 text-sm">
          <span className="flex items-center gap-2 text-ink/80">
            <MapPin className="h-4 w-4 text-copper" aria-hidden="true" />
            <span>
              <span className="text-ink/55">Cidade/UF: </span>
              <strong className="font-bold text-ink">{cityUf}</strong>
            </span>
          </span>
          <button
            type="button"
            onClick={onEditLocation}
            className="focus-ring rounded-md px-1 text-xs font-bold text-copper underline-offset-2 hover:underline"
          >
            Alterar
          </button>
        </div>
      )}

      <fieldset disabled={sending} className="mt-6 flex flex-col gap-4">
        <legend className="sr-only">Seus dados de contato</legend>
        <FormField
          ref={refs.name}
          label={C.fields.name.label}
          placeholder={C.fields.name.placeholder}
          icon={User}
          name="name"
          autoComplete="name"
          autoCapitalize="words"
          maxLength={120}
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          onBlur={touch('name')}
          error={shown('name')}
          valid={!errors.name}
          required
        />
        <FormField
          ref={refs.business}
          label={C.fields.business.label}
          placeholder={C.fields.business.placeholder}
          icon={Store}
          name="organization"
          autoComplete="organization"
          maxLength={120}
          value={value.business}
          onChange={(e) => onChange({ business: e.target.value })}
          onBlur={touch('business')}
          error={shown('business')}
          valid={!errors.business}
          required
        />
        <FormField
          ref={refs.whatsapp}
          label={C.fields.whatsapp.label}
          placeholder={C.fields.whatsapp.placeholder}
          icon={Phone}
          name="tel"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={value.whatsapp}
          onChange={(e) => onChange({ whatsapp: maskPhone(e.target.value) })}
          onBlur={touch('whatsapp')}
          error={shown('whatsapp')}
          valid={!errors.whatsapp}
          required
        />
        <FormField
          ref={refs.email}
          label={C.fields.email.label}
          hint={C.fields.email.hint}
          placeholder={C.fields.email.placeholder}
          icon={Mail}
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={254}
          value={value.email}
          onChange={(e) => onChange({ email: e.target.value })}
          onBlur={touch('email')}
          error={shown('email')}
          valid={!!value.email && !errors.email}
        />
        <FormField
          ref={refs.cnpj}
          label={C.fields.cnpj.label}
          hint={C.fields.cnpj.hint}
          placeholder={C.fields.cnpj.placeholder}
          icon={FileText}
          name="cnpj"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={value.cnpj}
          onChange={(e) => onChange({ cnpj: maskCnpj(e.target.value) })}
          onBlur={touch('cnpj')}
          error={shown('cnpj')}
          valid={!!value.cnpj && !errors.cnpj}
        />

        <div>
          <label
            htmlFor={consentId}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors duration-200 ${
              shown('consent') ? 'border-red-600/60 bg-red-50/60' : 'border-ink/12 bg-white/45 hover:border-copper/45'
            }`}
          >
            <span className="relative mt-0.5 grid h-5 w-5 shrink-0 place-items-center">
              <input
                ref={refs.consent}
                id={consentId}
                type="checkbox"
                checked={value.consent}
                onChange={(e) => {
                  onChange({ consent: e.target.checked });
                  touch('consent')();
                }}
                aria-invalid={!!shown('consent')}
                className="peer focus-ring absolute inset-0 h-5 w-5 cursor-pointer appearance-none rounded-md border border-ink/35 bg-white/80 transition-colors checked:border-copper checked:bg-copper"
              />
              <m.span
                initial={false}
                animate={{ scale: value.consent ? 1 : 0 }}
                transition={{ duration: 0.18 }}
                className="pointer-events-none relative text-cream"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3.5} aria-hidden="true" />
              </m.span>
            </span>
            <span className="text-[13px] leading-relaxed text-ink/75">{C.consent}</span>
          </label>
          {shown('consent') && (
            <p role="alert" className="flex items-center gap-1.5 pt-1.5 text-[13px] font-medium text-red-700">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> {errors.consent}
            </p>
          )}
        </div>
      </fieldset>

      <div className="mt-6">
        {submitFailed && (
          <p role="alert" className="mb-3 text-sm font-medium text-red-700">
            Não foi possível confirmar seu cadastro. Seus dados foram mantidos; tente enviar novamente.
          </p>
        )}
        <PrimaryButton type="submit" disabled={sending}>
          {sending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              {C.sending}
            </>
          ) : (
            <>
              {C.cta}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </>
          )}
        </PrimaryButton>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-ink/60">
          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {C.microcopy}
        </p>
      </div>
    </form>
  );
}
