import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db, mockSession } from "~/mocks/db";
import { renderWithProviders } from "../../../tests/render";
import { AssistantDialog } from "./assistant-dialog";

beforeEach(() => mockSession.set("adm_owner"));

function renderDialog(assistant: Parameters<typeof AssistantDialog>[0]["assistant"] = null) {
  const onClose = vi.fn();
  renderWithProviders(<AssistantDialog assistant={assistant} onClose={onClose} />);
  return { onClose };
}

describe("Assistant dialog (DSH-ASS-02/03, DAC-07)", () => {
  it("explains what to fix before sending anything", async () => {
    renderDialog();
    await userEvent.type(screen.getByLabelText("Mobile number"), "0123");
    await userEvent.click(screen.getByRole("button", { name: "Add assistant" }));
    expect(
      await screen.findByText("Enter the assistant's full name (at least 3 characters)."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter an Egyptian mobile number, e.g. 010 1234 5678."),
    ).toBeInTheDocument();
  });

  it("DAC-07: a phone another assistant uses is a field error", async () => {
    const { onClose } = renderDialog();
    const taken = db.assistants[0]!.phoneE164; // +201001234567
    await userEvent.type(screen.getByLabelText("Full name"), "Samir Fathy");
    await userEvent.type(screen.getByLabelText("Mobile number"), `0${taken.slice(3)}`);
    await userEvent.click(screen.getByRole("button", { name: "Add assistant" }));
    expect(
      await screen.findByText("This phone number is already used by another assistant."),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(db.assistants).toHaveLength(3);
  });

  it("adds an assistant with the phone stored as E.164", async () => {
    const { onClose } = renderDialog();
    await userEvent.type(screen.getByLabelText("Full name"), "Samir Fathy");
    await userEvent.type(screen.getByLabelText("Mobile number"), "0115 123 4567");
    await userEvent.click(screen.getByRole("button", { name: "Add assistant" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(db.assistants.at(-1)).toMatchObject({
      fullName: "Samir Fathy",
      phoneE164: "+201151234567",
      email: null,
      isActive: true,
    });
  });

  it("keeps the check-in count after a rename (DBR-14)", async () => {
    const hany = db.assistants[0]!;
    const before = db.checkIns.filter((c) => c.assistantId === hany.id).length;
    expect(before).toBeGreaterThan(0);
    const { onClose } = renderDialog({ ...hany, checkInsCount: before });
    const name = screen.getByLabelText("Full name");
    await userEvent.clear(name);
    await userEvent.type(name, "Hany Adel Mahmoud");
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(db.assistants[0]!.fullName).toBe("Hany Adel Mahmoud");
    expect(db.checkIns.filter((c) => c.assistantId === hany.id)).toHaveLength(before);
  });
});
