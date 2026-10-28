"use client";

import { startTransition, useActionState, useState, useTransition } from "react";
import type { ContentSection } from "@/lib/content";
import type { FestivalDay } from "@/lib/festival";
import { buttonClass } from "../admin-ui";
import { resetSection, saveSection, type SaveState } from "./actions";
import { AudioField } from "./audio-field";
import type { Field, SectionConfig } from "./fields";
import { ImageField } from "./image-field";
import { ListField } from "./list-field";
import { PhotosField } from "./photos-field";
import { ProgrammeField } from "./programme-field";

const inputClass =
  "min-h-12 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 py-3 text-base text-ink focus:border-navy focus:outline-3 focus:outline-offset-1 focus:outline-sun";

type Values = Record<string, unknown>;

export function SectionForm({ config, values }: { config: SectionConfig; values: Values }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveSection.bind(null, config.id), { status: "idle" });
  const [resetting, startReset] = useTransition();
  // Remount the fields after a reset so they pick up the restored defaults.
  const [version, setVersion] = useState(0);

  return (
    <section id={config.id} aria-labelledby={`${config.id}-heading`} className="scroll-mt-6 rounded-3xl bg-white p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-1">
        <h2 id={`${config.id}-heading`} className="text-[21px] font-bold text-navy">
          {config.title}
        </h2>
        <p className="text-[15px] text-muted">{config.description}</p>
      </div>
      {/* Submitted by hand rather than through the action prop: React resets a form after an
          action, which snaps the list editors' dropdowns back to their first option on screen. */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          startTransition(() => action(data));
        }}
        className="flex flex-col gap-5"
        key={version}
      >
        <div className={config.id === "colors" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-5"}>
          {config.fields.map((field) => (
            <FieldInput key={field.key} section={config.id} field={field} values={values} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <button type="submit" disabled={pending} className={buttonClass}>
            {pending ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            disabled={resetting}
            onClick={() => {
              if (!window.confirm(`Reset “${config.title}” to the original wording and settings?`)) return;
              startReset(async () => {
                await resetSection(config.id);
                setVersion((v) => v + 1);
              });
            }}
            className="min-h-11 cursor-pointer rounded-full px-4 text-[15px] font-semibold text-muted hover:bg-mist hover:text-navy disabled:opacity-60"
          >
            {resetting ? "Resetting…" : "Reset to original"}
          </button>
          <p aria-live="polite" className="text-[15px] font-semibold">
            {state.status === "saved" && !pending ? <span className="text-[#17603a]">Saved. The site is updated.</span> : null}
            {state.status === "error" && !pending ? <span className="text-rust">{state.message}</span> : null}
          </p>
        </div>
      </form>
    </section>
  );
}

function FieldInput({ section, field, values }: { section: ContentSection; field: Field; values: Values }) {
  const id = `${section}-${field.key}`;
  const value = values[field.key];
  const help = field.help ? (
    <p id={`${id}-help`} className="text-sm text-muted">
      {field.help}
    </p>
  ) : null;
  const describedBy = field.help ? `${id}-help` : undefined;

  if (field.type === "photos") {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-[15px] font-semibold">{field.label}</span>
        {help}
        <PhotosField name={field.key} initial={value as never} />
      </div>
    );
  }
  if (field.type === "audio") {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-[15px] font-semibold">{field.label}</span>
        {help}
        <AudioField name={field.key} initial={String(value ?? "")} initialDuration={String(values.duration ?? "")} />
      </div>
    );
  }
  if (field.type === "image") {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-[15px] font-semibold">{field.label}</span>
        {help}
        <ImageField name={field.key} initial={String(value ?? "")} />
      </div>
    );
  }
  if (field.type === "list") {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-[15px] font-semibold">{field.label}</span>
        {help}
        <ListField name={field.key} fields={field.item} initial={value as Record<string, unknown>[]} itemName={field.itemName} max={field.max} />
      </div>
    );
  }
  if (field.type === "programme") {
    return <ProgrammeField days={value as FestivalDay[]} />;
  }
  if (field.type === "toggle") {
    return (
      <div className="flex flex-col gap-1 rounded-2xl bg-mist px-4 py-2">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] font-semibold">
          <input
            type="checkbox"
            name={field.key}
            defaultChecked={value === true}
            aria-describedby={describedBy}
            className="size-5 flex-none accent-navy"
          />
          {field.label}
        </label>
        {help}
      </div>
    );
  }
  if (field.type === "color") {
    return <ColorInput id={id} name={field.key} label={field.label} initial={String(value)} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {field.label}
      </label>
      {field.type === "textarea" || field.type === "lines" ? (
        <textarea
          id={id}
          name={field.key}
          defaultValue={String(value ?? "")}
          rows={field.type === "lines" ? 5 : 3}
          aria-describedby={describedBy}
          className={inputClass}
        />
      ) : (
        <input
          id={id}
          name={field.key}
          type={field.type === "number" ? "number" : "text"}
          inputMode={field.type === "number" ? "numeric" : undefined}
          min={field.type === "number" ? 0 : undefined}
          defaultValue={value === null || value === undefined ? "" : String(value)}
          aria-describedby={describedBy}
          className={inputClass}
        />
      )}
      {help}
    </div>
  );
}

function ColorInput({ id, name, label, initial }: { id: string; name: string; label: string; initial: string }) {
  const [color, setColor] = useState(initial);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line p-3">
      <input
        id={id}
        name={name}
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="size-12 flex-none cursor-pointer rounded-xl border border-line bg-white p-1"
      />
      <label htmlFor={id} className="flex min-w-0 flex-col text-sm font-semibold">
        {label}
        <span className="font-mono text-[13px] font-normal text-muted uppercase">{color}</span>
      </label>
    </div>
  );
}
