import { callGroq } from '../services/groqService.js'

export async function scoreCandidate(req, res) {
  try {
    const { scorecard, candidateBackground, candidateName } = req.body

    if (!scorecard || !candidateBackground) {
      return res.status(400).json({ error: 'scorecard and candidateBackground are required' })
    }

    const systemPrompt = `You are an expert technical recruiter and hiring manager. 
    Score candidates against scorecards objectively and fairly.
    Return valid JSON only. No markdown, no explanation.`

    const userPrompt = `Score this candidate against the scorecard criteria.
    For each criterion give a score 1-5 with brief reasoning.
    
    Return JSON with exactly this structure:
    {
      "candidateName": "${candidateName || 'Candidate'}",
      "categoryScores": [
        {
          "name": "category name matching scorecard",
          "weight": 40,
          "criteria": [
            {
              "skill": "skill name",
              "score": 4,
              "reasoning": "one sentence why this score",
              "required": true
            }
          ],
          "categoryScore": 85
        }
      ],
      "totalWeightedScore": 78,
      "minimumPassScore": 65,
      "passed": true,
      "summary": "2-3 sentence overall assessment of the candidate",
      "strengths": ["strength 1", "strength 2"],
      "gaps": ["gap 1", "gap 2"],
      "recommendation": "Strong Yes / Yes / Maybe / No"
    }

    Scorecard:
    ${JSON.stringify(scorecard)}

    Candidate Background:
    ${candidateBackground}`

    const result = await callGroq(systemPrompt, userPrompt)
    const parsed = JSON.parse(result)
    res.json({ success: true, data: parsed })

  } catch (error) {
    console.error('scoreCandidate error:', error)
    res.status(500).json({ error: 'Failed to score candidate' })
  }
}