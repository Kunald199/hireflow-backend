import { callGroq } from '../services/groqService.js'

export async function generateScorecard(req, res) {
  try {
    const { jobTitle, mustHaveSkills, niceToHaveSkills, seniorityLevel } = req.body

    if (!jobTitle || !mustHaveSkills) {
      return res.status(400).json({ error: 'jobTitle and mustHaveSkills are required' })
    }

    const systemPrompt = `You are an expert recruiter building structured hiring scorecards. 
    Return valid JSON only. No markdown, no explanation.`

    const userPrompt = `Create a candidate evaluation scorecard for this role and return JSON:
    {
      "jobTitle": "${jobTitle}",
      "seniorityLevel": "${seniorityLevel}",
      "categories": [
        {
          "name": "Technical Skills",
          "weight": 40,
          "criteria": [
            { "skill": "skill name", "required": true, "scoringGuide": "what 1/3/5 looks like" }
          ]
        },
        {
          "name": "Experience",
          "weight": 25,
          "criteria": [...]
        },
        {
          "name": "Soft Skills",
          "weight": 20,
          "criteria": [...]
        },
        {
          "name": "Culture Fit",
          "weight": 15,
          "criteria": [...]
        }
      ],
      "scoringScale": "1=Poor, 2=Below Average, 3=Average, 4=Good, 5=Excellent",
      "minimumPassScore": 65
    }

    Must-have skills: ${mustHaveSkills.join(', ')}
    Nice-to-have skills: ${niceToHaveSkills?.join(', ') || 'none provided'}`

    const result = await callGroq(systemPrompt, userPrompt)
    console.log('Groq raw response:', result)
    const parsed = JSON.parse(result)
    res.json({ success: true, data: parsed })

  }  catch (error) {
    console.error('generateScorecard error:', error.message)
    res.status(500).json({ error: 'Failed to generate scorecard' })
  }
}