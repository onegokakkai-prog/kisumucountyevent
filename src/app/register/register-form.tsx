"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import {
  hubServices,
  hubSlots,
  interests,
  roles,
  rolesWithInstitution,
  subCounties,
} from "@/lib/festival";
import { register } from "./actions";
import type { FieldErrors, RegisterState } from "./schema";

const initialState: RegisterState = { status: "idle" };

export function RegisterForm() {
  // Remounting clears the action state, so "register someone else" starts a fresh form.
  const [attempt, setAttempt] = useState(0);
  return <RegisterFormInner key={attempt} onReset={() => setAttempt((n) => n + 1)} />;
}

function RegisterFormInner({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(register, initialState);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-start gap-[18px] py-6 sm:py-10">
        <span className="flex size-16 items-center justify-center rounded-full bg-sun text-navy">
          <Icon name="check" size={30} strokeWidth={2.6} />
        </span>
        <h2
          ref={successRef}
          tabIndex={-1}
          className="font-display text-[clamp(32px,4vw,40px)] leading-tight font-extrabold tracking-[-0.02em] text-navy outline-none"
        >
          You&apos;re registered, {state.name.split(" ")[0]}.
        </h2>
        <p className="max-w-[520px] text-lg leading-relaxed text-body">
          Thank you. The festival team will contact you on {state.phone} with your entry details and session
          reminders. See you at Kisumu Central Grounds.
        </p>
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

  const errorState = state.status === "error" ? state : null;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-9">
      <Fields
        key={errorState?.submittedAt ?? "initial"}
        message={errorState?.message}
        values={errorState?.values ?? {}}
        errors={errorState?.errors ?? {}}
        pending={pending}
      />
    </form>
  );
}

const fieldClass =
  "min-h-12 w-full rounded-xl border-[1.5px] bg-white px-3.5 py-3 text-base text-ink placeholder:text-muted/70 focus:border-navy focus:outline-3 focus:outline-offset-1 focus:outline-sun aria-[invalid=true]:border-rust";
const legendClass = "mb-4 p-0 font-display text-2xl font-extrabold text-navy";
const checkClass = "flex min-h-11 cursor-pointer items-center gap-3 text-base";
const checkboxClass = "size-5 flex-none accent-navy";

function str(values: Record<string, unknown>, key: string, fallback = "") {
  const v = values[key];
  return typeof v === "string" ? v : fallback;
}

function list(values: Record<string, unknown>, key: string, fallback: string[] = []) {
  const v = values[key];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : fallback;
}

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="text-sm font-semibold text-rust">
      {errors[0]}
    </p>
  );
}

// Field ids the error summary links to, in form order.
const fieldLabels: [keyof FieldErrors, string][] = [
  ["role", "How you're attending"],
  ["name", "Full name"],
  ["phone", "Mobile number"],
  ["email", "Email"],
  ["subCounty", "Sub-county"],
  ["institution", "School or institution"],
  ["groupSize", "Number in your group"],
  ["days", "Which days"],
  ["hubService", "Access Hub service"],
  ["hubSlot", "Access Hub preferred time"],
];

function ErrorSummary({ message, errors }: { message: string; errors: FieldErrors }) {
  const ref = useRef<HTMLDivElement>(null);
  const items = fieldLabels.filter(([k]) => errors[k]?.length);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      aria-labelledby="error-summary-title"
      className="rounded-2xl border-2 border-rust bg-rust-soft px-5 py-4 text-rust-ink focus-visible:outline-offset-4"
    >
      <h2 id="error-summary-title" className="font-semibold">
        {message}
      </h2>
      {items.length ? (
        <ul className="mt-2 flex flex-col gap-1">
          {items.map(([k, label]) => (
            <li key={k}>
              <a
                href={`#${k}`}
                onClick={(e) => {
                  const field = document.getElementById(k);
                  if (!field) return;
                  e.preventDefault();
                  field.focus();
                  field.scrollIntoView({ block: "center" });
                }}
                className="inline-flex min-h-8 items-center font-semibold underline underline-offset-4"
              >
                {label}: {errors[k]![0]}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Fields({
  message,
  values,
  errors,
  pending,
}: {
  message?: string;
  values: Record<string, unknown>;
  errors: FieldErrors;
  pending: boolean;
}) {
  const [role, setRole] = useState(str(values, "role", roles[0]));
  const [wantsHub, setWantsHub] = useState(values.wantsHub === true);
  const showInstitution = (rolesWithInstitution as readonly string[]).includes(role);
  const days = list(values, "days", ["day-1", "day-2"]);
  const chosenInterests = list(values, "interests");

  const invalid = (k: keyof FieldErrors) => (errors[k]?.length ? true : undefined);
  const describedBy = (k: keyof FieldErrors) => (errors[k]?.length ? `${k}-error` : undefined);

  return (
    <>
      {message ? <ErrorSummary message={message} errors={errors} /> : null}
      <fieldset className="flex flex-col">
        <legend className={legendClass}>1. I&apos;m coming as…</legend>
        <div className="flex flex-wrap gap-2.5">
          {roles.map((r, i) => (
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
        <legend className={legendClass}>2. Your details</legend>
        <div className="grid gap-[18px] sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-[15px] font-semibold">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              defaultValue={str(values, "name")}
              aria-invalid={invalid("name")}
              aria-describedby={describedBy("name")}
              className={`${fieldClass} border-line-strong`}
            />
            <FieldError id="name-error" errors={errors.name} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-[15px] font-semibold">
              Mobile number
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
              aria-invalid={invalid("phone")}
              aria-describedby={describedBy("phone")}
              className={`${fieldClass} border-line-strong`}
            />
            <FieldError id="phone-error" errors={errors.phone} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[15px] font-semibold">
              Email <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={str(values, "email")}
              aria-invalid={invalid("email")}
              aria-describedby={describedBy("email")}
              className={`${fieldClass} border-line-strong`}
            />
            <FieldError id="email-error" errors={errors.email} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="subCounty" className="text-[15px] font-semibold">
              Sub-county
            </label>
            <select
              id="subCounty"
              name="subCounty"
              required
              defaultValue={str(values, "subCounty")}
              aria-invalid={invalid("subCounty")}
              aria-describedby={describedBy("subCounty")}
              className={`${fieldClass} border-line-strong`}
            >
              <option value="" disabled>
                Select…
              </option>
              {subCounties.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <FieldError id="subCounty-error" errors={errors.subCounty} />
          </div>
          {showInstitution ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="institution" className="text-[15px] font-semibold">
                School or institution
              </label>
              <input
                id="institution"
                name="institution"
                type="text"
                autoComplete="organization"
                defaultValue={str(values, "institution")}
                className={`${fieldClass} border-line-strong`}
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <label htmlFor="groupSize" className="text-[15px] font-semibold">
              Number in your group
            </label>
            <input
              id="groupSize"
              name="groupSize"
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              defaultValue={str(values, "groupSize", "1")}
              aria-invalid={invalid("groupSize")}
              aria-describedby={describedBy("groupSize")}
              className={`${fieldClass} border-line-strong`}
            />
            <FieldError id="groupSize-error" errors={errors.groupSize} />
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col" aria-describedby={describedBy("days")}>
        <legend className={legendClass}>3. Which days?</legend>
        <label className={checkClass}>
          <input
            type="checkbox"
            id="days"
            name="days"
            value="day-1"
            defaultChecked={days.includes("day-1")}
            aria-invalid={invalid("days")}
            className={checkboxClass}
          />
          Day 1 — Opening, Town Hall &amp; constituency debates
        </label>
        <label className={checkClass}>
          <input
            type="checkbox"
            name="days"
            value="day-2"
            defaultChecked={days.includes("day-2")}
            className={checkboxClass}
          />
          Day 2 — CBE keynote, Gubernatorial Debate &amp; Grand Awards
        </label>
        <FieldError id="days-error" errors={errors.days} />
      </fieldset>

      <fieldset className="flex flex-col">
        <legend className={legendClass}>
          4. What interests you? <span className="font-sans text-base font-medium text-muted">(optional)</span>
        </legend>
        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {interests.map((i) => (
            <label key={i} className={checkClass}>
              <input
                type="checkbox"
                name="interests"
                value={i}
                defaultChecked={chosenInterests.includes(i)}
                className={checkboxClass}
              />
              {i}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset id="access-hub" className="flex scroll-mt-24 flex-col gap-3.5 rounded-[18px] bg-mist p-5 sm:p-6">
        <legend className="float-left w-full p-0 font-display text-2xl font-extrabold text-navy">
          5. Access Hub <span className="font-sans text-base font-medium text-muted">(optional)</span>
        </legend>
        <p className="text-base leading-normal text-body">
          Book ahead to skip the queue at the scholarship desk, EARC screenings or NCPWD registration.
        </p>
        <label className={checkClass}>
          <input
            type="checkbox"
            name="wantsHub"
            checked={wantsHub}
            onChange={(e) => setWantsHub(e.target.checked)}
            aria-controls="hub-fields"
            className={checkboxClass}
          />
          Yes, I&apos;d like to book an Access Hub slot
        </label>
        {wantsHub ? (
          <div id="hub-fields" className="grid gap-[18px] sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="hubService" className="text-[15px] font-semibold">
                Service
              </label>
              <select
                id="hubService"
                name="hubService"
                defaultValue={str(values, "hubService")}
                aria-invalid={invalid("hubService")}
                aria-describedby={describedBy("hubService")}
                className={`${fieldClass} border-line-strong`}
              >
                <option value="" disabled>
                  Select…
                </option>
                {hubServices.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <FieldError id="hubService-error" errors={errors.hubService} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="hubSlot" className="text-[15px] font-semibold">
                Preferred time
              </label>
              <select
                id="hubSlot"
                name="hubSlot"
                defaultValue={str(values, "hubSlot")}
                aria-invalid={invalid("hubSlot")}
                aria-describedby={describedBy("hubSlot")}
                className={`${fieldClass} border-line-strong`}
              >
                <option value="" disabled>
                  Select…
                </option>
                {hubSlots.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <FieldError id="hubSlot-error" errors={errors.hubSlot} />
            </div>
          </div>
        ) : null}
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7">
        <label className={`${checkClass} text-[15px] text-body`}>
          <input
            type="checkbox"
            name="emailUpdates"
            defaultChecked={values.emailUpdates === true}
            className={checkboxClass}
          />
          Send me festival updates by email
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[52px] cursor-pointer items-center gap-2.5 rounded-full bg-sun px-8 text-[17px] font-extrabold text-navy transition-colors hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Registering…" : "Complete registration"}
          {pending ? null : <Icon name="arrow-right" size={18} strokeWidth={2.5} />}
        </button>
      </div>
    </>
  );
}
