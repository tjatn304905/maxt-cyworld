import { memo, useEffect, useRef } from 'react'
import type {
  HeadType, BodyType, FaceType, BottomType, AccessoryType, AvatarConfig, UserAvatar,
} from '../../types'
import { resolveRenderKey } from './avatarCatalog'
import { SPRITE_BASE, SPRITE_LAYERS, GRID_W, GRID_H, type SpriteLayer } from './sprites'

interface PixelAvatarProps {
  size?: number
  head?: HeadType
  body?: BodyType
  face?: FaceType
  bottom?: BottomType
  accessory?: AccessoryType
  color?: string
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
  // resolveRenderKey falls back to category+name lookup when the API
  // response predates renderKey (old server builds)
  return avatarConfigFromRenderKeys([
    avatar.hair ? resolveRenderKey('HAIR', avatar.hair.name, avatar.hair.renderKey) : null,
    avatar.face ? resolveRenderKey('FACE', avatar.face.name, avatar.face.renderKey) : null,
    avatar.cloth ? resolveRenderKey('CLOTHES', avatar.cloth.name, avatar.cloth.renderKey) : null,
    avatar.bottom ? resolveRenderKey('BOTTOM', avatar.bottom.name, avatar.bottom.renderKey) : null,
    avatar.accessory ? resolveRenderKey('ACCESSORY', avatar.accessory.name, avatar.accessory.renderKey) : null,
  ])
}

function layerFor(part: string, variant: string): SpriteLayer | null {
  return SPRITE_LAYERS[`${part}:${variant}`] ?? SPRITE_LAYERS[`${part}:default`] ?? null
}

function drawLayer(ctx: CanvasRenderingContext2D, layer: SpriteLayer): void {
  for (const [rowIdx, row] of Object.entries(layer.rows)) {
    const y = Number(rowIdx)
    for (let x = 0; x < Math.min(row.length, GRID_W); x++) {
      const ch = row[x]
      if (ch === '.' || ch === ' ') continue
      const color = layer.palette[ch]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(x, y, 1, 1)
    }
  }
}

function PixelAvatarInner({
  size = 64,
  head = 'default',
  body = 'default',
  face = 'default',
  bottom = 'default',
  accessory = 'none',
}: PixelAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, GRID_W, GRID_H)
    // layer order: base → bottom → top → face → hair → accessory
    const layers = [
      SPRITE_BASE,
      layerFor('bottom', bottom),
      layerFor('top', body),
      layerFor('face', face),
      layerFor('hair', head),
      accessory === 'none' ? null : layerFor('accessory', accessory),
    ]
    for (const layer of layers) {
      if (layer) drawLayer(ctx, layer)
    }
  }, [head, body, face, bottom, accessory])

  return (
    <div
      className="relative pixel-render flex items-end justify-center"
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        width={GRID_W}
        height={GRID_H}
        style={{
          width: size * (GRID_W / GRID_H),
          height: size,
          imageRendering: 'pixelated',
        }}
      />
    </div>
  )
}

const PixelAvatar = memo(PixelAvatarInner)
export default PixelAvatar
