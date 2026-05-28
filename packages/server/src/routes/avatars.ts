import { Router } from 'express'
import pool from '../db/pool.js'
import { verifyAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/avatar-items — list all items, optional category filter
router.get('/avatar-items', async (req, res) => {
  const { category } = req.query as Record<string, string>

  let query = `SELECT id, category, name, image_url, is_default FROM avatar_items`
  const params: any[] = []

  if (category) {
    params.push(category.toUpperCase())
    query += ` WHERE category = $1`
  }

  query += ` ORDER BY category, id`

  const { rows } = await pool.query(query, params)

  res.json(rows.map((row) => ({
    id: row.id,
    category: row.category,
    name: row.name,
    imageUrl: row.image_url,
    isDefault: row.is_default,
  })))
})

// GET /api/avatars/me — get current user's equipped avatar
router.get('/avatars/me', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest

  const { rows } = await pool.query(
    `SELECT a.hair_id, a.face_id, a.cloth_id, a.accessory_id,
            h.name AS hair_name, h.image_url AS hair_image,
            f.name AS face_name, f.image_url AS face_image,
            c.name AS cloth_name, c.image_url AS cloth_image,
            ac.name AS accessory_name, ac.image_url AS accessory_image
     FROM avatars a
     LEFT JOIN avatar_items h ON a.hair_id = h.id
     LEFT JOIN avatar_items f ON a.face_id = f.id
     LEFT JOIN avatar_items c ON a.cloth_id = c.id
     LEFT JOIN avatar_items ac ON a.accessory_id = ac.id
     WHERE a.user_id = $1`,
    [authReq.userId]
  )

  if (rows.length === 0) {
    res.json({ hair: null, face: null, cloth: null, accessory: null })
    return
  }

  const row = rows[0]
  res.json({
    hair: row.hair_id ? { id: row.hair_id, name: row.hair_name, imageUrl: row.hair_image } : null,
    face: row.face_id ? { id: row.face_id, name: row.face_name, imageUrl: row.face_image } : null,
    cloth: row.cloth_id ? { id: row.cloth_id, name: row.cloth_name, imageUrl: row.cloth_image } : null,
    accessory: row.accessory_id ? { id: row.accessory_id, name: row.accessory_name, imageUrl: row.accessory_image } : null,
  })
})

// PUT /api/avatars/me — update equipped items
router.put('/avatars/me', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const { hairId, faceId, clothId, accessoryId } = req.body

  // Validate item IDs exist if provided
  const itemIds = [hairId, faceId, clothId, accessoryId].filter((id) => id != null)
  if (itemIds.length > 0) {
    const { rows } = await pool.query(
      `SELECT id FROM avatar_items WHERE id = ANY($1)`,
      [itemIds]
    )
    if (rows.length !== itemIds.length) {
      res.status(400).json({ error: '유효하지 않은 아이템 ID가 포함되어 있습니다.' })
      return
    }
  }

  await pool.query(
    `INSERT INTO avatars (user_id, hair_id, face_id, cloth_id, accessory_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE SET
       hair_id = EXCLUDED.hair_id,
       face_id = EXCLUDED.face_id,
       cloth_id = EXCLUDED.cloth_id,
       accessory_id = EXCLUDED.accessory_id,
       updated_at = CURRENT_TIMESTAMP`,
    [authReq.userId, hairId ?? null, faceId ?? null, clothId ?? null, accessoryId ?? null]
  )

  res.json({ message: '아바타가 업데이트되었습니다.' })
})

export default router
