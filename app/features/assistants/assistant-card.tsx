import { Mail, MessageCircle, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import { useTranslations } from "use-intl";
import { Ltr, Phone, whatsappUrl } from "~/components/format";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { ActionMenu, ActionMenuItem, ActionMenuSeparator } from "~/components/ui/menu";
import type { Assistant } from "~/domain/api";

/**
 * Assistant card (DSH-ASS-01): who they are, how to reach them, whether they can scan,
 * and their check-in history. Delete is only offered without history (DBR-14, DAC-07).
 */
export function AssistantCard({
  assistant,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  assistant: Assistant;
  onEdit: (assistant: Assistant) => void;
  onToggleActive: (assistant: Assistant) => void;
  onDelete: (assistant: Assistant) => void;
}) {
  const t = useTranslations("assistants.card");
  const tc = useTranslations("common");
  const { fullName, phoneE164, email, notes, isActive, checkInsCount } = assistant;

  return (
    <article className="flex flex-col rounded-sm border border-line bg-sheet transition-colors duration-150 hover:border-line-strong">
      <div className="flex items-start gap-3 p-4">
        <Avatar name={fullName} src={assistant.photoUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="text-subheading font-semibold break-words">
            {/* Typed by people in either language: isolated, aligned with the page. */}
            <bdi>{fullName}</bdi>
          </h2>
          <div className="mt-1">
            <Badge tone={isActive ? "success" : "neutral"}>
              {isActive ? t("active") : t("inactive")}
            </Badge>
          </div>
        </div>
        <ActionMenu label={`${tc("moreActions")}: ${fullName}`}>
          <ActionMenuItem onSelect={() => onEdit(assistant)}>
            <Pencil aria-hidden="true" />
            {t("edit")}
          </ActionMenuItem>
          <ActionMenuItem onSelect={() => onToggleActive(assistant)}>
            {isActive ? <PowerOff aria-hidden="true" /> : <Power aria-hidden="true" />}
            {isActive ? t("deactivate") : t("activate")}
          </ActionMenuItem>
          {checkInsCount === 0 ? (
            <>
              <ActionMenuSeparator />
              <ActionMenuItem destructive onSelect={() => onDelete(assistant)}>
                <Trash2 aria-hidden="true" />
                {t("delete")}
              </ActionMenuItem>
            </>
          ) : null}
        </ActionMenu>
      </div>

      <dl className="flex flex-col gap-2 px-4 pb-4 text-body">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <dt className="sr-only">{t("phone")}</dt>
          <dd>
            <Phone e164={phoneE164} />
          </dd>
          <dd>
            <a
              href={whatsappUrl(phoneE164)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-8 items-center gap-1 text-caption font-medium text-cyan hover:underline touch:min-h-11"
              aria-label={`${tc("whatsapp")}: ${fullName}`}
            >
              <MessageCircle aria-hidden="true" className="size-3.5" />
              {tc("whatsapp")}
            </a>
          </dd>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <dt className="sr-only">{tc("email")}</dt>
          <Mail aria-hidden="true" className="size-3.5 shrink-0 text-graphite" />
          <dd className="min-w-0 truncate">
            {email ? (
              <a href={`mailto:${email}`} className="text-ink hover:text-cyan hover:underline">
                <Ltr>{email}</Ltr>
              </a>
            ) : (
              <span className="text-graphite">{t("noEmail")}</span>
            )}
          </dd>
        </div>
        {notes ? (
          <div>
            <dt className="sr-only">{t("notes")}</dt>
            <dd className="line-clamp-3 text-caption break-words text-graphite">
              <bdi>{notes}</bdi>
            </dd>
          </div>
        ) : null}
      </dl>

      <dl className="mt-auto grid grid-cols-2 border-t border-line text-caption">
        <div className="flex min-w-0 flex-col gap-0.5 border-e border-line px-3 py-2.5">
          <dt className="text-graphite">{t("checkIns")}</dt>
          <dd className="tabular font-medium text-ink">
            {t("checkInsCount", { count: checkInsCount })}
          </dd>
        </div>
        <div className="flex min-w-0 flex-col gap-0.5 px-3 py-2.5">
          <dt className="text-graphite">{t("scannerApp")}</dt>
          <dd className="font-medium text-ink">{t("comingSoon")}</dd>
        </div>
      </dl>
    </article>
  );
}
