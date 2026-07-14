import { Router } from 'express'
import bcrypt from 'bcryptjs'
import type { LoginRequest, SignupRequest, FindEmailRequest, ResetPasswordRequest } from '@maxt/shared'
import {
  findUserByEmail,
  findUserById,
  createUser,
  toPublicUser,
  findEmailsByNameAndNickname,
  updateUserPassword,
} from '../data/users.js'
import { signToken, verifyAuth, type AuthRequest } from '../middleware/auth.js'
import pool from '../db/pool.js'

const router = Router()

// avatar slot → item category mapping (selection must match category)
const AVATAR_SLOTS: { key: 'hairId' | 'faceId' | 'clothId' | 'bottomId' | 'accessoryId'; category: string }[] = [
  { key: 'hairId', category: 'HAIR' },
  { key: 'faceId', category: 'FACE' },
  { key: 'clothId', category: 'CLOTHES' },
  { key: 'bottomId', category: 'BOTTOM' },
  { key: 'accessoryId', category: 'ACCESSORY' },
]

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

// POST /api/auth/signup — creates user + avatar in one transaction
router.post('/signup', async (req, res) => {
  const { name, email, password, nickname, avatar } = req.body as SignupRequest

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

  // default items fill any slot the user did not pick
  const { rows: defaultItems } = await pool.query(
    `SELECT id, category FROM avatar_items WHERE is_default = TRUE`
  )
  const defaultMap: Record<string, number> = {}
  for (const item of defaultItems) {
    defaultMap[item.category] = item.id
  }

  // validate selected items exist and match their slot category
  const selectedIds = AVATAR_SLOTS
    .map((slot) => avatar?.[slot.key])
    .filter((id): id is number => typeof id === 'number')

  const itemCategoryById: Record<number, string> = {}
  if (selectedIds.length > 0) {
    const { rows: itemRows } = await pool.query(
      `SELECT id, category FROM avatar_items WHERE id = ANY($1)`,
      [selectedIds]
    )
    for (const row of itemRows) {
      itemCategoryById[row.id] = row.category
    }
  }

  const slotIds: Record<string, number | null> = {}
  for (const slot of AVATAR_SLOTS) {
    const selected = avatar?.[slot.key]
    if (typeof selected === 'number') {
      if (itemCategoryById[selected] !== slot.category) {
        res.status(400).json({ error: '유효하지 않은 아바타 아이템입니다.' })
        return
      }
      slotIds[slot.category] = selected
    } else {
      slotIds[slot.category] = defaultMap[slot.category] ?? null
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const user = await createUser({ name, email, passwordHash, nickname }, client)

    await client.query(
      `INSERT INTO avatars (user_id, hair_id, face_id, cloth_id, bottom_id, accessory_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        slotIds['HAIR'],
        slotIds['FACE'],
        slotIds['CLOTHES'],
        slotIds['BOTTOM'],
        slotIds['ACCESSORY'],
      ]
    )

    await client.query('COMMIT')

    const token = signToken(user.id)
    res.status(201).json({ token, user: toPublicUser(user) })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})

// keep first 2 chars of local part visible: sumsoo@x.com → su****@x.com
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  const visible = local.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(local.length - visible.length, 1))}@${domain}`
}

// POST /api/auth/find-email — identity check via name + nickname (no SMTP)
router.post('/find-email', async (req, res) => {
  const { name, nickname } = req.body as FindEmailRequest

  if (!name || !nickname) {
    res.status(400).json({ error: '이름과 닉네임을 입력해주세요.' })
    return
  }

  const emails = await findEmailsByNameAndNickname(name.trim(), nickname.trim())
  if (emails.length === 0) {
    res.status(404).json({ error: '일치하는 계정을 찾을 수 없습니다.' })
    return
  }

  res.json({ maskedEmails: emails.map(maskEmail) })
})

// POST /api/auth/reset-password — identity check via email + name + nickname (no SMTP)
router.post('/reset-password', async (req, res) => {
  const { email, name, nickname, newPassword } = req.body as ResetPasswordRequest

  if (!email || !name || !nickname || !newPassword) {
    res.status(400).json({ error: '모든 필드를 입력해주세요.' })
    return
  }

  if (newPassword.length < 4) {
    res.status(400).json({ error: '비밀번호는 4자 이상이어야 합니다.' })
    return
  }

  const user = await findUserByEmail(email.trim())
  if (!user || user.name !== name.trim() || user.nickname !== nickname.trim()) {
    res.status(404).json({ error: '입력한 정보와 일치하는 계정이 없습니다.' })
    return
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await updateUserPassword(user.id, passwordHash)

  res.json({ ok: true })
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
