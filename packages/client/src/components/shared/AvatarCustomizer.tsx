import { useEffect, useMemo, useState } from 'react'
import type { ItemCategory } from '../../types'
import { useAvatarStore } from '../../store/avatarStore'
import PixelAvatar, { avatarConfigFromRenderKeys } from '../ui/PixelAvatar'
import { resolveRenderKey } from '../ui/avatarCatalog'

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

// item cells zoom into the body part the item affects (44px window, 80px avatar)
const PREVIEW_WINDOW = 44
const PREVIEW_AVATAR = 80
const TORSO_ACCESSORIES = ['scarf', 'bowtie', 'necklace']

function previewOffsetY(category: ItemCategory, renderKey: string | null): number {
  if (category === 'HAIR') return 6
  if (category === 'FACE') return -4
  if (category === 'CLOTHES') return -26
  if (category === 'BOTTOM') return -32
  const variant = renderKey?.split(':')[1] ?? ''
  if (TORSO_ACCESSORIES.includes(variant)) return -24
  if (variant === 'none') return -16
  return -2
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
    const keys = items
      .filter((item) => selectedIds.includes(item.id))
      .map((item) => resolveRenderKey(item.category, item.name, item.renderKey))
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
            const config = avatarConfigFromRenderKeys([
              resolveRenderKey(item.category, item.name, item.renderKey),
            ])
            const isSelected = selectedId === item.id
            return (
              <button
                key={item.id}
                type='button'
                onClick={() => setDraftItem(activeTab, item.id)}
                className={`flex flex-col items-center gap-0.5 p-1 rounded-md border-[1.5px] cursor-pointer bg-white transition-colors ${
                  isSelected ? 'border-cy-cyan' : 'border-cy-border-light hover:border-cy-cyan'
                }`}
              >
                <span
                  className='relative block overflow-hidden rounded-sm'
                  style={{ width: PREVIEW_WINDOW, height: PREVIEW_WINDOW }}
                >
                  <span
                    className='absolute'
                    style={{
                      left: (PREVIEW_WINDOW - PREVIEW_AVATAR) / 2,
                      top: previewOffsetY(activeTab, item.renderKey),
                    }}
                  >
                    <PixelAvatar size={PREVIEW_AVATAR} {...config} />
                  </span>
                </span>
                <span className='text-[7px] text-cy-text-light'>{item.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
