import type { User } from '@maxt/shared'

interface StoredUser extends User {
  passwordHash: string
}

// In-memory dummy database
const users: StoredUser[] = [
  {
    id: '1',
    name: '김팀장',
    email: 'kim@maxt.com',
    ilchonName: '팀장님짱',
    passwordHash: '$2a$10$xJ0Bz3z5z5z5z5z5z5z5z.placeholder', // will be set on startup
    createdAt: '2024-01-01',
  },
]

let initialized = false

export async function initDummyData() {
  if (initialized) return
  const bcrypt = await import('bcryptjs')
  // Set default password "1234" for the demo user
  users[0].passwordHash = await bcrypt.hash('1234', 10)
  initialized = true
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return users.find((u) => u.email === email)
}

export function findUserById(id: string): StoredUser | undefined {
  return users.find((u) => u.id === id)
}

export function createUser(data: {
  name: string
  email: string
  passwordHash: string
  ilchonName: string
}): StoredUser {
  const newUser: StoredUser = {
    id: String(Date.now()),
    name: data.name,
    email: data.email,
    ilchonName: data.ilchonName,
    passwordHash: data.passwordHash,
    createdAt: new Date().toISOString().slice(0, 10),
  }
  users.push(newUser)
  return newUser
}

export function toPublicUser(user: StoredUser): User {
  const { passwordHash, ...publicUser } = user
  return publicUser
}
