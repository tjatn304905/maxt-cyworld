import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/posts.js'
import commentRoutes from './routes/comments.js'
import likeRoutes from './routes/likes.js'
import avatarRoutes from './routes/avatars.js'
import bgmRoutes from './routes/bgm.js'
import adminRoutes from './routes/admin.js'
import uploadRoutes from './routes/uploads.js'
import { seed } from './db/seed.js'

const app = express()
const PORT = process.env.PORT || 3001

// CORS_ORIGIN: comma-separated production origins (e.g. Vercel domain)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean) ?? []),
]

// Middleware
app.use(helmet())
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/posts', commentRoutes)
app.use('/api/posts', likeRoutes)
app.use('/api', avatarRoutes)
app.use('/api/bgm', bgmRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/uploads', uploadRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start
async function start() {
  // Listen first so the platform port scan (Render) succeeds even if seeding is slow or fails
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📧 Demo account: kim@maxt.com / 1234`)
  })

  try {
    await seed()
  } catch (err) {
    console.error('❌ Seed failed:', err)
  }
}

start()
