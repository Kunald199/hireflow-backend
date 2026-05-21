import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import hireflowRoutes from './routes/hireflow.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'HireFlow API is running',
    timestamp: new Date().toISOString()
  })
})

// All HireFlow routes live under /api
app.use('/api', hireflowRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong' })
})

app.listen(PORT, () => {
  console.log(`🚀 HireFlow API running on http://localhost:${PORT}`)
  console.log(`📋 Endpoints ready:`)
  console.log(`   POST /api/analyze-jd`)
  console.log(`   POST /api/generate-scorecard`)
  console.log(`   POST /api/generate-outreach`)
  console.log(`   POST /api/generate-questions`)
  console.log(`   POST /api/generate-brief`)
})