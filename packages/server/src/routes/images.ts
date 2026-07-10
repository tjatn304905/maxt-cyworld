import { Router } from 'express'
import pool from '../db/pool.js'

const router = Router()

// GET /api/images — 게시글에 첨부된 모든 이미지 (사진첩 갤러리용)
router.get('/', async (req, res) => {
  const { page = '1', limit = '60' } = req.query as Record<string, string>
  const pageSize = Math.min(100, Math.max(1, parseInt(limit)))
  const offset = (Math.max(1, parseInt(page)) - 1) * pageSize

  const countResult = await pool.query(`SELECT COUNT(*) FROM post_images`)
  const total = parseInt(countResult.rows[0].count)

  const { rows } = await pool.query(
    `SELECT pi.id, pi.image_url, pi.post_id, hp.title AS post_title, hp.event_date
     FROM post_images pi
     JOIN history_posts hp ON pi.post_id = hp.id
     ORDER BY hp.event_date DESC, pi.post_id DESC, pi.sort_order, pi.id
     LIMIT $1 OFFSET $2`,
    [pageSize, offset]
  )

  res.json({
    data: rows.map((row) => ({
      id: row.id,
      imageUrl: row.image_url,
      postId: row.post_id,
      postTitle: row.post_title,
      eventDate: row.event_date,
    })),
    total,
    page: parseInt(page),
    limit: pageSize,
  })
})

export default router
