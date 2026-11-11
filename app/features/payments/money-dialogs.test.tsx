import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MOCK_API } from "~/mocks/config";
import { db, mockNow, mockSession } from "~/mocks/db";
import { server } from "~/mocks/node";
import { heldSeats, paymentDetail, soldSeats } from "~/mocks/views";
import { renderWithProviders } from "../../../tests/render";
import { CancelDialog } from "./cancel-dialog";
import { MoveDialog } from "./move-dialog";
import { RefundDialog } from "./refund-dialog";

beforeEach(() => mockSession.set("adm_owner"));

/** The seed has two late payments on a full session (Website BR-09). */
function refundRequired() {
  const booking = db.bookings.find((b) => b.status === "REFUND_REQUIRED")!;
  const payment = db.payments.find((p) => p.bookingId === booking.id && p.status === "SUCCEEDED")!;
  return { booking, payment, detail: paymentDetail(payment) };
}

function paidUpcoming() {
  const now = mockNow().getTime();
  const booking = db.bookings.find((b) => {
    if (b.status !== "PAID") return false;
    const session = db.sessions.find((s) => s.id === b.sessionId)!;
    return Date.parse(session.meetings[0]!.startsAt) > now;
  })!;
  const payment = db.payments.find((p) => p.bookingId === booking.id && p.status === "SUCCEEDED")!;
  return { booking, payment, detail: paymentDetail(payment) };
}

/** Other sessions of the same course a student could be moved to (DBR-12). */
function moveTargets(courseId: string, exceptSessionId: string) {
  const now = mockNow().getTime();
  return db.sessions.filter(
    (s) =>
      s.courseId === courseId &&
      s.id !== exceptSessionId &&
      s.isPublished &&
      Date.parse(s.meetings[0]!.startsAt) > now,
  );
}

/** A later, published session of the same course with `free` seats left. */
function addTarget(fromSessionId: string, suffix = "T", free = 1) {
  const from = db.sessions.find((s) => s.id === fromSessionId)!;
  const week = 7 * 24 * 60 * 60_000;
  const later = (iso: string) => new Date(Date.parse(iso) + 4 * week).toISOString();
  const target = {
    ...from,
    id: `ses_test_${suffix}`,
    code: `${from.code}-${suffix}`,
    capacity: free,
    isPublished: true,
    isClosedManually: false,
    registrationClosesAt: later(from.registrationClosesAt),
    meetings: from.meetings.map((m, i) => ({
      ...m,
      id: `mtg_test_${suffix}_${i}`,
      startsAt: later(m.startsAt),
      endsAt: later(m.endsAt),
    })),
  };
  db.sessions.push(target);
  return target;
}

function fill(sessionId: string) {
  const session = db.sessions.find((s) => s.id === sessionId)!;
  session.capacity = soldSeats(sessionId) + heldSeats(sessionId);
}

describe("Record refund (DSH-PAY-05, DBR-11, DAC-04)", () => {
  it("needs the Paymob transaction ID and an amount within what was paid", async () => {
    const { payment, booking, detail } = refundRequired();
    renderWithProviders(<RefundDialog payment={detail} open onOpenChange={vi.fn()} />);
    const amount = screen.getByLabelText(/Refund amount/);
    await userEvent.clear(amount);
    await userEvent.type(amount, String(payment.amount / 100 + 1));
    await userEvent.click(screen.getByRole("button", { name: "Record refund" }));

    expect(
      await screen.findByText(`Enter an amount between 1 and ${payment.amount / 100} EGP.`),
    ).toBeInTheDocument();
    expect(screen.getByText("Enter the refund transaction ID from Paymob.")).toBeInTheDocument();
    expect(payment.status).toBe("SUCCEEDED");
    expect(booking.status).toBe("REFUND_REQUIRED");
  });

  it("records a full refund: payment and booking become Refunded", async () => {
    const { payment, booking, detail } = refundRequired();
    const onOpenChange = vi.fn();
    renderWithProviders(<RefundDialog payment={detail} open onOpenChange={onOpenChange} />);
    await userEvent.type(screen.getByLabelText(/Paymob refund transaction ID/), "261234567");
    await userEvent.click(screen.getByRole("button", { name: "Record refund" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(payment).toMatchObject({
      status: "REFUNDED",
      refundedAmount: payment.amount,
      refundTransactionId: "261234567",
    });
    expect(booking.status).toBe("REFUNDED");
    expect(db.bookings.filter((b) => b.status === "REFUND_REQUIRED")).toHaveLength(1);
  });
});

describe("Move to another session (DSH-PAY-06, DBR-12)", () => {
  it("explains when no other session has free seats, and can't submit", async () => {
    const { booking, detail } = refundRequired();
    for (const s of moveTargets(detail.course.id, booking.sessionId)) fill(s.id);
    renderWithProviders(<MoveDialog payment={detail} open onOpenChange={vi.fn()} />);

    expect(
      await screen.findByText(/No other session of this course has free seats/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Move student" })).toBeDisabled();
  });

  it("asks to choose a session first", async () => {
    const { booking, detail } = refundRequired();
    addTarget(booking.sessionId);
    renderWithProviders(<MoveDialog payment={detail} open onOpenChange={vi.fn()} />);
    await screen.findByRole("combobox", { name: /Session/ });
    await userEvent.click(screen.getByRole("button", { name: "Move student" }));
    expect(await screen.findByText("Choose a session.")).toBeInTheDocument();
    expect(booking.status).toBe("REFUND_REQUIRED");
  });

  it("moves the student into the chosen session as Paid", async () => {
    const { booking, payment, detail } = refundRequired();
    const from = booking.sessionId;
    const target = addTarget(from);
    const onOpenChange = vi.fn();
    renderWithProviders(<MoveDialog payment={detail} open onOpenChange={onOpenChange} />);

    await userEvent.click(await screen.findByRole("combobox", { name: /Session/ }));
    await userEvent.click(
      await screen.findByRole("option", { name: new RegExp(`^${target.code} `) }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Move student" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(booking).toMatchObject({
      status: "PAID",
      sessionId: target.id,
      movedFromSessionId: from,
    });
    expect(payment.timeline.at(-1)).toMatchObject({ type: "MOVED" });
  });

  it("says so when the chosen session filled up meanwhile", async () => {
    const { booking, detail } = refundRequired();
    const target = addTarget(booking.sessionId, "A");
    addTarget(booking.sessionId, "B"); // Still has a seat, so the choice stays open.
    renderWithProviders(<MoveDialog payment={detail} open onOpenChange={vi.fn()} />);

    await userEvent.click(await screen.findByRole("combobox", { name: /Session/ }));
    await userEvent.click(
      await screen.findByRole("option", { name: new RegExp(`^${target.code} `) }),
    );
    fill(target.id); // Someone else took the last seat.
    await userEvent.click(screen.getByRole("button", { name: "Move student" }));

    expect(
      await screen.findByText("That session just filled up. Choose another one."),
    ).toBeInTheDocument();
    expect(booking.status).toBe("REFUND_REQUIRED");
    expect(booking.sessionId).not.toBe(target.id);
  });
});

describe("Cancel booking (DSH-PAY-07)", () => {
  it("requires a reason and changes nothing without one", async () => {
    const { booking, detail } = paidUpcoming();
    renderWithProviders(<CancelDialog payment={detail} open onOpenChange={vi.fn()} />);
    const dialog = screen.getByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel booking" }));
    expect(await screen.findByText("Give a reason for the cancellation.")).toBeInTheDocument();
    expect(booking.status).toBe("PAID");
  });

  it("cancels with a reason and records it in the history", async () => {
    const { booking, payment, detail } = paidUpcoming();
    const onOpenChange = vi.fn();
    renderWithProviders(<CancelDialog payment={detail} open onOpenChange={onOpenChange} />);
    await userEvent.type(screen.getByLabelText(/Reason/), "Student asked to withdraw.");
    await userEvent.click(screen.getByRole("button", { name: "Cancel booking" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(booking).toMatchObject({
      status: "CANCELLED",
      cancelReason: "Student asked to withdraw.",
    });
    expect(payment.timeline.at(-1)).toMatchObject({ type: "CANCELLED" });
  });
});

describe("review findings (D12)", () => {
  it("records the Paymob refund of a cancelled booking (DD-050)", async () => {
    const { booking, payment, detail } = paidUpcoming();
    booking.status = "CANCELLED";
    const onOpenChange = vi.fn();
    renderWithProviders(
      <RefundDialog
        payment={{ ...detail, bookingStatus: "CANCELLED" }}
        open
        onOpenChange={onOpenChange}
      />,
    );
    await userEvent.type(screen.getByLabelText(/Paymob refund transaction ID/), "262000111");
    await userEvent.click(screen.getByRole("button", { name: "Record refund" }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(payment.status).toBe("REFUNDED");
    expect(booking.status).toBe("REFUNDED");
  });

  it("accepts the student into their own session when a seat has freed up (DD-051)", async () => {
    const { booking, payment, detail } = refundRequired();
    const own = db.sessions.find((s) => s.id === booking.sessionId)!;
    own.capacity = soldSeats(own.id) + heldSeats(own.id) + 1;
    const onOpenChange = vi.fn();
    renderWithProviders(<MoveDialog payment={detail} open onOpenChange={onOpenChange} />);
    await userEvent.click(await screen.findByRole("combobox", { name: /Session/ }));
    await userEvent.click(await screen.findByRole("option", { name: /this session/ }));
    await userEvent.click(screen.getByRole("button", { name: "Move student" }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(booking).toMatchObject({ status: "PAID", sessionId: own.id });
    expect(payment.timeline.at(-1)?.note).toContain("accepted");
  });

  it("uses a new Idempotency-Key after a refusal, so the next try isn't replayed", async () => {
    const { booking, detail } = refundRequired();
    const a = addTarget(booking.sessionId, "A");
    addTarget(booking.sessionId, "B");
    const keys: string[] = [];
    server.events.on("request:start", ({ request }) => {
      if (request.url.includes("/move")) keys.push(request.headers.get("Idempotency-Key")!);
    });
    renderWithProviders(<MoveDialog payment={detail} open onOpenChange={vi.fn()} />);
    const choose = async (code: string) => {
      await userEvent.click(await screen.findByRole("combobox", { name: /Session/ }));
      await userEvent.click(await screen.findByRole("option", { name: new RegExp(`^${code} `) }));
    };
    await choose(a.code);
    fill(a.id);
    await userEvent.click(screen.getByRole("button", { name: "Move student" }));
    await screen.findByText("That session just filled up. Choose another one.");
    await choose(`${a.code.slice(0, -2)}-B`);
    await userEvent.click(screen.getByRole("button", { name: "Move student" }));
    await waitFor(() => expect(booking.status).toBe("PAID"));
    expect(keys).toHaveLength(2);
    expect(keys[0]).not.toBe(keys[1]);
    server.events.removeAllListeners();
  });

  it("replays the first answer when the same key is sent twice (mock contract)", async () => {
    const { payment } = refundRequired();
    const send = () =>
      fetch(`${MOCK_API}/payments/${payment.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": "same-key" },
        body: JSON.stringify({ amount: 100, refundTransactionId: "263000222" }),
      });
    const first = await send();
    const second = await send();
    expect(first.status).toBe(200);
    expect(second.status).toBe(200); // Not "can't be refunded any more".
    expect(payment.refundedAmount).toBe(100); // Applied once.
  });

  it("explains a booking that changed meanwhile instead of showing the server text", async () => {
    const { booking, detail } = paidUpcoming();
    const onOpenChange = vi.fn();
    renderWithProviders(<CancelDialog payment={detail} open onOpenChange={onOpenChange} />);
    booking.status = "CANCELLED"; // Another admin was faster.
    await userEvent.type(screen.getByLabelText(/Reason/), "Student withdrew.");
    await userEvent.click(screen.getByRole("button", { name: "Cancel booking" }));
    expect(await screen.findByText("This booking changed in the meantime")).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
