# GrowEasy AI CSV Importer

An AI-powered CSV importer that turns **any** lead spreadsheet — Facebook exports,
Google Ads reports, real-estate CRMs, agency sheets, manual spreadsheets — into the
standard GrowEasy CRM schema. The hard part isn't parsing the CSV; it's understanding
what each column *means* regardless of how it's labeled, which is why the mapping step
is delegated to an LLM rather than a fixed column-name lookup.

---

## How it works

1. **Upload** — the user drops a CSV. The frontend parses it with PapaParse purely for
   preview; nothing is sent to the server yet.
2. **Preview** — a searchable, paginated table shows exactly what's in the file.
3. **Confirm import** — only on explicit confirmation is the raw file uploaded to the
   backend.
4. **AI mapping** — the backend streams the CSV, splits rows into batches of 20, and
   sends each batch to the OpenAI API with a strict system prompt and a Zod-validated
   JSON schema. Batches run with bounded concurrency and automatic retries.
5. **Results** — the backend merges every batch into one `{ imported, skipped }`
   payload; the frontend shows summary stats and full result tables, with CSV export.

```
 CSV file          Frontend                     Backend                      OpenAI
┌─────────┐   1   ┌──────────┐   3 (confirm)  ┌───────────┐   4 (batches)  ┌────────┐
│ any.csv │ ────> │ Preview  │ ─────────────> │  Parse +  │ ─────────────> │  LLM   │
└─────────┘  2    │  table   │                │  Batch    │ <───────────── │ mapping│
                   └──────────┘  <──────────── │  Merge    │  5 (JSON)      └────────┘
                        5 (result)             └───────────┘
```

---

## Tech stack

**Frontend** — Next.js 15 (App Router), TypeScript, Tailwind CSS, hand-built shadcn-style
primitives, React Hook Form, PapaParse, TanStack Table, React Dropzone.

**Backend** — Node.js, Express, TypeScript, Multer, `csv-parser` (streaming), the OpenAI
SDK, Zod, `p-limit` for concurrency, `p-retry` for retries, `dotenv`.

---

## Folder structure

```
groweasy-csv-importer/
├── backend/
│   ├── src/
│   │   ├── ai/            # OpenAI client, prompt building, batch extraction + retries
│   │   ├── config/         # Environment configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── csv/            # Streaming CSV parser
│   │   ├── middleware/      # Upload, error handling, request logging
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Import pipeline orchestration
│   │   ├── types/           # Shared CRM types
│   │   ├── utils/           # Batching, logging, phone parsing helpers
│   │   ├── validators/      # Zod schemas for AI responses
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/                # Vitest unit tests
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── app/                  # Next.js App Router pages, layout, globals.css
│   ├── components/
│   │   ├── ui/                # Button, Card, Input, Progress, Badge, Toast, DataTable
│   │   ├── UploadZone.tsx
│   │   ├── CSVPreviewTable.tsx
│   │   ├── ImportButton.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── CRMResultTable.tsx
│   │   ├── ErrorBanner.tsx
│   │   └── LoadingOverlay.tsx
│   ├── lib/                   # cn(), CSV parsing, API client
│   ├── types/                 # Shared CRM types (mirrors backend)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## CRM schema

Every extracted record contains exactly these fields (never renamed, never extended):

```
created_at, name, email, country_code, mobile_without_country_code, company,
city, state, country, lead_owner, crm_status, crm_note, data_source,
possession_time, description
```

`crm_status` is restricted to `GOOD_LEAD_FOLLOW_UP | DID_NOT_CONNECT | BAD_LEAD | SALE_DONE`.
`data_source` is restricted to `leads_on_demand | meridian_tower | eden_park |
varah_swamy | sarjapur_plots`, or left blank. A row is skipped only when **both**
email and mobile are missing — everything else is imported with best-effort field
inference, and unknown fields are left as empty strings rather than invented.

---

## Installation

### Prerequisites
- Node.js 18+
- An OpenAI API key

### Backend

```bash
cd backend
cp .env.example .env   # fill in OPENAI_API_KEY
npm install
npm run dev             # http://localhost:8080
```

### Frontend

```bash
cd frontend
cp .env.example .env    # point NEXT_PUBLIC_API_URL at your backend
npm install
npm run dev              # http://localhost:3000
```

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Server port |
| `NODE_ENV` | `development` | Environment |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origin |
| `OPENAI_API_KEY` | — | **Required.** OpenAI API key |
| `OPENAI_MODEL` | `gpt-4.1` | Model used for extraction |
| `OPENAI_TEMPERATURE` | `0` | Kept at 0 for deterministic mapping |
| `BATCH_SIZE` | `20` | Rows sent to the model per request |
| `MAX_CONCURRENCY` | `5` | Concurrent in-flight AI batches |
| `AI_MAX_RETRIES` | `3` | Retries per batch on transient failure |
| `MAX_UPLOAD_ROWS` | `100000` | Hard row-count ceiling per upload |
| `MAX_UPLOAD_SIZE_MB` | `25` | Max upload size |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend base URL |

---

## API documentation

### `GET /api/health`
Returns `{ status: "ok", service: "groweasy-csv-importer-backend" }`.

### `POST /api/import`
Multipart form upload. Field name: `file` (`.csv`, up to `MAX_UPLOAD_SIZE_MB`).

**200 response:**
```json
{
  "imported": [ { "created_at": "...", "name": "...", "...": "..." } ],
  "skipped": [ { "reason": "...", "original_record": { } } ],
  "totalImported": 42,
  "totalSkipped": 3
}
```

**Error responses:**
| Status | Cause |
|---|---|
| 400 | No file attached, empty CSV, or a non-CSV file |
| 413 | CSV exceeds `MAX_UPLOAD_ROWS` or `MAX_UPLOAD_SIZE_MB` |
| 500 | Unexpected server error |

A batch that fails AI extraction after all retries does **not** fail the whole
import — its rows are recorded in `skipped` with a descriptive reason, and every
other batch still gets imported.

---

## Testing

```bash
cd backend
npm test          # Vitest: CSV parser, prompt formatting, AI response validation
```

```bash
cd frontend
npm run build      # Type-checks and lints the whole app
```

---

## Deployment

### Backend → Railway or Render
1. Point the service at `backend/` as the root directory.
2. Build command: `npm run build`. Start command: `npm start`.
3. Set the environment variables listed above (`OPENAI_API_KEY` is required).

### Frontend → Vercel
1. Point the project at `frontend/` as the root directory (Next.js is auto-detected).
2. Set `NEXT_PUBLIC_API_URL` to the deployed backend URL.

### Docker (both services locally)
```bash
OPENAI_API_KEY=sk-... docker compose up --build
```

---

## Tradeoffs

- **LLM-based mapping over rule-based mapping.** A synonym dictionary would be faster
  and cheaper, but breaks the moment a CSV uses a header nobody anticipated. The LLM
  approach generalizes to arbitrary, unseen column names and multiple languages, at
  the cost of latency and per-import API spend.
- **Temperature 0, strict JSON schema.** Prioritizes determinism and schema
  conformance over creative inference — appropriate for a data-migration tool
  where inventing values is worse than leaving them blank.
- **Batch size of 20.** Balances prompt size (and therefore cost and latency) against
  the number of round trips; very wide CSVs may need a smaller batch size to stay
  within model context limits.
- **Per-batch failure isolation.** A systemic outage still fails the whole file
  (every batch retries and then fails), but a transient blip only costs the rows in
  that specific batch, which is preferable to failing an entire large import over
  one bad batch.
- **Frontend re-uploads the raw file rather than the parsed JSON.** This keeps the
  backend as the single source of truth for parsing (handling encoding, duplicate
  headers, and huge files via streaming) rather than trusting client-side parsing
  for the actual import.

## Future improvements

- Column-level confidence scores surfaced in the UI so a human can spot-check
  low-confidence mappings before they're committed.
- A "remember this mapping" cache keyed by header fingerprint, to skip the AI call
  entirely for CSVs from a source seen before.
- Streaming partial results to the frontend as batches complete, instead of waiting
  for the whole file.
- Authentication and per-tenant CRM schema configuration (schema and enums are
  currently hardcoded to match this spec).
- Server-side persistence of import runs for audit/history.

## Screenshots

_Add screenshots of the upload, preview, and results screens here once deployed._
