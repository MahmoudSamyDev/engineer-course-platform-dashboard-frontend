import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { IconButton } from "./ui/icon-button";

/** Copies a reference or ID; the icon confirms for 2 s. */
export function CopyButton({ value, label }: { value: string; label?: string }) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);
  return (
    <IconButton
      label={copied ? t("copied") : (label ?? t("copy"))}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard blocked: the value stays visible to copy by hand.
        }
      }}
    >
      {copied ? <Check aria-hidden="true" className="text-success" /> : <Copy aria-hidden="true" />}
    </IconButton>
  );
}
