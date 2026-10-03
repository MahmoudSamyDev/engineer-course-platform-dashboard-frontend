import { ToggleGroup } from "radix-ui";
import { useTranslations } from "use-intl";
import type { Locale } from "~/domain/types";
import { useUpdateMyLocaleMutation } from "~/features/auth/api";
import { isLocale, storeLocale } from "~/i18n/config";
import { cn } from "~/lib/cn";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { localeChanged, selectLocale } from "~/store/ui-slice";

/**
 * AR / EN switch (DSH-GEN-02). Applies immediately, remembers the choice in this browser,
 * and — when signed in — saves it as the user's preference.
 */
export function LanguageSwitch({
  signedIn = false,
  className,
}: {
  signedIn?: boolean;
  className?: string;
}) {
  const t = useTranslations("language");
  const locale = useAppSelector(selectLocale);
  const dispatch = useAppDispatch();
  const [saveLocale] = useUpdateMyLocaleMutation();

  function change(next: Locale) {
    dispatch(localeChanged(next));
    storeLocale(next);
    if (signedIn) void saveLocale(next);
  }

  return (
    <ToggleGroup.Root
      type="single"
      value={locale}
      onValueChange={(value) => isLocale(value) && change(value)}
      aria-label={t("label")}
      className={cn("inline-flex rounded-full border border-line-strong bg-sheet p-0.5", className)}
    >
      {(["ar", "en"] as const).map((option) => (
        <ToggleGroup.Item
          key={option}
          value={option}
          lang={option}
          className={cn(
            "h-8 rounded-full px-3 text-caption font-medium text-graphite touch:h-10",
            "transition-colors duration-150 hover:text-ink",
            "data-[state=on]:bg-ink data-[state=on]:text-sheet",
          )}
        >
          {t(option)}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
