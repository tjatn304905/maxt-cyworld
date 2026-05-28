import { Router } from 'express'
import pool from '../db/pool.js'
import { verifyAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/posts — list with pagination, category filter
router.get('/', async (req, res) => {
  const { category, page = '1', limit = '20' } = req.query as Record<string, string>
  const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit)
  const pageSize = Math.min(100, Math.max(1, parseInt(limit)))

  let where = ''
  const params: any[] = []

  if (category) {
    params.push(category)
    where = `WHERE hp.category = $${params.length}`
  }

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM history_posts hp ${where}`,
    params
  )
  const total = parseInt(countResult.rows[0].count)

  const dataParams = [...params, pageSize, offset]
  const { rows } = await pool.query(
    `SELECT hp.id, hp.category, hp.title, hp.content, hp.event_date,
            hp.created_at, hp.updated_at,
            u.id AS author_id, u.name AS author_name, u.nickname AS author_nickname,
            pi.image_url AS representative_image,
            COALESCE(lc.like_count, 0)::int AS like_count,
            COALESCE(cc.comment_count, 0)::int AS comment_count
     FROM history_posts hp
     LEFT JOIN users u ON hp.author_id = u.id
     LEFT JOIN LATERAL (
       SELECT image_url FROM post_images WHERE post_id = hp.id AND is_representative = TRUE LIMIT 1
     ) pi ON TRUE
     LEFT JOIN LATERAL (
       SELECT COUNT(*) AS like_count FROM likes WHERE post_id = hp.id
     ) lc ON TRUE
     LEFT JOIN LATERAL (
       SELECT COUNT(*) AS comment_count FROM comments WHERE post_id = hp.id
     ) cc ON TRUE
     ${where}
     ORDER BY hp.event_date DESC, hp.created_at DESC
     LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams
  )

  res.json({
    data: rows.map(mapPostRow),
    total,
    page: parseInt(page),
    limit: pageSize,
  })
})

// GET /api/posts/:id — detail with all images
router.get('/:id', async (req, res) => {
  const { id } = req.params

  const { rows } = await pool.query(
    `SELECT hp.id, hp.category, hp.title, hp.content, hp.event_date,
            hp.created_at, hp.updated_at,
            u.id AS author_id, u.name AS author_name, u.nickname AS author_nickname,
            COALESCE(lc.like_count, 0)::int AS like_count,
            COALESCE(cc.comment_count, 0)::int AS comment_count
     FROM history_posts hp
     LEFT JOIN users u ON hp.author_id = u.id
     LEFT JOIN LATERAL (
       SELECT COUNT(*) AS like_count FROM likes WHERE post_id = hp.id
     ) lc ON TRUE
     LEFT JOIN LATERAL (
       SELECT COUNT(*) AS comment_count FROM comments WHERE post_id = hp.id
     ) cc ON TRUE
     WHERE hp.id = $1`,
    [id]
  )

  if (rows.length === 0) {
    res.status(404).json({ error: '게시물을 찾을 수 없습니다.' })
    return
  }

  const { rows: images } = await pool.query(
    `SELECT id, image_url, is_representative FROM post_images WHERE post_id = $1 ORDER BY id`,
    [id]
  )

  const post = mapPostRow(rows[0])
  res.json({ ...post, images })
})

// POST /api/posts — create (auth required)
router.post('/', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const { category, title, content, eventDate, images } = req.body

  if (!category || !title || !content || !eventDate) {
    res.status(400).json({ error: '필수 항목을 모두 입력해주세요.' })
    return
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query(
      `INSERT INTO history_posts (author_id, category, title, content, event_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
      [authReq.userId, category, title, content, eventDate]
    )
    const postId = rows[0].id

    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await client.query(
          `INSERT INTO post_images (post_id, image_url, is_representative) VALUES ($1, $2, $3)`,
          [postId, images[i].imageUrl, i === 0]
        )
      }
    }

    await client.query('COMMIT')
    res.status(201).json({ id: postId, message: '게시물이 작성되었습니다.' })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})

// PUT /api/posts/:id — update (author or ADMIN only)
router.put('/:id', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const { id } = req.params
  const { category, title, content, eventDate } = req.body

  // Check ownership or admin
  const { rows: postRows } = await pool.query(
    `SELECT hp.author_id, u.role FROM history_posts hp
     LEFT JOIN users u ON u.id = $1
     WHERE hp.id = $2`,
    [authReq.userId, id]
  )

  if (postRows.length === 0) {
    res.status(404).json({ error: '게시물을 찾을 수 없습니다.' })
    return
  }

  if (postRows[0].author_id !== authReq.userId && postRows[0].role !== 'ADMIN') {
    res.status(403).json({ error: '수정 권한이 없습니다.' })
    return
  }

  await pool.query(
    `UPDATE history_posts SET category = COALESCE($1, category), title = COALESCE($2, title),
     content = COALESCE($3, content), event_date = COALESCE($4, event_date), updated_at = CURRENT_TIMESTAMP
     WHERE id = $5`,
    [category, title, content, eventDate, id]
  )

  res.json({ message: '게시물이 수정되었습니다.' })
})

// DELETE /api/posts/:id — delete (author or ADMIN only)
router.delete('/:id', verifyAuth, async (req, res) => {
  const authReq = req as AuthRequest
  const { id } = req.params

  const { rows: postRows } = await pool.query(
    `SELECT hp.author_id, u.role FROM history_posts hp
     LEFT JOIN users u ON u.id = $1
     WHERE hp.id = $2`,
    [authReq.userId, id]
  )

  if (postRows.length === 0) {
    res.status(404).json({ error: '게시물을 찾을 수 없습니다.' })
    return
  }

  if (postRows[0].author_id !== authReq.userId && postRows[0].role !== 'ADMIN') {
    res.status(403).json({ error: '삭제 권한이 없습니다.' })
    return
  }

  await pool.query(`DELETE FROM history_posts WHERE id = $1`, [id])
  res.json({ message: '게시물이 삭제되었습니다.' })
})

function mapPostRow(row: any) {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    content: row.content,
    eventDate: row.event_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: {
      id: row.author_id,
      name: row.author_name,
      nickname: row.author_nickname,
    },
    representativeImage: row.representative_image ?? null,
    likeCount: row.like_count ?? 0,
    commentCount: row.comment_count ?? 0,
  }
}

export default router
