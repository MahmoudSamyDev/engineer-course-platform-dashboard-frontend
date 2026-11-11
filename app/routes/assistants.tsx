import { Plus, UsersRound } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { PageHeader } from "~/components/layout/page-header";
import { Button } from "~/components/ui/button";
import { ConfirmDialog } from "~/components/ui/confirm-dialog";
import { EmptyState } from "~/components/ui/empty-state";
import { ErrorState } from "~/components/ui/error-state";
import { SearchInput } from "~/components/ui/filter-bar";
import { Skeleton } from "~/components/ui/skeleton";
import { useToast } from "~/components/ui/toast";
import type { Assistant } from "~/domain/api";
import {
  assistantsApi,
  useDeleteAssistantMutation,
  useGetAssistantsQuery,
  useUpdateAssistantMutation,
} from "~/features/assistants/api";
import { AssistantCard } from "~/features/assistants/assistant-card";
import { AssistantDialog } from "~/features/assistants/assistant-dialog";
import { cn } from "~/lib/cn";
import { useUrlParams } from "~/lib/use-url-params";
import { getApiError } from "~/store/api";
import { store } from "~/store/store";
import type { Route } from "./+types/assistants";

const FILTERS = ["active", "inactive", "all"] as const;
type Filter = (typeof FILTERS)[number];
const ACTIVE_PARAM: Record<Filter, "true" | "false" | undefined> = {
  active: "true",
  inactive: "false",
  all: undefined,
};

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const status = new URL(request.url).searchParams.get("status");
  const filter = (FILTERS as readonly string[]).includes(status ?? "")
    ? (status as Filter)
    : "active";
  store.dispatch(
    assistantsApi.endpoints.getAssistants.initiate(
      { active: ACTIVE_PARAM[filter] },
      { subscribe: false },
    ),
  );
  return null;
}

type Confirm = { kind: "deactivate" | "delete"; assistant: Assistant };

/** Assistants — "Who scans tickets at the door?" (SRS §4.9, DUS-20/21, DAC-07). */
export default function Assistants() {
  const t = useTranslations("assistants");
  const tp = useTranslations("pages.assistants");
  const tc = useTranslations("common");
  const toast = useToast();
  const url = useUrlParams();
  // The search term may be a phone number: component state only, never the URL (DSH-GEN-04).
  const [q, setQ] = useState("");
  const status = url.get("status");
  const filter: Filter = (FILTERS as readonly string[]).includes(status ?? "")
    ? (status as Filter)
    : "active";
  const { data, error, isLoading, isFetching, refetch } = useGetAssistantsQuery({
    active: ACTIVE_PARAM[filter],
    q: q || undefined,
  });
  const [update, updateState] = useUpdateAssistantMutation();
  const [remove, removeState] = useDeleteAssistantMutation();
  const [editing, setEditing] = useState<Assistant | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const adding = url.get("new") === "1";

  const openAdd = () => url.set({ new: 1 });

  async function setActive(assistant: Assistant, isActive: boolean) {
    try {
      await update({ id: assistant.id, isActive }).unwrap();
      toast({
        title: isActive ? t("activated") : t("deactivated"),
        description: assistant.fullName,
      });
      setConfirm(null);
    } catch (e) {
      toast({ title: getApiError(e)?.message ?? tc("saveFailed"), tone: "error" });
    }
  }

  async function runConfirm() {
    if (!confirm) return;
    if (confirm.kind === "deactivate") return setActive(confirm.assistant, false);
    try {
      await remove(confirm.assistant.id).unwrap();
      toast({ title: t("deleted"), description: confirm.assistant.fullName });
      setConfirm(null);
    } catch (e) {
      const apiError = getApiError(e);
      toast({
        title:
          apiError?.fields?.assistant === "HAS_CHECKINS" ? t("deleteBlocked") : tc("saveFailed"),
        tone: "error",
      });
      setConfirm(null);
    }
  }

  return (
    <>
      <PageHeader
        title={tp("title")}
        description={tp("description")}
        actions={
          <Button variant="primary" onClick={openAdd}>
            <Plus aria-hidden="true" />
            {t("add")}
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav aria-label={t("filterLabel")} className="flex gap-1 border-b border-line md:border-0">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              aria-current={filter === option ? "page" : undefined}
              onClick={() => url.set({ status: option === "active" ? undefined : option })}
              className={cn(
                "relative h-10 shrink-0 px-3 text-body whitespace-nowrap text-graphite hover:text-ink touch:h-11",
                filter === option &&
                  "font-semibold text-ink after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:bg-cyan",
              )}
            >
              {t(`filters.${option}`)}
            </button>
          ))}
        </nav>
        <SearchInput
          label={t("searchLabel")}
          placeholder={t("searchPlaceholder")}
          value={q}
          onSearch={setQ}
          className="md:w-72"
        />
      </div>

      {isLoading ? (
        <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-56 rounded-sm" />
          ))}
        </div>
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.length === 0 ? (
        q ? (
          <EmptyState
            title={t("noResults")}
            description={t("noResultsHint")}
            action={
              <Button variant="secondary" onClick={() => setQ("")}>
                {tc("clearSearch")}
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<UsersRound strokeWidth={1.5} />}
            title={t(`empty.${filter}`)}
            description={t("emptyHint")}
            action={
              filter === "inactive" ? (
                <Button variant="secondary" onClick={() => url.set({ status: "all" })}>
                  {t("showAll")}
                </Button>
              ) : (
                <Button variant="primary" onClick={openAdd}>
                  {t("add")}
                </Button>
              )
            }
          />
        )
      ) : (
        <ul
          aria-busy={isFetching}
          className={cn(
            "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
            isFetching && "opacity-70 transition-opacity",
          )}
        >
          {data.map((assistant) => (
            <li key={assistant.id} className="flex [&>article]:flex-1">
              <AssistantCard
                assistant={assistant}
                onEdit={setEditing}
                onToggleActive={(a) =>
                  a.isActive ? setConfirm({ kind: "deactivate", assistant: a }) : setActive(a, true)
                }
                onDelete={(a) => setConfirm({ kind: "delete", assistant: a })}
              />
            </li>
          ))}
        </ul>
      )}

      {adding || editing ? (
        <AssistantDialog
          key={editing?.id ?? "new"}
          assistant={editing}
          onClose={() => {
            setEditing(null);
            if (adding) url.set({ new: undefined });
          }}
        />
      ) : null}
      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={
          confirm?.kind === "delete"
            ? t("deleteTitle", { name: confirm.assistant.fullName })
            : t("deactivateTitle", { name: confirm?.assistant.fullName ?? "" })
        }
        description={
          confirm?.kind === "delete"
            ? t("deleteDescription")
            : t("deactivateDescription", { count: confirm?.assistant.checkInsCount ?? 0 })
        }
        confirmLabel={confirm?.kind === "delete" ? t("card.delete") : t("card.deactivate")}
        destructive
        loading={updateState.isLoading || removeState.isLoading}
        onConfirm={runConfirm}
      />
    </>
  );
}
