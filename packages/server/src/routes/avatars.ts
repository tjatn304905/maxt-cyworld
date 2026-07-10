import { Router } from 'express'
import type { UpdateAvatarRequest } from '@maxt/shared'
import pool from '../db/pool.js'
import { verifyAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// slot key in request body → item category it must match
const SLOT_CATEGORIES: { key: keyof UpdateAvatarRequest; category: string }[] = [
  { key: 'hairId', category: 'HAIR' },
  { key: 'faceId', category: 'FACE' },
  { key: 'clothId', category: 'CLOTHES' },
  { key: 'bottomId', category: 'BOTTOM' },
  { key: 'accessoryId', category: 'ACCESSORY' },
]

// GET /api/avatar-items — list all items, optional category filter
router.get('/avatar-items', async (req, res) => {
  const { category } = req.query as Record<string, string>

  let query = `SELECT id, category, name, image_url, is_default, render_key FROM avatar_items`
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
    renderKey: row.render_key ?? null,
  })))
})

// GET /api/avatars/me — get current user's equipped avatar
router.get('/avatars/me', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest

  const { rows } = await pool.query(
    `SELECT a.hair_id, a.face_id, a.cloth_id, a.bottom_id, a.accessory_id,
            h.name AS hair_name, h.image_url AS hair_image, h.render_key AS hair_key,
            f.name AS face_name, f.image_url AS face_image, f.render_key AS face_key,
            c.name AS cloth_name, c.image_url AS cloth_image, c.render_key AS cloth_key,
            b.name AS bottom_name, b.image_url AS bottom_image, b.render_key AS bottom_key,
            ac.name AS accessory_name, ac.image_url AS accessory_image, ac.render_key AS accessory_key
     FROM avatars a
     LEFT JOIN avatar_items h ON a.hair_id = h.id
     LEFT JOIN avatar_items f ON a.face_id = f.id
     LEFT JOIN avatar_items c ON a.cloth_id = c.id
     LEFT JOIN avatar_items b ON a.bottom_id = b.id
     LEFT JOIN avatar_items ac ON a.accessory_id = ac.id
     WHERE a.user_id = $1`,
    [authReq.userId]
  )

  if (rows.length === 0) {
    res.json({ hair: null, face: null, cloth: null, bottom: null, accessory: null })
    return
  }

  const row = rows[0]
  res.json({
    hair: row.hair_id
      ? { id: row.hair_id, name: row.hair_name, imageUrl: row.hair_image, renderKey: row.hair_key }
      : null,
    face: row.face_id
      ? { id: row.face_id, name: row.face_name, imageUrl: row.face_image, renderKey: row.face_key }
      : null,
    cloth: row.cloth_id
      ? { id: row.cloth_id, name: row.cloth_name, imageUrl: row.cloth_image, renderKey: row.cloth_key }
      : null,
    bottom: row.bottom_id
      ? { id: row.bottom_id, name: row.bottom_name, imageUrl: row.bottom_image, renderKey: row.bottom_key }
      : null,
    accessory: row.accessory_id
      ? { id: row.accessory_id, name: row.accessory_name, imageUrl: row.accessory_image, renderKey: row.accessory_key }
      : null,
  })
})

// PUT /api/avatars/me — update equipped items
router.put('/avatars/me', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const body = req.body as UpdateAvatarRequest
  const { hairId, faceId, clothId, bottomId, accessoryId } = body

  // Validate item IDs exist and match their slot category
  const itemIds = [hairId, faceId, clothId, bottomId, accessoryId].filter((id) => id != null)
  if (itemIds.length > 0) {
    const { rows } = await pool.query(
      `SELECT id, category FROM avatar_items WHERE id = ANY($1)`,
      [itemIds]
    )
    const categoryById: Record<number, string> = {}
    for (const row of rows) {
      categoryById[row.id] = row.category
    }
    for (const slot of SLOT_CATEGORIES) {
      const id = body[slot.key]
      if (id != null && categoryById[id] !== slot.category) {
        res.status(400).json({ error: '유효하지 않은 아이템 ID가 포함되어 있습니다.' })
        return
      }
    }
  }

  await pool.query(
    `INSERT INTO avatars (user_id, hair_id, face_id, cloth_id, bottom_id, accessory_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id) DO UPDATE SET
       hair_id = EXCLUDED.hair_id,
       face_id = EXCLUDED.face_id,
       cloth_id = EXCLUDED.cloth_id,
       bottom_id = EXCLUDED.bottom_id,
       accessory_id = EXCLUDED.accessory_id,
       updated_at = CURRENT_TIMESTAMP`,
    [authReq.userId, hairId ?? null, faceId ?? null, clothId ?? null, bottomId ?? null, accessoryId ?? null]
  )

  res.json({ message: '아바타가 업데이트되었습니다.' })
})

export default router
