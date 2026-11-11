import { Archive, ArchiveRestore, Mail, MailOpen, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "use-intl";
import { CopyButton } from "~/components/copy-button";
import { DateTime, Ltr, Phone, whatsappUrl } from "~/components/format";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { Sheet } from "~/components/ui/sheet";
import { useToast } from "~/components/ui/toast";
import type { ContactMessage } from "~/domain/api";
import { mailtoReply, messageLanguage } from "~/domain/messages";
import type { Locale } from "~/domain/types";
import { getApiError } from "~/store/api";
import { useSetMessageStatusMutation } from "./api";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-caption text-graphite">{label}</dt>
      <dd className="flex min-w-0 items-center gap-1 text-end text-body">{children}</dd>
    </div>
  );
}

/**
 * Reading sheet (`?message=<id>`, DSH-MSG-02). Opening a New message marks it Read once;
 * "Mark as new" and "Archive" close the sheet, since the message leaves what you're reading.
 */
export function MessageSheet({
  id,
  message: current,
  loading,
  onClose,
}: {
  id: string | undefined;
  message: ContactMessage | undefined;
  loading: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("inbox");
  const ts = useTranslations("status.message");
  const tc = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as Locale;
  const toast = useToast();
  const [setStatus, { isLoading }] = useSetMessageStatusMutation();
  const markedRead = useRef<string | null>(null);
  // Archiving removes the message from the cached list at once (optimistic): keep showing it
  // until the sheet closes, instead of flashing "doesn't exist".
  const [last, setLast] = useState(current);
  if (current && current !== last) setLast(current);
  const message = current ?? (last?.id === id ? last : undefined);

  // Opening a New message marks it Read — once per opening, so "Mark as new" sticks
  // (DSH-MSG-02/03). Closing the sheet resets it.
  useEffect(() => {
    if (!id) {
      markedRead.current = null;
      return;
    }
    if (!message || markedRead.current === message.id) return;
    markedRead.current = message.id;
    if (message.status === "NEW") void setStatus({ id: message.id, status: "READ" });
  }, [id, message, setStatus]);

  async function change(status: ContactMessage["status"], done: string) {
    if (!message) return;
    try {
      await setStatus({ id: message.id, status }).unwrap();
      toast({ title: done, description: message.name });
      onClose();
    } catch (e) {
      toast({ title: getApiError(e)?.message ?? tc("saveFailed"), tone: "error" });
    }
  }

  const archived = message?.status === "ARCHIVED";
  const writtenIn = message ? messageLanguage(message.message) : locale;

  return (
    <Sheet
      open={Boolean(id)}
      onOpenChange={(open) => !open && onClose()}
      title={message ? message.name : t("title")}
      description={
        message ? (
          <>
            {t(`subjects.${message.subject}`)} · <DateTime iso={message.createdAt} />
          </>
        ) : undefined
      }
      footer={
        message ? (
          <>
            <Button asChild variant="primary">
              <a href={mailtoReply(message)}>
                <Mail aria-hidden="true" />
                {t("replyEmail")}
              </a>
            </Button>
            {message.phoneE164 ? (
              <Button asChild variant="secondary">
                <a href={whatsappUrl(message.phoneE164)} target="_blank" rel="noreferrer">
                  <MessageCircle aria-hidden="true" />
                  {t("replyWhatsapp")}
                </a>
              </Button>
            ) : null}
            <div className="ms-auto flex gap-2">
              {!archived ? (
                <Button
                  variant="ghost"
                  disabled={isLoading}
                  onClick={() => change("NEW", t("markedNew"))}
                >
                  <MailOpen aria-hidden="true" />
                  {t("markNew")}
                </Button>
              ) : null}
              <Button
                variant="ghost"
                disabled={isLoading}
                onClick={() =>
                  archived ? change("READ", t("unarchived")) : change("ARCHIVED", t("archived"))
                }
              >
                {archived ? <ArchiveRestore aria-hidden="true" /> : <Archive aria-hidden="true" />}
                {archived ? t("unarchive") : t("archive")}
              </Button>
            </div>
          </>
        ) : undefined
      }
    >
      {message ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={message.status === "NEW" ? "warning" : "neutral"}>
              {ts(message.status)}
            </Badge>
            {message.courseTitle ? <Badge tone="info">{message.courseTitle[locale]}</Badge> : null}
          </div>

          <section aria-label={t("messageLabel")}>
            <p
              lang={writtenIn}
              dir={writtenIn === "ar" ? "rtl" : "ltr"}
              className="text-body-lg leading-relaxed break-words whitespace-pre-line text-ink"
            >
              {message.message}
            </p>
          </section>

          <section aria-labelledby="message-sender">
            <h3 id="message-sender" className="mb-1 text-label font-medium text-graphite">
              {t("sender")}
            </h3>
            <dl className="divide-y divide-line border-y border-line">
              <Row label={tc("email")}>
                <a
                  href={mailtoReply(message)}
                  className="min-w-0 truncate text-ink hover:text-cyan hover:underline"
                >
                  <Ltr>{message.email}</Ltr>
                </a>
                <CopyButton value={message.email} />
              </Row>
              <Row label={t("phone")}>
                {message.phoneE164 ? (
                  <>
                    <Phone e164={message.phoneE164} />
                    <CopyButton value={message.phoneE164} />
                  </>
                ) : (
                  <span className="text-graphite">{t("noPhone")}</span>
                )}
              </Row>
              <Row label={t("received")}>
                <DateTime iso={message.createdAt} />
              </Row>
            </dl>
          </section>
          <p className="text-caption text-graphite">{t("replyHint")}</p>
        </div>
      ) : loading ? null : (
        <EmptyState title={tErrors("notFoundItem")} />
      )}
    </Sheet>
  );
}
