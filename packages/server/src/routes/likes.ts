import { Router } from 'express'
import pool from '../db/pool.js'
import { verifyAuth, optionalAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// POST /api/posts/:postId/like — toggle like
router.post('/:postId/like', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const { postId } = req.params

  const { rows: postRows } = await pool.query(
    `SELECT id FROM history_posts WHERE id = $1`,
    [postId]
  )
  if (postRows.length === 0) {
    res.status(404).json({ error: '게시물을 찾을 수 없습니다.' })
    return
  }

  // Check if already liked
  const { rows: existing } = await pool.query(
    `SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2`,
    [authReq.userId, postId]
  )

  if (existing.length > 0) {
    // Unlike
    await pool.query(
      `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
      [authReq.userId, postId]
    )
    res.json({ liked: false, message: '좋아요를 취소했습니다.' })
  } else {
    // Like
    await pool.query(
      `INSERT INTO likes (user_id, post_id) VALUES ($1, $2)`,
      [authReq.userId, postId]
    )
    res.json({ liked: true, message: '좋아요를 눌렀습니다.' })
  }
})

// GET /api/posts/:postId/like — like status (anonymous allowed: liked=false)
router.get('/:postId/like', optionalAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const { postId } = req.params

  let liked = false
  if (authReq.userId) {
    const { rows } = await pool.query(
      `SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2`,
      [authReq.userId, postId]
    )
    liked = rows.length > 0
  }

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM likes WHERE post_id = $1`,
    [postId]
  )

  res.json({ liked, count: countRows[0].count })
})

export default router
