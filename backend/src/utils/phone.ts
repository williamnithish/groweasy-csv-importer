/**
 * Splits a raw phone string into { countryCode, number } when a leading
 * "+<digits>" country code is present. Falls back to an empty country code
 * when none is detectable. This is a best-effort heuristic used only as a
 * fallback; the AI extraction step is the primary source of truth.
 */
export function splitCountryCode(raw: string): { countryCode: string; number: string } {
  const trimmed = raw.trim();
  const match = trimmed.match(/^\+(\d{1,3})[\s-]?(\d{6,})$/);
  if (match) {
    return { countryCode: `+${match[1]}`, number: match[2] };
  }
  return { countryCode: "", number: trimmed.replace(/[^\d]/g, "") };
}

/** Extracts all plausible phone-like tokens from a free-text field. */
export function extractAllPhones(raw: string): string[] {
  if (!raw) return [];
  const matches = raw.match(/\+?\d[\d\s-]{6,}\d/g) ?? [];
  return matches.map((m) => m.trim());
}

/** Extracts all plausible email addresses from a free-text field. */
export function extractAllEmails(raw: string): string[] {
  if (!raw) return [];
  const matches = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ?? [];
  return matches.map((m) => m.trim());
}
