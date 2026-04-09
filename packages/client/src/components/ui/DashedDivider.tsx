interface DashedDividerProps {
  className?: string
}

export default function DashedDivider({ className = '' }: DashedDividerProps) {
  return <hr className={`border-dashed border-black my-2 ${className}`} />
}
