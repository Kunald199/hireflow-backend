import {
  savePipelineRun,
  getPipelineRuns,
  getPipelineRunById,
  deletePipelineRun
} from '../services/supabaseService.js'

export async function saveRun(req, res) {
  try {
    const { jobTitle, companyName, jobDescription, analysis, scorecard, questions, outreach, brief } = req.body

    if (!jobTitle || !jobDescription) {
      return res.status(400).json({ error: 'jobTitle and jobDescription are required' })
    }

    const data = await savePipelineRun({
      jobTitle,
      companyName,
      jobDescription,
      analysis,
      scorecard,
      questions,
      outreach,
      brief
    })

    res.json({ success: true, data })
  } catch (error) {
    console.error('saveRun error:', error)
    res.status(500).json({ error: 'Failed to save pipeline run' })
  }
}

export async function getRuns(req, res) {
  try {
    const data = await getPipelineRuns()
    res.json({ success: true, data })
  } catch (error) {
    console.error('getRuns error:', error)
    res.status(500).json({ error: 'Failed to fetch pipeline runs' })
  }
}

export async function getRunById(req, res) {
  try {
    const { id } = req.params
    const data = await getPipelineRunById(id)
    res.json({ success: true, data })
  } catch (error) {
    console.error('getRunById error:', error)
    res.status(500).json({ error: 'Failed to fetch pipeline run' })
  }
}

export async function deleteRun(req, res) {
  try {
    const { id } = req.params
    await deletePipelineRun(id)
    res.json({ success: true, message: 'Pipeline run deleted' })
  } catch (error) {
    console.error('deleteRun error:', error)
    res.status(500).json({ error: 'Failed to delete pipeline run' })
  }
}