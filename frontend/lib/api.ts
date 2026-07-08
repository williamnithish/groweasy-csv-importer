import { ImportResult } from "@/types/crm";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

/** Uploads the raw CSV file to the backend and returns the normalized import result. */
export async function importCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/import`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new ApiError(
      "Could not reach the import server. Check your connection and that the backend is running."
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.error ?? `Import failed with status ${response.status}`, response.status);
  }

  return response.json();
}
