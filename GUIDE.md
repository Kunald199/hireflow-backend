# HireFlow Backend — Build Guide

A complete record of how this backend was built, every architectural decision made, and why.

---

## Tech Stack

| Layer       | Tool                    | Reason                                         |
| ----------- | ----------------------- | ---------------------------------------------- |
| Runtime     | Node.js 24              | Modern JS, ES modules, fast                    |
| Framework   | Express                 | Lightweight, full control                      |
| AI          | Groq API                | Free tier, fastest inference                   |
| Model       | llama-3.3-70b-versatile | Best open source for structured output         |
| Database    | Supabase (Postgres)     | Free tier, real Postgres, built-in auth ready  |
| PDF Parsing | pdfjs-dist              | ES module compatible, reliable text extraction |

---

## Phase 1 — Project Setup

### Why two separate repos?

Frontend and backend are independent services deployed separately. Keeping them in separate repos mirrors real engineering team structure — each service has its own dependencies, deployment pipeline, and can scale independently.

### Why ES Modules?

`"type": "module"` in package.json enables `import`/`export` syntax matching the frontend. Avoids cognitive switching between CommonJS (`require`) on backend and ESM on frontend.

### Why Express over alternatives?

Express gives full control over every endpoint and middleware. NestJS and Fastify add abstractions that obscure what's actually happening — not ideal when the goal is understanding backend fundamentals deeply.

### Environment variables pattern

- `.env` — real secrets, never committed (in `.gitignore`)
- `.env.example` — template committed to GitHub

API keys live only on the backend. Never exposed to the browser. This is the correct security pattern.

### Folder structure rationale

routes/ → URL definitions only
controllers/ → request/response handling
services/ → business logic + external API calls

Each file has one job. Routes don't know about Groq. Controllers don't know how Groq works. Services don't know about HTTP.

---

## Phase 2 — AI Endpoints

### Service layer pattern

All Groq communication lives in `groqService.js`. Every controller calls `callGroq()` without knowing anything about Groq internals. Swapping AI providers means changing one file.

### Lazy Groq initialization

ES modules load all imports before any code executes — before `dotenv.config()` runs. Creating the Groq client at module load time means `process.env.GROQ_API_KEY` is undefined.

Solution: create the client inside the function so it only runs when an endpoint is actually called, by which point dotenv has loaded.

### Structured JSON prompts

Every prompt explicitly instructs the model to return JSON only — no markdown, no explanation. This makes responses directly parsable with `JSON.parse()` and gives the frontend a consistent data contract.

### cleanJSON utility

Groq sometimes wraps responses in markdown code fences (` ```json ``` `) even when instructed not to. `cleanJSON()` strips these before parsing — applied in the service layer so every controller gets clean JSON automatically.

### Two Groq functions

- `callGroq()` — 2048 max tokens, temperature 0.7 — for fast structured outputs
- `callGroqLarge()` — 4096 max tokens, temperature 0.3 — for resume parsing which needs to read more text and return more detail

### Input validation

Every controller validates required fields before calling Groq. Calling an AI API with empty input wastes token quota and returns garbage. Validate first, call second.

### HTTP status codes

- `200` — success
- `400` — bad request (missing required fields)
- `500` — server error (Groq failure, parse error)

---

## Phase 3 — Resume Parsing

### Why pdfjs-dist over pdf-parse?

`pdf-parse` uses CommonJS and has subpath export issues with ES modules. `pdfjs-dist` works cleanly with ES module imports. Switching libraries rather than fighting the module system is the right engineering decision.

### PDF → base64 → buffer pattern

Browser can't send binary files as JSON. Frontend converts PDF to base64 string, backend converts base64 back to buffer, pdfjs-dist reads the buffer. Standard pattern for file transfer over REST APIs.

### Express payload limit

Default Express JSON body limit is 100kb. A 240kb PDF becomes ~330kb as base64. Increased limit to `10mb` to handle real-world resume sizes.

### Resume prompt engineering

The prompt explicitly says "every single technology mentioned ANYWHERE" and includes examples of what specific extraction looks like. LLMs follow examples better than abstract instructions. Lower temperature (0.3) makes extraction more precise.

---

## Phase 4 — Database

### Why Supabase?

Free tier includes 500MB Postgres, built-in auth (ready for future phases), and a clean SDK. Real Postgres — not a fake database.

### Why JSONB columns?

Each AI step returns a different shaped object. JSONB stores JSON natively in Postgres, supports indexing and querying inside the data, and is faster than TEXT for JSON storage.

### service_role vs anon key

- `anon` key — respects Row Level Security, limited access, safe for frontends
- `service_role` key — bypasses RLS, full access, backend only

Service role key lives exclusively in `.env` on the backend. Never touches the browser.

### Row Level Security

Supabase enables RLS by default blocking all operations. Disabled for this version since there's no user authentication. Re-enabling with per-user policies is the next step when auth is added.

### getPipelineRuns select query

Only fetches the columns needed for the history list — `id, created_at, job_title, company_name, candidate_name`. Avoids pulling large JSONB columns for every row just to show a list. Full data only fetched when a specific run is opened.

---

## Bugs Hit & Fixed

| Bug                          | Cause                                | Fix                                 |
| ---------------------------- | ------------------------------------ | ----------------------------------- |
| `ERR_MODULE_NOT_FOUND`       | File not created yet                 | Created missing controller files    |
| `GROQ_API_KEY undefined`     | ES module import timing              | Lazy initialization inside function |
| Groq returns markdown fences | Model ignores instructions sometimes | `cleanJSON()` strips fences         |
| `PayloadTooLargeError`       | Express 100kb default limit          | `express.json({ limit: '10mb' })`   |
| `pdfParse is not a function` | CommonJS/ESM incompatibility         | Switched to pdfjs-dist              |
| RLS blocking inserts         | Supabase default security            | Disabled RLS for single-user app    |
| candidate_name null          | Missing from getPipelineRuns select  | Added to select query               |
