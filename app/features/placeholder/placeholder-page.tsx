import { Construction } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { PageHeader } from "~/components/layout/page-header";
import { EmptyState } from "~/components/ui/empty-state";

type PageKey =
  | "home"
  | "students"
  | "student"
  | "payments"
  | "courses"
  | "course"
  | "session"
  | "assistants"
  | "messages"
  | "profile";

const DESCRIBED = {
  home: true,
  students: true,
  payments: true,
  courses: true,
  assistants: true,
  messages: true,
  profile: true,
} as const;
type DescribedPage = keyof typeof DESCRIBED;

/**
 * Boilerplate stand-in for a page that a later phase builds (docs/PHASES.md).
 * Removed page by page as each phase lands.
 */
export function PlaceholderPage({
  page,
  phase,
  actions,
  back,
}: {
  page: PageKey;
  phase: string;
  actions?: ReactNode;
  back?: { to: string; label: string };
}) {
  const t = useTranslations();
  const description =
    page in DESCRIBED ? t(`pages.${page as DescribedPage}.description`) : undefined;
  return (
    <>
      <PageHeader
        title={t(`pages.${page}.title`)}
        description={description}
        actions={actions}
        back={back}
      />
      <EmptyState
        icon={<Construction strokeWidth={1.5} />}
        title={t("placeholder.title")}
        description={t("placeholder.description", { phase })}
      />
    </>
  );
}
