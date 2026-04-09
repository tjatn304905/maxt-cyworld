import { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface CyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'active'
  size?: 'sm' | 'md'
  children: ReactNode
}

export default function CyButton({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}: CyButtonProps) {
  const activeClass = variant === 'active' ? '!bg-cy-text-light !text-white' : ''
  const sizeClass = size === 'sm' ? '!text-[8px] !px-1.5' : ''

  return (
    <button
      className={`cy-btn ${activeClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
