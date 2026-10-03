import {
  BookOpenText,
  House,
  IdCard,
  Inbox,
  ReceiptText,
  ScanLine,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type NavKey =
  "home" | "students" | "payments" | "courses" | "assistants" | "messages" | "profile";

/** Main routes in navigation order (SRS DSH-NAV-01). */
export const NAV_ITEMS: ReadonlyArray<{ key: NavKey; to: string; icon: LucideIcon }> = [
  { key: "home", to: "/", icon: House },
  { key: "students", to: "/students", icon: UsersRound },
  { key: "payments", to: "/payments", icon: ReceiptText },
  { key: "courses", to: "/courses", icon: BookOpenText },
  { key: "assistants", to: "/assistants", icon: ScanLine },
  { key: "messages", to: "/messages", icon: Inbox },
  { key: "profile", to: "/profile", icon: IdCard },
];
