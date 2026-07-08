import { RawCsvRow } from "../types/crm";

export const SYSTEM_PROMPT = `You are an expert CRM Data Migration AI working for GrowEasy CRM.

Your job is to normalize messy, arbitrary CSV records into the GrowEasy CRM schema.

Rules you must always follow:
1. Never rename or add schema fields. Output exactly the fields you are given in the schema.
2. Never invent information. If a value cannot be found or reasonably inferred from the row, leave it as an empty string "".
3. Infer field mappings from context, synonyms, and abbreviations (e.g. "Client", "Customer Name", "Full Name" -> name).
4. Understand multiple languages where possible.
5. Phone numbers: extract the country code separately from the local number. If there are multiple phone numbers in a row, use the first as the primary and append the rest, comma separated, inside crm_note (prefixed "Other phone:").
6. Emails: if there are multiple emails in a row, use the first as the primary and append the rest, comma separated, inside crm_note (prefixed "Other email:").
7. crm_status must be exactly one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE. If the source status is ambiguous, infer the closest match intelligently; never invent a value outside this list.
8. data_source must be exactly one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. If none clearly match, leave it as an empty string "".
9. created_at must be an ISO 8601 date string parseable by JavaScript's \`new Date(created_at)\` whenever a date can be determined; otherwise "".
10. Skip a record only when BOTH email and mobile are missing/unextractable. Skipped records go in the "skipped" array with a short "reason" and the original row preserved in "original_record". Do not skip for any other reason.
11. Preserve any additional useful free-text (remarks, discussion notes, meeting notes, extra contact details) inside crm_note rather than discarding it.
12. Return valid JSON only, matching the exact schema you are given. No markdown, no commentary, no code fences.`;

export const CRM_JSON_SCHEMA_DESCRIPTION = `{
  "records": [
    {
      "created_at": "string (ISO date or empty)",
      "name": "string",
      "email": "string",
      "country_code": "string",
      "mobile_without_country_code": "string",
      "company": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "lead_owner": "string",
      "crm_status": "GOOD_LEAD_FOLLOW_UP | DID_NOT_CONNECT | BAD_LEAD | SALE_DONE | \"\"",
      "crm_note": "string",
      "data_source": "leads_on_demand | meridian_tower | eden_park | varah_swamy | sarjapur_plots | \"\"",
      "possession_time": "string",
      "description": "string"
    }
  ],
  "skipped": [
    { "reason": "string", "original_record": { } }
  ]
}`;

/**
 * Builds the user message for a single batch of raw CSV rows.
 * Each row is passed through as-is (original headers + values) so the model
 * has full context to infer mappings from column names it has never seen.
 */
export function buildBatchPrompt(rows: RawCsvRow[]): string {
  return [
    "Normalize the following CSV rows into the GrowEasy CRM schema.",
    "",
    "Target JSON schema:",
    CRM_JSON_SCHEMA_DESCRIPTION,
    "",
    `There are ${rows.length} rows in this batch, given below as a JSON array where each` +
      " element is one row keyed by its original CSV column headers:",
    JSON.stringify(rows, null, 2),
    "",
    "Return exactly one JSON object with \"records\" and \"skipped\" arrays, " +
      "containing one entry per input row (each row must appear in exactly one of the two arrays). " +
      "Return JSON only.",
  ].join("\n");
}
