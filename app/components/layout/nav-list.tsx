import { NavLink } from "react-router";
import { useTranslations } from "use-intl";
import { cn } from "~/lib/cn";
import { NAV_ITEMS } from "./nav-items";

/**
 * The main navigation list, shared by the desktop rail and the mobile drawer.
 * Active item: cyan-wash fill + 3px start-edge bar + semibold — never color alone (DSH-NAV-03).
 */
export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("nav");
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
            <span>{t(key)}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
