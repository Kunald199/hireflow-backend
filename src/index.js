import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}))
app.use(express.json())

// Health check — always have this on a real API
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'HireFlow API is running',
    timestamp: new Date().toISOString()
  })
})

// Routes (we'll add these in Phase 2)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HireFlow API' })
})

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
})