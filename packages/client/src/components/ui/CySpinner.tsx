interface CySpinnerProps {
  label?: string
  className?: string
}

export default function CySpinner({ label, className = '' }: CySpinnerProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className='cy-spinner'><span /><span /><span /></span>
      {label && <span className='font-neo text-[8px] text-cy-text-muted'>{label}</span>}
    </span>
  )
}
