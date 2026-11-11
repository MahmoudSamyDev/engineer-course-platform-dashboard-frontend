import { http, HttpResponse } from "msw";
import type {
  AssistantInput,
  CertificationDto,
  MessageStatus,
  MilestoneDto,
  UpdateInstructorInput,
} from "~/domain/api";
import { EG_MOBILE_E164, EG_PHONE_E164 } from "~/domain/phone";
import {
  checkYears,
  filledBoth,
  isOptionalHttpsUrl,
  isValidSocialUrl,
} from "~/domain/profile-rules";
import { checkImage, type UploadKind, UPLOAD_RULES } from "~/domain/uploads";
import { MOCK_API } from "../config";
import { db, mockNow, type MockAssistant } from "../db";
import { apiError, latency } from "../http";
import { itemResponse, matchesQuery } from "./helpers";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toAssistant = (a: MockAssistant) => ({
  ...a,
  checkInsCount: db.checkIns.filter((c) => c.assistantId === a.id).length,
});

function validateAssistant(body: AssistantInput, id?: string) {
  const fields: Record<string, string> = {};
  if (!body.fullName?.trim() || body.fullName.trim().length < 3) fields.fullName = "REQUIRED";
  if (!EG_MOBILE_E164.test(body.phoneE164 ?? "")) fields.phoneE164 = "INVALID";
  else if (db.assistants.some((a) => a.phoneE164 === body.phoneE164 && a.id !== id))
    fields.phoneE164 = "TAKEN";
  if (body.email && !EMAIL.test(body.email)) fields.email = "INVALID";
  return Object.keys(fields).length
    ? apiError(422, "VALIDATION_FAILED", "Check the assistant's details.", fields)
    : null;
}

/** Section PATCH validation (DSH-PRO-02…05): required bilingual fields, contact, links, stats. */
function validateInstructor(body: UpdateInstructorInput) {
  const fields: Record<string, string> = {};
  for (const key of [
    "name",
    "shortName",
    "title",
    "specialization",
    "photoAlt",
    "positioningStatement",
    "valueProposition",
    "bioShort",
  ] as const) {
    if (key in body && !filledBoth(body[key])) fields[key] = "REQUIRED";
  }
  if (body.contact) {
    if (!EG_PHONE_E164.test(body.contact.phoneE164)) fields["contact.phoneE164"] = "INVALID";
    if (!EG_MOBILE_E164.test(body.contact.whatsappE164)) fields["contact.whatsappE164"] = "INVALID";
    if (!EMAIL.test(body.contact.email)) fields["contact.email"] = "INVALID";
  }
  for (const link of body.social ?? []) {
    if (!isValidSocialUrl(link.platform, link.url)) fields[`social.${link.platform}`] = "INVALID";
  }
  if (body.stats?.some((stat) => !stat.value.trim() || !filledBoth(stat.label)))
    fields.stats = "REQUIRED";
  return Object.keys(fields).length
    ? apiError(422, "VALIDATION_FAILED", "Check the profile details.", fields)
    : null;
}

/** SRS §7.2 — assistants (DSH-ASS), instructor profile (DSH-PRO), messages (DSH-MSG), uploads. */
export const peopleHandlers = [
  http.get(`${MOCK_API}/assistants`, async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    const active = url.searchParams.get("active");
    const items = db.assistants
      .filter((a) => (active === "true" ? a.isActive : active === "false" ? !a.isActive : true))
      .filter((a) => matchesQuery(url.searchParams.get("q"), a.fullName, a.phoneE164))
      .map(toAssistant);
    return HttpResponse.json({
      data: items,
      meta: { page: 1, pageSize: items.length, total: items.length },
    });
  }),

  http.post(`${MOCK_API}/assistants`, async ({ request }) => {
    await latency();
    const body = (await request.json()) as AssistantInput;
    const invalid = validateAssistant(body);
    if (invalid) return invalid;
    const assistant: MockAssistant = {
      id: `ast_${Date.now().toString(36)}`,
      fullName: body.fullName.trim(),
      phoneE164: body.phoneE164,
      email: body.email?.trim() || null,
      photoUrl: body.photoUrl ?? null,
      notes: body.notes?.trim() || null,
      isActive: true,
      appAccess: "NONE",
      createdAt: mockNow().toISOString(),
    };
    db.assistants.push(assistant);
    return itemResponse(toAssistant(assistant), 201);
  }),

  http.patch(`${MOCK_API}/assistants/:id`, async ({ params, request }) => {
    await latency();
    const assistant = db.assistants.find((a) => a.id === params.id);
    if (!assistant) return apiError(404, "NOT_FOUND", "Assistant not found.");
    const body = (await request.json()) as Partial<AssistantInput> & { isActive?: boolean };
    if (body.fullName !== undefined || body.phoneE164 !== undefined || body.email !== undefined) {
      const invalid = validateAssistant({ ...assistant, ...body } as AssistantInput, assistant.id);
      if (invalid) return invalid;
    }
    if (body.fullName !== undefined) assistant.fullName = body.fullName.trim();
    if (body.phoneE164 !== undefined) assistant.phoneE164 = body.phoneE164;
    if (body.email !== undefined) assistant.email = body.email?.trim() || null;
    if (body.photoUrl !== undefined) assistant.photoUrl = body.photoUrl;
    if (body.notes !== undefined) assistant.notes = body.notes?.trim() || null;
    if (body.isActive !== undefined) assistant.isActive = body.isActive;
    return itemResponse(toAssistant(assistant));
  }),

  http.delete(`${MOCK_API}/assistants/:id`, async ({ params }) => {
    await latency();
    const assistant = db.assistants.find((a) => a.id === params.id);
    if (!assistant) return apiError(404, "NOT_FOUND", "Assistant not found.");
    if (toAssistant(assistant).checkInsCount > 0) {
      return apiError(409, "CONFLICT", "This assistant has check-in history. Deactivate instead.", {
        assistant: "HAS_CHECKINS",
      });
    }
    db.assistants = db.assistants.filter((a) => a.id !== assistant.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${MOCK_API}/instructor`, async () => {
    await latency();
    return itemResponse(db.instructor);
  }),

  http.patch(`${MOCK_API}/instructor`, async ({ request }) => {
    await latency();
    const body = (await request.json()) as UpdateInstructorInput;
    const invalid = validateInstructor(body);
    if (invalid) return invalid;
    Object.assign(db.instructor, body);
    return itemResponse(db.instructor);
  }),

  http.put(`${MOCK_API}/instructor/certifications`, async ({ request }) => {
    await latency();
    const certifications = (await request.json()) as CertificationDto[];
    const year = mockNow().getFullYear();
    const bad = certifications.findIndex(
      (c) =>
        !filledBoth(c.name) ||
        !filledBoth(c.issuer) ||
        checkYears(c.year, undefined, year) !== null ||
        !isOptionalHttpsUrl(c.credentialUrl),
    );
    if (bad >= 0) {
      return apiError(422, "VALIDATION_FAILED", "Check the certification details.", {
        certifications: "INVALID",
        index: String(bad),
      });
    }
    db.instructor.certifications = certifications.map((c) => ({
      ...c,
      credentialUrl: c.credentialUrl?.trim() || null,
      imageUrl: c.imageUrl ?? null,
    }));
    return itemResponse(db.instructor);
  }),

  http.put(`${MOCK_API}/instructor/journey`, async ({ request }) => {
    await latency();
    const journey = (await request.json()) as MilestoneDto[];
    const year = mockNow().getFullYear();
    const bad = journey.findIndex(
      (j) =>
        !filledBoth(j.title) ||
        !filledBoth(j.organization) ||
        checkYears(j.startYear, j.endYear, year) !== null,
    );
    if (bad >= 0) {
      const problem = checkYears(journey[bad]!.startYear, journey[bad]!.endYear, year);
      return apiError(422, "VALIDATION_FAILED", "Check the milestone years and titles.", {
        journey: problem === "endBeforeStart" ? "END_BEFORE_START" : "INVALID",
        index: String(bad),
      });
    }
    db.instructor.journey = journey;
    return itemResponse(db.instructor);
  }),

  http.get(`${MOCK_API}/messages`, async ({ request }) => {
    await latency();
    const status = new URL(request.url).searchParams.get("status");
    const items = db.messages
      .filter((m) => (status === "ARCHIVED" ? m.status === "ARCHIVED" : m.status !== "ARCHIVED"))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return HttpResponse.json({
      data: items,
      meta: { page: 1, pageSize: items.length, total: items.length },
    });
  }),

  http.patch(`${MOCK_API}/messages/:id`, async ({ params, request }) => {
    await latency();
    const message = db.messages.find((m) => m.id === params.id);
    if (!message) return apiError(404, "NOT_FOUND", "Message not found.");
    const { status } = (await request.json()) as { status: MessageStatus };
    message.status = status;
    return itemResponse(message);
  }),

  http.post(`${MOCK_API}/uploads`, async ({ request }) => {
    await latency();
    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind") as UploadKind;
    if (!(kind in UPLOAD_RULES))
      return apiError(422, "VALIDATION_FAILED", "Unknown upload kind.", { kind: "INVALID" });
    if (!(file instanceof File))
      return apiError(422, "VALIDATION_FAILED", "Choose an image.", { file: "REQUIRED" });
    const problem = checkImage(kind, file);
    if (problem === "type")
      return apiError(422, "VALIDATION_FAILED", "Use a JPG, PNG or WebP image.", { file: "TYPE" });
    if (problem === "size")
      return apiError(422, "VALIDATION_FAILED", "The image is too large.", { file: "SIZE" });
    // The mock keeps the image in this browser tab only (a blob: URL).
    return itemResponse({ url: URL.createObjectURL(file), width: 0, height: 0 }, 201);
  }),
];
