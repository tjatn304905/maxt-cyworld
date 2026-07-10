import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useAvatarStore } from '../../store/avatarStore'
import AvatarCustomizer from '../../components/shared/AvatarCustomizer'
import PixelAvatar from '../../components/ui/PixelAvatar'

type SignupStep = 'verify' | 'form' | 'avatar'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [nickname, setNickname] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [step, setStep] = useState<SignupStep>('verify')
  const { signup, isLoading, error, clearError } = useAuthStore()
  const draft = useAvatarStore((state) => state.draft)
  const navigate = useNavigate()

  const handleFormNext = (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirmPw) return
    clearError()
    setStep('avatar')
  }

  const handleSignup = async (withAvatar: boolean) => {
    try {
      await signup(name, email, password, nickname, withAvatar ? draft : undefined)
      navigate('/')
    } catch {
      // error is set in store
    }
  }

  // Step 1: fake identity verification (Cyworld nostalgia)
  if (step === 'verify') {
    return (
      <div className='retro-login-bg'>
        <Link to='/login' className='absolute top-4 left-4 text-gray-500 hover:text-gray-700'>
          <ArrowLeft size={24} />
        </Link>

        <div className='flex items-center gap-3 mb-8'>
          <PixelAvatar size={44} head='cat' body='casual' />
          <h1 className='retro-login-title'>회원가입</h1>
        </div>

        <div className='retro-login-card w-full max-w-[380px] p-6 text-center'>
          <div className='text-4xl mb-4'>🔐</div>
          <h2 className='text-base font-bold mb-2'>본인 확인</h2>
          <p className='text-xs text-gray-500 mb-6 leading-relaxed'>
            싸이월드 가입을 위해 본인 확인이 필요합니다.<br />
            아래 버튼을 눌러 진행해주세요.
          </p>

          <div className='space-y-2'>
            <button
              onClick={() => setStep('form')}
              className='w-full py-3 bg-cy-cyan text-white rounded-xl font-bold text-sm hover:bg-cy-cyan-dark transition-colors cursor-pointer'
            >
              📱 휴대폰 인증 (건너뛰기)
            </button>
            <button
              onClick={() => setStep('form')}
              className='w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors cursor-pointer'
            >
              📧 이메일 인증 (건너뛰기)
            </button>
          </div>

          <p className='text-[10px] text-gray-400 mt-4'>* 개발 환경이므로 인증 없이 가입됩니다.</p>
        </div>

        <div className='absolute bottom-8 text-center'>
          <p className='text-[10px] text-gray-400'>Copyright Cyworld Z Corp All Rights reserved.</p>
        </div>
      </div>
    )
  }

  // Step 3: avatar customization → actual signup
  if (step === 'avatar') {
    return (
      <div className='retro-login-bg'>
        <button
          onClick={() => setStep('form')}
          className='absolute top-4 left-4 text-gray-500 hover:text-gray-700 cursor-pointer'
        >
          <ArrowLeft size={24} />
        </button>

        <div className='flex items-center gap-3 mb-6'>
          <h1 className='retro-login-title'>미니미 만들기</h1>
        </div>
        <p className='text-xs text-gray-500 mb-4'>
          {nickname || name}님의 미니미를 꾸며보세요!
        </p>

        <div className='retro-login-card w-full max-w-[440px] p-4'>
          <AvatarCustomizer />
        </div>

        {error && <p className='text-red-500 text-xs text-center mt-3'>{error}</p>}

        <div className='flex flex-col items-center gap-2 mt-4 w-full max-w-[440px]'>
          <button
            onClick={() => handleSignup(true)}
            disabled={isLoading}
            className='w-full py-3 bg-cy-cyan text-white rounded-xl font-bold text-sm hover:bg-cy-cyan-dark transition-colors cursor-pointer disabled:opacity-60'
          >
            {isLoading ? '가입 중...' : '이 모습으로 시작하기 🎉'}
          </button>
          <button
            onClick={() => handleSignup(false)}
            disabled={isLoading}
            className='text-xs text-gray-400 hover:text-gray-600 cursor-pointer'
          >
            건너뛰기 (기본 미니미로 시작)
          </button>
        </div>
      </div>
    )
  }

  // Step 2: signup form
  return (
    <div className='retro-login-bg'>
      <button
        onClick={() => setStep('verify')}
        className='absolute top-4 left-4 text-gray-500 hover:text-gray-700 cursor-pointer'
      >
        <ArrowLeft size={24} />
      </button>

      <div className='flex items-center gap-3 mb-6'>
        <PixelAvatar size={44} head='bunny' body='hoodie' />
        <h1 className='retro-login-title'>정보 입력</h1>
      </div>

      <form onSubmit={handleFormNext} className='retro-login-card w-full max-w-[380px] space-y-3 p-5'>
        <div className='login-input-wrap'>
          <input
            type='text'
            value={name}
            onChange={(e) => { setName(e.target.value); clearError() }}
            placeholder='팀원 이름'
            className='login-input'
            required
          />
        </div>

        <div className='login-input-wrap'>
          <input
            type='email'
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError() }}
            placeholder='이메일 (ID)'
            className='login-input'
            autoComplete='email'
            required
          />
        </div>

        <div className='login-input-wrap'>
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError() }}
            placeholder='비밀번호 (4자 이상)'
            className='login-input'
            autoComplete='new-password'
            minLength={4}
            required
          />
          <button
            type='button'
            onClick={() => setShowPw(!showPw)}
            className='login-input-icon'
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className='login-input-wrap'>
          <input
            type={showPw ? 'text' : 'password'}
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder='비밀번호 확인'
            className='login-input'
            autoComplete='new-password'
            required
          />
        </div>
        {confirmPw && password !== confirmPw && (
          <p className='text-red-500 text-xs'>비밀번호가 일치하지 않습니다.</p>
        )}

        <div className='login-input-wrap'>
          <input
            type='text'
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); clearError() }}
            placeholder='일촌명 (ex: 팀장님짱, 코딩요정)'
            className='login-input'
            required
          />
        </div>

        {error && <p className='text-red-500 text-xs text-center'>{error}</p>}

        <button
          type='submit'
          disabled={confirmPw !== '' && password !== confirmPw}
          className='login-btn'
        >
          다음 → 미니미 만들기
        </button>
      </form>

      <p className='mt-4 text-sm text-gray-500'>
        이미 계정이 있나요?{' '}
        <Link to='/login' className='text-cy-cyan-dark font-bold hover:underline'>로그인</Link>
      </p>

      <div className='absolute bottom-8 text-center'>
        <p className='text-[10px] text-gray-400'>Copyright Cyworld Z Corp All Rights reserved.</p>
      </div>
    </div>
  )
}
