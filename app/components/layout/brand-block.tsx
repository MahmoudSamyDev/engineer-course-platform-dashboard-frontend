import { useTranslations } from "use-intl";

/**
 * The brand as a small title block: a mark cell and a name cell divided by a rule
 * (DESIGN_SYSTEM §1, §7.1). The owner's name is placeholder data until the profile API lands.
 */
export function BrandBlock() {
  const t = useTranslations("brand");
  return (
    <div className="flex items-stretch overflow-hidden rounded-sm border-[1.5px] border-line-strong bg-sheet">
      <div
        aria-hidden="true"
        className="flex w-11 shrink-0 items-center justify-center border-e-[1.5px] border-line-strong bg-cyan-deep font-display text-body font-bold text-sheet"
        dir="ltr"
      >
        KM
      </div>
      <div className="flex min-w-0 flex-col justify-center px-3 py-1.5">
        <span className="truncate text-body font-semibold text-ink">{t("owner")}</span>
        <span className="truncate text-caption text-graphite">{t("product")}</span>
      </div>
    </div>
  );
}
