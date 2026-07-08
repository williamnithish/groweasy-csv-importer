import { describe, it, expect } from "vitest";
import { parseAiResponse } from "../src/validators/crmSchema";

describe("parseAiResponse", () => {
  it("parses a well-formed AI response", () => {
    const raw = JSON.stringify({
      records: [
        {
          created_at: "2024-01-01T00:00:00.000Z",
          name: "John Doe",
          email: "john@example.com",
          country_code: "+91",
          mobile_without_country_code: "9876543210",
          company: "",
          city: "",
          state: "",
          country: "",
          lead_owner: "",
          crm_status: "GOOD_LEAD_FOLLOW_UP",
          crm_note: "",
          data_source: "meridian_tower",
          possession_time: "",
          description: "",
        },
      ],
      skipped: [],
    });
    const parsed = parseAiResponse(raw);
    expect(parsed.records).toHaveLength(1);
    expect(parsed.records[0].crm_status).toBe("GOOD_LEAD_FOLLOW_UP");
  });

  it("strips markdown code fences before parsing", () => {
    const raw = "```json\n" + JSON.stringify({ records: [], skipped: [] }) + "\n```";
    const parsed = parseAiResponse(raw);
    expect(parsed.records).toEqual([]);
  });

  it("rejects an invalid crm_status value", () => {
    const raw = JSON.stringify({
      records: [{ crm_status: "NOT_A_REAL_STATUS" }],
      skipped: [],
    });
    expect(() => parseAiResponse(raw)).toThrow();
  });

  it("throws a descriptive error for malformed JSON", () => {
    expect(() => parseAiResponse("{not valid json")).toThrow(/not valid JSON/);
  });
});
