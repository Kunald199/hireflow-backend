import { callGroq } from '../services/groqService.js'

export async function generateQuestions(req, res) {
  try {
    const { jobTitle, mustHaveSkills, seniorityLevel, keyResponsibilities } = req.body

    if (!jobTitle) {
      return res.status(400).json({ error: 'jobTitle is required' })
    }

    const systemPrompt = `You are a senior technical interviewer and hiring expert. 
    Create interview questions that reveal true candidate capability. 
    Return valid JSON only. No markdown, no explanation.`

    const userPrompt = `Generate a complete interview question set and return JSON:
    {
      "jobTitle": "${jobTitle}",
      "screeningQuestions": [
        { "question": "...", "purpose": "what this reveals", "redFlagAnswers": "what to watch for" }
      ],
      "technicalQuestions": [
        { "question": "...", "difficulty": "Easy/Medium/Hard", "idealAnswerPoints": ["point1", "point2"] }
      ],
      "behavioralQuestions": [
        { "question": "STAR format question...", "competency": "what competency this tests" }
      ],
      "cultureQuestions": [
        { "question": "...", "purpose": "..." }
      ],
      "closingQuestions": ["question candidates should ask you"]
    }

    Role: ${jobTitle}
    Seniority: ${seniorityLevel || 'Mid-level'}
    Key skills: ${mustHaveSkills?.join(', ') || 'not specified'}
    Responsibilities: ${keyResponsibilities?.join(', ') || 'not specified'}`

    const result = await callGroq(systemPrompt, userPrompt)
    const parsed = JSON.parse(result)
    res.json({ success: true, data: parsed })

  } catch (error) {
    console.error('generateQuestions error:', error)
    res.status(500).json({ error: 'Failed to generate questions' })
  }
}