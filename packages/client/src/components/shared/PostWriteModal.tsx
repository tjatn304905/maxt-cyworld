import { useState, type FormEvent, type ChangeEvent } from 'react'
import type { PostType } from '../../types'
import type { PostDetail } from '../../services/posts'
import { usePostStore } from '../../store/postStore'
import { uploadImage } from '../../services/uploads'
import CyModal from '../ui/CyModal'
import CyInput from '../ui/CyInput'
import CyTextarea from '../ui/CyTextarea'
import CyButton from '../ui/CyButton'

interface PostWriteModalProps {
  postType: PostType
  categories: string[]
  editing?: PostDetail | null
  requireImage?: boolean
  onClose: () => void
}

export default function PostWriteModal({
  postType,
  categories,
  editing = null,
  requireImage = false,
  onClose,
}: PostWriteModalProps) {
  const { createPost, updatePost } = usePostStore()

  const [title, setTitle] = useState(editing?.title ?? '')
  const [content, setContent] = useState(editing?.content ?? '')
  const [category, setCategory] = useState(editing?.category ?? categories[0])
  const [eventDate, setEventDate] = useState(
    editing?.eventDate ? editing.eventDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  )
  const [imageUrls, setImageUrls] = useState<string[]>(
    editing?.images?.map((img) => img.imageUrl) ?? []
  )
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setIsUploading(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        const { url } = await uploadImage(file)
        setImageUrls((prev) => [...prev, url])
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (url: string) => {
    setImageUrls((prev) => prev.filter((u) => u !== url))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.')
      return
    }
    if (requireImage && imageUrls.length === 0) {
      setError('사진을 한 장 이상 업로드해주세요.')
      return
    }

    setIsSaving(true)
    setError(null)
    const images = imageUrls.map((imageUrl) => ({ imageUrl }))
    try {
      if (editing) {
        await updatePost(editing.id, postType, { category, title, content, eventDate, images })
      } else {
        await createPost({ postType, category, title, content, eventDate, images })
      }
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || '저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <CyModal title={editing ? 'EDIT POST' : 'NEW POST'} onClose={onClose}>
      <form onSubmit={handleSubmit} className='cy-write-panel flex flex-col gap-2'>
        <div className='flex gap-1.5'>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='text-[9px] bg-white border-[1.5px] border-[#ABABAB] rounded-md px-1 py-0.5 font-[inherit] outline-none'
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type='date'
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className='text-[9px] bg-white border-[1.5px] border-[#ABABAB] rounded-md px-1 py-0.5 font-[inherit] outline-none'
          />
        </div>

        <CyInput
          placeholder='제목을 입력하세요'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <CyTextarea
          placeholder='내용을 입력하세요'
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className='flex flex-col gap-1'>
          <label className='cy-btn inline-flex w-fit items-center gap-1 cursor-pointer'>
            📷 사진 첨부
            <input
              type='file'
              accept='image/*'
              multiple
              onChange={handleFileChange}
              className='hidden'
            />
          </label>
          {isUploading && <p className='text-[8px] text-cy-text-muted'>업로드 중...</p>}
          {imageUrls.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {imageUrls.map((url) => (
                <div key={url} className='relative'>
                  <img src={url} alt='첨부 이미지' className='w-12 h-12 object-cover rounded-sm border border-cy-border-light' />
                  <button
                    type='button'
                    onClick={() => removeImage(url)}
                    className='absolute -top-1 -right-1 bg-cy-tag-red text-white text-[7px] rounded-full w-3 h-3 flex items-center justify-center cursor-pointer'
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className='text-[8px] text-cy-tag-red'>{error}</p>}

        <div className='flex justify-end gap-1'>
          <CyButton type='button' onClick={onClose}>취소</CyButton>
          <CyButton type='submit' variant='active' disabled={isSaving || isUploading}>
            {isSaving ? '저장 중...' : editing ? '수정하기' : '등록하기'}
          </CyButton>
        </div>
      </form>
    </CyModal>
  )
}
