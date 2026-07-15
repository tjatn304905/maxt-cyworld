import { useEffect, useState, type FormEvent } from 'react'
import { useAuthStore } from '../../store/authStore'
import CyButton from '../../components/ui/CyButton'
import CyInput from '../../components/ui/CyInput'
import DashedDivider from '../../components/ui/DashedDivider'

export default function ProfileEditor() {
  const { user, isLoading, error, updateProfile, clearError } = useAuthStore()

  const [name, setName] = useState(user?.name ?? '')
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // sync form when the user loads/refreshes
  useEffect(() => {
    if (user) {
      setName(user.name)
      setNickname(user.nickname)
    }
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaved(false)

    if (!name.trim() || !nickname.trim()) {
      setLocalError('이름과 닉네임을 입력해주세요.')
      return
    }
    if (newPassword && newPassword !== confirmPassword) {
      setLocalError('새 비밀번호가 서로 일치하지 않습니다.')
      return
    }
    if (newPassword && !currentPassword) {
      setLocalError('현재 비밀번호를 입력해주세요.')
      return
    }
    setLocalError(null)

    try {
      await updateProfile({
        name: name.trim(),
        nickname: nickname.trim(),
        ...(newPassword ? { currentPassword, newPassword } : {}),
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // error is set in store
    }
  }

  return (
    <div className='bg-white border-2 border-dashed border-cy-border rounded-lg p-4'>
      <h3 className='text-[14px] font-bold mb-3 text-center'>👤 내 정보 수정</h3>

      <form onSubmit={handleSubmit} className='flex flex-col gap-2 max-w-[320px] mx-auto'>
        <div className='flex items-center gap-2'>
          <label className='text-[9px] text-cy-text-light w-14 shrink-0'>이메일 (ID)</label>
          <span className='text-[9px] text-cy-text-muted truncate'>{user?.email}</span>
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-[9px] text-cy-text-light w-14 shrink-0'>이름</label>
          <CyInput
            value={name}
            onChange={(e) => { setName(e.target.value); clearError(); setLocalError(null) }}
          />
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-[9px] text-cy-text-light w-14 shrink-0'>닉네임</label>
          <CyInput
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); clearError(); setLocalError(null) }}
          />
        </div>

        <DashedDivider />

        <p className='text-[8px] text-cy-text-muted'>비밀번호를 바꾸려면 아래를 입력하세요. (비워두면 유지)</p>
        <div className='flex items-center gap-2'>
          <label className='text-[9px] text-cy-text-light w-14 shrink-0'>현재 비밀번호</label>
          <CyInput
            type='password'
            value={currentPassword}
            autoComplete='current-password'
            onChange={(e) => { setCurrentPassword(e.target.value); clearError(); setLocalError(null) }}
          />
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-[9px] text-cy-text-light w-14 shrink-0'>새 비밀번호</label>
          <CyInput
            type='password'
            value={newPassword}
            minLength={4}
            autoComplete='new-password'
            placeholder='4자 이상'
            onChange={(e) => { setNewPassword(e.target.value); clearError(); setLocalError(null) }}
          />
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-[9px] text-cy-text-light w-14 shrink-0'>비밀번호 확인</label>
          <CyInput
            type='password'
            value={confirmPassword}
            minLength={4}
            autoComplete='new-password'
            onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(null) }}
          />
        </div>

        {(localError || error) && (
          <p className='text-[8px] text-cy-tag-red text-center'>{localError || error}</p>
        )}

        <div className='flex items-center justify-center gap-2 mt-1'>
          <CyButton type='submit' variant='active' disabled={isLoading}>
            {isLoading ? '저장 중...' : '저장하기'}
          </CyButton>
          {saved && <span className='text-[9px] text-cy-cyan'>✔ 저장 완료!</span>}
        </div>
      </form>
    </div>
  )
}
