import { describe, it, expect } from "vitest";
import { parseCsvBuffer, EmptyCsvError } from "../src/csv/parser";

describe("parseCsvBuffer", () => {
  it("parses a simple CSV into row objects", async () => {
    const csv = "name,email\nJohn Doe,john@example.com\nJane Doe,jane@example.com\n";
    const rows = await parseCsvBuffer(Buffer.from(csv));
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: "John Doe", email: "john@example.com" });
  });

  it("dedupes duplicate headers instead of dropping columns", async () => {
    const csv = "phone,phone\n1234567890,9876543210\n";
    const rows = await parseCsvBuffer(Buffer.from(csv));
    expect(rows[0]).toHaveProperty("phone");
    expect(rows[0]).toHaveProperty("phone_2");
  });

  it("throws EmptyCsvError for a header-only CSV", async () => {
    const csv = "name,email\n";
    await expect(parseCsvBuffer(Buffer.from(csv))).rejects.toBeInstanceOf(EmptyCsvError);
  });

  it("strips a BOM from the first header", async () => {
    const csv = "\uFEFFname,email\nJohn,john@example.com\n";
    const rows = await parseCsvBuffer(Buffer.from(csv));
    expect(Object.keys(rows[0])).toContain("name");
  });
});
