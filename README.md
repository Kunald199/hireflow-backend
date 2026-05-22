# HireFlow Backend

REST API backend for HireFlow — an AI-powered recruiting assistant that automates job description analysis, candidate scoring, interview question generation, and personalized outreach.

Built with Node.js, Express, Groq (Llama 3.3 70b), and Supabase.

---

## What This API Does

A recruiter pastes a job description and optionally uploads a candidate resume. The API runs a multi-step AI pipeline:

1. **Analyze JD** — extracts skills, seniority, responsibilities, red flags
2. **Generate Scorecard** — builds a weighted evaluation rubric
3. **Score Candidate** — AI scores the candidate against the scorecard
4. **Generate Questions** — creates tailored interview questions
5. **Generate Outreach** — writes personalized LinkedIn DM and email
6. **Generate Hiring Brief** — produces a hiring manager one-pager
7. **Parse Resume** — extracts structured data from PDF resumes

---

## Tech Stack

| Tool              | Purpose                  |
| ----------------- | ------------------------ |
| Node.js + Express | REST API framework       |
| Groq API          | AI inference (free tier) |
| Llama 3.3 70b     | LLM model via Groq       |
| Supabase          | Postgres database        |
| pdfjs-dist        | PDF text extraction      |

---

## Project Structure

src/
├── index.js → Express server entry point
├── routes/
│ └── hireflow.js → All route definitions
├── controllers/
│ ├── analyzeController.js
│ ├── scorecardController.js
│ ├── scoringController.js
│ ├── questionsController.js
│ ├── outreachController.js
│ ├── briefController.js
│ ├── resumeController.js
│ └── historyController.js
└── services/
├── groqService.js → Groq API communication
└── supabaseService.js → Database operations

---

## API Endpoints

### AI Pipeline

POST /api/analyze-jd → Analyze job description
POST /api/generate-scorecard → Generate candidate scorecard
POST /api/score-candidate → AI score candidate vs scorecard
POST /api/generate-questions → Generate interview questions
POST /api/generate-outreach → Generate personalized outreach
POST /api/generate-brief → Generate hiring manager brief
POST /api/parse-resume → Parse resume from text
POST /api/parse-resume-pdf → Parse resume from PDF (base64)

### History

POST /api/runs → Save a pipeline run
GET /api/runs → Get all saved runs
GET /api/runs/:id → Get a specific run
DELETE /api/runs/:id → Delete a run

---

## Local Setup

### Prerequisites

- Node.js 18+
- Groq API key (free at console.groq.com)
- Supabase project (free at supabase.com)

### Install

```bash
git clone https://github.com/YOUR_USERNAME/hireflow-backend
cd hireflow-backend
npm install
```

### Environment Variables

Create `.env` from the example:

```bash
cp .env.example .env
```

Fill in your values:
PORT=3001
FRONTEND_URL=http://localhost:5173
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

### Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE pipeline_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  job_title TEXT NOT NULL,
  company_name TEXT,
  candidate_name TEXT,
  job_description TEXT NOT NULL,
  analysis JSONB,
  scorecard JSONB,
  questions JSONB,
  outreach JSONB,
  brief JSONB
);

CREATE INDEX pipeline_runs_created_at_idx
ON pipeline_runs(created_at DESC);

ALTER TABLE pipeline_runs DISABLE ROW LEVEL SECURITY;
```

### Run

```bash
npm run dev
```

API runs on `http://localhost:3001`

---

## Key Design Decisions

**Why Express over NestJS?**
Full control over every endpoint and middleware. NestJS abstracts too much for a project focused on understanding backend fundamentals.

**Why Groq over OpenAI?**
Free tier with the fastest inference available. Llama 3.3 70b produces high quality structured JSON output reliably.

**Why service layer pattern?**
All Groq communication lives in `groqService.js`. Swapping AI providers means changing one file.

**Why JSONB in Postgres?**
Each AI step returns a different shaped object. JSONB stores JSON natively in Postgres and supports querying inside the data.

**Why lazy Groq initialization?**
ES modules load imports before `dotenv.config()` runs. Creating the client inside the function ensures env variables are loaded first.

---

## Related

- [HireFlow Frontend](https://github.com/Kunald199/hireflow-frontend)
