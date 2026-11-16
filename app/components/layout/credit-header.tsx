// lucide-react 1.x dropped the brand logos, so they are drawn here (feather-icons style: 24x24,
// stroke currentColor) from path data. WhatsApp has no simple outline logo: a speech bubble is
// the closest shape.
const PATHS = {
  linkedin:
    "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM6 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  github:
    "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
  portfolio:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20",
  facebook: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  whatsapp: "M7.9 20A9 9 0 1 0 4 16.1L2 22z",
};

const PORTFOLIO = "https://www.mahmoudsamydev.site";

const LINKS = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/MahmoudSamyDev", icon: PATHS.linkedin },
  { name: "GitHub", href: "https://github.com/MahmoudSamyDev", icon: PATHS.github },
  { name: "Portfolio", href: PORTFOLIO, icon: PATHS.portfolio },
  { name: "Facebook", href: "https://www.facebook.com/Mahmoud.samy.2024", icon: PATHS.facebook },
  { name: "WhatsApp", href: "https://wa.me/201550202563", icon: PATHS.whatsapp },
];

/**
 * Developer credit, pinned above every page (mounted once in root.tsx). Always left-to-right
 * so it looks the same in Arabic. z-35 sits above the navigation rail (30) and top bar (20)
 * and below every dialog, sheet and drawer overlay (40+).
 */
export function CreditHeader() {
  return (
    <div
      dir="ltr"
      className="sticky top-0 z-[35] flex h-8 w-full items-center justify-center gap-3 border-b border-amber-300 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 px-3 text-sm text-slate-700 print:hidden"
    >
      <p className="shrink-0 whitespace-nowrap">
        Developed by{" "}
        <a
          href={PORTFOLIO}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Mahmoud Samy, developer portfolio"
          title="Mahmoud Samy"
          className="font-bold text-slate-950 hover:text-amber-800 hover:underline"
        >
          Mahmoud Samy
        </a>
      </p>
      <span aria-hidden="true" className="h-4 w-px shrink-0 bg-amber-400" />
      <nav aria-label="Developer links" className="flex items-center gap-3">
        {LINKS.map(({ name, href, icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            title={name}
            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-950"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-4 shrink-0"
            >
              <path d={icon} />
            </svg>
            <span className="hidden sm:inline">{name}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
