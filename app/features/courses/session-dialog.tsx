import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { useDiscardGuard } from "~/components/use-discard-guard";
import { BilingualField } from "~/components/ui/bilingual-field";
import { AmountInput } from "~/components/ui/amount-input";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { Field } from "~/components/ui/field";
import { IconButton } from "~/components/ui/icon-button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { SwitchField } from "~/components/ui/switch";
import { useToast } from "~/components/ui/toast";
import type { CourseDetail, SessionRow } from "~/domain/api";
import { egpToPiasters, piastersToEgp } from "~/domain/money";
import { checkMeetings, minimumCapacity } from "~/domain/session-rules";
import { appNow } from "~/lib/clock";
import { emptyText } from "~/lib/localized";
import { utcIsoToZonedLocal, zonedLocalToUtcIso } from "~/lib/time";
import { useDraft } from "~/lib/use-draft";
import { getApiError } from "~/store/api";
import { useCreateSessionMutation, useGetLocationsQuery, useUpdateSessionMutation } from "./api";
import {
  addLocalDays,
  defaultCloseLocal,
  meetingsToRows,
  repeatWeekly,
  rowsToMeetings,
  type MeetingRow,
} from "./meeting-rows";

const DEFAULT_ROW: MeetingRow = { date: "", from: "10:00", to: "14:00" };

function initialDraft(course: CourseDetail, session: SessionRow | undefined) {
  if (session) {
    return {
      locationId: session.location.id,
      label: session.label,
      capacity: session.capacity,
      price: piastersToEgp(session.price),
      rows: meetingsToRows(session.meetings),
      // Keep the session's own close time; the 24 h default only fills a new session.
      closesAt: utcIsoToZonedLocal(session.registrationClosesAt),
      isPublished: session.isPublished,
    };
  }
  return {
    locationId: "",
    label: emptyText(),
    capacity: 25,
    price: piastersToEgp(course.basePrice),
    rows: [{ ...DEFAULT_ROW }],
    closesAt: "",
    isPublished: true,
  };
}

/**
 * Add or edit a session with its meetings (DSH-SES-02…04). Times are entered in Cairo
 * wall-clock time and sent as UTC. On edit, capacity can't drop below sold + held seats
 * (DBR-05) and changes to meetings are confirmed because students already booked.
 */
export function SessionDialog({
  course,
  session,
  open,
  onOpenChange,
}: {
  course: CourseDetail;
  session?: SessionRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("session.form");
  const tc = useTranslations("common");
  const toast = useToast();
  const { data: locations } = useGetLocationsQuery(undefined, { skip: !open });
  const [create, createState] = useCreateSessionMutation();
  const [update, updateState] = useUpdateSessionMutation();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [repeatCount, setRepeatCount] = useState(course.meetingsCount || 4);

  const { draft, patch, dirty, reset } = useDraft(initialDraft(course, session));
  const close = () => {
    reset();
    setError(null);
    setFieldErrors({});
    onOpenChange(false);
  };
  const { requestClose, guard } = useDiscardGuard(dirty, close);

  const minCapacity = session ? minimumCapacity(session.sold, session.held) : 1;
  const closesAt = draft.closesAt || defaultCloseLocal(draft.rows);
  const saving = createState.isLoading || updateState.isLoading;

  const setRow = (index: number, changes: Partial<MeetingRow>) =>
    patch({ rows: draft.rows.map((row, i) => (i === index ? { ...row, ...changes } : row)) });

  function validate(): string | null {
    const errors: Record<string, string> = {};
    if (!draft.locationId) errors.locationId = t("errors.location");
    if (!(draft.capacity >= minCapacity))
      errors.capacity = t("errors.capacity", { min: minCapacity });
    if (!(draft.price > 0)) errors.price = t("errors.price");
    const meetings = rowsToMeetings(draft.rows);
    if (meetings.length === 0) errors.meetings = t("errors.noMeetings");
    setFieldErrors(errors);
    if (Object.keys(errors).length) return null;

    const problem = checkMeetings(meetings, appNow(), !session);
    if (problem.kind !== "none") {
      return t(`errors.${problem.kind}`, { number: "index" in problem ? problem.index + 1 : 1 });
    }
    const first = meetings.map((m) => m.startsAt).sort()[0]!;
    if (closesAt && Date.parse(zonedLocalToUtcIso(closesAt)) >= Date.parse(first))
      return t("errors.closesAfterFirst");
    return "";
  }

  async function save() {
    const problem = validate();
    if (problem === null) return;
    if (problem) return setError(problem);
    setError(null);

    const body = {
      locationId: draft.locationId,
      label: draft.label,
      capacity: draft.capacity,
      price: egpToPiasters(draft.price),
      meetings: rowsToMeetings(draft.rows),
      registrationClosesAt: zonedLocalToUtcIso(closesAt),
      isPublished: draft.isPublished,
    };
    try {
      if (session) {
        await update({ id: session.id, courseId: course.id, ...body }).unwrap();
        toast({ title: t("updated"), description: session.code });
      } else {
        const created = await create({ courseId: course.id, ...body }).unwrap();
        toast({ title: t("created"), description: created.code });
      }
      close();
    } catch (e) {
      const apiError = getApiError(e);
      if (apiError?.fields?.capacity === "CAPACITY_BELOW_SOLD") {
        setFieldErrors({
          capacity: t("errors.capacity", { min: Number(apiError.fields.minimum ?? minCapacity) }),
        });
      } else {
        setError(apiError?.message ?? tc("saveFailed"));
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      onRequestClose={requestClose}
      title={session ? t("editTitle", { code: session.code }) : t("addTitle")}
      description={session ? undefined : t("addDescription", { course: course.code })}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={() => requestClose() && close()}>
            {tc("cancel")}
          </Button>
          <Button variant="primary" onClick={save} loading={saving}>
            {session ? tc("save") : t("submit")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {session?.hasBookings ? (
          <p className="rounded-sm bg-warning-wash px-3 py-2 text-body text-warning">
            {t("hasBookingsWarning")}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("location")} error={fieldErrors.locationId} required>
            {(control) => (
              <Select
                {...control}
                value={draft.locationId || undefined}
                onValueChange={(value) => patch({ locationId: value ?? "" })}
                options={(locations ?? []).map((l) => ({ value: l.id, label: l.shortName.en }))}
                placeholder={t("locationPlaceholder")}
              />
            )}
          </Field>
          <Field
            label={t("capacity")}
            hint={session ? t("capacityHint", { min: minCapacity }) : undefined}
            error={fieldErrors.capacity}
            required
          >
            {(control) => (
              <Input
                {...control}
                type="number"
                inputMode="numeric"
                min={minCapacity}
                max={500}
                dir="ltr"
                value={Number.isNaN(draft.capacity) ? "" : draft.capacity}
                onChange={(event) => patch({ capacity: event.target.valueAsNumber })}
              />
            )}
          </Field>
          <Field label={t("price")} hint={t("priceHint")} error={fieldErrors.price} required>
            {(control) => (
              <AmountInput
                {...control}
                suffix={t("currency")}
                min={1}
                value={Number.isNaN(draft.price) ? "" : draft.price}
                onChange={(event) => patch({ price: event.target.valueAsNumber })}
              />
            )}
          </Field>
          <Field label={t("closesAt")} hint={t("closesAtHint")}>
            {(control) => (
              <Input
                {...control}
                type="datetime-local"
                dir="ltr"
                value={closesAt}
                onChange={(event) => patch({ closesAt: event.target.value })}
              />
            )}
          </Field>
        </div>

        <BilingualField
          label={t("label")}
          hint={t("labelHint")}
          value={draft.label}
          onChange={(label) => patch({ label })}
          maxLength={60}
        />

        <fieldset className="flex flex-col gap-3 border-t border-line pt-5">
          <legend className="text-label font-medium text-ink">{t("meetings")}</legend>
          <p className="text-caption text-graphite">{t("meetingsHint")}</p>

          <ol className="flex flex-col gap-2">
            {draft.rows.map((row, index) => (
              <li
                key={index}
                className="grid grid-cols-[auto_1fr_auto] items-end gap-2 sm:grid-cols-[1.5rem_minmax(9rem,1fr)_8.5rem_8.5rem_auto]"
              >
                <span className="tabular pb-2.5 text-caption text-graphite">{index + 1}</span>
                <Field
                  label={<span className="sr-only">{t("date", { number: index + 1 })}</span>}
                  className="col-span-2 sm:col-span-1"
                >
                  {(control) => (
                    <Input
                      {...control}
                      type="date"
                      dir="ltr"
                      value={row.date}
                      onChange={(event) => setRow(index, { date: event.target.value })}
                    />
                  )}
                </Field>
                <Field label={<span className="sr-only">{t("from", { number: index + 1 })}</span>}>
                  {(control) => (
                    <Input
                      {...control}
                      type="time"
                      dir="ltr"
                      value={row.from}
                      onChange={(event) => setRow(index, { from: event.target.value })}
                    />
                  )}
                </Field>
                <Field label={<span className="sr-only">{t("to", { number: index + 1 })}</span>}>
                  {(control) => (
                    <Input
                      {...control}
                      type="time"
                      dir="ltr"
                      value={row.to}
                      onChange={(event) => setRow(index, { to: event.target.value })}
                    />
                  )}
                </Field>
                <IconButton
                  label={t("removeMeeting", { number: index + 1 })}
                  disabled={draft.rows.length === 1}
                  onClick={() => patch({ rows: draft.rows.filter((_, i) => i !== index) })}
                  className="mb-0.5 hover:text-danger"
                >
                  <Trash2 aria-hidden="true" />
                </IconButton>
              </li>
            ))}
          </ol>
          {fieldErrors.meetings ? (
            <p role="alert" className="text-caption font-medium text-danger">
              {fieldErrors.meetings}
            </p>
          ) : null}

          <div className="flex flex-wrap items-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const last = draft.rows[draft.rows.length - 1];
                patch({
                  rows: [
                    ...draft.rows,
                    last?.date ? { ...last, date: addLocalDays(last.date, 7) } : { ...DEFAULT_ROW },
                  ],
                });
              }}
            >
              <Plus aria-hidden="true" />
              {t("addMeeting")}
            </Button>
            <div className="flex items-end gap-2">
              <Field
                label={<span className="text-caption">{t("repeatCount")}</span>}
                className="w-24"
              >
                {(control) => (
                  <Input
                    {...control}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={60}
                    dir="ltr"
                    value={repeatCount}
                    onChange={(event) => setRepeatCount(event.target.valueAsNumber)}
                  />
                )}
              </Field>
              <Button
                variant="secondary"
                size="sm"
                disabled={!draft.rows[0]?.date || !(repeatCount > 0)}
                onClick={() => patch({ rows: repeatWeekly(draft.rows[0]!, repeatCount) })}
              >
                {t("repeatWeekly")}
              </Button>
            </div>
          </div>
        </fieldset>

        <div className="border-t border-line">
          <SwitchField
            label={t("published")}
            hint={t("publishedHint")}
            checked={draft.isPublished}
            onCheckedChange={(isPublished) => patch({ isPublished })}
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-sm bg-danger-wash px-3 py-2 text-body font-medium text-danger"
          >
            {error}
          </p>
        ) : null}
      </div>
      {guard}
    </Dialog>
  );
}
