import pg from 'pg'

// Hosted Postgres (Supabase) requires TLS; local dev does not
const connectionString = process.env.DATABASE_URL
const useSsl = !!connectionString && !connectionString.includes('localhost')

const pool = new pg.Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export default pool
