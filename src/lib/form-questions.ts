import { z } from "zod";
import type { FormQuestion, QuestionType } from "./content";

// Organiser-defined questions, shared by the visitor form's extra questions and the
// professionals' form: how they are labelled, shown, validated and stored.

export type { FormQuestion, QuestionType };

export type Answers = Record<string, string | string[]>;

export const questionTypes: { value: QuestionType; label: string }[] = [
  { value: "text", label: "Short answer" },
  { value: "textarea", label: "Paragraph" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Choose one" },
  { value: "checkboxes", label: "Tick all that apply" },
  { value: "yesno", label: "Yes / No" },
];

export const choiceTypes: readonly QuestionType[] = ["select", "radio", "checkboxes"];

export const OTHER = "Other";

export function splitLines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

// The form field names for a question's answer and its "Other" text box.
export function questionKey(id: string) {
  return `q_${id}`;
}

export function otherKey(id: string) {
  return `q_${id}_other`;
}

// Fills settings missing from questions saved before they existed.
export function normaliseQuestion(q: Partial<FormQuestion> & Pick<FormQuestion, "id" | "label" | "type">): FormQuestion {
  return {
    options: [],
    required: "no",
    other: "no",
    help: "",
    showIfQuestion: "",
    showIfAnswer: "",
    ...q,
  };
}

export type OptionGroup = { label: string; options: string[] };

// Choices written as "Group | Choice" are grouped under their heading, in order.
export function groupOptions(options: string[]): OptionGroup[] {
  const groups: OptionGroup[] = [];
  for (const line of options) {
    const bar = line.indexOf("|");
    const label = bar === -1 ? "" : line.slice(0, bar).trim();
    const option = bar === -1 ? line.trim() : line.slice(bar + 1).trim();
    if (!option) continue;
    const last = groups.at(-1);
    if (last && last.label === label) last.options.push(option);
    else groups.push({ label, options: [option] });
  }
  return groups;
}

export function choicesOf(q: FormQuestion): string[] {
  if (q.type === "yesno") return ["Yes", "No"];
  const choices = groupOptions(q.options).flatMap((g) => g.options);
  return q.other === "yes" ? [...choices, OTHER] : choices;
}

// The group heading a stored answer belongs to, e.g. its CBC pathway and track.
export function groupOf(q: FormQuestion, answer: string) {
  return groupOptions(q.options).find((g) => g.options.includes(answer))?.label ?? "";
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

// Whether a question is asked, given the current answers (read by form field name).
export function isVisible(q: FormQuestion, questions: FormQuestion[], valuesOf: (key: string) => string[]): boolean {
  if (!q.showIfQuestion.trim()) return true;
  const parent = questions.find((p) => p.id !== q.id && same(p.label, q.showIfQuestion));
  if (!parent) return true;
  if (!isVisible(parent, questions.filter((p) => p.id !== q.id), valuesOf)) return false;
  return valuesOf(questionKey(parent.id)).some((v) => same(v, q.showIfAnswer));
}

export function readQuestionValues(formData: FormData, questions: FormQuestion[]): Record<string, string | string[]> {
  const text = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v : "";
  };
  const values: Record<string, string | string[]> = {};
  for (const q of questions) {
    const key = questionKey(q.id);
    values[key] = q.type === "checkboxes" ? formData.getAll(key).filter((v): v is string => typeof v === "string") : text(key);
    if (q.other === "yes") values[otherKey(q.id)] = text(otherKey(q.id));
  }
  return values;
}

export function valuesReader(values: Record<string, unknown>) {
  return (key: string) => {
    const v = values[key];
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : typeof v === "string" && v ? [v] : [];
  };
}

// Zod fields for the questions currently asked; hidden ones are left out.
export function questionShapes(questions: FormQuestion[], values: Record<string, unknown>) {
  const read = valuesReader(values);
  const shapes: Record<string, z.ZodType> = {};
  for (const q of questions) {
    if (!isVisible(q, questions, read)) continue;
    const required = q.required === "yes";
    const choices = choicesOf(q);
    const key = questionKey(q.id);
    if (q.type === "checkboxes") {
      const list = z.array(z.string().refine((v) => choices.includes(v), "Choose from the list."));
      shapes[key] = required ? list.min(1, "Choose at least one.") : list;
    } else {
      let text = z.string().trim().max(q.type === "textarea" ? 2000 : 300, "That's too long.");
      if (q.type === "number") text = text.regex(/^$|^-?\d+(\.\d+)?$/, "Enter a number.");
      if (choiceTypes.includes(q.type) || q.type === "yesno") {
        text = text.refine((v) => v === "" || choices.includes(v), "Choose from the list.");
      }
      const typed = q.type === "text" || q.type === "textarea" || q.type === "number";
      shapes[key] = required ? text.min(1, typed ? "Answer this question." : "Choose an answer.") : text;
    }
    if (q.other === "yes") shapes[otherKey(q.id)] = z.string().trim().max(200, "That's too long.");
  }
  return shapes;
}

// Adds "tell us more" errors for an "Other" choice left blank.
export function refineOthers(questions: FormQuestion[], v: Record<string, unknown>, ctx: z.RefinementCtx) {
  for (const q of questions) {
    if (q.other !== "yes") continue;
    const answer = v[questionKey(q.id)];
    const picked = Array.isArray(answer) ? answer.includes(OTHER) : answer === OTHER;
    if (picked && !String(v[otherKey(q.id)] ?? "").trim()) {
      ctx.addIssue({ code: "custom", path: [questionKey(q.id)], message: "Tell us what “Other” is." });
    }
  }
}

// The answers to store, by question id. "Other" becomes "Other: <their words>".
export function collectAnswers(questions: FormQuestion[], v: Record<string, unknown>): Answers {
  const answers: Answers = {};
  for (const q of questions) {
    const value = v[questionKey(q.id)] as string | string[] | undefined;
    if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) continue;
    const other = String(v[otherKey(q.id)] ?? "").trim();
    const withOther = (x: string) => (x === OTHER && other ? `${OTHER}: ${other}` : x);
    answers[q.id] = Array.isArray(value) ? value.map(withOther) : withOther(value);
  }
  return answers;
}

export function formatAnswer(value: string | string[] | undefined) {
  if (value === undefined) return "";
  return Array.isArray(value) ? value.join("; ") : value;
}

// Counts per choice (and per group) for the admin pages. Answers no longer offered, and
// "Other: …" answers, are counted under their own text and "Other".
export function tallyAnswers(q: FormQuestion, answers: (string | string[] | undefined)[]) {
  const counts = new Map<string, number>(choicesOf(q).map((c) => [c, 0]));
  for (const a of answers) {
    for (const value of Array.isArray(a) ? a : a ? [a] : []) {
      const key = value.startsWith(`${OTHER}: `) ? OTHER : value;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const groups = new Map<string, number>();
  for (const group of groupOptions(q.options)) {
    if (!group.label) continue;
    groups.set(group.label, group.options.reduce((sum, o) => sum + (counts.get(o) ?? 0), 0));
  }
  return { choices: [...counts.entries()], groups: [...groups.entries()] };
}
