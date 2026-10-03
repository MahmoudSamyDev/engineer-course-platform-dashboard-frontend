import { ChevronsUpDown, IdCard, LogOut } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { Link, useNavigate } from "react-router";
import { useTranslations } from "use-intl";
import { Avatar } from "~/components/ui/avatar";
import type { AdminUser } from "~/domain/admin";
import { useLogoutMutation } from "~/features/auth/api";

const itemClasses =
  "flex h-10 cursor-default items-center gap-2.5 rounded-sm px-2.5 text-body text-ink outline-none select-none data-[highlighted]:bg-paper [&_svg]:size-4 [&_svg]:text-graphite";

/** Signed-in user + account actions (DSH-AUTH-06). */
export function UserMenu({ user }: { user: AdminUser }) {
  const t = useTranslations();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  async function signOut() {
    try {
      await logout().unwrap();
    } finally {
      navigate("/login?reason=signed-out", { replace: true });
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={t("nav.account")}
        className="flex w-full items-center gap-3 rounded-sm p-2 text-start transition-colors duration-150 hover:bg-paper data-[state=open]:bg-paper"
      >
        <Avatar name={user.name} size="sm" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body font-medium text-ink">{user.name}</span>
          <span className="truncate text-caption text-graphite">{t(`roles.${user.role}`)}</span>
        </span>
        <ChevronsUpDown aria-hidden="true" className="size-4 text-graphite" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="start"
          sideOffset={6}
          className="z-50 min-w-56 animate-dialog-in rounded-md border border-line bg-sheet p-1 shadow-float"
        >
          <DropdownMenu.Label className="px-2.5 py-1.5 text-caption text-graphite" dir="ltr">
            {user.email}
          </DropdownMenu.Label>
          <DropdownMenu.Item asChild className={itemClasses}>
            <Link to="/profile?tab=account">
              <IdCard aria-hidden="true" />
              {t("nav.profile")}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Item className={itemClasses} onSelect={() => void signOut()}>
            <LogOut aria-hidden="true" className="rtl:-scale-x-100" />
            {t("auth.signOut")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
