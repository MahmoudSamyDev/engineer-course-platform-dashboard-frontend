import { useLocale, useTranslations } from "use-intl";
import { DateTime } from "~/components/format";
import type { ContactMessage } from "~/domain/api";
import { firstLine } from "~/domain/messages";
import type { Locale } from "~/domain/types";
import { cn } from "~/lib/cn";

/**
 * Inbox rows (DSH-MSG-01): sender, topic, course, first line, received time. New messages
 * carry a dot and bold sender so they stand out without colour alone.
 */
export function MessageList({
  messages,
  openId,
  onOpen,
}: {
  messages: ContactMessage[];
  openId: string | undefined;
  onOpen: (id: string) => void;
}) {
  const t = useTranslations("inbox");
  const ts = useTranslations("status.message");
  const locale = useLocale() as Locale;

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-sm border border-line bg-sheet">
      {messages.map((message) => {
        const isNew = message.status === "NEW";
        return (
          <li key={message.id}>
            <button
              type="button"
              onClick={() => onOpen(message.id)}
              aria-current={openId === message.id ? "true" : undefined}
              className={cn(
                "grid w-full grid-cols-[0.75rem_minmax(0,1fr)_auto] items-start gap-x-2 px-4 py-3.5 text-start transition-colors duration-150 hover:bg-paper focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan",
                openId === message.id && "bg-cyan-wash hover:bg-cyan-wash",
              )}
            >
              <span className="flex h-6 items-center" aria-hidden="true">
                {isNew ? <span className="size-2 rounded-full bg-warning" /> : null}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span
                  className={cn(
                    "truncate text-body text-ink",
                    isNew ? "font-semibold" : "font-medium",
                  )}
                >
                  {isNew ? <span className="sr-only">{ts("NEW")}: </span> : null}
                  <bdi>{message.name}</bdi>
                </span>
                <span className="truncate text-caption text-graphite">
                  {t(`subjects.${message.subject}`)}
                  {message.courseTitle ? <> · {message.courseTitle[locale]}</> : null}
                </span>
                {/* Its own direction, so line-clamp cuts at the text's end (an English
                    message in the Arabic UI); `match-parent` keeps it aligned with the page. */}
                <span
                  dir="auto"
                  className={cn(
                    "line-clamp-2 [text-align:match-parent] text-body break-words sm:line-clamp-1",
                    isNew ? "text-ink" : "text-graphite",
                  )}
                >
                  {firstLine(message.message)}
                </span>
              </span>
              <span className="text-caption whitespace-nowrap text-graphite tabular">
                <DateTime iso={message.createdAt} short />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
