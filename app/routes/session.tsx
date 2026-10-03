import { useParams } from "react-router";
import { useTranslations } from "use-intl";
import { PlaceholderPage } from "~/features/placeholder/placeholder-page";

export default function Page() {
  const t = useTranslations("pages");
  const { courseId } = useParams();
  return (
    <PlaceholderPage
      page="session"
      phase="D9"
      back={{ to: `/courses/${courseId}?tab=sessions`, label: t("course.title") }}
    />
  );
}
