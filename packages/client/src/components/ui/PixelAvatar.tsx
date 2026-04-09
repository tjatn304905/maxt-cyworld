import { memo } from 'react'
import type { HeadType, BodyType, AccessoryType } from '../../types'

interface PixelAvatarProps {
  size?: number
  head?: HeadType
  body?: BodyType
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

function PixelAvatarInner({ size = 64, head = 'default', body = 'default', accessory = 'none' }: PixelAvatarProps) {
  const s = size
  const unit = Math.floor(s / 8)

  const headColor = HEAD_COLORS[head]
  const bodyColor = BODY_COLORS[body]

  return (
    <div className="relative pixel-render" style={{ width: s, height: s }}>
      {/* Body */}
      <div
        className="absolute rounded-sm"
        style={{
          bottom: 0, left: unit * 1.5,
          width: unit * 5, height: unit * 3,
          backgroundColor: bodyColor, border: '1px solid rgba(0,0,0,0.15)',
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

      {/* Eyes */}
      <div className="absolute bg-[#333]" style={{ top: unit * 2, left: unit * 2.8, width: unit * 0.7, height: unit * 0.7 }} />
      <div className="absolute bg-[#333]" style={{ top: unit * 2, left: unit * 4.5, width: unit * 0.7, height: unit * 0.7 }} />

      {/* Mouth */}
      <div className="absolute bg-[#ff6666] rounded-full" style={{ top: unit * 3.2, left: unit * 3.4, width: unit * 1.2, height: unit * 0.5 }} />

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
