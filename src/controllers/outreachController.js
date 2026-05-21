import { callGroq } from '../services/groqService.js'

export async function generateOutreach(req, res) {
  try {
    const { jobTitle, candidateName, candidateBackground, companyName, tone } = req.body

    if (!jobTitle || !candidateBackground) {
      return res.status(400).json({ error: 'jobTitle and candidateBackground are required' })
    }

    const systemPrompt = `You are an expert technical recruiter known for personalized, 
    non-generic outreach that candidates actually respond to. 
    Return valid JSON only. No markdown, no explanation.`

    const userPrompt = `Write personalized recruiter outreach and return JSON:
    {
      "linkedinDM": {
        "subject": "short attention-grabbing opener",
        "message": "personalized LinkedIn message under 300 characters"
      },
      "email": {
        "subject": "compelling email subject line",
        "body": "full personalized email, 150-200 words"
      },
      "followUp": {
        "timing": "when to send follow up",
        "message": "short follow up message"
      },
      "personalizedHooks": ["specific thing from their background to mention", "another hook"]
    }

    Role: ${jobTitle}
    Company: ${companyName || 'our company'}
    Candidate name: ${candidateName || 'the candidate'}
    Candidate background: ${candidateBackground}
    Tone: ${tone || 'professional but warm'}`

    const result = await callGroq(systemPrompt, userPrompt)
    const parsed = JSON.parse(result)
    res.json({ success: true, data: parsed })

  } catch (error) {
    console.error('generateOutreach error:', error)
    res.status(500).json({ error: 'Failed to generate outreach' })
  }
}