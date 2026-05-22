import { callGroqLarge } from '../services/groqService.js'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

async function extractTextFromPDF(buffer) {
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
  const pdf = await loadingTask.promise
  
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map(item => item.str).join(' ')
    fullText += pageText + '\n'
  }
  
  return fullText
}

async function parseResumeWithGroq(resumeText, res) {
  // Trim to 6000 chars max — covers most resumes without hitting context limits
  const trimmedText = resumeText.trim().slice(0, 6000)

  const systemPrompt = `You are an expert recruiter and resume parser. 
  Extract ALL information thoroughly from the entire resume.
  Read every job, every skill, every achievement carefully.
  Return valid JSON only. No markdown, no explanation.`

  const userPrompt = `Extract ALL candidate information from this resume thoroughly.
  Read every section — work history, skills, education, achievements.
  Be specific and technical. Extract exact technology names, not generic descriptions.
  Return JSON with exactly this structure:
  {
    "name": "candidate full name",
    "currentTitle": "current or most recent job title",
    "yearsOfExperience": "total years of professional experience as a number",
    "currentCompany": "current or most recent company",
    "skills": ["every single technology, language, framework, tool mentioned ANYWHERE in the resume e.g. React, TypeScript, Python, AWS, PostgreSQL, Docker — be exhaustive"],
    "background": "2-3 sentences MAX. Be specific not generic. Include: their title, years of experience, the exact technologies they are strongest in, and one standout achievement with a metric if available. Example: 5-year backend engineer specialising in Python and AWS, built microservices handling 10M daily requests at Stripe, strong in Postgres and Redis.",
    "education": "highest degree, field of study, and institution",
    "previousCompanies": ["every company they have worked at in order most recent first"],
    "achievements": ["every specific achievement with metrics e.g. reduced latency by 40%, led team of 8, grew revenue $2M"],
    "totalJobsHeld": "number of jobs in their career",
    "industries": ["industries they have worked in"]
  }

  Full Resume:
  ${trimmedText}`

  const result = await callGroqLarge(systemPrompt, userPrompt)
  const parsed = JSON.parse(result)
  res.json({ success: true, data: parsed })
}

export async function parseResume(req, res) {
  try {
    const { resumeText } = req.body
    if (!resumeText) {
      return res.status(400).json({ error: 'resumeText is required' })
    }
    await parseResumeWithGroq(resumeText, res)
  } catch (error) {
    console.error('parseResume error:', error.message)
    res.status(500).json({ error: 'Failed to parse resume' })
  }
}

export async function parseResumePDF(req, res) {
  try {
    const { pdfBase64 } = req.body
    if (!pdfBase64) {
      return res.status(400).json({ error: 'pdfBase64 is required' })
    }

    const buffer = Buffer.from(pdfBase64, 'base64')
    const resumeText = await extractTextFromPDF(buffer)

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract text from PDF' })
    }

    await parseResumeWithGroq(resumeText, res)
  } catch (error) {
    console.error('parseResumePDF error:', error.message)
    res.status(500).json({ error: 'Failed to parse PDF resume', detail: error.message })
  }
}