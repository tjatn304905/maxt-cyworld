import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRoutes from './routes/auth.js'
import { initDummyData } from './data/users.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.use('/api/auth', authRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start
async function start() {
  await initDummyData()
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📧 Demo account: kim@maxt.com / 1234`)
  })
}

start()
