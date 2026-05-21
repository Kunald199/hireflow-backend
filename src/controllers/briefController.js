import { callGroq } from '../services/groqService.js'

export async function generateBrief(req, res) {
  try {
    const { jobTitle, analysis, scorecard } = req.body

    if (!jobTitle || !analysis) {
      return res.status(400).json({ error: 'jobTitle and analysis are required' })
    }

    const systemPrompt = `You are an expert at writing concise, professional hiring briefs 
    for hiring managers. Return valid JSON only. No markdown, no explanation.`

    const userPrompt = `Create a hiring manager brief and return JSON:
    {
      "jobTitle": "${jobTitle}",
      "executiveSummary": "2-3 sentence overview of the role and ideal candidate",
      "keyHiringCriteria": ["top 5 things that matter most"],
      "candidatePersona": "description of the ideal candidate profile",
      "interviewProcess": [
        { "stage": "Stage name", "format": "format", "focus": "what to evaluate", "duration": "30 min" }
      ],
      "compensationContext": "market context for this role",
      "timeToHireTarget": "realistic timeline",
      "successMetrics": ["how you'll know the hire was successful in 90 days"]
    }

    Job Title: ${jobTitle}
    Analysis: ${JSON.stringify(analysis)}
    Scorecard summary: ${JSON.stringify(scorecard) || 'not provided'}`

    const result = await callGroq(systemPrompt, userPrompt)
    const parsed = JSON.parse(result)
    res.json({ success: true, data: parsed })

  } catch (error) {
    console.error('generateBrief error:', error)
    res.status(500).json({ error: 'Failed to generate brief' })
  }
}