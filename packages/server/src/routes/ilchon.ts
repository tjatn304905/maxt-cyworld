import { Router } from 'express'
import pool from '../db/pool.js'
import { verifyAuth, type AuthRequest } from '../middleware/auth.js'
import { findUserRole } from '../data/users.js'

const router = Router()

const MAX_CONTENT_LENGTH = 100

// GET /api/ilchon — list newest first with author avatar
router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 100)

  const { rows } = await pool.query(
    `SELECT ic.id, ic.user_id, ic.content, ic.created_at, ic.updated_at,
            u.name AS author_name, u.nickname AS author_nickname,
            h.render_key AS hair_key, f.render_key AS face_key, cl.render_key AS cloth_key,
            b.render_key AS bottom_key, ac.render_key AS accessory_key
     FROM ilchon_comments ic
     LEFT JOIN users u ON ic.user_id = u.id
     LEFT JOIN avatars a ON a.user_id = u.id
     LEFT JOIN avatar_items h ON a.hair_id = h.id
     LEFT JOIN avatar_items f ON a.face_id = f.id
     LEFT JOIN avatar_items cl ON a.cloth_id = cl.id
     LEFT JOIN avatar_items b ON a.bottom_id = b.id
     LEFT JOIN avatar_items ac ON a.accessory_id = ac.id
     ORDER BY ic.created_at DESC
     LIMIT $1`,
    [limit]
  )

  const comments = rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: {
      name: row.author_name,
      nickname: row.author_nickname,
      avatarKeys: [row.hair_key, row.face_key, row.cloth_key, row.bottom_key, row.accessory_key],
    },
  }))

  res.json(comments)
})

// POST /api/ilchon — create (auth required)
router.post('/', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const { content } = req.body

  const trimmed = typeof content === 'string' ? content.trim() : ''
  if (!trimmed) {
    res.status(400).json({ error: '일촌평 내용을 입력해주세요.' })
    return
  }
  if (trimmed.length > MAX_CONTENT_LENGTH) {
    res.status(400).json({ error: `일촌평은 ${MAX_CONTENT_LENGTH}자 이내로 입력해주세요.` })
    return
  }

  const { rows } = await pool.query(
    `INSERT INTO ilchon_comments (user_id, content)
     VALUES ($1, $2) RETURNING id, created_at`,
    [authReq.userId, trimmed]
  )

  res.status(201).json({ id: rows[0].id, message: '일촌평이 등록되었습니다.' })
})

// PUT /api/ilchon/:id — edit own comment (auth required)
router.put('/:id', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const { id } = req.params
  const { content } = req.body

  const trimmed = typeof content === 'string' ? content.trim() : ''
  if (!trimmed) {
    res.status(400).json({ error: '일촌평 내용을 입력해주세요.' })
    return
  }
  if (trimmed.length > MAX_CONTENT_LENGTH) {
    res.status(400).json({ error: `일촌평은 ${MAX_CONTENT_LENGTH}자 이내로 입력해주세요.` })
    return
  }

  const { rows } = await pool.query(
    `SELECT user_id FROM ilchon_comments WHERE id = $1`,
    [id]
  )

  if (rows.length === 0) {
    res.status(404).json({ error: '일촌평을 찾을 수 없습니다.' })
    return
  }

  if (rows[0].user_id !== authReq.userId) {
    res.status(403).json({ error: '수정 권한이 없습니다.' })
    return
  }

  await pool.query(
    `UPDATE ilchon_comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [trimmed, id]
  )
  res.json({ message: '일촌평이 수정되었습니다.' })
})

// DELETE /api/ilchon/:id — delete own comment (author or admin)
router.delete('/:id', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const { id } = req.params

  const { rows } = await pool.query(
    `SELECT user_id FROM ilchon_comments WHERE id = $1`,
    [id]
  )

  if (rows.length === 0) {
    res.status(404).json({ error: '일촌평을 찾을 수 없습니다.' })
    return
  }

  const role = await findUserRole(authReq.userId!)
  if (rows[0].user_id !== authReq.userId && role !== 'ADMIN') {
    res.status(403).json({ error: '삭제 권한이 없습니다.' })
    return
  }

  await pool.query(`DELETE FROM ilchon_comments WHERE id = $1`, [id])
  res.json({ message: '일촌평이 삭제되었습니다.' })
})

export default router
