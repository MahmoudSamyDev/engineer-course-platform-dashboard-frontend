import { useState } from "react";
import { sameValue } from "./localized";

/**
 * Editable copy of server data for a section form. When the server value changes (after a
 * save or a refetch) the draft follows it; `dirty` compares the draft with the server value.
 */
export function useDraft<T>(source: T) {
  const [draft, setDraft] = useState<T>(source);
  const [base, setBase] = useState<T>(source);
  if (!sameValue(source, base)) {
    setBase(source);
    setDraft(source);
  }
  return {
    draft,
    setDraft,
    patch: (changes: Partial<T>) => setDraft((current) => ({ ...current, ...changes })),
    dirty: !sameValue(draft, source),
    reset: () => setDraft(source),
  };
}
