import { Router } from 'express'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import { verifyAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'post-images'

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('IMAGE_ONLY'))
      return
    }
    cb(null, true)
  },
})

// POST /api/uploads — upload one image to Supabase Storage, returns public URL
router.post('/', verifyAuth, (req, res) => {
  if (!supabase) {
    res.status(503).json({ error: '이미지 업로드가 설정되지 않았습니다.' })
    return
  }

  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.message === 'IMAGE_ONLY') {
        res.status(400).json({ error: '이미지 파일만 업로드할 수 있습니다.' })
        return
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: '이미지는 5MB 이하만 업로드할 수 있습니다.' })
        return
      }
      res.status(400).json({ error: '파일 업로드에 실패했습니다.' })
      return
    }

    const authReq = req as AuthRequest
    const file = (req as any).file as Express.Multer.File | undefined
    if (!file) {
      res.status(400).json({ error: '파일이 없습니다.' })
      return
    }

    const ext = file.originalname.includes('.')
      ? file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase()
      : ''
    const path = `${authReq.userId}/${Date.now()}${ext}`

    const { error } = await supabase.storage.from(BUCKET).upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    })
    if (error) {
      console.error('storage upload error:', error)
      res.status(500).json({ error: '이미지 업로드에 실패했습니다.' })
      return
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    res.status(201).json({ url: data.publicUrl })
  })
})

export default router
