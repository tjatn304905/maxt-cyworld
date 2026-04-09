import CyButton from './CyButton'

interface PageHeaderProps {
  title: string
  subtitle: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="w-full py-2 px-3">
      <div className="flex justify-between items-center">
        <p className="uppercase text-[8px] font-extrabold">
          <span className="page-header-title">{title}</span>{' '}
          <span className="page-header-subtitle">{subtitle}</span>
        </p>
        {action && (
          <CyButton onClick={action.onClick} size="sm">
            {action.label}
          </CyButton>
        )}
      </div>
      <hr className="page-header-hr" />
    </div>
  )
}
