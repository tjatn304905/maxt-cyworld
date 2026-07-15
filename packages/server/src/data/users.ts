import type { User, UserRole } from '@maxt/shared'
import pool from '../db/pool.js'

// pool or transaction client — both expose query()
type Queryable = { query: (text: string, params?: any[]) => Promise<any> }

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

export async function findEmailsByNameAndNickname(name: string, nickname: string): Promise<string[]> {
  const { rows } = await pool.query(
    `SELECT email FROM users WHERE name = $1 AND nickname = $2`,
    [name, nickname]
  )
  return rows.map((row: any) => row.email)
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  await pool.query(`UPDATE users SET password = $1 WHERE id = $2`, [passwordHash, id])
}

export async function updateUserProfile(
  id: string,
  data: { name?: string; nickname?: string; passwordHash?: string }
): Promise<StoredUser | undefined> {
  const { rows } = await pool.query(
    `UPDATE users
     SET name = COALESCE($1, name),
         nickname = COALESCE($2, nickname),
         password = COALESCE($3, password)
     WHERE id = $4
     RETURNING id, email, password, name, nickname, role, created_at`,
    [data.name ?? null, data.nickname ?? null, data.passwordHash ?? null, id]
  )
  if (rows.length === 0) return undefined
  return mapRow(rows[0])
}

export async function findUserRole(id: string): Promise<UserRole | undefined> {
  const { rows } = await pool.query(`SELECT role FROM users WHERE id = $1`, [id])
  if (rows.length === 0) return undefined
  return rows[0].role
}

export async function createUser(
  data: {
    name: string
    email: string
    passwordHash: string
    nickname: string
  },
  db: Queryable = pool
): Promise<StoredUser> {
  const { rows } = await db.query(
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
