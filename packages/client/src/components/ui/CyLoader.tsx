import PixelAvatar from './PixelAvatar'

interface CyLoaderProps {
  message?: string
  size?: 'sm' | 'md'
  fullPage?: boolean
  className?: string
}

export default function CyLoader({
  message = '로딩 중',
  size = 'md',
  fullPage = false,
  className = '',
}: CyLoaderProps) {
  const body = (
    <div className={`cy-loader ${className}`}>
      <span className='cy-loader-minimi'>
        <PixelAvatar size={size === 'sm' ? 40 : 64} />
      </span>
      <span className='cy-loader-shadow' />
      <p className='cy-loader-msg'>
        {message}<span>.</span><span>.</span><span>.</span>
      </p>
    </div>
  )

  if (fullPage) {
    return <div className='login-bg'>{body}</div>
  }
  return body
}
