import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import NavigationTabs from '../shared/NavigationTabs'
import { useVisitStore } from '../../store/visitStore'
// BGM feature temporarily hidden — restore later
// import { useBgmStore } from '../../store/bgmStore'
import { useAuthStore } from '../../store/authStore'
import { useRole } from '../../hooks/useRole'
import { useEffect, useState, useCallback } from 'react'
import type { TabItem } from '../../types'

const BASE_TABS: TabItem[] = [
  { to: '/', label: '홈' },
  { to: '/board', label: '게시판' },
  { to: '/photo', label: '사진첩' },
  { to: '/miniroom', label: '미니룸' },
]

export default function MiniHompyLayout() {
  const { today, total, recordVisit } = useVisitStore()
  // const loadTracks = useBgmStore((state) => state.loadTracks)
  const logout = useAuthStore((state) => state.logout)
  const { isAdmin } = useRole()
  const navigate = useNavigate()
  const [scale, setScale] = useState(1)

  const tabs = isAdmin ? [...BASE_TABS, { to: '/admin', label: '관리' }] : BASE_TABS

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const updateScale = useCallback(() => {
    // upscale only on large screens (1x~2x); below 1x the layout reflows via CSS instead of shrinking
    const frameW = 900 // frame 808 + bookmark tabs 44 + side margins
    const frameH = 590
    const sw = window.innerWidth / frameW
    const sh = window.innerHeight / frameH
    setScale(Math.max(1, Math.min(sw, sh, 2)))
  }, [])

  useEffect(() => {
    recordVisit()
    // loadTracks() // BGM feature temporarily hidden — restore later
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [updateScale])

  return (
    <div
      className="w-full max-w-[808px] max-desk:px-2 max-desk:py-3"
      style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
    >
      <div className="cyframe-outer w-full min-h-[544px] max-desk:min-h-0 relative">
        <NavigationTabs tabs={tabs} />

        <div className="cyframe-dashed">
          <div className="cyframe-inner">
            <header className="cy-header">
              <div className="cy-header-counter">
                Today <span className="text-[#FF0000]">{today}</span> | Total {total}
              </div>
              <div className="cy-header-title">
                사이좋은 사람들, 싸이월드
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="cy-header-settings bg-transparent border-none p-0 cursor-pointer hover:underline"
              >
                로그아웃 <span className="text-[#ff6400] ml-1">▶️</span>
              </button>
            </header>

            <div className="flex gap-2 max-desk:flex-col">
              <aside className="cy-sidebar h-[440px] max-desk:h-auto">
                <Sidebar />
              </aside>
              <main className="cy-main h-[440px] max-desk:h-auto overflow-y-auto scrollbar-hide">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
