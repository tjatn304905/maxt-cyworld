interface CyTagProps {
  label: string
  color?: 'red' | 'cyan'
}

export default function CyTag({ label, color = 'red' }: CyTagProps) {
  const colorClass = color === 'cyan' ? '!bg-cy-cyan' : ''
  return <span className={`cy-tag ${colorClass}`}>{label}</span>
}
