import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import PixelAvatar from '../../components/ui/PixelAvatar'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { login, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/')
    } catch {
      // error is set in store
    }
  }

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

      {/* Login Form */}
      <form onSubmit={handleSubmit} className='retro-login-card w-full max-w-[380px] space-y-3 p-5'>
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
          {email && (
            <button
              type='button'
              onClick={() => setEmail('')}
              className='login-input-icon'
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className='login-input-wrap'>
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError() }}
            placeholder='비밀번호'
            className='login-input'
            autoComplete='current-password'
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

        {error && <p className='text-red-500 text-xs text-center'>{error}</p>}

        <button
          type='submit'
          disabled={isLoading}
          className='login-btn'
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      {/* Links */}
      <div className='flex items-center gap-2 mt-5 text-sm text-gray-500'>
        <span className='hover:text-gray-700 cursor-pointer'>아이디 찾기</span>
        <span className='text-gray-300'>•</span>
        <span className='hover:text-gray-700 cursor-pointer'>비밀번호 재설정</span>
        <span className='text-gray-300'>•</span>
        <Link to='/signup' className='text-cy-cyan-dark font-bold hover:underline'>회원가입</Link>
      </div>

      {/* Banner (decorative) */}
      <div className='mt-8 w-full max-w-[380px] bg-gradient-to-r from-[#fff3e0] to-[#ffe0b2] border border-[#e0c090] rounded-lg p-3 flex items-center gap-3'>
        <div className='text-2xl'>🌰</div>
        <div>
          <p className='text-xs font-bold text-[#6d4c00]'>Mobile AX Team Archive</p>
          <p className='text-[10px] text-[#8d6c20]'>우리 팀의 추억을 도토리에 담아요 🌰</p>
        </div>
      </div>

      {/* Footer */}
      <div className='absolute bottom-8 text-center'>
        <div className='flex items-center gap-2 text-xs text-gray-400 mb-1'>
          <span>이용약관</span>
          <span className='text-gray-300'>|</span>
          <span className='font-bold'>개인정보처리방침</span>
          <span className='text-gray-300'>|</span>
          <span>고객센터</span>
        </div>
        <p className='text-[10px] text-gray-400'>Copyright Cyworld Z Corp All Rights reserved.</p>
      </div>
    </div>
  )
}
