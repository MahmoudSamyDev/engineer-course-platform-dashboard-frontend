import { useLocale, useTranslations } from "use-intl";
import { TitleBlock, TitleCell } from "~/components/ui/title-block";
import { Money } from "~/components/format";
import type { Overview } from "~/domain/api";
import { lastMonthKeys } from "~/domain/months";
import { appNow } from "~/lib/clock";

function monthName(key: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { month: "long", timeZone: "UTC" }).format(
    new Date(`${key}-15T12:00:00Z`),
  );
}

/**
 * Home title block (DSH-HOME-01, DESIGN_SYSTEM §7.2): four facts in one ruled frame,
 * each compared in words — never an arrow or a color alone.
 */
export function KpiStrip({ kpis }: { kpis: Overview["kpis"] }) {
  const t = useTranslations("home.kpi");
  const locale = useLocale();
  const lastMonth = monthName(lastMonthKeys(appNow(), 2)[0]!, locale);

  const revenueNote = (() => {
    if (kpis.revenueLastMonth === 0) return t("noRevenueLastMonth", { month: lastMonth });
    const change = Math.round(((kpis.revenueThisMonth - kpis.revenueLastMonth) / kpis.revenueLastMonth) * 100);
    return change >= 0 ? t("revenueUp", { percent: change, month: lastMonth }) : t("revenueDown", { percent: -change, month: lastMonth });
  })();

  const diff = kpis.paidThisMonth - kpis.paidLastMonth;
  const paidNote =
    diff === 0
      ? t("paidSame", { month: lastMonth })
      : diff > 0
        ? t("paidMore", { count: diff, month: lastMonth })
        : t("paidFewer", { count: -diff, month: lastMonth });

  const fill = kpis.seatsCapacity > 0 ? Math.round((kpis.seatsSold / kpis.seatsCapacity) * 100) : 0;

  return (
    <TitleBlock>
      <TitleCell label={t("revenue")} value={<Money amount={kpis.revenueThisMonth} wrap />} note={revenueNote} />
      <TitleCell label={t("paid")} value={kpis.paidThisMonth} note={paidNote} />
      <TitleCell
        label={t("seats")}
        value={t("seatsValue", { sold: kpis.seatsSold, capacity: kpis.seatsCapacity })}
        note={t("seatsNote", { percent: fill })}
      />
      <TitleCell label={t("upcoming")} value={kpis.upcomingSessions} note={t("upcomingNote")} />
    </TitleBlock>
  );
}
