import { Router } from 'express'
import bcrypt from 'bcryptjs'
import type { LoginRequest, SignupRequest } from '@maxt/shared'
import { findUserByEmail, findUserById, createUser, toPublicUser } from '../data/users.js'
import { signToken, verifyAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body as LoginRequest

  if (!email || !password) {
    res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' })
    return
  }

  const user = findUserByEmail(email)
  if (!user) {
    res.status(401).json({ error: '존재하지 않는 계정입니다.' })
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' })
    return
  }

  const token = signToken(user.id)
  res.json({ token, user: toPublicUser(user) })
})

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, ilchonName } = req.body as SignupRequest

  if (!name || !email || !password || !ilchonName) {
    res.status(400).json({ error: '모든 필드를 입력해주세요.' })
    return
  }

  if (password.length < 4) {
    res.status(400).json({ error: '비밀번호는 4자 이상이어야 합니다.' })
    return
  }

  const existing = findUserByEmail(email)
  if (existing) {
    res.status(409).json({ error: '이미 가입된 이메일입니다.' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = createUser({ name, email, passwordHash, ilchonName })
  const token = signToken(user.id)
  res.status(201).json({ token, user: toPublicUser(user) })
})

// GET /api/auth/me
router.get('/me', verifyAuth, (req, res) => {
  const authReq = req as AuthRequest
  const user = findUserById(authReq.userId!)
  if (!user) {
    res.status(404).json({ error: '사용자를 찾을 수 없습니다.' })
    return
  }
  res.json({ user: toPublicUser(user) })
})

export default router
