import { useEffect } from "react";
import { useBlocker } from "react-router";
import { useTranslations } from "use-intl";
import { ConfirmDialog } from "./ui/confirm-dialog";

/** The `?tab=` of a page whose tabs save independently (course details, profile). */
const tabOf = (search: string) => new URLSearchParams(search).get("tab");

/**
 * Asks before leaving a page with unsaved changes (DSH-GEN-06): in-app navigation, switching
 * to another tab of the same page (each tab keeps its own draft), and closing the browser tab.
 * Other query changes (filters, an opened dialog) don't leave the form, so they pass.
 */
export function UnsavedChangesGuard({ when }: { when: boolean }) {
  const t = useTranslations("common");
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when &&
      (currentLocation.pathname !== nextLocation.pathname ||
        tabOf(currentLocation.search) !== tabOf(nextLocation.search)),
  );

  useEffect(() => {
    if (!when) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [when]);

  return (
    <ConfirmDialog
      open={blocker.state === "blocked"}
      onOpenChange={(open) => !open && blocker.state === "blocked" && blocker.reset()}
      title={t("unsavedTitle")}
      description={t("unsavedDescription")}
      confirmLabel={t("discard")}
      destructive
      onConfirm={() => blocker.state === "blocked" && blocker.proceed()}
    />
  );
}
