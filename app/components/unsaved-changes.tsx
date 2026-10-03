import { useEffect } from "react";
import { useBlocker } from "react-router";
import { useTranslations } from "use-intl";
import { ConfirmDialog } from "./ui/confirm-dialog";

/** Asks before leaving a page with unsaved changes (DSH-GEN-06): in-app navigation and tab close. */
export function UnsavedChangesGuard({ when }: { when: boolean }) {
  const t = useTranslations("common");
  const blocker = useBlocker(({ currentLocation, nextLocation }) => when && currentLocation.pathname !== nextLocation.pathname);

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
