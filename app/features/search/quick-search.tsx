import { Search } from "lucide-react";
import { useEffect, useEffectEvent, useId, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { useLocale, useTranslations } from "use-intl";
import { Ltr, Phone } from "~/components/format";
import { BookingBadge } from "~/components/status";
import { Dialog } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import type { Locale } from "~/domain/types";
import { cn } from "~/lib/cn";
import { useGetRegistrationsQuery } from "../students/api";

/** Fewer characters than this match too much to be useful. */
const MIN_CHARS = 3;
const MAX_RESULTS = 8;

/** True when the user is typing somewhere, so "/" must type a slash, not open search. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']"),
  );
}

/** Opens quick search on "/" from anywhere that isn't a text field (DSH-GEN-12). */
export function useQuickSearchShortcut(open: () => void) {
  const onKey = useEffectEvent((event: globalThis.KeyboardEvent) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    if (isTyping(event.target) || document.querySelector("[role=dialog], [role=alertdialog]"))
      return;
    event.preventDefault();
    open();
  });
  useEffect(() => {
    const handler = (event: globalThis.KeyboardEvent) => onKey(event);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}

/** The rail's search field look-alike, or an icon button in the phone top bar. */
export function QuickSearchTrigger({
  onOpen,
  compact = false,
}: {
  onOpen: () => void;
  compact?: boolean;
}) {
  const t = useTranslations("search");
  if (compact) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label={t("open")}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-sm text-graphite hover:bg-paper hover:text-ink"
      >
        <Search aria-hidden="true" className="size-5" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-keyshortcuts="/"
      className="flex h-10 w-full items-center gap-2 rounded-sm border-[1.5px] border-line bg-paper px-3 text-body text-graphite transition-colors duration-150 hover:border-line-strong hover:text-ink"
    >
      <Search aria-hidden="true" className="size-4 shrink-0" />
      <span className="flex-1 truncate text-start">{t("open")}</span>
      <kbd
        aria-hidden="true"
        className="rounded-xs border border-line bg-sheet px-1.5 font-sans text-caption leading-5"
      >
        /
      </kbd>
    </button>
  );
}

/**
 * Find a booking by reference, phone or email and open the student (DSH-GEN-12). The term
 * stays in component state and is cleared on close: it may be a phone number (DSH-GEN-04).
 */
export function QuickSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("search");
  const locale = useLocale() as Locale;
  const navigate = useNavigate();
  const listId = useId();
  const [text, setText] = useState("");
  const [term, setTerm] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  // Wait for a pause in typing before asking the API.
  useEffect(() => {
    const timer = setTimeout(() => setTerm(text.trim()), 250);
    return () => clearTimeout(timer);
  }, [text]);

  const ready = term.length >= MIN_CHARS;
  const { data, isFetching, isError } = useGetRegistrationsQuery(
    { q: term, bookingStatus: "ALL", pageSize: MAX_RESULTS, sort: "-registeredAt" },
    { skip: !open || !ready },
  );
  const results = ready ? (data?.items ?? []) : [];
  const settled = ready && term === text.trim() && !isFetching;

  function close(next: boolean) {
    if (!next) {
      setText("");
      setTerm("");
      setActive(0);
    }
    onOpenChange(next);
  }

  function go(index: number) {
    const row = results[index];
    if (!row) return;
    close(false);
    navigate(`/students/${row.student.id}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(active);
    }
  }

  const optionId = (i: number) => `${listId}-${i}`;

  return (
    <Dialog
      open={open}
      onOpenChange={close}
      title={t("title")}
      description={t("description")}
      initialFocus={input}
    >
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-graphite"
          />
          <Input
            type="search"
            role="combobox"
            aria-label={t("label")}
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={results.length ? optionId(active) : undefined}
            placeholder={t("placeholder")}
            autoComplete="off"
            spellCheck={false}
            ref={input}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            className="ps-9"
          />
          {isFetching ? (
            <Spinner className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-graphite" />
          ) : null}
        </div>

        <ul
          id={listId}
          role="listbox"
          aria-label={t("results")}
          className={cn(
            "flex flex-col",
            results.length > 0 && "divide-y divide-line rounded-sm border border-line",
          )}
        >
          {results.map((row, i) => (
            // Keyboard users move with ↑/↓ and Enter on the combobox input (aria-activedescendant).
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <li
              key={row.bookingId}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(i)}
              className={cn(
                "flex cursor-pointer items-start justify-between gap-3 px-3 py-2.5",
                i === active && "bg-cyan-wash",
              )}
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium text-ink">
                  <bdi>{row.student.fullName}</bdi>
                </span>
                <span className="flex flex-wrap items-center gap-x-2 text-caption text-graphite">
                  <Ltr className="tabular">{row.reference}</Ltr>
                  <Phone e164={row.student.phoneE164} />
                </span>
                <span className="truncate text-caption text-graphite">
                  {row.course.title[locale]} · <Ltr>{row.session.code}</Ltr>
                </span>
              </span>
              <BookingBadge status={row.status} />
            </li>
          ))}
        </ul>

        <p role="status" className="text-caption text-graphite">
          {!ready
            ? t("hint", { count: MIN_CHARS })
            : isError
              ? t("error")
              : settled && results.length === 0
                ? t("none")
                : settled && (data?.total ?? 0) > results.length
                  ? t("more", { shown: results.length, count: data?.total ?? 0 })
                  : settled
                    ? t("count", { count: results.length })
                    : null}
        </p>
      </div>
    </Dialog>
  );
}
