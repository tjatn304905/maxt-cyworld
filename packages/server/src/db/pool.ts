import pg from 'pg'

// Hosted Postgres (Supabase) requires TLS; local dev does not
const connectionString = process.env.DATABASE_URL
const useSsl = !!connectionString && !connectionString.includes('localhost')

const pool = new pg.Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
})

// Supabase pooler drops idle connections periodically — log and let pg
// replace the client instead of killing the process (crash-loop guard)
pool.on('error', (err) => {
  console.error('Unexpected error on idle client (recovered):', err.message)
})

export default pool
