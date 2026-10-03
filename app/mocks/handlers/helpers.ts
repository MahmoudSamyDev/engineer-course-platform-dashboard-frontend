import { HttpResponse } from "msw";

/** `{ data, meta }` list envelope with server-side paging (SRS §7.2). */
export function listResponse<T>(items: T[], url: URL, extraMeta: Record<string, unknown> = {}) {
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 25));
  const start = (page - 1) * pageSize;
  return HttpResponse.json({
    data: items.slice(start, start + pageSize),
    meta: { page, pageSize, total: items.length, ...extraMeta },
  });
}

export function itemResponse<T>(data: T, status = 200) {
  return HttpResponse.json({ data }, { status });
}

/** Case- and diacritic-insensitive match on any of the given values (search box). */
export function matchesQuery(
  query: string | null,
  ...values: Array<string | null | undefined>
): boolean {
  if (!query) return true;
  const needle = normalize(query);
  return values.some((value) => value && normalize(value).includes(needle));
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[ً-ْ]/g, "") // Arabic diacritics
    .replace(/[أإآ]/g, "ا")
    .replace(/\s+/g, "")
    .replace(/^\+?20/, "0");
}

/** Inclusive date range on a Cairo-agnostic ISO timestamp (`from`/`to` are YYYY-MM-DD). */
export function inRange(iso: string, from: string | null, to: string | null): boolean {
  const day = iso.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

export function sortBy<T>(
  items: T[],
  key: string | null,
  getters: Record<string, (item: T) => string | number>,
  fallback: string,
): T[] {
  const sort = key && getters[key.replace(/^-/, "")] ? key : fallback;
  const desc = sort.startsWith("-");
  const get = getters[sort.replace(/^-/, "")]!;
  return [...items].sort((a, b) => {
    const x = get(a);
    const y = get(b);
    const order =
      typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
    return desc ? -order : order;
  });
}

/** CSV with a UTF-8 BOM so Excel shows Arabic correctly (DSH-STU-06). */
export function csvResponse(
  filename: string,
  header: string[],
  rows: Array<Array<string | number>>,
) {
  const escape = (value: string | number) => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const body = "﻿" + [header, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
  return new HttpResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
