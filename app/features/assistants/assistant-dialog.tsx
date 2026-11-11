import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslations } from "use-intl";
import { z } from "zod";
import { useDiscardGuard } from "~/components/use-discard-guard";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { Field } from "~/components/ui/field";
import { ImagePicker } from "~/components/ui/image-picker";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/components/ui/toast";
import type { Assistant } from "~/domain/api";
import { e164ToNational, normalizeEgyptianMobile } from "~/domain/phone";
import { maxMegabytes } from "~/domain/uploads";
import { useImageUpload } from "~/features/uploads/use-image-upload";
import { getApiError } from "~/store/api";
import { useCreateAssistantMutation, useUpdateAssistantMutation } from "./api";

const NOTES_MAX = 500;

const schema = z.object({
  fullName: z.string().trim().min(3, "name").max(80, "name"),
  phone: z
    .string()
    .trim()
    .min(1, "phoneRequired")
    .refine((value) => normalizeEgyptianMobile(value) !== null, "phone"),
  email: z.union([z.literal(""), z.email("email")]),
  notes: z.string().max(NOTES_MAX),
});
type Values = z.infer<typeof schema>;
type ErrorKey = "name" | "phoneRequired" | "phone" | "phoneTaken" | "email";

/**
 * Add or edit an assistant (DSH-ASS-02/03). Phone is typed the Egyptian way and stored as
 * E.164; a phone another assistant uses is a field error (DAC-07, DBR-14).
 * Mount it fresh for each opening (`key`) so the form starts from the right values.
 */
export function AssistantDialog({
  assistant,
  onClose,
}: {
  /** `null` adds a new assistant. */
  assistant: Assistant | null;
  onClose: () => void;
}) {
  const t = useTranslations("assistants.dialog");
  const tc = useTranslations("common");
  const toast = useToast();
  const [create, createState] = useCreateAssistantMutation();
  const [update, updateState] = useUpdateAssistantMutation();
  const photoUpload = useImageUpload("assistant-photo");
  const [photoUrl, setPhotoUrl] = useState(assistant?.photoUrl ?? null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      fullName: assistant?.fullName ?? "",
      phone: assistant ? e164ToNational(assistant.phoneE164) : "",
      email: assistant?.email ?? "",
      notes: assistant?.notes ?? "",
    },
  });
  const { errors, isDirty } = form.formState;
  const dirty = isDirty || photoUrl !== (assistant?.photoUrl ?? null);
  const { requestClose, guard } = useDiscardGuard(dirty, onClose);
  const fullName = useWatch({ control: form.control, name: "fullName" });

  async function submit(values: Values) {
    const body = {
      fullName: values.fullName.trim(),
      phoneE164: normalizeEgyptianMobile(values.phone)!,
      email: values.email.trim() || null,
      notes: values.notes.trim() || null,
      photoUrl,
    };
    try {
      if (assistant) await update({ id: assistant.id, ...body }).unwrap();
      else await create(body).unwrap();
      toast({ title: assistant ? tc("saved") : t("added"), description: body.fullName });
      onClose();
    } catch (error) {
      const apiError = getApiError(error);
      const fields = apiError?.fields ?? {};
      if (fields.phoneE164)
        form.setError("phone", { message: fields.phoneE164 === "TAKEN" ? "phoneTaken" : "phone" });
      if (fields.fullName) form.setError("fullName", { message: "name" });
      if (fields.email) form.setError("email", { message: "email" });
      if (!Object.keys(fields).length)
        toast({ title: tc("saveFailed"), description: apiError?.message, tone: "error" });
    }
  }

  const message = (key: string | undefined) => (key ? t(`errors.${key as ErrorKey}`) : undefined);

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      onRequestClose={requestClose}
      title={assistant ? t("editTitle") : t("addTitle")}
      description={t("description")}
      footer={
        <>
          <Button variant="secondary" onClick={() => requestClose() && onClose()}>
            {tc("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="assistant-form"
            loading={createState.isLoading || updateState.isLoading}
            disabled={photoUpload.uploading}
          >
            {assistant ? tc("save") : t("submit")}
          </Button>
        </>
      }
    >
      <form
        id="assistant-form"
        noValidate
        onSubmit={form.handleSubmit(submit)}
        className="flex flex-col gap-5"
      >
        <Field label={t("fullName")} error={message(errors.fullName?.message)} required>
          {(control) => (
            <Input {...control} {...form.register("fullName")} autoComplete="off" maxLength={80} />
          )}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={t("phone")}
            hint={t("phoneHint")}
            error={message(errors.phone?.message)}
            required
          >
            {(control) => (
              <Input
                {...control}
                {...form.register("phone")}
                type="tel"
                inputMode="tel"
                autoComplete="off"
                dir="ltr"
                placeholder="010 1234 5678"
              />
            )}
          </Field>
          <Field label={t("email")} hint={t("optional")} error={message(errors.email?.message)}>
            {(control) => (
              <Input
                {...control}
                {...form.register("email")}
                type="email"
                inputMode="email"
                autoComplete="off"
                dir="ltr"
              />
            )}
          </Field>
        </div>
        <ImagePicker
          label={t("photo")}
          shape="square"
          src={photoUrl}
          previewAlt={fullName}
          hint={t("photoHint", { max: maxMegabytes("assistant-photo") })}
          error={photoUpload.error}
          uploading={photoUpload.uploading}
          onSelect={async (file) => {
            const url = await photoUpload.uploadFile(file);
            if (url) setPhotoUrl(url);
          }}
          onRemove={() => {
            photoUpload.clearError();
            setPhotoUrl(null);
          }}
        />
        <Field label={t("notes")} hint={t("notesHint")}>
          {(control) => (
            <Textarea {...control} {...form.register("notes")} rows={3} maxLength={NOTES_MAX} />
          )}
        </Field>
      </form>
      {guard}
    </Dialog>
  );
}
