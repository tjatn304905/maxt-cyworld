import { Router } from 'express'
import pool from '../db/pool.js'
import { verifyAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// POST /api/posts/:postId/like — toggle like
router.post('/:postId/like', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const { postId } = req.params

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

// GET /api/posts/:postId/like — check if current user liked
router.get('/:postId/like', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const { postId } = req.params

  const { rows } = await pool.query(
    `SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2`,
    [authReq.userId, postId]
  )

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM likes WHERE post_id = $1`,
    [postId]
  )

  res.json({
    liked: rows.length > 0,
    count: countRows[0].count,
  })
})

export default router
