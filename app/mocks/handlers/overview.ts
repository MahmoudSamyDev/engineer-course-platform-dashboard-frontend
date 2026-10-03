import { http } from "msw";
import type { NavCounts } from "~/domain/api";
import { MOCK_API } from "../config";
import { db } from "../db";
import { latency } from "../http";
import { overview } from "../views";
import { itemResponse } from "./helpers";

/** SRS §7.2 — GET /admin/overview, GET /admin/counts (navigation badges, DSH-NAV-04). */
export const overviewHandlers = [
  http.get(`${MOCK_API}/overview`, async () => {
    await latency();
    return itemResponse(overview());
  }),
  http.get(`${MOCK_API}/counts`, async () => {
    await latency();
    const counts: NavCounts = {
      refundRequired: db.bookings.filter((b) => b.status === "REFUND_REQUIRED").length,
      newMessages: db.messages.filter((m) => m.status === "NEW").length,
    };
    return itemResponse(counts);
  }),
];
