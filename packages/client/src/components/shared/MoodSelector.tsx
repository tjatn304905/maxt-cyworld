import type { Mood } from '../../types'

interface MoodSelectorProps {
  moods: Mood[]
  value: string
  onChange: (value: string) => void
}

export default function MoodSelector({ moods, value, onChange }: MoodSelectorProps) {
  return (
    <div className="w-full pt-12 px-4 font-[Pretendard] text-xs">
      <p className="font-bold text-[10px]">오늘의 기분</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#DDDDDD] text-[10px] py-0.5 px-1 border-none outline-none rounded-sm font-[inherit] cursor-pointer"
      >
        {moods.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
    </div>
  )
}
