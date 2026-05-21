import { callGroq } from '../services/groqService.js'

export async function analyzeJD(req, res) {
  try {
    const { jobDescription } = req.body

    if (!jobDescription) {
      return res.status(400).json({ error: 'jobDescription is required' })
    }

    const systemPrompt = `You are an expert recruiter and talent acquisition specialist. 
    Analyze job descriptions with precision and return structured JSON only. 
    No markdown, no explanation, just valid JSON.`

    const userPrompt = `Analyze this job description and return a JSON object with exactly this structure:
    {
      "jobTitle": "extracted job title",
      "department": "likely department",
      "seniorityLevel": "Junior/Mid/Senior/Lead/Principal/Director",
      "mustHaveSkills": ["skill1", "skill2"],
      "niceToHaveSkills": ["skill1", "skill2"],
      "experienceYears": "X-Y years",
      "keyResponsibilities": ["responsibility1", "responsibility2"],
      "cultureSignals": ["signal1", "signal2"],
      "redFlags": ["any concerning vague language or unrealistic expectations"]
    }

    Job Description:
    ${jobDescription}`

    const result = await callGroq(systemPrompt, userPrompt)

    // Parse the JSON response
    const parsed = JSON.parse(result)
    res.json({ success: true, data: parsed })

  } catch (error) {
    console.error('analyzeJD error:', error)
    res.status(500).json({ error: 'Failed to analyze job description' })
  }
}