import type { ReactNode } from "react";

/** Full-page frame for the loading fallback, sign-in and top-level errors. */
export function StatusScreen({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
