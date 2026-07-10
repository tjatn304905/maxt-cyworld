import { Router } from 'express'
import type { CreateBgmTrackRequest } from '@maxt/shared'
import pool from '../db/pool.js'
import { verifyAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// GET /api/bgm — public track list
router.get('/', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, title, artist, file_url, sort_order FROM bgm_tracks ORDER BY sort_order, id`
  )
  res.json(
    rows.map((row) => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      fileUrl: row.file_url,
      sortOrder: row.sort_order,
    }))
  )
})

// POST /api/bgm — add track (ADMIN only)
router.post('/', verifyAuth, requireRole('ADMIN'), async (req, res) => {
  const { title, artist, fileUrl, sortOrder = 0 } = req.body as CreateBgmTrackRequest

  if (!title || !artist || !fileUrl) {
    res.status(400).json({ error: '필수 항목을 모두 입력해주세요.' })
    return
  }

  const { rows } = await pool.query(
    `INSERT INTO bgm_tracks (title, artist, file_url, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
    [title, artist, fileUrl, sortOrder]
  )
  res.status(201).json({ id: rows[0].id, message: '곡이 추가되었습니다.' })
})

// DELETE /api/bgm/:id — remove track (ADMIN only)
router.delete('/:id', verifyAuth, requireRole('ADMIN'), async (req, res) => {
  const { id } = req.params

  const { rows } = await pool.query(`DELETE FROM bgm_tracks WHERE id = $1 RETURNING id`, [id])
  if (rows.length === 0) {
    res.status(404).json({ error: '곡을 찾을 수 없습니다.' })
    return
  }
  res.json({ message: '곡이 삭제되었습니다.' })
})

export default router
