import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { usePostStore } from '../../store/postStore'
import { useAuthStore } from '../../store/authStore'
import { useRole } from '../../hooks/useRole'
import { extractImageUrls } from '../../utils/postHtml'
import PageHeader from '../../components/ui/PageHeader'
import CyButton from '../../components/ui/CyButton'
import CyInput from '../../components/ui/CyInput'
import RichTextEditor from '../../components/shared/RichTextEditor'
import { BOARD_CATEGORIES } from './categories'

export default function BoardEditorPage() {
  const { id } = useParams()
  const isEdit = id != null
  const postId = Number(id)
  const navigate = useNavigate()

  const user = useAuthStore((state) => state.user)
  const { canWrite, isAdmin } = useRole()
  const { currentPost, fetchPost, createPost, updatePost } = usePostStore()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string>(BOARD_CATEGORIES[0])
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10))
  const [content, setContent] = useState('')
  const [loaded, setLoaded] = useState(!isEdit)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isEdit && !Number.isNaN(postId)) {
      fetchPost(postId)
    }
  }, [isEdit, postId, fetchPost])

  // populate form once the post to edit arrives
  useEffect(() => {
    if (isEdit && currentPost && currentPost.id === postId && !loaded) {
      setTitle(currentPost.title)
      setCategory(currentPost.category)
      setEventDate(currentPost.eventDate?.slice(0, 10) ?? eventDate)
      setContent(currentPost.content)
      setLoaded(true)
    }
  }, [isEdit, currentPost, postId, loaded, eventDate])

  if (!canWrite) {
    return <Navigate to='/board' replace />
  }
  if (isEdit && loaded && currentPost && currentPost.author?.id !== user?.id && !isAdmin) {
    return <Navigate to={`/board/${postId}`} replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const plainText = content.replace(/<[^>]*>/g, '').trim()
    const hasImage = extractImageUrls(content).length > 0
    if (!title.trim() || (!plainText && !hasImage)) {
      setError('제목과 내용을 입력해주세요.')
      return
    }

    setIsSaving(true)
    setError(null)
    const images = extractImageUrls(content).map((imageUrl) => ({ imageUrl }))
    try {
      if (isEdit) {
        await updatePost(postId, { category, title, content, eventDate, images })
        navigate(`/board/${postId}`)
      } else {
        const newId = await createPost({ category, title, content, eventDate, images })
        navigate(`/board/${newId}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isEdit && !loaded) {
    return <p className='text-[9px] text-cy-text-muted text-center py-8'>불러오는 중...</p>
  }

  return (
    <div className='flex flex-col px-4 h-full overflow-y-auto scrollbar-hide'>
      <PageHeader title='Board' subtitle={isEdit ? 'Edit Story' : 'New Story'} />

      <form onSubmit={handleSubmit} className='flex flex-col gap-2 pb-3'>
        <div className='flex gap-1.5 items-center'>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='text-[9px] bg-white border-[1.5px] border-[#ABABAB] rounded-md px-1 py-0.5 font-[inherit] outline-none'
          >
            {BOARD_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type='date'
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className='text-[9px] bg-white border-[1.5px] border-[#ABABAB] rounded-md px-1 py-0.5 font-[inherit] outline-none'
          />
          <CyInput
            placeholder='제목을 입력하세요'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <RichTextEditor content={content} onChange={setContent} />

        {error && <p className='text-[8px] text-cy-tag-red'>{error}</p>}

        <div className='flex justify-end gap-1'>
          <CyButton type='button' onClick={() => navigate(isEdit ? `/board/${postId}` : '/board')}>
            취소
          </CyButton>
          <CyButton type='submit' variant='active' disabled={isSaving}>
            {isSaving ? '저장 중...' : isEdit ? '수정하기' : '등록하기'}
          </CyButton>
        </div>
      </form>
    </div>
  )
}
