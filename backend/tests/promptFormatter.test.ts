import { describe, it, expect } from "vitest";
import { buildBatchPrompt, SYSTEM_PROMPT } from "../src/ai/prompt";

describe("buildBatchPrompt", () => {
  it("includes the row count and the raw row data", () => {
    const rows = [{ "Customer Name": "John", Phone: "9876543210" }];
    const prompt = buildBatchPrompt(rows);
    expect(prompt).toContain("1 rows");
    expect(prompt).toContain("Customer Name");
    expect(prompt).toContain("9876543210");
  });

  it("system prompt forbids inventing fields", () => {
    expect(SYSTEM_PROMPT).toMatch(/never invent/i);
  });
});
