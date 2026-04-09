import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [ilchonName, setIlchonName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [step, setStep] = useState<'verify' | 'form'>('verify')
  const { signup, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirmPw) {
      return
    }
    try {
      await signup(name, email, password, ilchonName)
      navigate('/')
    } catch {
      // error is set in store
    }
  }

  // Step 1: Fake identity verification (visual only, Cyworld nostalgia)
  if (step === 'verify') {
    return (
      <div className="login-bg">
        <Link to="/login" className="absolute top-4 left-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={24} />
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#ff6000] rounded-full flex items-center justify-center">
            <span className="text-white text-lg">☺</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">회원가입</h1>
        </div>

        <div className="w-full max-w-[380px] bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-base font-bold mb-2">본인 확인</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            싸이월드 가입을 위해 본인 확인이 필요합니다.<br />
            아래 버튼을 눌러 진행해주세요.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => setStep('form')}
              className="w-full py-3 bg-[#ff6000] text-white rounded-xl font-bold text-sm hover:bg-[#e55500] transition-colors"
            >
              📱 휴대폰 인증 (건너뛰기)
            </button>
            <button
              onClick={() => setStep('form')}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              📧 이메일 인증 (건너뛰기)
            </button>
          </div>

          <p className="text-[10px] text-gray-400 mt-4">* 개발 환경이므로 인증 없이 가입됩니다.</p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 text-center">
          <p className="text-[10px] text-gray-300">Copyright Cyworld Z Corp All Rights reserved.</p>
        </div>
      </div>
    )
  }

  // Step 2: Actual signup form
  return (
    <div className="login-bg">
      <button
        onClick={() => setStep('verify')}
        className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#ff6000] rounded-full flex items-center justify-center">
          <span className="text-white text-lg">☺</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900">정보 입력</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-[380px] space-y-3">
        {/* Name */}
        <div className="login-input-wrap">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError() }}
            placeholder="팀원 이름"
            className="login-input"
            required
          />
        </div>

        {/* Email */}
        <div className="login-input-wrap">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError() }}
            placeholder="이메일 (ID)"
            className="login-input"
            autoComplete="email"
            required
          />
        </div>

        {/* Password */}
        <div className="login-input-wrap">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError() }}
            placeholder="비밀번호 (4자 이상)"
            className="login-input"
            autoComplete="new-password"
            minLength={4}
            required
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="login-input-icon"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="login-input-wrap">
          <input
            type={showPw ? 'text' : 'password'}
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="비밀번호 확인"
            className="login-input"
            autoComplete="new-password"
            required
          />
        </div>
        {confirmPw && password !== confirmPw && (
          <p className="text-red-500 text-xs">비밀번호가 일치하지 않습니다.</p>
        )}

        {/* Il-chon Nickname */}
        <div className="login-input-wrap">
          <input
            type="text"
            value={ilchonName}
            onChange={(e) => { setIlchonName(e.target.value); clearError() }}
            placeholder="일촌명 (ex: 팀장님짱, 코딩요정)"
            className="login-input"
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || (confirmPw !== '' && password !== confirmPw)}
          className="login-btn"
        >
          {isLoading ? '가입 중...' : '가입하기'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-500">
        이미 계정이 있나요?{' '}
        <Link to="/login" className="text-[#ff6000] font-bold hover:underline">로그인</Link>
      </p>

      <div className="absolute bottom-8 text-center">
        <p className="text-[10px] text-gray-300">Copyright Cyworld Z Corp All Rights reserved.</p>
      </div>
    </div>
  )
}
