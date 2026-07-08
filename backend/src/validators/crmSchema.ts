import { z } from "zod";
import { CRM_STATUSES, DATA_SOURCES } from "../types/crm";

const emptyOr = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, z.literal("")]);

export const crmRecordSchema = z.object({
  created_at: z.string().default(""),
  name: z.string().default(""),
  email: z.string().default(""),
  country_code: z.string().default(""),
  mobile_without_country_code: z.string().default(""),
  company: z.string().default(""),
  city: z.string().default(""),
  state: z.string().default(""),
  country: z.string().default(""),
  lead_owner: z.string().default(""),
  crm_status: emptyOr(z.enum(CRM_STATUSES)).default(""),
  crm_note: z.string().default(""),
  data_source: emptyOr(z.enum(DATA_SOURCES)).default(""),
  possession_time: z.string().default(""),
  description: z.string().default(""),
});

export const skippedRecordSchema = z.object({
  reason: z.string().default(""),
  original_record: z.record(z.unknown()).default({}),
});

export const aiResponseSchema = z.object({
  records: z.array(crmRecordSchema).default([]),
  skipped: z.array(skippedRecordSchema).default([]),
});

export type AiResponse = z.infer<typeof aiResponseSchema>;

/**
 * Parses and validates a raw JSON string returned by the model.
 * Throws a descriptive error if the shape doesn't match the expected schema
 * so the caller can retry the batch.
 */
export function parseAiResponse(raw: string): AiResponse {
  let json: unknown;
  try {
    json = JSON.parse(stripCodeFences(raw));
  } catch (err) {
    throw new Error(`AI response was not valid JSON: ${(err as Error).message}`);
  }
  const result = aiResponseSchema.safeParse(json);
  if (!result.success) {
    throw new Error(`AI response failed schema validation: ${result.error.message}`);
  }
  return result.data;
}

function stripCodeFences(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");
}
