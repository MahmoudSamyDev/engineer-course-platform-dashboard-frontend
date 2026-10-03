import { Plus } from "lucide-react";
import { useTranslations } from "use-intl";
import { Button } from "~/components/ui/button";
import { PlaceholderPage } from "~/features/placeholder/placeholder-page";

export default function Page() {
  const t = useTranslations("actions");
  return (
    <PlaceholderPage
      page="courses"
      phase="D9"
      actions={
        // Opens the Add course dialog in D9 (DSH-CRS-03); disabled until then.
        <Button variant="primary" disabled>
          <Plus aria-hidden="true" />
          {t("addCourse")}
        </Button>
      }
    />
  );
}
