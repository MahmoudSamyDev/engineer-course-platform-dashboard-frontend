import type { FormEvent, ReactNode } from "react";
import { useTranslations } from "use-intl";
import { UnsavedChangesGuard } from "./unsaved-changes";
import { Button } from "./ui/button";

/**
 * A tab or section that saves on its own (DSH-CRS-04, DSH-PRO-01): fields, then a sticky
 * Save / Discard bar while there are changes, plus the leave-page guard.
 */
export function SectionForm({
  dirty,
  saving,
  onSave,
  onDiscard,
  children,
  saveLabel,
  error,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  children: ReactNode;
  saveLabel?: string;
  error?: string | null;
}) {
  const t = useTranslations("common");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSave();
  };
  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 rounded-sm border border-line bg-sheet p-4 sm:p-6">
        {children}
      </div>
      {error ? (
        <p
          role="alert"
          className="rounded-sm bg-danger-wash px-3 py-2 text-body font-medium text-danger"
        >
          {error}
        </p>
      ) : null}
      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-2 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 print:hidden">
        {dirty ? (
          <span className="me-auto text-caption text-graphite">{t("unsavedHint")}</span>
        ) : null}
        <Button variant="secondary" onClick={onDiscard} disabled={!dirty || saving}>
          {t("discard")}
        </Button>
        <Button type="submit" variant="primary" loading={saving} disabled={!dirty}>
          {saveLabel ?? t("save")}
        </Button>
      </div>
      <UnsavedChangesGuard when={dirty} />
    </form>
  );
}
