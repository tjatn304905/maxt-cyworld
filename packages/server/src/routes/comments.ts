import { Router } from 'express'
import pool from '../db/pool.js'
import { verifyAuth, type AuthRequest } from '../middleware/auth.js'
import { findUserRole } from '../data/users.js'

const router = Router()

// GET /api/posts/:postId/comments — list with threaded structure
router.get('/:postId/comments', async (req, res) => {
  const { postId } = req.params

  const { rows } = await pool.query(
    `SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at, c.updated_at,
            u.name AS author_name, u.nickname AS author_nickname
     FROM comments c
     LEFT JOIN users u ON c.user_id = u.id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [postId]
  )

  const comments = rows.map((row) => ({
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    parentId: row.parent_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: {
      name: row.author_name,
      nickname: row.author_nickname,
    },
  }))

  res.json(comments)
})

// POST /api/posts/:postId/comments — create (auth required)
router.post('/:postId/comments', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const { postId } = req.params
  const { content, parentId } = req.body

  if (!content) {
    res.status(400).json({ error: '댓글 내용을 입력해주세요.' })
    return
  }

  // Verify post exists
  const { rows: postRows } = await pool.query(
    `SELECT id FROM history_posts WHERE id = $1`,
    [postId]
  )
  if (postRows.length === 0) {
    res.status(404).json({ error: '게시물을 찾을 수 없습니다.' })
    return
  }

  // Verify parent comment exists if parentId is provided
  if (parentId) {
    const { rows: parentRows } = await pool.query(
      `SELECT id FROM comments WHERE id = $1 AND post_id = $2`,
      [parentId, postId]
    )
    if (parentRows.length === 0) {
      res.status(404).json({ error: '부모 댓글을 찾을 수 없습니다.' })
      return
    }
  }

  const { rows } = await pool.query(
    `INSERT INTO comments (post_id, user_id, parent_id, content)
     VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
    [postId, authReq.userId, parentId ?? null, content]
  )

  res.status(201).json({ id: rows[0].id, message: '댓글이 작성되었습니다.' })
})

// PUT /api/posts/:postId/comments/:id — edit own comment (auth required)
router.put('/:postId/comments/:id', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const { id } = req.params
  const { content } = req.body

  if (!content) {
    res.status(400).json({ error: '댓글 내용을 입력해주세요.' })
    return
  }

  const { rows } = await pool.query(
    `SELECT user_id FROM comments WHERE id = $1`,
    [id]
  )

  if (rows.length === 0) {
    res.status(404).json({ error: '댓글을 찾을 수 없습니다.' })
    return
  }

  if (rows[0].user_id !== authReq.userId) {
    res.status(403).json({ error: '수정 권한이 없습니다.' })
    return
  }

  await pool.query(
    `UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [content, id]
  )
  res.json({ message: '댓글이 수정되었습니다.' })
})

// DELETE /api/posts/:postId/comments/:id — delete own comment (auth required)
router.delete('/:postId/comments/:id', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const { id } = req.params

  const { rows } = await pool.query(
    `SELECT user_id FROM comments WHERE id = $1`,
    [id]
  )

  if (rows.length === 0) {
    res.status(404).json({ error: '댓글을 찾을 수 없습니다.' })
    return
  }

  // author or admin only — delete replies first (no ON DELETE CASCADE on parent_id)
  const role = await findUserRole(authReq.userId!)
  if (rows[0].user_id !== authReq.userId && role !== 'ADMIN') {
    res.status(403).json({ error: '삭제 권한이 없습니다.' })
    return
  }

  await pool.query(`DELETE FROM comments WHERE parent_id = $1`, [id])
  await pool.query(`DELETE FROM comments WHERE id = $1`, [id])
  res.json({ message: '댓글이 삭제되었습니다.' })
})

export default router
