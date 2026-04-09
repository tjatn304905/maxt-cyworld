import { type ReactNode, type HTMLAttributes } from 'react'

interface CyCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hoverable?: boolean
}

export default function CyCard({
  children,
  hoverable = false,
  className = '',
  ...props
}: CyCardProps) {
  const hoverClass = hoverable ? 'hover:border-cy-cyan' : ''
  return (
    <div
      className={`bg-white border-[1.5px] border-[#DDDDDD] rounded-md ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
