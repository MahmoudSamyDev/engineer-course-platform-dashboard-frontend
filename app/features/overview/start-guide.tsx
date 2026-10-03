import { Link } from "react-router";
import { useTranslations } from "use-intl";
import { Button } from "~/components/ui/button";

/** Empty system (DSH-HOME-08): the three steps to the first booking. */
export function StartGuide() {
  const t = useTranslations("home.start");
  return (
    <section className="rounded-sm border border-line bg-sheet p-6">
      <h2 className="font-display text-heading font-semibold">{t("title")}</h2>
      <ol className="mt-4 flex flex-col gap-3 text-body text-ink">
        {(["one", "two", "three"] as const).map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="tabular inline-flex size-6 shrink-0 items-center justify-center rounded-xs bg-cyan-wash text-caption font-semibold text-cyan">
              {index + 1}
            </span>
            {t(step)}
          </li>
        ))}
      </ol>
      <Button asChild variant="primary" className="mt-5">
        <Link to="/courses?new=1">{t("action")}</Link>
      </Button>
    </section>
  );
}
