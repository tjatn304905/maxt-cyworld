import type { DiaryEntry } from '../../types'
import CyButton from '../../components/ui/CyButton'

interface DiaryDetailProps {
  diary: DiaryEntry
  onClose: () => void
}

export default function DiaryDetail({ diary, onClose }: DiaryDetailProps) {
  return (
    <div className="w-full mb-2 border-[1.5px] border-[#DDDDDD] rounded-sm">
      <div className="flex items-center pl-3 h-5 bg-[#DDDDDD]">
        <p className="text-cy-text-light text-[9px] font-medium">{diary.date}</p>
      </div>
      <div className="flex flex-col justify-center items-center py-3">
        <h1 className="font-bold text-[10px]">제목 : {diary.title}</h1>
        <p className="text-[9px] text-cy-text-light mt-1.5 px-3">{diary.content}</p>
        <p className="text-[8px] text-cy-text-muted mt-1.5">✍️ {diary.author}</p>
      </div>
      <div className="flex justify-center pb-1.5">
        <CyButton onClick={onClose} size="sm">목록으로</CyButton>
      </div>
    </div>
  )
}
