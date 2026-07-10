import { useEffect, useState } from 'react'
import { useAvatarStore } from '../../store/avatarStore'
import AvatarCustomizer from '../../components/shared/AvatarCustomizer'
import CyButton from '../../components/ui/CyButton'

export default function AvatarBuilder() {
  const { loadMyAvatar, saveDraft, resetDraftFromEquipped, isLoading, error } = useAvatarStore()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadMyAvatar()
  }, [loadMyAvatar])

  const handleSave = async () => {
    setSaved(false)
    try {
      await saveDraft()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // error is set in store
    }
  }

  return (
    <div className='bg-white border-2 border-dashed border-cy-border rounded-lg p-4'>
      <h3 className='text-[14px] font-bold mb-3 text-center'>🧑‍🎨 미니미 만들기</h3>
      <AvatarCustomizer />
      <div className='flex items-center justify-center gap-2 mt-3'>
        <CyButton onClick={resetDraftFromEquipped}>되돌리기</CyButton>
        <CyButton variant='active' onClick={handleSave} disabled={isLoading}>
          {isLoading ? '저장 중...' : '저장하기'}
        </CyButton>
        {saved && <span className='text-[9px] text-cy-cyan'>✔ 저장 완료!</span>}
      </div>
      {error && <p className='text-[8px] text-cy-tag-red text-center mt-1'>{error}</p>}
    </div>
  )
}
