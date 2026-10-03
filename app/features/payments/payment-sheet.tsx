import { ArrowRightLeft, Ban, Undo2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useLocale, useTranslations } from "use-intl";
import { CopyButton } from "~/components/copy-button";
import { DateTime, Ltr, Money, Phone } from "~/components/format";
import { BookingBadge, PaymentBadge } from "~/components/status";
import { Button } from "~/components/ui/button";
import { ErrorState } from "~/components/ui/error-state";
import { Sheet } from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import type { PaymentDetail } from "~/domain/api";
import type { Locale } from "~/domain/types";
import { useGetPaymentQuery } from "./api";
import { CancelDialog } from "./cancel-dialog";
import { MoveDialog } from "./move-dialog";
import { RefundDialog } from "./refund-dialog";

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-caption text-graphite">{label}</dt>
      <dd className="min-w-0 text-end text-body">{children}</dd>
    </div>
  );
}

/** Payment details sheet (`?payment=<id>`, DSH-PAY-04) with refund / move / cancel actions. */
export function PaymentSheet({ id, onClose }: { id: string | undefined; onClose: () => void }) {
  const t = useTranslations("payments.detail");
  const { data, error, isLoading, refetch } = useGetPaymentQuery(id ?? "", { skip: !id });
  const [dialog, setDialog] = useState<"refund" | "move" | "cancel" | null>(null);

  const canRefund = data && data.status === "SUCCEEDED" && (data.bookingStatus === "PAID" || data.bookingStatus === "REFUND_REQUIRED");
  const canMove = data?.bookingStatus === "REFUND_REQUIRED";
  const canCancel = data?.bookingStatus === "PAID" && data.status === "SUCCEEDED";

  return (
    <Sheet
      open={Boolean(id)}
      onOpenChange={(open) => !open && onClose()}
      title={data ? data.student.fullName : t("title")}
      description={data ? <Ltr>{data.reference}</Ltr> : undefined}
      footer={
        data && (canRefund || canMove || canCancel) ? (
          <>
            {canMove ? (
              <Button variant="primary" onClick={() => setDialog("move")}>
                <ArrowRightLeft aria-hidden="true" />
                {t("move")}
              </Button>
            ) : null}
            {canRefund ? (
              <Button variant={canMove ? "secondary" : "primary"} onClick={() => setDialog("refund")}>
                <Undo2 aria-hidden="true" className="rtl:-scale-x-100" />
                {t("refund")}
              </Button>
            ) : null}
            {canCancel ? (
              <Button variant="danger" onClick={() => setDialog("cancel")}>
                <Ban aria-hidden="true" />
                {t("cancel")}
              </Button>
            ) : null}
          </>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-3" aria-hidden="true">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <PaymentDetails payment={data} />
      )}
      {data && dialog === "refund" ? <RefundDialog payment={data} open onOpenChange={(o) => !o && setDialog(null)} /> : null}
      {data && dialog === "move" ? <MoveDialog payment={data} open onOpenChange={(o) => !o && setDialog(null)} /> : null}
      {data && dialog === "cancel" ? <CancelDialog payment={data} open onOpenChange={(o) => !o && setDialog(null)} /> : null}
    </Sheet>
  );
}

function PaymentDetails({ payment }: { payment: PaymentDetail }) {
  const t = useTranslations("payments.detail");
  const ts = useTranslations("status");
  const locale = useLocale() as Locale;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <PaymentBadge status={payment.status} />
        <BookingBadge status={payment.bookingStatus} />
      </div>

      {payment.bookingStatus === "REFUND_REQUIRED" ? (
        <p className="rounded-sm bg-warning-wash px-3 py-2 text-body text-warning">{t("refundRequiredHint")}</p>
      ) : null}

      <section aria-labelledby="pd-money">
        <h3 id="pd-money" className="mb-1 text-label font-medium text-graphite">{t("money")}</h3>
        <dl className="divide-y divide-line border-y border-line">
          <Fact label={t("amount")}><span className="font-semibold"><Money amount={payment.amount} /></span></Fact>
          {payment.refundedAmount > 0 ? <Fact label={t("refunded")}><Money amount={payment.refundedAmount} /></Fact> : null}
          <Fact label={t("method")}>{ts(`method.${payment.method}`)}</Fact>
          <Fact label={t("transaction")}>
            {payment.providerTransactionId ? (
              <span className="inline-flex items-center gap-1"><Ltr className="tabular">{payment.providerTransactionId}</Ltr><CopyButton value={payment.providerTransactionId} /></span>
            ) : "—"}
          </Fact>
          <Fact label={t("order")}><span className="inline-flex items-center gap-1"><Ltr className="tabular">{payment.providerOrderId}</Ltr><CopyButton value={payment.providerOrderId} /></span></Fact>
          {payment.refundTransactionId ? <Fact label={t("refundTransaction")}><Ltr className="tabular">{payment.refundTransactionId}</Ltr></Fact> : null}
        </dl>
      </section>

      <section aria-labelledby="pd-booking">
        <h3 id="pd-booking" className="mb-1 text-label font-medium text-graphite">{t("booking")}</h3>
        <dl className="divide-y divide-line border-y border-line">
          <Fact label={t("course")}>{payment.course.title[locale]}</Fact>
          <Fact label={t("session")}>
            <Link to={`/courses/${payment.course.id}/sessions/${payment.session.id}`} className="text-cyan hover:underline"><Ltr>{payment.session.code}</Ltr></Link>
          </Fact>
          <Fact label={t("student")}>
            <Link to={`/students/${payment.student.id}`} className="text-cyan hover:underline">{payment.student.fullName}</Link>
          </Fact>
          <Fact label={t("phone")}><Phone e164={payment.student.phoneE164} /></Fact>
          <Fact label={t("email")}><Ltr className="break-all">{payment.studentEmail}</Ltr></Fact>
        </dl>
      </section>

      <section aria-labelledby="pd-timeline">
        <h3 id="pd-timeline" className="mb-2 text-label font-medium text-graphite">{t("timeline")}</h3>
        <ol className="relative flex flex-col gap-4 border-s border-line ps-4">
          {payment.timeline.map((event, index) => (
            <li key={index} className="relative">
              <span aria-hidden="true" className="absolute -start-[1.3rem] top-1.5 size-2 bg-cyan" />
              <p className="text-body font-medium">{t(`events.${event.type}`)}</p>
              <p className="text-caption text-graphite">
                <DateTime iso={event.at} />
                {event.by ? <> · {event.by}</> : null}
              </p>
              {event.note ? <p className="mt-0.5 text-caption text-ink">{event.note}</p> : null}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
