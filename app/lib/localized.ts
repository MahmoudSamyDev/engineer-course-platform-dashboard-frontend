import type { LocalizedList, LocalizedText } from "~/domain/types";

/** A bilingual list edited as "one item per line" text (outcomes, requirements, topics). */
export function listToText(list: LocalizedList | undefined): LocalizedText {
  return { ar: (list?.ar ?? []).join("\n"), en: (list?.en ?? []).join("\n") };
}

export function textToList(text: LocalizedText): LocalizedList {
  const split = (value: string) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  return { ar: split(text.ar), en: split(text.en) };
}

export const emptyText = (): LocalizedText => ({ ar: "", en: "" });

/** Shallow-stable deep equality for small form values (dirty checks). */
export function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
