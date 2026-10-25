"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  OTHER,
  groupOptions,
  isVisible,
  otherKey,
  questionKey,
  valuesReader,
  type FormQuestion,
} from "@/lib/form-questions";
import { wardsFor, type LocationConfig } from "@/lib/registration-form";

// Building blocks shared by the visitor and professionals' registration forms.

export type FieldErrors = Record<string, string[] | undefined>;
export type Values = Record<string, unknown>;

export const fieldClass =
  "min-h-12 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 py-3 text-base text-ink placeholder:text-muted/70 focus:border-navy focus:outline-3 focus:outline-offset-1 focus:outline-sun aria-[invalid=true]:border-rust";
export const legendClass = "mb-4 p-0 font-display text-2xl font-extrabold text-navy";
export const checkClass = "flex min-h-11 cursor-pointer items-center gap-3 text-base";
export const checkboxClass = "size-5 flex-none accent-navy";
export const optional = <span className="font-normal text-muted">(optional)</span>;
export const optionalLegend = <span className="font-sans text-base font-medium text-muted">(optional)</span>;

export function str(values: Values, key: string, fallback = "") {
  const v = values[key];
  return typeof v === "string" ? v : fallback;
}

export function list(values: Values, key: string, fallback: string[] = []) {
  const v = values[key];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : fallback;
}

export function errorProps(errors: FieldErrors, key: string) {
  return {
    "aria-invalid": errors[key]?.length ? true : undefined,
    "aria-describedby": errors[key]?.length ? `${key}-error` : undefined,
  };
}

export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="text-sm font-semibold text-rust">
      {errors[0]}
    </p>
  );
}

export function ErrorSummary({ message, errors, labels }: { message: string; errors: FieldErrors; labels: [string, string][] }) {
  const ref = useRef<HTMLDivElement>(null);
  const items = labels.filter(([k]) => errors[k]?.length);

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

// Labels for the error summary, in form order.
export function locationLabels(location: LocationConfig): [string, string][] {
  return [
    ["gender", location.labels.gender],
    ["subCounty", location.labels.subCounty],
    ["ward", location.labels.ward],
    ["region", location.labels.region],
  ];
}

// Tracks the form's current answers, so follow-up questions can appear as people answer.
// Put it on an element inside the form: change events bubble up to it.
export function useLiveValues(initial: Values) {
  const [values, setValues] = useState<Values>(initial);
  const onChange = (e: ChangeEvent<HTMLElement>) => {
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const data = new FormData(form);
    const next: Values = {};
    for (const key of new Set(data.keys())) {
      const all = data.getAll(key).filter((v): v is string => typeof v === "string");
      next[key] = all.length > 1 || key.startsWith("q_") ? all : (all[0] ?? "");
    }
    setValues(next);
  };
  return [values, onChange] as const;
}

// Gender, sub-county, then the ward for that sub-county or, from outside Kisumu County, a region.
export function LocationFields({ location, values, errors }: { location: LocationConfig; values: Values; errors: FieldErrors }) {
  const [subCounty, setSubCounty] = useState(str(values, "subCounty"));
  const wards = wardsFor(location, subCounty);
  const askWard = location.showWard && wards.length > 0;
  const askRegion = location.showSubCounty && subCounty !== "" && wards.length === 0 && location.regions.length > 0;
  const { labels } = location;

  return (
    <>
      {location.showGender ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="gender" className="text-[15px] font-semibold">
            {labels.gender}
          </label>
          <select id="gender" name="gender" defaultValue={str(values, "gender")} {...errorProps(errors, "gender")} className={fieldClass}>
            <option value="" disabled>
              Select…
            </option>
            {location.genders.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <FieldError id="gender-error" errors={errors.gender} />
        </div>
      ) : null}
      {location.showSubCounty ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="subCounty" className="text-[15px] font-semibold">
            {labels.subCounty}
          </label>
          <select
            id="subCounty"
            name="subCounty"
            value={subCounty}
            onChange={(e) => setSubCounty(e.target.value)}
            {...errorProps(errors, "subCounty")}
            className={fieldClass}
          >
            <option value="" disabled>
              Select…
            </option>
            {location.subCounties.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <FieldError id="subCounty-error" errors={errors.subCounty} />
        </div>
      ) : null}
      {askWard ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="ward" className="text-[15px] font-semibold">
            {labels.ward}
          </label>
          {/* Keyed by sub-county so switching sub-county clears a ward from the old one. */}
          <select
            key={subCounty}
            id="ward"
            name="ward"
            defaultValue={wards.includes(str(values, "ward")) ? str(values, "ward") : ""}
            {...errorProps(errors, "ward")}
            className={fieldClass}
          >
            <option value="" disabled>
              Select…
            </option>
            {wards.map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
          <FieldError id="ward-error" errors={errors.ward} />
        </div>
      ) : null}
      {askRegion ? (
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="region" className="text-[15px] font-semibold">
            {labels.region}
          </label>
          <select id="region" name="region" defaultValue={str(values, "region")} {...errorProps(errors, "region")} className={fieldClass}>
            <option value="" disabled>
              Select…
            </option>
            {location.regions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <FieldError id="region-error" errors={errors.region} />
        </div>
      ) : null}
    </>
  );
}

// The organisers' questions that apply given the answers so far.
export function visibleQuestions(questions: FormQuestion[], live: Values) {
  return questions.filter((q) => isVisible(q, questions, valuesReader(live)));
}

// One organiser-defined question. As a step, its wording is the step heading.
export function Question({
  q,
  values,
  live,
  errors,
  step,
}: {
  q: FormQuestion;
  values: Values;
  live: Values;
  errors: FieldErrors;
  step?: number;
}) {
  const key = questionKey(q.id);
  const error = errors[key];
  const required = q.required === "yes";
  const describedBy = [q.help ? `${key}-help` : null, error?.length ? `${key}-error` : null].filter(Boolean).join(" ") || undefined;
  const label = (
    <>
      {step ? `${step}. ` : null}
      {q.label} {required ? null : step ? optionalLegend : optional}
    </>
  );
  const help = q.help ? (
    <p id={`${key}-help`} className={step ? "-mt-2 mb-2 text-base text-body" : "text-sm text-muted"}>
      {q.help}
    </p>
  ) : null;
  const groups = groupOptions(q.options);
  const current = valuesReader(live)(key);
  const showOther = q.other === "yes" && current.includes(OTHER);
  const other = showOther ? (
    <div className="flex flex-col gap-2">
      <label htmlFor={otherKey(q.id)} className="text-[15px] font-semibold">
        Please tell us
      </label>
      <input id={otherKey(q.id)} name={otherKey(q.id)} type="text" defaultValue={str(values, otherKey(q.id))} className={fieldClass} />
    </div>
  ) : null;

  if (q.type === "radio" || q.type === "checkboxes" || q.type === "yesno") {
    const chosen = q.type === "checkboxes" ? list(values, key) : [str(values, key)];
    const input = (o: string, first: boolean) => (
      <label key={o} className={checkClass}>
        <input
          id={first ? key : undefined}
          type={q.type === "checkboxes" ? "checkbox" : "radio"}
          name={key}
          value={o}
          defaultChecked={chosen.includes(o)}
          aria-invalid={first && error?.length ? true : undefined}
          className={checkboxClass}
        />
        {o}
      </label>
    );
    const extras = q.type !== "yesno" && q.other === "yes" ? [OTHER] : [];
    return (
      <fieldset className="flex flex-col gap-1" aria-describedby={describedBy}>
        <legend className={step ? legendClass : "mb-1 text-[15px] font-semibold"}>{label}</legend>
        {help}
        {q.type === "yesno" ? (
          <div className="flex gap-6">{["Yes", "No"].map((o, i) => input(o, i === 0))}</div>
        ) : (
          <>
            {groups.map((g, gi) => (
              <div key={`${g.label}-${gi}`} className="flex flex-col">
                {g.label ? <span className="mt-3 mb-1 text-[13px] font-bold tracking-[0.06em] text-rust uppercase">{g.label}</span> : null}
                <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">{g.options.map((o, i) => input(o, gi === 0 && i === 0))}</div>
              </div>
            ))}
            {extras.length ? <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">{extras.map((o) => input(o, groups.length === 0))}</div> : null}
          </>
        )}
        <FieldError id={`${key}-error`} errors={error} />
        {other}
      </fieldset>
    );
  }

  const common = {
    id: key,
    name: key,
    defaultValue: str(values, key),
    required,
    "aria-invalid": error?.length ? true : undefined,
    "aria-describedby": describedBy,
    className: fieldClass,
  };

  const control =
    q.type === "select" ? (
      <select {...common}>
        <option value="">Select…</option>
        {groups.map((g, gi) =>
          g.label ? (
            <optgroup key={`${g.label}-${gi}`} label={g.label}>
              {g.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </optgroup>
          ) : (
            g.options.map((o) => <option key={o}>{o}</option>)
          ),
        )}
        {q.other === "yes" ? <option>{OTHER}</option> : null}
      </select>
    ) : q.type === "textarea" ? (
      <textarea {...common} rows={4} />
    ) : (
      <input {...common} type="text" inputMode={q.type === "number" ? "decimal" : undefined} />
    );

  if (step) {
    return (
      <fieldset className="flex flex-col gap-2">
        <legend className={legendClass}>
          <label htmlFor={key}>{label}</label>
        </legend>
        {help}
        {control}
        <FieldError id={`${key}-error`} errors={error} />
        {other}
      </fieldset>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={key} className="text-[15px] font-semibold">
        {label}
      </label>
      {help}
      {control}
      <FieldError id={`${key}-error`} errors={error} />
      {other}
    </div>
  );
}
