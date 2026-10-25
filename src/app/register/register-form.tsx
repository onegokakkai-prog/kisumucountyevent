"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  ErrorSummary,
  FieldError,
  LocationFields,
  Question,
  checkClass,
  checkboxClass,
  errorProps,
  fieldClass,
  legendClass,
  list,
  locationLabels,
  optional,
  optionalLegend,
  str,
  useLiveValues,
  visibleQuestions,
  type FieldErrors,
  type Values,
} from "@/components/forms/form-parts";
import { Icon } from "@/components/icons";
import { questionKey } from "@/lib/form-questions";
import type { RegistrationForm } from "@/lib/registration-form";
import { register } from "./actions";
import type { RegisterState } from "./schema";

const initialState: RegisterState = { status: "idle" };

export function RegisterForm({ form }: { form: RegistrationForm }) {
  // Remounting clears the action state, so "register someone else" starts a fresh form.
  const [attempt, setAttempt] = useState(0);
  return <RegisterFormInner key={attempt} form={form} onReset={() => setAttempt((n) => n + 1)} />;
}

function RegisterFormInner({ form, onReset }: { form: RegistrationForm; onReset: () => void }) {
  const [state, formAction, pending] = useActionState(register, initialState);

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

export function Success({ name, onReset, children }: { name: string; onReset: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div className="flex flex-col items-start gap-[18px] py-6 sm:py-10">
      <span className="flex size-16 items-center justify-center rounded-full bg-sun text-navy">
        <Icon name="check" size={30} strokeWidth={2.6} />
      </span>
      <h2
        ref={ref}
        tabIndex={-1}
        className="font-display text-[clamp(32px,4vw,40px)] leading-tight font-extrabold tracking-[-0.02em] text-navy outline-none"
      >
        You&apos;re registered, {name.split(" ")[0]}.
      </h2>
      <p className="max-w-[520px] text-lg leading-relaxed text-body">{children}</p>
      <div className="flex flex-wrap gap-3">
        <a
          href="#programme"
          className="inline-flex min-h-[52px] items-center rounded-full bg-navy px-[26px] text-base font-bold text-white transition-colors hover:bg-lake"
        >
          See the programme
        </a>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-[52px] cursor-pointer items-center rounded-full border-2 border-navy px-6 text-base font-bold text-navy transition-colors hover:bg-mist"
        >
          Register someone else
        </button>
      </div>
    </div>
  );
}

export function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-[52px] cursor-pointer items-center gap-2.5 rounded-full bg-sun px-8 text-[17px] font-extrabold text-navy transition-colors hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "Sending…" : label}
      {pending ? null : <Icon name="arrow-right" size={18} strokeWidth={2.5} />}
    </button>
  );
}

function Fields({
  form,
  message,
  values,
  errors,
  pending,
}: {
  form: RegistrationForm;
  message?: string;
  values: Values;
  errors: FieldErrors;
  pending: boolean;
}) {
  const { labels, show } = form;
  const [role, setRole] = useState(str(values, "role", form.roles[0] ?? ""));
  const [wantsHub, setWantsHub] = useState(values.wantsHub === true);
  const [live, onChange] = useLiveValues(values);
  const showInstitution = show.institution && form.rolesWithInstitution.includes(role);
  const days = list(values, "days", ["day-1", "day-2"]);
  const chosenInterests = list(values, "interests");
  const questions = visibleQuestions(form.questions, live);

  // Steps are numbered in the order they appear, skipping hidden ones.
  let step = 0;
  const next = () => ++step;

  // Field ids the error summary links to, in form order.
  const summaryLabels: [string, string][] = [
    ["role", labels.rolesHeading],
    ["name", labels.nameLabel],
    ["phone", labels.phoneLabel],
    ["email", labels.emailLabel],
    ...locationLabels(form.location),
    ["institution", labels.institutionLabel],
    ["groupSize", labels.groupSizeLabel],
    ["days", labels.daysHeading],
    ...form.questions.map((q): [string, string] => [questionKey(q.id), q.label]),
    ["hubService", labels.hubServiceLabel],
    ["hubSlot", labels.hubSlotLabel],
  ];

  return (
    <div className="contents" onChange={onChange}>
      {message ? <ErrorSummary message={message} errors={errors} labels={summaryLabels} /> : null}
      <fieldset className="flex flex-col">
        <legend className={legendClass}>
          {next()}. {labels.rolesHeading}
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {form.roles.map((r, i) => (
            <label key={r} className="cursor-pointer">
              <input
                id={i === 0 ? "role" : undefined}
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                className="peer sr-only"
              />
              <span className="inline-flex min-h-11 items-center rounded-full border-2 border-line-strong bg-white px-5 text-base font-semibold text-navy transition-colors peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sun hover:border-navy">
                {r}
              </span>
            </label>
          ))}
        </div>
        <FieldError id="role-error" errors={errors.role} />
      </fieldset>

      <fieldset className="flex flex-col">
        <legend className={legendClass}>
          {next()}. {labels.detailsHeading}
        </legend>
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
          {show.email ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[15px] font-semibold">
                {labels.emailLabel} {optional}
              </label>
              <input id="email" name="email" type="email" autoComplete="email" defaultValue={str(values, "email")} {...errorProps(errors, "email")} className={fieldClass} />
              <FieldError id="email-error" errors={errors.email} />
            </div>
          ) : null}
          <LocationFields location={form.location} values={values} errors={errors} />
          {showInstitution ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="institution" className="text-[15px] font-semibold">
                {labels.institutionLabel}
              </label>
              <input
                id="institution"
                name="institution"
                type="text"
                autoComplete="organization"
                defaultValue={str(values, "institution")}
                {...errorProps(errors, "institution")}
                className={fieldClass}
              />
              <FieldError id="institution-error" errors={errors.institution} />
            </div>
          ) : null}
          {show.groupSize ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="groupSize" className="text-[15px] font-semibold">
                {labels.groupSizeLabel}
              </label>
              <input
                id="groupSize"
                name="groupSize"
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                defaultValue={str(values, "groupSize", "1")}
                {...errorProps(errors, "groupSize")}
                className={fieldClass}
              />
              <FieldError id="groupSize-error" errors={errors.groupSize} />
            </div>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="flex flex-col" aria-describedby={errors.days?.length ? "days-error" : undefined}>
        <legend className={legendClass}>
          {next()}. {labels.daysHeading}
        </legend>
        {form.days.map((d, i) => (
          <label key={d.id} className={checkClass}>
            <input
              type="checkbox"
              id={i === 0 ? "days" : undefined}
              name="days"
              value={d.id}
              defaultChecked={days.includes(d.id)}
              aria-invalid={i === 0 && errors.days?.length ? true : undefined}
              className={checkboxClass}
            />
            {d.label}
          </label>
        ))}
        <FieldError id="days-error" errors={errors.days} />
      </fieldset>

      {show.interests ? (
        <fieldset className="flex flex-col">
          <legend className={legendClass}>
            {next()}. {labels.interestsHeading} {optionalLegend}
          </legend>
          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {form.interests.map((i) => (
              <label key={i} className={checkClass}>
                <input type="checkbox" name="interests" value={i} defaultChecked={chosenInterests.includes(i)} className={checkboxClass} />
                {i}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {questions.length ? (
        <fieldset className="flex flex-col">
          <legend className={legendClass}>
            {next()}. {form.questionsHeading}
          </legend>
          <div className="flex flex-col gap-6">
            {questions.map((q) => (
              <Question key={q.id} q={q} values={values} live={live} errors={errors} />
            ))}
          </div>
        </fieldset>
      ) : null}

      {show.hub ? (
        <fieldset id="access-hub" className="flex scroll-mt-24 flex-col gap-3.5 rounded-[18px] bg-mist p-5 sm:p-6">
          <legend className="float-left w-full p-0 font-display text-2xl font-extrabold text-navy">
            {next()}. {labels.hubHeading} {optionalLegend}
          </legend>
          {labels.hubBody ? <p className="text-base leading-normal text-body">{labels.hubBody}</p> : null}
          <label className={checkClass}>
            <input
              type="checkbox"
              name="wantsHub"
              checked={wantsHub}
              onChange={(e) => setWantsHub(e.target.checked)}
              aria-controls="hub-fields"
              className={checkboxClass}
            />
            {labels.hubCheckbox}
          </label>
          {wantsHub ? (
            <div id="hub-fields" className="grid gap-[18px] sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="hubService" className="text-[15px] font-semibold">
                  {labels.hubServiceLabel}
                </label>
                <select id="hubService" name="hubService" defaultValue={str(values, "hubService")} {...errorProps(errors, "hubService")} className={fieldClass}>
                  <option value="" disabled>
                    Select…
                  </option>
                  {form.hubServices.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <FieldError id="hubService-error" errors={errors.hubService} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="hubSlot" className="text-[15px] font-semibold">
                  {labels.hubSlotLabel}
                </label>
                <select id="hubSlot" name="hubSlot" defaultValue={str(values, "hubSlot")} {...errorProps(errors, "hubSlot")} className={fieldClass}>
                  <option value="" disabled>
                    Select…
                  </option>
                  {form.hubSlots.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <FieldError id="hubSlot-error" errors={errors.hubSlot} />
              </div>
            </div>
          ) : null}
        </fieldset>
      ) : null}

      <div className={`flex flex-wrap items-center gap-4 border-t border-line pt-7 ${show.updates ? "justify-between" : "justify-end"}`}>
        {show.updates ? (
          <label className={`${checkClass} text-[15px] text-body`}>
            <input type="checkbox" name="emailUpdates" defaultChecked={values.emailUpdates === true} className={checkboxClass} />
            {labels.updatesLabel}
          </label>
        ) : null}
        <SubmitButton pending={pending} label={labels.submitLabel} />
      </div>
    </div>
  );
}
