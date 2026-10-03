import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { Toast } from "radix-ui";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "use-intl";
import { cn } from "~/lib/cn";

type Tone = "success" | "error" | "info";
type ToastItem = { id: number; title: string; description?: string; tone: Tone };
type ToastFn = (toast: Omit<ToastItem, "id" | "tone"> & { tone?: Tone }) => void;

const ToastContext = createContext<ToastFn>(() => {});

/** Result of a finished action — "Course published", "Refund recorded" (DESIGN_SYSTEM §9). */
export function useToast(): ToastFn {
  return useContext(ToastContext);
}

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info };
const TONES = { success: "text-success", error: "text-danger", info: "text-info" };

/** Toasts in a polite live region, bottom-end on desktop and bottom on phones; 5 s, pausable. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("common");
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback<ToastFn>((toast) => {
    setItems((current) => [...current.slice(-2), { id: Date.now() + Math.random(), tone: "success", ...toast }]);
  }, []);
  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      <Toast.Provider duration={5000} swipeDirection="down">
        {children}
        {items.map((item) => {
          const Icon = ICONS[item.tone];
          return (
            <Toast.Root
              key={item.id}
              type={item.tone === "error" ? "foreground" : "background"}
              onOpenChange={(open) => !open && setItems((current) => current.filter((i) => i.id !== item.id))}
              className="flex items-start gap-3 rounded-md border border-line bg-sheet p-3 shadow-float animate-dialog-in"
            >
              <Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", TONES[item.tone])} />
              <div className="min-w-0 flex-1">
                <Toast.Title className="text-body font-semibold text-ink">{item.title}</Toast.Title>
                {item.description ? <Toast.Description className="mt-0.5 text-caption text-graphite">{item.description}</Toast.Description> : null}
              </div>
              <Toast.Close aria-label={t("close")} className="inline-flex size-8 items-center justify-center rounded-sm text-graphite hover:bg-paper">
                <X aria-hidden="true" className="size-4" />
              </Toast.Close>
            </Toast.Root>
          );
        })}
        <Toast.Viewport className="fixed inset-x-3 bottom-3 z-[60] flex flex-col gap-2 outline-none sm:start-auto sm:end-4 sm:bottom-4 sm:w-96" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
