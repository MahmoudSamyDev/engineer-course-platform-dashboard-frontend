import { Avatar as RadixAvatar } from "radix-ui";
import { cn } from "~/lib/cn";
import { initials } from "~/lib/format";

/** Photo, or initials on cyan-wash (DESIGN_SYSTEM §2). Decorative next to a visible name. */
export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "size-8 text-caption", md: "size-10 text-body", lg: "size-16 text-heading" };
  return (
    <RadixAvatar.Root
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-cyan-wash font-semibold text-ink",
        sizes[size],
        className,
      )}
    >
      {src ? <RadixAvatar.Image src={src} alt="" className="size-full object-cover" /> : null}
      <RadixAvatar.Fallback aria-hidden="true">{initials(name)}</RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
