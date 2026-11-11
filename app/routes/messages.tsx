import { Inbox } from "lucide-react";
import { useTranslations } from "use-intl";
import { PageHeader } from "~/components/layout/page-header";
import { EmptyState } from "~/components/ui/empty-state";
import { ErrorState } from "~/components/ui/error-state";
import { Skeleton } from "~/components/ui/skeleton";
import { useGetCountsQuery } from "~/features/overview/api";
import { messagesApi, useGetMessagesQuery } from "~/features/messages/api";
import { MessageList } from "~/features/messages/message-list";
import { MessageSheet } from "~/features/messages/message-sheet";
import { cn } from "~/lib/cn";
import { useUrlParams } from "~/lib/use-url-params";
import { store } from "~/store/store";
import type { Route } from "./+types/messages";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const archived = new URL(request.url).searchParams.get("tab") === "archived";
  store.dispatch(messagesApi.endpoints.getMessages.initiate({ archived }, { subscribe: false }));
  return null;
}

/** Messages — "Who wrote, and have I answered?" (SRS §4.11, DUS-25). */
export default function Messages() {
  const t = useTranslations("inbox");
  const tp = useTranslations("pages.messages");
  const url = useUrlParams();
  const archived = url.get("tab") === "archived";
  const openId = url.get("message");
  const { data, error, isLoading, isFetching, refetch } = useGetMessagesQuery({ archived });
  const { data: counts } = useGetCountsQuery();
  const open = data?.find((m) => m.id === openId);

  const tabs = [
    { key: "inbox", label: t("tabs.inbox"), count: counts?.newMessages ?? 0 },
    { key: "archived", label: t("tabs.archived"), count: 0 },
  ] as const;

  return (
    <>
      <PageHeader title={tp("title")} description={tp("description")} />

      <nav aria-label={t("tabsLabel")} className="mb-5 flex gap-1 border-b border-line">
        {tabs.map((tab) => {
          const current = (tab.key === "archived") === archived;
          return (
            <button
              key={tab.key}
              type="button"
              aria-current={current ? "page" : undefined}
              onClick={() =>
                url.set({
                  tab: tab.key === "archived" ? "archived" : undefined,
                  message: undefined,
                })
              }
              className={cn(
                "relative inline-flex h-10 shrink-0 items-center gap-2 px-3 text-body whitespace-nowrap text-graphite hover:text-ink touch:h-11",
                current &&
                  "font-semibold text-ink after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:bg-cyan",
              )}
            >
              {tab.label}
              {tab.count > 0 ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-warning-wash px-1.5 text-caption font-semibold text-warning tabular">
                  <span aria-hidden="true">{tab.count}</span>
                  <span className="sr-only">, {t("newCount", { count: tab.count })}</span>
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {isLoading ? (
        <div
          aria-hidden="true"
          className="divide-y divide-line rounded-sm border border-line bg-sheet"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2 px-4 py-4 ps-9">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
              <Skeleton className="h-4 w-full max-w-xl" />
            </div>
          ))}
        </div>
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={<Inbox strokeWidth={1.5} />}
          title={archived ? t("empty.archived") : t("empty.inbox")}
          description={archived ? t("emptyHint.archived") : t("emptyHint.inbox")}
        />
      ) : (
        <div aria-busy={isFetching} className={cn(isFetching && "opacity-70 transition-opacity")}>
          <MessageList messages={data} openId={openId} onOpen={(id) => url.set({ message: id })} />
        </div>
      )}

      <MessageSheet
        id={openId}
        message={open}
        loading={isLoading}
        onClose={() => url.set({ message: undefined })}
      />
    </>
  );
}
