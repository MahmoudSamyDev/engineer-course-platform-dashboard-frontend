/** Joins class names, skipping falsy values. Variants are explicit maps, so no merge step is needed. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
