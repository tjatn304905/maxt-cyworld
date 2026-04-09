import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import NavigationTabs from '../shared/NavigationTabs'
import { useVisitStore } from '../../store/visitStore'
import { useEffect, useState, useCallback } from 'react'
import type { TabItem } from '../../types'

const TABS: TabItem[] = [
  { to: '/', label: '홈' },
  { to: '/photo', label: '사진첩' },
  { to: '/diary', label: '다이어리' },
  { to: '/board', label: '게시판' },
]

export default function MiniHompyLayout() {
  const { today, total, recordVisit } = useVisitStore()
  const [scale, setScale] = useState(1)

  const updateScale = useCallback(() => {
    const frameW = 860
    const frameH = 570
    const sw = window.innerWidth / frameW
    const sh = window.innerHeight / frameH
    setScale(Math.min(sw, sh, 2))
  }, [])

  useEffect(() => {
    recordVisit()
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [updateScale])

  return (
    <div
      className="flex items-center justify-center"
      style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
    >
      <div className="cyframe-outer w-[808px] min-h-[544px] relative">
        <NavigationTabs tabs={TABS} />

        <div className="cyframe-dashed">
          <div className="cyframe-inner">
            <header className="cy-header">
              <div className="cy-header-counter">
                Today <span className="text-[#FF0000]">{today}</span> | Total {total}
              </div>
              <div className="cy-header-title">
                사이좋은 사람들, 싸이월드
              </div>
              <div className="cy-header-settings">
                사생활보호설정 <span className="text-[#ff6400] ml-1">▶️</span>
              </div>
            </header>

            <div className="flex gap-2">
              <aside className="cy-sidebar h-[440px]">
                <Sidebar />
              </aside>
              <main className="cy-main h-[440px] overflow-y-auto scrollbar-hide">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
