import bcrypt from 'bcryptjs'
import pool from './pool.js'

export async function seed() {
  const client = await pool.connect()
  try {
    // Check if demo user already exists
    const { rows } = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      ['kim@maxt.com']
    )

    if (rows.length > 0) {
      console.log('✅ Seed data already exists, skipping.')
      return
    }

    await client.query('BEGIN')

    // 1. Seed default avatar items
    const avatarItems = [
      { category: 'HAIR', name: 'Default Hair', image_url: '/avatars/hair_default.png' },
      { category: 'FACE', name: 'Default Face', image_url: '/avatars/face_default.png' },
      { category: 'CLOTHES', name: 'Default Clothes', image_url: '/avatars/clothes_default.png' },
      { category: 'ACCESSORY', name: 'No Accessory', image_url: '/avatars/accessory_none.png' },
    ]

    const itemIds: Record<string, number> = {}
    for (const item of avatarItems) {
      const result = await client.query(
        `INSERT INTO avatar_items (category, name, image_url, is_default) VALUES ($1, $2, $3, TRUE) RETURNING id`,
        [item.category, item.name, item.image_url]
      )
      itemIds[item.category] = result.rows[0].id
    }

    // 2. Seed demo user
    const passwordHash = await bcrypt.hash('1234', 10)
    const userResult = await client.query(
      `INSERT INTO users (email, password, name, nickname, role) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['kim@maxt.com', passwordHash, '김팀장', '팀장님짱', 'USER']
    )
    const userId = userResult.rows[0].id

    // 3. Create default avatar for demo user
    await client.query(
      `INSERT INTO avatars (user_id, hair_id, face_id, cloth_id, accessory_id) VALUES ($1, $2, $3, $4, $5)`,
      [userId, itemIds['HAIR'], itemIds['FACE'], itemIds['CLOTHES'], itemIds['ACCESSORY']]
    )

    await client.query('COMMIT')
    console.log('🌱 Seed data created successfully.')
    console.log(`📧 Demo account: kim@maxt.com / 1234`)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
