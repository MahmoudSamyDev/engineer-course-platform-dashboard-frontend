import { Mail, MessageCircle } from "lucide-react";
import { Link, useLocation, useParams } from "react-router";
import { useLocale, useTranslations } from "use-intl";
import { CopyButton } from "~/components/copy-button";
import { DateTime, Ltr, Money, Phone, whatsappUrl } from "~/components/format";
import { PageHeader } from "~/components/layout/page-header";
import { AttendanceLabel, BookingBadge, PaymentBadge, TicketBadge } from "~/components/status";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { ErrorState } from "~/components/ui/error-state";
import { Panel } from "~/components/ui/panel";
import { Skeleton } from "~/components/ui/skeleton";
import { TitleBlock, TitleCell } from "~/components/ui/title-block";
import type { Locale } from "~/domain/types";
import { studentsApi, useGetStudentQuery } from "~/features/students/api";
import { AttendanceStrip } from "~/features/students/attendance-strip";
import { store } from "~/store/store";
import type { Route } from "./+types/student";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  store.dispatch(studentsApi.endpoints.getStudent.initiate(params.studentId, { subscribe: false }));
  return null;
}

/** Student details (DSH-STU-05): contact, registrations with tickets and attendance, payments. */
export default function Student() {
  const { studentId = "" } = useParams();
  const t = useTranslations("student");
  const tp = useTranslations("pages");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const location = useLocation();
  const backTo = (location.state as { from?: string } | null)?.from ?? "/students";
  const { data, error, isLoading, refetch } = useGetStudentQuery(studentId);
  const back = { to: backTo, label: tp("students.title") };

  if (isLoading) {
    return (
      <div aria-hidden="true" className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (error && "status" in error && error.status === 404) {
    return (
      <>
        <PageHeader title={tp("student.title")} back={back} />
        <EmptyState title={t("notFound")} action={<Button asChild variant="secondary"><Link to="/students">{tp("students.title")}</Link></Button>} />
      </>
    );
  }
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;

  const paid = data.payments.filter((p) => p.status === "SUCCEEDED" || p.status === "REFUNDED").reduce((sum, p) => sum + p.amount - p.refundedAmount, 0);

  return (
    <>
      <PageHeader
        title={data.fullName}
        description={data.department[locale]}
        back={back}
        actions={
          <>
            <Button asChild variant="secondary">
              <a href={whatsappUrl(data.phoneE164)} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden="true" />
                {tc("whatsapp")}
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href={`mailto:${data.email}`}>
                <Mail aria-hidden="true" />
                {tc("email")}
              </a>
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-6">
        <TitleBlock>
          <TitleCell size="fact" label={t("phone")} value={<Phone e164={data.phoneE164} />} />
          <TitleCell size="fact" label={t("email")} value={<Ltr className="break-all">{data.email}</Ltr>} />
          <TitleCell size="fact" label={t("registrations")} value={data.registrations.length} />
          <TitleCell size="fact" label={t("netPaid")} value={<Money amount={paid} />} note={<>{t("firstRegistered")} <DateTime iso={data.createdAt} withTime={false} /></>} />
        </TitleBlock>

        <section aria-labelledby="registrations-title" className="flex flex-col gap-3">
          <h2 id="registrations-title" className="font-display text-heading font-semibold">{t("registrationsTitle")}</h2>
          {data.registrations.length === 0 ? (
            <EmptyState title={t("noRegistrations")} />
          ) : (
            data.registrations.map((r) => (
              <article key={r.bookingId} className="rounded-sm border border-line bg-sheet">
                <header className="flex flex-col gap-2 border-b border-line p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-subheading font-semibold">
                      <Link to={`/courses/${r.course.id}/sessions/${r.session.id}`} className="hover:text-cyan hover:underline">
                        {r.course.title[locale]}
                      </Link>
                    </h3>
                    <p className="text-caption text-graphite">
                      <Ltr>{r.session.code}</Ltr> · {r.session.label[locale]} · {r.location[locale]}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <BookingBadge status={r.status} />
                    {r.ticketStatus ? <TicketBadge status={r.ticketStatus} /> : null}
                    <AttendanceLabel attendance={r.attendance} />
                  </div>
                </header>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 pt-3 text-body sm:grid-cols-4">
                  <div>
                    <dt className="text-caption text-graphite">{t("reference")}</dt>
                    <dd className="flex items-center gap-1">
                      <Ltr className="tabular font-medium">{r.reference}</Ltr>
                      <CopyButton value={r.reference} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-caption text-graphite">{t("registeredAt")}</dt>
                    <dd><DateTime iso={r.registeredAt} /></dd>
                  </div>
                  <div>
                    <dt className="text-caption text-graphite">{t("amount")}</dt>
                    <dd><Money amount={r.amount} /></dd>
                  </div>
                </dl>
                <div className="p-4">
                  <h4 className="mb-2 text-label font-medium text-graphite">{t("attendance")}</h4>
                  <AttendanceStrip meetings={r.meetings} />
                </div>
              </article>
            ))
          )}
        </section>

        <Panel id="payments" title={t("paymentsTitle")}>
          {data.payments.length === 0 ? (
            <p className="px-4 py-6 text-body text-graphite">{t("noPayments")}</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.payments.map((p) => (
                <li key={p.id}>
                  <Link to={`/payments?payment=${p.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-paper">
                    <span className="flex flex-col">
                      <span className="text-body font-medium"><Ltr>{p.reference}</Ltr> · <Ltr>{p.course.code}</Ltr></span>
                      <span className="text-caption text-graphite"><DateTime iso={p.createdAt} /></span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-semibold"><Money amount={p.amount} /></span>
                      <PaymentBadge status={p.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <p className="text-caption text-graphite">
          {t("consent")} <DateTime iso={data.consentAt} />
        </p>
      </div>
    </>
  );
}
