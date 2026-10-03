import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { useTranslations } from "use-intl";

/**
 * Page title (the page's only h1), optional description, back link and actions
 * (DSH-NAV-05/06). Also sets the document title.
 */
export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
}) {
  const t = useTranslations("app");
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <title>{t("documentTitle", { page: title })}</title>
      <div className="flex min-w-0 flex-col gap-1">
        {back ? (
          <Link
            to={back.to}
            className="mb-1 inline-flex items-center gap-1.5 self-start text-caption font-medium text-cyan hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            {back.label}
          </Link>
        ) : null}
        <h1 className="font-display text-[1.25rem] leading-7 font-semibold sm:text-title">
          {title}
        </h1>
        {description ? <p className="text-body text-graphite">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
