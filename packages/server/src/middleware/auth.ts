import { createHash } from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { UserRole } from '@maxt/shared'
import pool from '../db/pool.js'

// JWT_SECRET 미설정 시 DATABASE_URL(이미 비밀값)에서 유도한 시크릿으로 폴백 —
// 공개 저장소의 하드코딩 시크릿으로 운영되는 것을 막으면서 배포는 항상 성공하게 한다
function deriveSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET
  if (process.env.DATABASE_URL) {
    console.warn('⚠ JWT_SECRET not set — using a secret derived from DATABASE_URL. Set JWT_SECRET explicitly.')
    return createHash('sha256').update(process.env.DATABASE_URL).digest('hex')
  }
  return 'maxt-cyworld-secret-dev-key-2024'
}

const JWT_SECRET = deriveSecret()

const ROLE_LEVEL: Record<UserRole, number> = {
  USER: 0,
  WRITER: 1,
  ADMIN: 2,
}

export interface AuthRequest extends Request {
  userId?: string
  role?: UserRole
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: '인증이 필요합니다.' })
    return
  }

  try {
    const token = header.slice(7)
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ error: '유효하지 않은 토큰입니다.' })
  }
}

// Token is optional: attaches userId if a valid token exists, otherwise passes through
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: string }
      req.userId = payload.userId
    } catch {
      // invalid token is treated as anonymous
    }
  }
  next()
}

// Role is checked against DB on every request so revocation takes effect immediately
export function requireRole(minRole: UserRole) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [req.userId])
      if (rows.length === 0) {
        res.status(401).json({ error: '사용자를 찾을 수 없습니다.' })
        return
      }
      const role = rows[0].role as UserRole
      if (ROLE_LEVEL[role] < ROLE_LEVEL[minRole]) {
        res.status(403).json({ error: '권한이 없습니다.' })
        return
      }
      req.role = role
      next()
    } catch (err) {
      console.error('requireRole error:', err)
      res.status(500).json({ error: '서버 오류가 발생했습니다.' })
    }
  }
}
