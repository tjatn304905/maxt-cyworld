import { useNavigate } from 'react-router-dom'
import CyTag from '../../components/ui/CyTag'
import { NEWS_ITEMS } from './data'

export default function News() {
  const navigate = useNavigate()

  return (
    <div className="w-[240px]">
      <div className="font-black text-xs text-cy-cyan">Updated News</div>
      <hr className="my-1 h-[1px] bg-cy-border border-none" />
      <div className="flex flex-col gap-0.5">
        {NEWS_ITEMS.map((diary) => (
          <div key={diary.id} className="flex items-center gap-1.5">
            <CyTag label="다이어리" />
            <div
              onClick={() => navigate('/diary')}
              className="font-black text-[9px] cursor-pointer hover:underline truncate"
            >
              {diary.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
