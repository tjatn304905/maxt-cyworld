import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import PixelAvatar from '../../components/ui/PixelAvatar'

type TabKey = 'email' | 'password'

export default function FindAccountPage() {
  const [searchParams] = useSearchParams()
  const initialTab: TabKey = searchParams.get('tab') === 'password' ? 'password' : 'email'
  const [tab, setTab] = useState<TabKey>(initialTab)

  // find email form
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [foundEmails, setFoundEmails] = useState<string[] | null>(null)

  // reset password form
  const [rpEmail, setRpEmail] = useState('')
  const [rpName, setRpName] = useState('')
  const [rpNickname, setRpNickname] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetDone, setResetDone] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const { findEmail, resetPassword, isLoading, error, clearError } = useAuthStore()

  const switchTab = (next: TabKey) => {
    setTab(next)
    setLocalError(null)
    clearError()
  }

  const handleFindEmail = async (e: FormEvent) => {
    e.preventDefault()
    setFoundEmails(null)
    try {
      const emails = await findEmail(name, nickname)
      setFoundEmails(emails)
    } catch {
      // error is set in store
    }
  }

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setLocalError('새 비밀번호가 서로 일치하지 않습니다.')
      return
    }
    setLocalError(null)
    try {
      await resetPassword(rpEmail, rpName, rpNickname, newPassword)
      setResetDone(true)
    } catch {
      // error is set in store
    }
  }

  const tabClass = (key: TabKey) =>
    `flex-1 py-2 text-sm font-bold text-center cursor-pointer border-b-2 ${
      tab === key ? 'border-cy-cyan-dark text-cy-cyan-dark' : 'border-transparent text-gray-400 hover:text-gray-600'
    }`

  return (
    <div className='retro-login-bg'>
      {/* Logo */}
      <div className='flex items-center gap-3 mb-8'>
        <PixelAvatar size={52} head='crown' body='suit' accessory='glasses' />
        <div>
          <h1 className='retro-login-title'>CYWORLD</h1>
          <p className='cy-widget-title text-center'>사이좋은 사람들</p>
        </div>
      </div>

      <div className='retro-login-card w-full max-w-[380px] p-5'>
        {/* Tabs */}
        <div className='flex mb-4'>
          <button type='button' onClick={() => switchTab('email')} className={tabClass('email')}>
            아이디 찾기
          </button>
          <button type='button' onClick={() => switchTab('password')} className={tabClass('password')}>
            비밀번호 재설정
          </button>
        </div>

        {tab === 'email' && (
          <form onSubmit={handleFindEmail} className='space-y-3'>
            <div className='login-input-wrap'>
              <input
                type='text'
                value={name}
                onChange={(e) => { setName(e.target.value); clearError() }}
                placeholder='이름'
                className='login-input'
                required
              />
            </div>
            <div className='login-input-wrap'>
              <input
                type='text'
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); clearError() }}
                placeholder='닉네임'
                className='login-input'
                required
              />
            </div>

            {error && <p className='text-red-500 text-xs text-center'>{error}</p>}

            {foundEmails && (
              <div className='bg-cy-inner-bg border border-cy-border-light rounded p-3 text-center space-y-1'>
                <p className='text-xs text-gray-500'>가입된 이메일(ID)</p>
                {foundEmails.map((masked) => (
                  <p key={masked} className='text-sm font-bold text-gray-700'>{masked}</p>
                ))}
              </div>
            )}

            <button type='submit' disabled={isLoading} className='login-btn'>
              {isLoading ? '확인 중...' : '아이디 찾기'}
            </button>
          </form>
        )}

        {tab === 'password' && (
          resetDone ? (
            <div className='space-y-4 text-center py-4'>
              <p className='text-sm font-bold text-gray-700'>비밀번호가 변경되었습니다! 🎉</p>
              <p className='text-xs text-gray-500'>새 비밀번호로 로그인해주세요.</p>
              <Link to='/login' className='login-btn block text-center'>로그인하러 가기</Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className='space-y-3'>
              <div className='login-input-wrap'>
                <input
                  type='email'
                  value={rpEmail}
                  onChange={(e) => { setRpEmail(e.target.value); clearError() }}
                  placeholder='이메일 (ID)'
                  className='login-input'
                  autoComplete='email'
                  required
                />
              </div>
              <div className='login-input-wrap'>
                <input
                  type='text'
                  value={rpName}
                  onChange={(e) => { setRpName(e.target.value); clearError() }}
                  placeholder='이름'
                  className='login-input'
                  required
                />
              </div>
              <div className='login-input-wrap'>
                <input
                  type='text'
                  value={rpNickname}
                  onChange={(e) => { setRpNickname(e.target.value); clearError() }}
                  placeholder='닉네임'
                  className='login-input'
                  required
                />
              </div>
              <div className='login-input-wrap'>
                <input
                  type='password'
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); clearError() }}
                  placeholder='새 비밀번호 (4자 이상)'
                  className='login-input'
                  autoComplete='new-password'
                  minLength={4}
                  required
                />
              </div>
              <div className='login-input-wrap'>
                <input
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(null) }}
                  placeholder='새 비밀번호 확인'
                  className='login-input'
                  autoComplete='new-password'
                  minLength={4}
                  required
                />
              </div>

              {(localError || error) && (
                <p className='text-red-500 text-xs text-center'>{localError || error}</p>
              )}

              <button type='submit' disabled={isLoading} className='login-btn'>
                {isLoading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </form>
          )
        )}
      </div>

      {/* Links */}
      <div className='flex items-center gap-2 mt-5 text-sm text-gray-500'>
        <Link to='/login' className='hover:text-gray-700'>로그인</Link>
        <span className='text-gray-300'>•</span>
        <Link to='/signup' className='text-cy-cyan-dark font-bold hover:underline'>회원가입</Link>
      </div>
    </div>
  )
}
