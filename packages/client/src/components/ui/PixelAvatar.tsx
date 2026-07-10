import { memo } from 'react'
import type { HeadType, BodyType, FaceType, BottomType, AccessoryType, AvatarConfig, UserAvatar } from '../../types'

interface PixelAvatarProps {
  size?: number
  head?: HeadType
  body?: BodyType
  face?: FaceType
  bottom?: BottomType
  accessory?: AccessoryType
  color?: string
}

const HEAD_COLORS: Record<HeadType, string> = {
  default: '#ffddaa',
  cat: '#ffcc88',
  bear: '#cc9966',
  bunny: '#ffccee',
  crown: '#ffddaa',
}

const BODY_COLORS: Record<BodyType, string> = {
  default: '#99ccff',
  suit: '#333333',
  casual: '#ff9999',
  sporty: '#99ff99',
  hoodie: '#cc99ff',
}

const BOTTOM_COLORS: Record<BottomType, string> = {
  default: '#7799bb',
  jeans: '#4477aa',
  shorts: '#ffcc66',
  skirt: '#ff99bb',
  training: '#555555',
}

// map DB render_key ('hair:cat', 'top:suit', ...) → PixelAvatar props
export function avatarConfigFromRenderKeys(
  keys: (string | null | undefined)[]
): AvatarConfig {
  const config: AvatarConfig = {}
  for (const key of keys) {
    if (!key) continue
    const [part, variant] = key.split(':')
    if (part === 'hair') config.head = variant as HeadType
    if (part === 'top') config.body = variant as BodyType
    if (part === 'face') config.face = variant as FaceType
    if (part === 'bottom') config.bottom = variant as BottomType
    if (part === 'accessory') config.accessory = variant as AccessoryType
  }
  return config
}

export function avatarConfigFromUserAvatar(avatar: UserAvatar | null): AvatarConfig {
  if (!avatar) return {}
  return avatarConfigFromRenderKeys([
    avatar.hair?.renderKey,
    avatar.face?.renderKey,
    avatar.cloth?.renderKey,
    avatar.bottom?.renderKey,
    avatar.accessory?.renderKey,
  ])
}

function PixelAvatarInner({
  size = 64,
  head = 'default',
  body = 'default',
  face = 'default',
  bottom = 'default',
  accessory = 'none',
}: PixelAvatarProps) {
  const s = size
  const unit = Math.floor(s / 8)

  const headColor = HEAD_COLORS[head] ?? HEAD_COLORS.default
  const bodyColor = BODY_COLORS[body] ?? BODY_COLORS.default
  const bottomColor = BOTTOM_COLORS[bottom] ?? BOTTOM_COLORS.default

  const sleepyEyes = face === 'sleepy'
  const coolEyes = face === 'cool'
  const winkEye = face === 'wink'

  return (
    <div className="relative pixel-render" style={{ width: s, height: s }}>
      {/* Body (top clothes) */}
      <div
        className="absolute rounded-sm"
        style={{
          bottom: unit * 1,
          left: unit * 1.5,
          width: unit * 5, height: unit * 2,
          backgroundColor: bodyColor, border: '1px solid rgba(0,0,0,0.15)',
        }}
      />

      {/* Bottom (pants/skirt) */}
      <div
        className="absolute rounded-sm"
        style={{
          bottom: 0,
          left: bottom === 'skirt' ? unit * 1.2 : unit * 1.8,
          width: bottom === 'skirt' ? unit * 5.6 : unit * 4.4,
          height: unit * 1.1,
          backgroundColor: bottomColor, border: '1px solid rgba(0,0,0,0.15)',
        }}
      />

      {/* Head */}
      <div
        className="absolute rounded-sm"
        style={{
          top: unit * 0.5, left: unit * 2,
          width: unit * 4, height: unit * 4,
          backgroundColor: headColor, border: '1px solid rgba(0,0,0,0.15)',
        }}
      />

      {/* Eyes (by face type) */}
      {coolEyes ? (
        <>
          <div className="absolute bg-[#111]" style={{ top: unit * 2, left: unit * 2.5, width: unit * 1.3, height: unit * 0.6 }} />
          <div className="absolute bg-[#111]" style={{ top: unit * 2, left: unit * 4.2, width: unit * 1.3, height: unit * 0.6 }} />
        </>
      ) : sleepyEyes ? (
        <>
          <div className="absolute bg-[#333]" style={{ top: unit * 2.3, left: unit * 2.8, width: unit * 0.8, height: unit * 0.2 }} />
          <div className="absolute bg-[#333]" style={{ top: unit * 2.3, left: unit * 4.4, width: unit * 0.8, height: unit * 0.2 }} />
        </>
      ) : winkEye ? (
        <>
          <div className="absolute bg-[#333]" style={{ top: unit * 2, left: unit * 2.8, width: unit * 0.7, height: unit * 0.7 }} />
          <div className="absolute bg-[#333]" style={{ top: unit * 2.3, left: unit * 4.4, width: unit * 0.8, height: unit * 0.2 }} />
        </>
      ) : (
        <>
          <div className="absolute bg-[#333]" style={{ top: unit * 2, left: unit * 2.8, width: unit * 0.7, height: unit * 0.7 }} />
          <div className="absolute bg-[#333]" style={{ top: unit * 2, left: unit * 4.5, width: unit * 0.7, height: unit * 0.7 }} />
        </>
      )}

      {/* Mouth (by face type) */}
      {face === 'smile' ? (
        <div
          className="absolute border-b-2 border-[#cc4444] rounded-b-full"
          style={{ top: unit * 2.9, left: unit * 3.2, width: unit * 1.6, height: unit * 0.8 }}
        />
      ) : face === 'sleepy' ? (
        <div className="absolute bg-[#cc7777] rounded-full" style={{ top: unit * 3.3, left: unit * 3.6, width: unit * 0.8, height: unit * 0.6 }} />
      ) : (
        <div className="absolute bg-[#ff6666] rounded-full" style={{ top: unit * 3.2, left: unit * 3.4, width: unit * 1.2, height: unit * 0.5 }} />
      )}

      {/* Accessory: Glasses */}
      {accessory === 'glasses' && (
        <>
          <div className="absolute border-2 border-[#333] rounded-full" style={{ top: unit * 1.6, left: unit * 2.2, width: unit * 1.6, height: unit * 1.2 }} />
          <div className="absolute border-2 border-[#333] rounded-full" style={{ top: unit * 1.6, left: unit * 4, width: unit * 1.6, height: unit * 1.2 }} />
          <div className="absolute bg-[#333]" style={{ top: unit * 2, left: unit * 3.8, width: unit * 0.3, height: unit * 0.15 }} />
        </>
      )}

      {/* Accessory: Hat */}
      {accessory === 'hat' && (
        <div className="absolute rounded-t-md" style={{ top: 0, left: unit * 1.5, width: unit * 5, height: unit * 1.5, backgroundColor: '#ff6666', border: '1px solid rgba(0,0,0,0.2)' }} />
      )}

      {/* Accessory: Headphones */}
      {accessory === 'headphones' && (
        <>
          <div className="absolute border-t-3 border-l-3 border-r-3 border-[#555] rounded-t-full" style={{ top: unit * 0.2, left: unit * 1.5, width: unit * 5, height: unit * 2 }} />
          <div className="absolute bg-[#555] rounded" style={{ top: unit * 1.5, left: unit * 1.2, width: unit * 1, height: unit * 1.5 }} />
          <div className="absolute bg-[#555] rounded" style={{ top: unit * 1.5, left: unit * 5.8, width: unit * 1, height: unit * 1.5 }} />
        </>
      )}

      {/* Accessory: Scarf */}
      {accessory === 'scarf' && (
        <div className="absolute" style={{ top: unit * 4.2, left: unit * 1.5, width: unit * 5, height: unit * 1, backgroundColor: '#ff9999', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '2px' }} />
      )}

      {/* Crown */}
      {head === 'crown' && (
        <div className="absolute" style={{ top: -unit * 0.3, left: unit * 2.5, width: 0, height: 0, borderLeft: `${unit * 1.5}px solid transparent`, borderRight: `${unit * 1.5}px solid transparent`, borderBottom: `${unit * 1.5}px solid #ffd700` }} />
      )}

      {/* Cat ears */}
      {head === 'cat' && (
        <>
          <div className="absolute" style={{ top: -unit * 0.2, left: unit * 2, width: 0, height: 0, borderLeft: `${unit * 0.8}px solid transparent`, borderRight: `${unit * 0.8}px solid transparent`, borderBottom: `${unit * 1.2}px solid ${headColor}` }} />
          <div className="absolute" style={{ top: -unit * 0.2, left: unit * 4.4, width: 0, height: 0, borderLeft: `${unit * 0.8}px solid transparent`, borderRight: `${unit * 0.8}px solid transparent`, borderBottom: `${unit * 1.2}px solid ${headColor}` }} />
        </>
      )}

      {/* Bunny ears */}
      {head === 'bunny' && (
        <>
          <div className="absolute rounded-full" style={{ top: -unit * 1.5, left: unit * 2.3, width: unit * 1, height: unit * 2, backgroundColor: headColor, border: '1px solid rgba(0,0,0,0.1)' }} />
          <div className="absolute rounded-full" style={{ top: -unit * 1.5, left: unit * 4.7, width: unit * 1, height: unit * 2, backgroundColor: headColor, border: '1px solid rgba(0,0,0,0.1)' }} />
        </>
      )}

      {/* Bear ears */}
      {head === 'bear' && (
        <>
          <div className="absolute rounded-full" style={{ top: -unit * 0.2, left: unit * 1.8, width: unit * 1.3, height: unit * 1.3, backgroundColor: headColor, border: '1px solid rgba(0,0,0,0.15)' }} />
          <div className="absolute rounded-full" style={{ top: -unit * 0.2, left: unit * 4.9, width: unit * 1.3, height: unit * 1.3, backgroundColor: headColor, border: '1px solid rgba(0,0,0,0.15)' }} />
        </>
      )}
    </div>
  )
}

const PixelAvatar = memo(PixelAvatarInner)
export default PixelAvatar
