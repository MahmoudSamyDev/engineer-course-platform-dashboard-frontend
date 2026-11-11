import { useRef, useState } from "react";
import { useTranslations } from "use-intl";
import { ConfirmDialog } from "~/components/ui/confirm-dialog";
import { Field } from "~/components/ui/field";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/components/ui/toast";
import type { PaymentDetail } from "~/domain/api";
import { getApiError } from "~/store/api";
import { useCancelBookingMutation } from "./api";
import { isStaleState, useIdempotencyKey } from "./use-idempotency-key";

/** Cancel a paid booking: ticket cancelled, seat released, reason required (DSH-PAY-07). */
export function CancelDialog({
  payment,
  open,
  onOpenChange,
}: {
  payment: PaymentDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("payments.cancel");
  const tp = useTranslations("payments");
  const tc = useTranslations("common");
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();
  const [idempotencyKey, renewKeyAfter] = useIdempotencyKey();
  const sending = useRef(false);
  const [cancel, { isLoading }] = useCancelBookingMutation();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      description={t("description", {
        name: payment.student.fullName,
        reference: payment.reference,
      })}
      confirmLabel={t("submit")}
      destructive
      loading={isLoading}
      onConfirm={async () => {
        if (!reason.trim()) return setError(t("reasonError"));
        if (sending.current) return; // A second click while the first is on its way.
        sending.current = true;
        try {
          await cancel({
            bookingId: payment.bookingId,
            reason: reason.trim(),
            idempotencyKey,
          }).unwrap();
          toast({ title: t("done"), description: payment.reference });
          onOpenChange(false);
        } catch (e) {
          renewKeyAfter(e);
          const apiError = getApiError(e);
          if (isStaleState(apiError?.fields)) {
            toast({ title: tp("staleTitle"), description: tp("staleCancel"), tone: "error" });
            return onOpenChange(false);
          }
          setError(apiError?.fields?.reason ? t("reasonError") : tc("saveFailed"));
        } finally {
          sending.current = false;
        }
      }}
    >
      <Field label={t("reason")} error={error} required>
        {(control) => (
          <Textarea
            {...control}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(undefined);
            }}
            rows={3}
          />
        )}
      </Field>
    </ConfirmDialog>
  );
}
