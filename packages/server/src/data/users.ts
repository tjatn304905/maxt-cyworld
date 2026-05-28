import type { User } from '@maxt/shared'
import pool from '../db/pool.js'

interface StoredUser extends User {
  password: string
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const { rows } = await pool.query(
    `SELECT id, email, password, name, nickname, role, created_at FROM users WHERE email = $1`,
    [email]
  )
  if (rows.length === 0) return undefined
  return mapRow(rows[0])
}

export async function findUserById(id: string): Promise<StoredUser | undefined> {
  const { rows } = await pool.query(
    `SELECT id, email, password, name, nickname, role, created_at FROM users WHERE id = $1`,
    [id]
  )
  if (rows.length === 0) return undefined
  return mapRow(rows[0])
}

export async function createUser(data: {
  name: string
  email: string
  passwordHash: string
  nickname: string
}): Promise<StoredUser> {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password, name, nickname) VALUES ($1, $2, $3, $4)
     RETURNING id, email, password, name, nickname, role, created_at`,
    [data.email, data.passwordHash, data.name, data.nickname]
  )
  return mapRow(rows[0])
}

export function toPublicUser(user: StoredUser): User {
  const { password, ...publicUser } = user
  return publicUser
}

function mapRow(row: any): StoredUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    nickname: row.nickname,
    role: row.role,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    password: row.password,
  }
}
