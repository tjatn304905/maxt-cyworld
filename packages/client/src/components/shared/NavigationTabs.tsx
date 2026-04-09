import { NavLink } from 'react-router-dom'
import type { TabItem } from '../../types'

interface NavigationTabsProps {
  tabs: TabItem[]
  className?: string
}

export default function NavigationTabs({ tabs, className = '' }: NavigationTabsProps) {
  return (
    <div className={`absolute top-16 -right-[44px] text-[9px] flex flex-col gap-0.5 z-30 ${className}`}>
      {tabs.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `bookmark-tab ${isActive ? 'active' : 'inactive'}`
          }
        >
          {label}
        </NavLink>
      ))}
    </div>
  )
}
