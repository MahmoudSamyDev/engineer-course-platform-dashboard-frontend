import { NavLink } from "react-router";
import { useTranslations } from "use-intl";
import { useGetCountsQuery } from "~/features/overview/api";
import { cn } from "~/lib/cn";
import { NAV_ITEMS } from "./nav-items";

/**
 * The main navigation list, shared by the desktop rail and the mobile drawer.
 * Active item: cyan-wash fill + 3px start-edge bar + semibold — never color alone (DSH-NAV-03).
 */
export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("nav");
  // Counts that need attention (DSH-NAV-04), refreshed every minute while the tab is visible.
  const { data: counts } = useGetCountsQuery(undefined, {
    pollingInterval: 60_000,
    skipPollingIfUnfocused: true,
  });
  const badgeFor = (key: string) =>
    key === "payments"
      ? counts?.refundRequired
      : key === "messages"
        ? counts?.newMessages
        : undefined;
  return (
    <ul className="flex flex-col gap-0.5">
      {NAV_ITEMS.map(({ key, to, icon: Icon }) => (
        <li key={key}>
          <NavLink
            to={to}
            end={to === "/"}
            prefetch="intent"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "relative flex h-10 items-center gap-3 rounded-sm px-3 text-body text-graphite touch:h-11",
                "transition-colors duration-150 hover:bg-paper hover:text-ink",
                isActive &&
                  "bg-cyan-wash font-semibold text-ink before:absolute before:inset-y-1.5 before:start-0 before:w-[3px] before:rounded-full before:bg-cyan hover:bg-cyan-wash",
              )
            }
          >
            <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.5} />
            <span className="flex-1">{t(key)}</span>
            {badgeFor(key) ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-xs bg-warning-wash px-1.5 text-caption font-semibold text-warning tabular">
                {badgeFor(key)}
                <span className="sr-only"> {t("needsAttention")}</span>
              </span>
            ) : null}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
