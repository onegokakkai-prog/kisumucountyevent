import type { FestivalDay } from "@/lib/festival";
import { slotFields } from "./fields";
import { ListField } from "./list-field";

const inputClass =
  "min-h-11 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-3 py-2 text-[15px] text-ink focus:border-navy focus:outline-3 focus:outline-offset-1 focus:outline-sun";

export function ProgrammeField({ days }: { days: FestivalDay[] }) {
  return (
    <div className="flex flex-col gap-5">
      {days.map((day, d) => (
        <fieldset key={day.id} className="flex flex-col gap-4 rounded-2xl bg-mist p-4 sm:p-5">
          <legend className="float-left mb-1 w-full font-display text-xl font-extrabold text-navy">{day.label}</legend>
          <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Tab name
              <input name={`days.${d}.label`} defaultValue={day.label} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Summary
              <input name={`days.${d}.intro`} defaultValue={day.intro} className={inputClass} />
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Time slots</span>
            <ListField name={`days.${d}.slots`} fields={slotFields} initial={day.slots} itemName="time slot" max={8} />
          </div>
        </fieldset>
      ))}
    </div>
  );
}
