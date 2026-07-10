import { type TextareaHTMLAttributes } from 'react'

interface CyTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function CyTextarea({ className = '', ...props }: CyTextareaProps) {
  return (
    <textarea
      className={`w-full text-[9px] outline-none bg-white border-[1.5px] border-[#ABABAB] rounded-md px-2 py-1 font-[inherit] resize-none ${className}`}
      {...props}
    />
  )
}
