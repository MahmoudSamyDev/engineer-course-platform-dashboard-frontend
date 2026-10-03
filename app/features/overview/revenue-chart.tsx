import { Tooltip } from "radix-ui";
import { useLocale, useTranslations } from "use-intl";
import { Panel } from "~/components/ui/panel";
import type { Overview } from "~/domain/api";
import { formatAmount } from "~/lib/format";

const CHART_HEIGHT = 160;

function monthLabel(key: string, locale: string, style: "short" | "long") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
    month: style,
    ...(style === "long" ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${key}-15T12:00:00Z`));
}

/**
 * Net revenue per Cairo month, last 6 months (DSH-HOME-03). Single series → one hue (cyan),
 * no legend; bars ≤ 24px with a rounded top; values on hover/focus plus a screen-reader
 * table; the current and the highest month are labelled directly (dataviz method).
 * With fewer than 4 months of data it shows totals instead of a chart.
 */
export function RevenueChart({ data }: { data: Overview["revenueByMonth"] }) {
  const t = useTranslations("home.revenue");
  const tc = useTranslations("common");
  const locale = useLocale();
  const withData = data.filter((d) => d.amount > 0);
  const max = Math.max(...data.map((d) => d.amount), 1);
  const peak = data.reduce((best, d) => (d.amount > best.amount ? d : best), data[0]!);
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  // Round the scale up to a clean step so the gridlines read as round numbers.
  const step = 10 ** Math.floor(Math.log10(max / 100)) * 100;
  const top = Math.ceil(max / 2 / step) * step * 2 || max;

  return (
    <Panel id="revenue" title={t("title")}>
      {withData.length < 4 ? (
        <dl className="grid grid-cols-2 gap-4 p-4">
          {data.slice(-2).map((d) => (
            <div key={d.month}>
              <dt className="text-label text-graphite">{monthLabel(d.month, locale, "long")}</dt>
              <dd className="tabular font-display text-heading font-semibold">{tc("money", { amount: formatAmount(d.amount) })}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="p-4">
          <p className="mb-4 text-caption text-graphite">{t("summary", { total: tc("money", { amount: formatAmount(total) }) })}</p>
          <div className="relative" style={{ height: CHART_HEIGHT }}>
            {[1, 0.5, 0].map((fraction) => (
              <div key={fraction} aria-hidden="true" className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: fraction * CHART_HEIGHT }}>
                <span className="h-px flex-1 bg-line" />
                <span className="tabular w-14 shrink-0 text-end text-[0.75rem] leading-none text-graphite">
                  {fraction === 0 ? "0" : `${formatAmount((top * fraction) / 1000)}k`}
                </span>
              </div>
            ))}
            <ul className="absolute inset-y-0 start-0 end-16 flex items-end justify-around" aria-hidden="true">
              {data.map((d) => {
                const label = d === peak || d === data[data.length - 1];
                return (
                  <li key={d.month} className="relative flex h-full w-full items-end justify-center">
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          type="button"
                          tabIndex={-1}
                          className="relative w-full max-w-6 rounded-t-[4px] bg-cyan outline-none hover:bg-cyan-deep"
                          style={{ height: `${Math.max(2, (d.amount / top) * 100)}%` }}
                        >
                          {label && d.amount > 0 ? (
                            <span className="tabular absolute -top-5 left-1/2 -translate-x-1/2 text-[0.75rem] whitespace-nowrap text-ink">
                              {formatAmount(d.amount / 1000)}k
                            </span>
                          ) : null}
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content sideOffset={6} className="z-50 rounded-sm bg-ink px-2 py-1 text-caption text-sheet">
                          {monthLabel(d.month, locale, "long")}: {tc("money", { amount: formatAmount(d.amount) })}
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </li>
                );
              })}
            </ul>
          </div>
          <ul aria-hidden="true" className="me-16 mt-2 flex justify-around">
            {data.map((d) => (
              <li key={d.month} className="w-full text-center text-caption text-graphite">
                {monthLabel(d.month, locale, "short")}
              </li>
            ))}
          </ul>
          <table className="sr-only">
            <caption>{t("title")}</caption>
            <thead>
              <tr>
                <th scope="col">{t("month")}</th>
                <th scope="col">{t("net")}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.month}>
                  <th scope="row">{monthLabel(d.month, locale, "long")}</th>
                  <td>{tc("money", { amount: formatAmount(d.amount) })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
