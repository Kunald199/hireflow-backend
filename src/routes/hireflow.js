import express from 'express'
import { analyzeJD } from '../controllers/analyzeController.js'
import { generateScorecard } from '../controllers/scorecardController.js'
import { generateOutreach } from '../controllers/outreachController.js'
import { generateQuestions } from '../controllers/questionsController.js'
import { generateBrief } from '../controllers/briefController.js'
import { saveRun, getRuns, getRunById, deleteRun } from '../controllers/historyController.js'
import { parseResume, parseResumePDF } from '../controllers/resumeController.js'
import { scoreCandidate } from '../controllers/scoringController.js'

const router = express.Router()

// AI endpoints
router.post('/analyze-jd', analyzeJD)
router.post('/generate-scorecard', generateScorecard)
router.post('/generate-outreach', generateOutreach)
router.post('/generate-questions', generateQuestions)
router.post('/generate-brief', generateBrief)

// Resume parsing
router.post('/parse-resume', parseResume)
router.post('/parse-resume-pdf', parseResumePDF)

// Candidate scoring
router.post('/score-candidate', scoreCandidate)

// History
router.post('/runs', saveRun)
router.get('/runs', getRuns)
router.get('/runs/:id', getRunById)
router.delete('/runs/:id', deleteRun)

export default router