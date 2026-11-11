import type { ReactNode } from "react";
import { Provider } from "react-redux";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useTranslations } from "use-intl";
import type { Route } from "./+types/root";
import { BrandBlock } from "./components/layout/brand-block";
import { StatusScreen } from "./components/layout/status-screen";
import { Button } from "./components/ui/button";
import { Spinner } from "./components/ui/spinner";
import { directionOf } from "./i18n/config";
import { AppProviders } from "./providers/app-providers";
import { LocaleBootstrap } from "./providers/locale-bootstrap";
import { useAppSelector } from "./store/hooks";
import { store } from "./store/store";
import { selectLocale } from "./store/ui-slice";
import "./styles/app.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  // Arabic is the default UI language: preload its body face (DESIGN_SYSTEM §4).
  {
    rel: "preload",
    href: "/fonts/plex-arabic-400.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
];

export const meta: Route.MetaFunction = () => [
  // Private admin app: never indexed (DNFR-SEC-07).
  { name: "robots", content: "noindex, nofollow" },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <Document>{children}</Document>
    </Provider>
  );
}

function Document({ children }: { children: ReactNode }) {
  const locale = useAppSelector(selectLocale);
  return (
    <html lang={locale} dir={directionOf(locale)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* eslint-disable-next-line no-restricted-syntax -- matches the paper token; meta tags can't read CSS variables */}
        <meta name="theme-color" content="#f3f5f6" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppProviders locale={locale}>{children}</AppProviders>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <LocaleBootstrap />
      <Outlet />
    </>
  );
}

/** Rendered into index.html at build time and shown until the app is ready (DSH-GEN-01). */
export function HydrateFallback() {
  const t = useTranslations("app");
  return (
    <StatusScreen>
      <title>{t("name")}</title>
      <div className="flex flex-col gap-6">
        <BrandBlock />
        <p className="flex items-center gap-2 text-body text-graphite" role="status">
          <Spinner />
          {t("loading")}
        </p>
      </div>
    </StatusScreen>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const t = useTranslations("errors");
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  // Thrown by the auth guard when `me` fails for a reason other than 401 (offline, API down).
  const unreachable = isRouteErrorResponse(error) && error.status === 503;
  const details = import.meta.env.DEV && error instanceof Error ? error.stack : undefined;

  return (
    <StatusScreen>
      <div className="flex flex-col gap-4 rounded-sm border border-line bg-sheet p-6">
        <h1 className="font-display text-title font-semibold">
          {notFound ? t("notFoundTitle") : unreachable ? t("networkTitle") : t("genericTitle")}
        </h1>
        <p className="text-body text-graphite">
          {notFound
            ? t("notFoundDescription")
            : unreachable
              ? t("networkDescription")
              : t("genericDescription")}
        </p>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link to="/">{t("backHome")}</Link>
          </Button>
          {!notFound ? (
            <Button variant="ghost" onClick={() => window.location.reload()}>
              {t("retry")}
            </Button>
          ) : null}
        </div>
        {details ? (
          <pre dir="ltr" className="max-h-64 overflow-auto rounded-sm bg-paper p-3 text-caption">
            {details}
          </pre>
        ) : null}
      </div>
    </StatusScreen>
  );
}
