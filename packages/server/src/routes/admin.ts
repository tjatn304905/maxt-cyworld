import { Router } from 'express'
import type { UpdateUserRoleRequest } from '@maxt/shared'
import pool from '../db/pool.js'
import { verifyAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.use(verifyAuth, requireRole('ADMIN'))

// GET /api/admin/users — member list with pagination
router.get('/users', async (req, res) => {
  const { page = '1', limit = '50' } = req.query as Record<string, string>
  const pageSize = Math.min(100, Math.max(1, parseInt(limit)))
  const offset = (Math.max(1, parseInt(page)) - 1) * pageSize

  const countResult = await pool.query(`SELECT COUNT(*) FROM users`)
  const total = parseInt(countResult.rows[0].count)

  const { rows } = await pool.query(
    `SELECT id, email, name, nickname, role, created_at
     FROM users ORDER BY created_at ASC LIMIT $1 OFFSET $2`,
    [pageSize, offset]
  )

  res.json({
    data: rows.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      nickname: row.nickname,
      role: row.role,
      createdAt: row.created_at,
    })),
    total,
    page: parseInt(page),
    limit: pageSize,
  })
})

// PATCH /api/admin/users/:id/role — grant/revoke WRITER
router.patch('/users/:id/role', async (req, res) => {
  const authReq = req as AuthRequest
  const { id } = req.params
  const { role } = req.body as UpdateUserRoleRequest

  if (role !== 'WRITER' && role !== 'USER') {
    res.status(400).json({ error: '유효하지 않은 권한입니다.' })
    return
  }

  if (id === authReq.userId) {
    res.status(400).json({ error: '자신의 권한은 변경할 수 없습니다.' })
    return
  }

  const { rows } = await pool.query(`SELECT role FROM users WHERE id = $1`, [id])
  if (rows.length === 0) {
    res.status(404).json({ error: '사용자를 찾을 수 없습니다.' })
    return
  }
  if (rows[0].role === 'ADMIN') {
    res.status(400).json({ error: '관리자의 권한은 변경할 수 없습니다.' })
    return
  }

  await pool.query(
    `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [role, id]
  )
  res.json({ message: '권한이 변경되었습니다.' })
})

export default router
