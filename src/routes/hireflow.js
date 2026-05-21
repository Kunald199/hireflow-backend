import express from 'express'
import { analyzeJD } from '../controllers/analyzeController.js'
import { generateScorecard } from '../controllers/scorecardController.js'
import { generateOutreach } from '../controllers/outreachController.js'
import { generateQuestions } from '../controllers/questionsController.js'
import { generateBrief } from '../controllers/briefController.js'

const router = express.Router()

router.post('/analyze-jd', analyzeJD)
router.post('/generate-scorecard', generateScorecard)
router.post('/generate-outreach', generateOutreach)
router.post('/generate-questions', generateQuestions)
router.post('/generate-brief', generateBrief)

export default router