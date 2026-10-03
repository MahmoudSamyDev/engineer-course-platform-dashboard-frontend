import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import { z } from "zod";
import { Money } from "~/components/format";
import { useDiscardGuard } from "~/components/use-discard-guard";
import { AmountInput } from "~/components/ui/amount-input";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/components/ui/toast";
import type { PaymentDetail } from "~/domain/api";
import { egpToPiasters } from "~/domain/money";
import { getApiError } from "~/store/api";
import { useRecordRefundMutation } from "./api";

/**
 * Record a refund made in the Paymob portal (DSH-PAY-05, DBR-11). Partial refunds allowed
 * (1 EGP up to the remaining amount); the booking becomes Refunded and the ticket Cancelled.
 */
export function RefundDialog({
  payment,
  open,
  onOpenChange,
}: {
  payment: PaymentDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("payments.refund");
  const tc = useTranslations("common");
  const toast = useToast();
  const [recordRefund, { isLoading }] = useRecordRefundMutation();
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const remaining = (payment.amount - payment.refundedAmount) / 100;

  const schema = z.object({
    amount: z.number({ error: "amount" }).min(1, "amount").max(remaining, "amount"),
    refundTransactionId: z.string().trim().min(1, "transaction"),
    note: z.string().max(500).optional(),
  });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { amount: remaining, refundTransactionId: "", note: "" },
    mode: "onTouched",
  });
  const { errors, isDirty } = form.formState;
  const { requestClose, guard } = useDiscardGuard(isDirty, () => onOpenChange(false));

  async function submit(values: Values) {
    try {
      await recordRefund({
        paymentId: payment.id,
        amount: egpToPiasters(values.amount),
        refundTransactionId: values.refundTransactionId,
        note: values.note,
        idempotencyKey,
      }).unwrap();
      toast({ title: t("done"), description: payment.reference });
      onOpenChange(false);
    } catch (error) {
      const apiError = getApiError(error);
      if (apiError?.fields?.amount) form.setError("amount", { message: "amount" });
      if (apiError?.fields?.refundTransactionId)
        form.setError("refundTransactionId", { message: "transaction" });
      if (!apiError?.fields) toast({ title: apiError?.message ?? tc("save"), tone: "error" });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      description={t("description", { reference: payment.reference })}
      size="sm"
      onRequestClose={requestClose}
      footer={
        <>
          <Button variant="secondary" onClick={() => requestClose() && onOpenChange(false)}>
            {tc("cancel")}
          </Button>
          <Button variant="primary" type="submit" form="refund-form" loading={isLoading}>
            {t("submit")}
          </Button>
        </>
      }
    >
      <form
        id="refund-form"
        noValidate
        onSubmit={form.handleSubmit(submit)}
        className="flex flex-col gap-4"
      >
        <p className="rounded-sm bg-warning-wash px-3 py-2 text-body text-warning">
          {t("consequence")}
        </p>
        <Field
          label={t("amount")}
          hint={
            <>
              {t("amountHint")} <Money amount={payment.amount - payment.refundedAmount} />
            </>
          }
          error={errors.amount ? t("amountError", { max: remaining }) : undefined}
          required
        >
          {(control) => (
            <AmountInput
              {...control}
              {...form.register("amount", { valueAsNumber: true })}
              suffix={t("currency")}
              min={1}
              max={remaining}
              step="0.01"
            />
          )}
        </Field>
        <Field
          label={t("transaction")}
          hint={t("transactionHint")}
          error={errors.refundTransactionId ? t("transactionError") : undefined}
          required
        >
          {(control) => (
            <Input
              {...control}
              {...form.register("refundTransactionId")}
              dir="ltr"
              autoComplete="off"
            />
          )}
        </Field>
        <Field label={t("note")} hint={t("noteHint")}>
          {(control) => <Textarea {...control} {...form.register("note")} rows={3} />}
        </Field>
      </form>
      {guard}
    </Dialog>
  );
}
