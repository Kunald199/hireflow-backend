# HireFlow — Build Guide

A full-stack AI recruiting assistant built with Node.js, Express, React, and Groq (Llama 3.3 70b).
This guide documents every decision made during the build — architecture, tooling, and reasoning.

---

## Tech Stack

| Layer              | Tool                    | Reason                                       |
| ------------------ | ----------------------- | -------------------------------------------- |
| Frontend           | React + Vite            | Industry standard, fast HMR                  |
| Styling            | Tailwind CSS v3         | Utility-first, no context switching          |
| Backend            | Node.js + Express       | Lightweight, full control over REST API      |
| AI / LLM           | Groq API                | Free tier, fastest inference available       |
| Model              | llama-3.3-70b-versatile | Best open-source model for structured output |
| Database           | Supabase (Postgres)     | Free tier, built-in auth, real Postgres      |
| Hosting (frontend) | Vercel                  | Free, instant deploys from GitHub            |
| Hosting (backend)  | Render.com              | Free tier, Node.js support                   |

---

## Phase 1 — Project Setup & Architecture

### Why two separate repos?

Frontend and backend are deployed independently to different services (Vercel + Render).
Keeping them separate mirrors how real engineering teams structure full-stack projects —
each service has its own dependencies, deployment pipeline, and can scale independently.

### Why Express over alternatives?

Express gives full control over every endpoint, middleware, and response shape.
Alternatives like NestJS add abstraction that obscures what's actually happening —
not ideal when the goal is to understand backend engineering deeply.

### Why ES Modules (`"type": "module"`)?

ES module syntax (`import`/`export`) is the modern JavaScript standard and matches
what React uses. Using CommonJS (`require`) on the backend while using ESM on the
frontend creates unnecessary cognitive switching.

### Environment variables pattern

- `.env` — real secrets, never committed (in `.gitignore`)
- `.env.example` — template committed to GitHub so any developer knows what variables are needed
- API keys live only on the backend — never exposed to the browser

### Folder structure

src/
├── routes/ → URL definitions only
├── controllers/ → request/response handling
├── services/ → business logic + external API calls
└── middleware/ → auth, error handling

This separation means each file has one job. Routes don't know about Groq.
Controllers don't know how Groq works. Services don't know about HTTP.

---

## Phase 2 — Backend AI Endpoints

### Why a service layer for Groq?

All Groq communication lives in `src/services/groqService.js`.
If the AI provider changes (Groq → OpenAI → Anthropic), one file changes.
Every controller just calls `callGroq()` and doesn't care what's underneath.

### Why lazy initialization for the Groq client?

ES modules load and execute imports before `dotenv.config()` runs.
Creating the Groq client at module load time means it initializes before
the `.env` file is read — so `process.env.GROQ_API_KEY` is undefined.
Creating it inside the function (lazy init) means it only runs when an
endpoint is actually called, by which point dotenv has loaded the variables.

### Why structured JSON prompts?

Each AI prompt explicitly requests a specific JSON shape and instructs the
model to return no markdown, no explanation — just valid JSON.
This makes the response directly parsable with `JSON.parse()` and gives
the frontend a consistent, predictable data contract.

### REST endpoints built

| Endpoint                     | Input                    | Output                        |
| ---------------------------- | ------------------------ | ----------------------------- |
| POST /api/analyze-jd         | Raw job description text | Structured role analysis      |
| POST /api/generate-scorecard | Job title + skills       | Weighted evaluation scorecard |
| POST /api/generate-outreach  | Candidate background     | LinkedIn DM + email templates |
| POST /api/generate-questions | Role details             | Full interview question set   |
| POST /api/generate-brief     | Analysis + scorecard     | Hiring manager one-pager      |

### HTTP status codes used

- `200` — success
- `400` — bad request (missing required fields)
- `500` — server error (Groq failure, parse error)

### Input validation

Every controller checks for required fields before calling Groq.
Hitting an AI API with an empty prompt wastes quota and returns garbage.
Validate first, call second.
