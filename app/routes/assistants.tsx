import { Plus } from "lucide-react";
import { useTranslations } from "use-intl";
import { Button } from "~/components/ui/button";
import { PlaceholderPage } from "~/features/placeholder/placeholder-page";

export default function Page() {
  const t = useTranslations("actions");
  return (
    <PlaceholderPage
      page="assistants"
      phase="D10"
      actions={
        // Opens the Add assistant dialog in D10 (DSH-ASS-02); disabled until then.
        <Button variant="primary" disabled>
          <Plus aria-hidden="true" />
          {t("addAssistant")}
        </Button>
      }
    />
  );
}
