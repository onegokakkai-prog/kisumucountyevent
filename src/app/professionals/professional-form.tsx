"use client";

import { useActionState, useState } from "react";
import {
  ErrorSummary,
  FieldError,
  LocationFields,
  Question,
  errorProps,
  fieldClass,
  legendClass,
  locationLabels,
  optional,
  str,
  useLiveValues,
  visibleQuestions,
  type FieldErrors,
  type Values,
} from "@/components/forms/form-parts";
import { questionKey } from "@/lib/form-questions";
import type { ProfessionalForm as ProfessionalFormConfig } from "@/lib/registration-form";
import { Success, SubmitButton } from "../register/register-form";
import type { RegisterState } from "../register/schema";
import { registerProfessional } from "./actions";

const initialState: RegisterState = { status: "idle" };

export function ProfessionalForm({ form }: { form: ProfessionalFormConfig }) {
  const [attempt, setAttempt] = useState(0);
  return <ProfessionalFormInner key={attempt} form={form} onReset={() => setAttempt((n) => n + 1)} />;
}

function ProfessionalFormInner({ form, onReset }: { form: ProfessionalFormConfig; onReset: () => void }) {
  const [state, formAction, pending] = useActionState(registerProfessional, initialState);

  if (state.status === "success") {
    return (
      <Success name={state.name} onReset={onReset}>
        {form.labels.successBody.replaceAll("{phone}", state.phone)}
      </Success>
    );
  }

  const errorState = state.status === "error" ? state : null;
  return (
    <form action={formAction} noValidate className="flex flex-col gap-9">
      <Fields
        key={errorState?.submittedAt ?? "initial"}
        form={form}
        message={errorState?.message}
        values={errorState?.values ?? {}}
        errors={errorState?.errors ?? {}}
        pending={pending}
      />
    </form>
  );
}

function Fields({
  form,
  message,
  values,
  errors,
  pending,
}: {
  form: ProfessionalFormConfig;
  message?: string;
  values: Values;
  errors: FieldErrors;
  pending: boolean;
}) {
  const { labels } = form;
  const [live, onChange] = useLiveValues(values);
  const questions = visibleQuestions(form.questions, live);
  const summaryLabels: [string, string][] = [
    ["name", labels.nameLabel],
    ["phone", labels.phoneLabel],
    ["email", labels.emailLabel],
    ...locationLabels(form.location),
    ...form.questions.map((q): [string, string] => [questionKey(q.id), q.label]),
  ];

  return (
    <div className="contents" onChange={onChange}>
      {message ? <ErrorSummary message={message} errors={errors} labels={summaryLabels} /> : null}
      {labels.intro ? <p className="text-lg leading-relaxed text-body">{labels.intro}</p> : null}

      <fieldset className="flex flex-col">
        <legend className={legendClass}>1. {labels.detailsHeading}</legend>
        <div className="grid gap-[18px] sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-[15px] font-semibold">
              {labels.nameLabel}
            </label>
            <input id="name" name="name" type="text" autoComplete="name" required defaultValue={str(values, "name")} {...errorProps(errors, "name")} className={fieldClass} />
            <FieldError id="name-error" errors={errors.name} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-[15px] font-semibold">
              {labels.phoneLabel}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              placeholder="0712 345 678"
              defaultValue={str(values, "phone")}
              {...errorProps(errors, "phone")}
              className={fieldClass}
            />
            <FieldError id="phone-error" errors={errors.phone} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[15px] font-semibold">
              {labels.emailLabel} {optional}
            </label>
            <input id="email" name="email" type="email" autoComplete="email" defaultValue={str(values, "email")} {...errorProps(errors, "email")} className={fieldClass} />
            <FieldError id="email-error" errors={errors.email} />
          </div>
          <LocationFields location={form.location} values={values} errors={errors} />
        </div>
      </fieldset>

      {questions.map((q, i) => (
        <Question key={q.id} q={q} values={values} live={live} errors={errors} step={i + 2} />
      ))}

      <div className="flex justify-end border-t border-line pt-7">
        <SubmitButton pending={pending} label={labels.submitLabel} />
      </div>
    </div>
  );
}
