import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { Provider } from "react-redux";
import type { Locale } from "~/domain/types";
import { AppProviders } from "~/providers/app-providers";
import { makeStore } from "~/store/store";

/** Renders UI with a fresh store and the app's providers (i18n, direction, tooltips). */
export function renderWithProviders(ui: ReactElement, { locale = "en" as Locale } = {}) {
  const store = makeStore();
  return {
    store,
    ...render(
      <Provider store={store}>
        <AppProviders locale={locale}>{ui}</AppProviders>
      </Provider>,
    ),
  };
}
