import { CircleAlert } from "lucide-react";
import { useTranslations } from "use-intl";
import { isNetworkError } from "~/store/api";
import { Button } from "./button";

/** What happened + how to recover (design.md §8). Never a bare "Something went wrong". */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const t = useTranslations("errors");
  const network = isNetworkError(error);
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-sm border border-danger/30 bg-danger-wash p-5">
      <p className="flex items-center gap-2 text-body font-semibold text-danger">
        <CircleAlert aria-hidden="true" className="size-4" />
        {network ? t("networkTitle") : t("loadTitle")}
      </p>
      <p className="text-body text-ink">{network ? t("networkDescription") : t("loadDescription")}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      ) : null}
    </div>
  );
}
