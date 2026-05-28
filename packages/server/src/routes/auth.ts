import { Router } from 'express'
import bcrypt from 'bcryptjs'
import type { LoginRequest, SignupRequest } from '@maxt/shared'
import { findUserByEmail, findUserById, createUser, toPublicUser } from '../data/users.js'
import { signToken, verifyAuth, type AuthRequest } from '../middleware/auth.js'
import pool from '../db/pool.js'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body as LoginRequest

  if (!email || !password) {
    res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' })
    return
  }

  const user = await findUserByEmail(email)
  if (!user) {
    res.status(401).json({ error: '존재하지 않는 계정입니다.' })
    return
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' })
    return
  }

  const token = signToken(user.id)
  res.json({ token, user: toPublicUser(user) })
})

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, nickname } = req.body as SignupRequest

  if (!name || !email || !password || !nickname) {
    res.status(400).json({ error: '모든 필드를 입력해주세요.' })
    return
  }

  if (password.length < 4) {
    res.status(400).json({ error: '비밀번호는 4자 이상이어야 합니다.' })
    return
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    res.status(409).json({ error: '이미 가입된 이메일입니다.' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await createUser({ name, email, passwordHash, nickname })

  // Create default avatar for the new user
  const { rows: defaultItems } = await pool.query(
    `SELECT id, category FROM avatar_items WHERE is_default = TRUE`
  )
  const itemMap: Record<string, number> = {}
  for (const item of defaultItems) {
    itemMap[item.category] = item.id
  }
  await pool.query(
    `INSERT INTO avatars (user_id, hair_id, face_id, cloth_id, accessory_id) VALUES ($1, $2, $3, $4, $5)`,
    [user.id, itemMap['HAIR'] ?? null, itemMap['FACE'] ?? null, itemMap['CLOTHES'] ?? null, itemMap['ACCESSORY'] ?? null]
  )

  const token = signToken(user.id)
  res.status(201).json({ token, user: toPublicUser(user) })
})

// GET /api/auth/me
router.get('/me', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const user = await findUserById(authReq.userId!)
  if (!user) {
    res.status(404).json({ error: '사용자를 찾을 수 없습니다.' })
    return
  }
  res.json({ user: toPublicUser(user) })
})

export default router
