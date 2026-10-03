import { useTranslations } from "use-intl";
import { PlaceholderPage } from "~/features/placeholder/placeholder-page";

export default function Page() {
  const t = useTranslations("pages");
  return (
    <PlaceholderPage
      page="course"
      phase="D9"
      back={{ to: "/courses", label: t("courses.title") }}
    />
  );
}
