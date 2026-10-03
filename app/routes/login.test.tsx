import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";
import { MOCK_PASSWORD } from "~/mocks/db";
import { renderWithProviders } from "../../tests/render";
import Login from "./login";

function renderLogin() {
  const Stub = createRoutesStub([
    { path: "/login", Component: Login },
    { path: "/", Component: () => <p>Home page</p> },
  ]);
  return renderWithProviders(<Stub initialEntries={["/login"]} />);
}

describe("Sign in (DSH-AUTH-01/02)", () => {
  it("explains what to fix when fields are empty", async () => {
    renderLogin();
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Enter your email.")).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
  });

  it("shows one generic message for wrong credentials", async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText("Email"), "owner@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Email or password is incorrect.")).toBeInTheDocument();
  });

  it("signs in and goes to Home", async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText("Email"), "owner@example.com");
    await userEvent.type(screen.getByLabelText("Password"), MOCK_PASSWORD);
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(screen.getByText("Home page")).toBeInTheDocument());
  });
});
