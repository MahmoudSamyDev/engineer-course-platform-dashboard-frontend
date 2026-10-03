import { useState } from "react";
import { useTranslations } from "use-intl";
import { ConfirmDialog } from "./ui/confirm-dialog";

/**
 * Asks before a dirty dialog closes (DSH-GEN-06). Pass `requestClose` as the Dialog's
 * `onRequestClose` and render `guard` next to it.
 */
export function useDiscardGuard(isDirty: boolean, close: () => void) {
  const t = useTranslations("common");
  const [asking, setAsking] = useState(false);
  const requestClose = () => {
    if (!isDirty) return true;
    setAsking(true);
    return false;
  };
  const guard = (
    <ConfirmDialog
      open={asking}
      onOpenChange={setAsking}
      title={t("unsavedTitle")}
      description={t("unsavedDescription")}
      confirmLabel={t("discard")}
      destructive
      onConfirm={() => {
        setAsking(false);
        close();
      }}
    />
  );
  return { requestClose, guard };
}
