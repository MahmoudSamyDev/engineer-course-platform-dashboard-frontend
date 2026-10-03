import { useState } from "react";
import { useLocale, useTranslations } from "use-intl";
import { Money } from "~/components/format";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { Field } from "~/components/ui/field";
import { Select } from "~/components/ui/select";
import { useToast } from "~/components/ui/toast";
import type { PaymentDetail } from "~/domain/api";
import type { Locale } from "~/domain/types";
import { appNow } from "~/lib/clock";
import { formatDateTime } from "~/lib/format";
import { getApiError } from "~/store/api";
import { useGetCourseSessionsQuery } from "../courses/api";
import { useMoveBookingMutation } from "./api";

/** Resolve a refund-required booking by moving the student to another session with seats (DSH-PAY-06, DBR-12). */
export function MoveDialog({
  payment,
  open,
  onOpenChange,
}: {
  payment: PaymentDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("payments.move");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const toast = useToast();
  const [target, setTarget] = useState<string>();
  const [error, setError] = useState<string>();
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const { data: sessions } = useGetCourseSessionsQuery(payment.course.id, { skip: !open });
  const [move, { isLoading }] = useMoveBookingMutation();
  const now = appNow().getTime();

  const options = (sessions ?? [])
    .filter(
      (s) =>
        s.id !== payment.session.id &&
        s.isPublished &&
        Date.parse(s.meetings[0]!.startsAt) > now &&
        s.capacity - s.sold - s.held > 0,
    )
    .map((s) => ({
      value: s.id,
      label: t("option", {
        code: s.code,
        date: formatDateTime(s.meetings[0]!.startsAt, locale),
        left: s.capacity - s.sold - s.held,
      }),
      price: s.price,
    }));
  const chosen = options.find((o) => o.value === target);

  async function submit() {
    if (!target) return setError(t("chooseError"));
    try {
      await move({
        bookingId: payment.bookingId,
        targetSessionId: target,
        idempotencyKey,
      }).unwrap();
      toast({ title: t("done"), description: payment.reference });
      onOpenChange(false);
    } catch (e) {
      const apiError = getApiError(e);
      setError(
        apiError?.fields?.targetSessionId === "NO_SEATS"
          ? t("noSeats")
          : (apiError?.message ?? tc("save")),
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      description={t("description", { name: payment.student.fullName })}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {tc("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            loading={isLoading}
            disabled={options.length === 0}
          >
            {t("submit")}
          </Button>
        </>
      }
    >
      {options.length === 0 && sessions ? (
        <p className="text-body text-graphite">{t("none")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          <Field label={t("session")} error={error} required>
            {(control) => (
              <Select
                {...control}
                value={target}
                onValueChange={(v) => {
                  setTarget(v);
                  setError(undefined);
                }}
                options={options}
                placeholder={t("placeholder")}
              />
            )}
          </Field>
          {chosen && chosen.price !== payment.amount ? (
            <p className="rounded-sm bg-info-wash px-3 py-2 text-body text-info">
              {t("priceDifference")} <Money amount={chosen.price} /> /{" "}
              <Money amount={payment.amount} />
            </p>
          ) : null}
          <p className="text-caption text-graphite">{t("consequence")}</p>
        </div>
      )}
    </Dialog>
  );
}
