import { http, HttpResponse } from "msw";
import type { AssistantInput, CertificationDto, MessageStatus, MilestoneDto, UpdateInstructorInput } from "~/domain/api";
import { MOCK_API } from "../config";
import { db, mockNow, type MockAssistant } from "../db";
import { apiError, latency } from "../http";
import { itemResponse, matchesQuery } from "./helpers";

const E164_EG_MOBILE = /^\+201[0125]\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toAssistant = (a: MockAssistant) => ({
  ...a,
  checkInsCount: db.checkIns.filter((c) => c.by === a.fullName).length,
});

function validateAssistant(body: AssistantInput, id?: string) {
  const fields: Record<string, string> = {};
  if (!body.fullName?.trim() || body.fullName.trim().length < 3) fields.fullName = "REQUIRED";
  if (!E164_EG_MOBILE.test(body.phoneE164 ?? "")) fields.phoneE164 = "INVALID";
  else if (db.assistants.some((a) => a.phoneE164 === body.phoneE164 && a.id !== id)) fields.phoneE164 = "TAKEN";
  if (body.email && !EMAIL.test(body.email)) fields.email = "INVALID";
  return Object.keys(fields).length ? apiError(422, "VALIDATION_FAILED", "Check the assistant's details.", fields) : null;
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
    return HttpResponse.json({ data: items, meta: { page: 1, pageSize: items.length, total: items.length } });
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
      return apiError(409, "CONFLICT", "This assistant has check-in history. Deactivate instead.", { assistant: "HAS_CHECKINS" });
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
    if (body.contact) {
      const fields: Record<string, string> = {};
      if (!/^\+20\d{9,10}$/.test(body.contact.phoneE164)) fields["contact.phoneE164"] = "INVALID";
      if (!/^\+20\d{9,10}$/.test(body.contact.whatsappE164)) fields["contact.whatsappE164"] = "INVALID";
      if (!EMAIL.test(body.contact.email)) fields["contact.email"] = "INVALID";
      if (Object.keys(fields).length) return apiError(422, "VALIDATION_FAILED", "Check the contact details.", fields);
    }
    Object.assign(db.instructor, body);
    return itemResponse(db.instructor);
  }),

  http.put(`${MOCK_API}/instructor/certifications`, async ({ request }) => {
    await latency();
    db.instructor.certifications = (await request.json()) as CertificationDto[];
    return itemResponse(db.instructor);
  }),

  http.put(`${MOCK_API}/instructor/journey`, async ({ request }) => {
    await latency();
    const journey = (await request.json()) as MilestoneDto[];
    if (journey.some((j) => typeof j.endYear === "number" && j.endYear < j.startYear)) {
      return apiError(422, "VALIDATION_FAILED", "End year can't be before the start year.", { journey: "END_BEFORE_START" });
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
    return HttpResponse.json({ data: items, meta: { page: 1, pageSize: items.length, total: items.length } });
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
    if (!(file instanceof File)) return apiError(422, "VALIDATION_FAILED", "Choose an image.", { file: "REQUIRED" });
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return apiError(422, "VALIDATION_FAILED", "Use a JPG, PNG or WebP image.", { file: "TYPE" });
    if (file.size > 5 * 1024 * 1024) return apiError(422, "VALIDATION_FAILED", "The image is larger than 5 MB.", { file: "SIZE" });
    // The mock keeps the image in this browser tab only.
    return itemResponse({ url: URL.createObjectURL(file), width: 0, height: 0 }, 201);
  }),
];
