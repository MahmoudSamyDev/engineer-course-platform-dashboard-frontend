import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Locale } from "~/domain/types";
import { DEFAULT_LOCALE } from "~/i18n/config";

/** Client-only UI state (SRS DC-02). Server data never lives here — it's in RTK Query. */
type UiState = {
  locale: Locale;
  /** Set when an API call answers 401 mid-session; the app layout redirects to sign-in. */
  sessionEnded: boolean;
};

const initialState: UiState = {
  locale: DEFAULT_LOCALE,
  sessionEnded: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    localeChanged(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
    sessionEnded(state) {
      state.sessionEnded = true;
    },
    sessionRestored(state) {
      state.sessionEnded = false;
    },
  },
  selectors: {
    selectLocale: (state) => state.locale,
    selectSessionEnded: (state) => state.sessionEnded,
  },
});

export const { localeChanged, sessionEnded, sessionRestored } = uiSlice.actions;
export const { selectLocale, selectSessionEnded } = uiSlice.selectors;
