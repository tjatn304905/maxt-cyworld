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

// upscaled render grid: 2x the authored dot grid (EPX/Scale2x smoothing)
const SCALE = 2
const OUT_W = GRID_W * SCALE
const OUT_H = GRID_H * SCALE

type ColorGrid = (string | null)[][]

// flatten the ordered layers into a single color grid (null = transparent)
function compositeGrid(layers: (SpriteLayer | null)[]): ColorGrid {
  const grid: ColorGrid = Array.from({ length: GRID_H }, () => new Array<string | null>(GRID_W).fill(null))
  for (const layer of layers) {
    if (!layer) continue
    for (const [rowIdx, row] of Object.entries(layer.rows)) {
      const y = Number(rowIdx)
      if (y < 0 || y >= GRID_H) continue
      for (let x = 0; x < Math.min(row.length, GRID_W); x++) {
        const ch = row[x]
        if (ch === '.' || ch === ' ') continue
        const color = layer.palette[ch]
        if (!color) continue
        grid[y][x] = color
      }
    }
  }
  return grid
}

// EPX / Scale2x: double the grid, rounding diagonal steps so curves read cleaner.
// Each source dot becomes a 2x2 block; corners borrow a neighbor's color only
// when the two adjacent neighbors agree (and opposite pairs differ), which
// smooths outlines without blurring flat fills or isolated highlight dots.
function epxDouble(src: ColorGrid): ColorGrid {
  const out: ColorGrid = Array.from({ length: OUT_H }, () => new Array<string | null>(OUT_W).fill(null))
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const p = src[y][x]
      const up = y > 0 ? src[y - 1][x] : p
      const down = y < GRID_H - 1 ? src[y + 1][x] : p
      const left = x > 0 ? src[y][x - 1] : p
      const right = x < GRID_W - 1 ? src[y][x + 1] : p
      let e0 = p
      let e1 = p
      let e2 = p
      let e3 = p
      if (up !== down && left !== right) {
        if (left === up) e0 = up
        if (up === right) e1 = up
        if (left === down) e2 = down
        if (down === right) e3 = down
      }
      out[2 * y][2 * x] = e0
      out[2 * y][2 * x + 1] = e1
      out[2 * y + 1][2 * x] = e2
      out[2 * y + 1][2 * x + 1] = e3
    }
  }
  return out
}

function drawGrid(ctx: CanvasRenderingContext2D, grid: ColorGrid): void {
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y]
    for (let x = 0; x < row.length; x++) {
      const color = row[x]
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
    ctx.clearRect(0, 0, OUT_W, OUT_H)
    // layer order: base → bottom → top → face → hair → accessory
    const layers = [
      SPRITE_BASE,
      layerFor('bottom', bottom),
      layerFor('top', body),
      layerFor('face', face),
      layerFor('hair', head),
      accessory === 'none' ? null : layerFor('accessory', accessory),
    ]
    // composite once, then EPX-upscale so the whole minimi is smoothed together
    drawGrid(ctx, epxDouble(compositeGrid(layers)))
  }, [head, body, face, bottom, accessory])

  return (
    <div
      className="relative pixel-render flex items-end justify-center"
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        width={OUT_W}
        height={OUT_H}
        style={{
          width: size * (OUT_W / OUT_H),
          height: size,
          imageRendering: 'pixelated',
        }}
      />
    </div>
  )
}

const PixelAvatar = memo(PixelAvatarInner)
export default PixelAvatar
