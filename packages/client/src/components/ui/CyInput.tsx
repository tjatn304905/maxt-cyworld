import { type InputHTMLAttributes, type ReactNode } from 'react'

interface CyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  icon?: ReactNode
}

export default function CyInput({ icon, className = '', ...props }: CyInputProps) {
  return (
    <div className="flex items-center gap-1 bg-white border-[1.5px] border-[#ABABAB] rounded-md px-2 py-0.5 flex-1">
      {icon && <span className="text-cy-text-muted shrink-0">{icon}</span>}
      <input
        className={`w-full text-[9px] outline-none bg-transparent font-[inherit] ${className}`}
        {...props}
      />
    </div>
  )
}
