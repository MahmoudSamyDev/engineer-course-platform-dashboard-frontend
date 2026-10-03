import { useTranslations } from "use-intl";
import { PlaceholderPage } from "~/features/placeholder/placeholder-page";

export default function Page() {
  const t = useTranslations("pages");
  return (
    <PlaceholderPage
      page="student"
      phase="D7"
      back={{ to: "/students", label: t("students.title") }}
    />
  );
}
