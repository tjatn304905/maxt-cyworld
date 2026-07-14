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
        <Link to='/find-account' className='hover:text-gray-700'>아이디 찾기</Link>
        <span className='text-gray-300'>•</span>
        <Link to='/find-account?tab=password' className='hover:text-gray-700'>비밀번호 재설정</Link>
        <span className='text-gray-300'>•</span>
        <Link to='/signup' className='text-cy-cyan-dark font-bold hover:underline'>회원가입</Link>
      </div>
    </div>
  )
}
