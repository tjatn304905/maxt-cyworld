import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { UserRole } from '@maxt/shared'
import pool from '../db/pool.js'

// production에서는 반드시 환경변수로 설정해야 함 (미설정 시 즉시 실패)
const JWT_SECRET = process.env.JWT_SECRET || 'maxt-cyworld-secret-dev-key-2024'
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.')
}

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
