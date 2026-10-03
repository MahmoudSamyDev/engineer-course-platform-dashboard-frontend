import { Link } from "react-router";
import { useTranslations } from "use-intl";
import { PageHeader } from "~/components/layout/page-header";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";

export default function NotFound() {
  const t = useTranslations("errors");
  return (
    <>
      <PageHeader title={t("notFoundTitle")} />
      <EmptyState
        title={t("notFoundTitle")}
        description={t("notFoundDescription")}
        action={
          <Button asChild variant="secondary">
            <Link to="/">{t("backHome")}</Link>
          </Button>
        }
      />
    </>
  );
}
