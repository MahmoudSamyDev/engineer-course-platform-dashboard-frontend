import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "./api";
import { uiSlice } from "./ui-slice";

const rootReducer = combineSlices(api, uiSlice);

export function makeStore(preloadedState?: Partial<RootState>) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  return store;
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

/**
 * The app's single store. Created at module level so route `clientLoader`s and
 * `clientMiddleware` can prefetch through RTK Query before components render.
 * Safe at build-time pre-render: creating a store touches no browser APIs.
 */
export const store = makeStore();

if (typeof window !== "undefined") {
  // Enables refetchOnFocus / refetchOnReconnect (SRS DSH-GEN-11).
  setupListeners(store.dispatch);
}
