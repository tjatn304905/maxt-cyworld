import { createClient } from '@supabase/supabase-js'
import pool from '../db/pool.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export const BUCKET = 'post-images'

// null when storage env is not configured — callers degrade gracefully
export const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null

// public URL → object path inside the bucket, or null if it is not one of ours
export function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + marker.length))
}

// remove bucket objects for URLs no longer referenced by any post_images row.
// call AFTER the DB delete/update has committed so the reference check is accurate.
export async function deleteOrphanImages(urls: string[]): Promise<void> {
  if (!supabase || urls.length === 0) return

  const paths: string[] = []
  for (const url of urls) {
    const path = storagePathFromUrl(url)
    if (!path) continue
    const { rows } = await pool.query(
      `SELECT 1 FROM post_images WHERE image_url = $1 LIMIT 1`,
      [url]
    )
    if (rows.length === 0) paths.push(path)
  }

  if (paths.length === 0) return
  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) console.error('storage cleanup error:', error.message)
}
