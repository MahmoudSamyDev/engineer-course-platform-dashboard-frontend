import { useTranslations } from "use-intl";
import type {
  Attendance,
  CoursePublicationState,
  MessageStatus,
  PaymentStatus,
} from "~/domain/api";
import {
  ATTENDANCE_TONE,
  BOOKING_TONE,
  COURSE_TONE,
  MESSAGE_TONE,
  PAYMENT_TONE,
  PUBLICATION_TONE,
  SESSION_TONE,
  TICKET_TONE,
} from "~/domain/status-tone";
import type { BookingStatus, CourseStatus, SessionStatus, TicketStatus } from "~/domain/types";
import { Badge } from "./ui/badge";

/** Status badges: one tone map (domain/status-tone) + one label set (messages `status.*`). */
export function BookingBadge({ status }: { status: BookingStatus }) {
  const t = useTranslations("status.booking");
  return <Badge tone={BOOKING_TONE[status]}>{t(status)}</Badge>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const t = useTranslations("status.payment");
  return <Badge tone={PAYMENT_TONE[status]}>{t(status)}</Badge>;
}

export function SessionBadge({ status }: { status: SessionStatus }) {
  const t = useTranslations("status.session");
  return <Badge tone={SESSION_TONE[status]}>{t(status)}</Badge>;
}

export function CourseStatusBadge({ status }: { status: CourseStatus }) {
  const t = useTranslations("status.course");
  return <Badge tone={COURSE_TONE[status]}>{t(status)}</Badge>;
}

export function PublicationBadge({ state }: { state: CoursePublicationState }) {
  const t = useTranslations("status.publication");
  return <Badge tone={PUBLICATION_TONE[state]}>{t(state)}</Badge>;
}

export function TicketBadge({ status }: { status: TicketStatus }) {
  const t = useTranslations("status.ticket");
  return <Badge tone={TICKET_TONE[status]}>{t(status)}</Badge>;
}

export function MessageBadge({ status }: { status: MessageStatus }) {
  const t = useTranslations("status.message");
  return <Badge tone={MESSAGE_TONE[status]}>{t(status)}</Badge>;
}

/** "Attended 2 of 4" — in words, never a colored dot alone (DSH-ATT-02). */
export function AttendanceLabel({ attendance }: { attendance: Attendance }) {
  const t = useTranslations("status.attendance");
  if (attendance.status === "NONE") return <span className="text-caption text-graphite">—</span>;
  return (
    <Badge tone={ATTENDANCE_TONE[attendance.status]}>
      {t(attendance.status, { attended: attendance.attended, total: attendance.total })}
    </Badge>
  );
}
