import { useEffect, useMemo, useState } from 'react'
import type { ItemCategory } from '../../types'
import { useAvatarStore } from '../../store/avatarStore'
import PixelAvatar, { avatarConfigFromRenderKeys } from '../ui/PixelAvatar'

const CATEGORY_TABS: { key: ItemCategory; label: string }[] = [
  { key: 'HAIR', label: '헤어' },
  { key: 'FACE', label: '얼굴' },
  { key: 'CLOTHES', label: '상의' },
  { key: 'BOTTOM', label: '하의' },
  { key: 'ACCESSORY', label: '악세사리' },
]

const SLOT_KEYS: Record<ItemCategory, 'hairId' | 'faceId' | 'clothId' | 'bottomId' | 'accessoryId'> = {
  HAIR: 'hairId',
  FACE: 'faceId',
  CLOTHES: 'clothId',
  BOTTOM: 'bottomId',
  ACCESSORY: 'accessoryId',
}

export default function AvatarCustomizer() {
  const { items, draft, loadItems, setDraftItem } = useAvatarStore()
  const [activeTab, setActiveTab] = useState<ItemCategory>('HAIR')

  useEffect(() => {
    loadItems()
  }, [loadItems])

  // preview config from currently drafted item ids
  const previewConfig = useMemo(() => {
    const selectedIds = Object.values(draft).filter((id): id is number => id != null)
    const keys = items.filter((item) => selectedIds.includes(item.id)).map((item) => item.renderKey)
    return avatarConfigFromRenderKeys(keys)
  }, [items, draft])

  const tabItems = items.filter((item) => item.category === activeTab)
  const selectedId = draft[SLOT_KEYS[activeTab]]

  return (
    <div className='flex gap-3 w-full'>
      {/* preview */}
      <div className='cy-panel flex flex-col items-center justify-center w-32 shrink-0'>
        <PixelAvatar size={88} {...previewConfig} />
        <p className='cy-widget-title mt-2'>MY MINIMI</p>
      </div>

      {/* item picker */}
      <div className='flex-1 min-w-0'>
        <div className='flex gap-0.5 mb-1.5 flex-wrap'>
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              type='button'
              onClick={() => setActiveTab(tab.key)}
              className={`cy-btn !text-[8px] ${activeTab === tab.key ? '!bg-cy-text-light !text-white' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className='grid grid-cols-4 gap-1.5 max-h-52 overflow-y-auto scrollbar-hide pr-0.5'>
          {tabItems.map((item) => {
            const config = avatarConfigFromRenderKeys([item.renderKey])
            const isSelected = selectedId === item.id
            return (
              <button
                key={item.id}
                type='button'
                onClick={() => setDraftItem(activeTab, item.id)}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-md border-[1.5px] cursor-pointer bg-white transition-colors ${
                  isSelected ? 'border-cy-cyan' : 'border-cy-border-light hover:border-cy-cyan'
                }`}
              >
                <PixelAvatar size={36} {...config} />
                <span className='text-[7px] text-cy-text-light'>{item.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
