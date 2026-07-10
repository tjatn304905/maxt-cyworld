import { memo, type CSSProperties, type ReactNode } from 'react'
import type {
  HeadType, BodyType, FaceType, BottomType, AccessoryType, AvatarConfig, UserAvatar,
} from '../../types'
import { resolveRenderKey } from './avatarCatalog'

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

// thin lines must stay >= 1px at small sizes
const px = (n: number) => Math.max(1, n)

function d(style: CSSProperties, key: string): ReactNode {
  return <div key={key} className="absolute" style={style} />
}

const line = 'rgba(0,0,0,0.15)'

// ===== BOTTOM (하의) =====
function renderBottom(bottom: BottomType, u: number): ReactNode[] {
  switch (bottom) {
    case 'jeans':
      return [
        d({ bottom: 0, left: u * 1.8, width: u * 1.9, height: u * 0.95, backgroundColor: '#4477aa', border: `1px solid ${line}`, borderRadius: '0 0 2px 2px' }, 'l'),
        d({ bottom: 0, left: u * 4.3, width: u * 1.9, height: u * 0.95, backgroundColor: '#4477aa', border: `1px solid ${line}`, borderRadius: '0 0 2px 2px' }, 'r'),
        d({ bottom: 0, left: u * 1.8, width: u * 1.9, height: px(u * 0.25), backgroundColor: '#a8c8e8' }, 'rl'),
        d({ bottom: 0, left: u * 4.3, width: u * 1.9, height: px(u * 0.25), backgroundColor: '#a8c8e8' }, 'rr'),
        d({ bottom: u * 0.8, left: u * 1.8, width: u * 4.4, height: u * 0.3, backgroundColor: '#33608c', borderRadius: '1px 1px 0 0' }, 'w'),
      ]
    case 'shorts':
      return [
        d({ bottom: 0, left: u * 2.2, width: u * 1.2, height: u * 0.5, backgroundColor: '#ffddaa', borderRadius: '0 0 1px 1px' }, 'sl'),
        d({ bottom: 0, left: u * 4.6, width: u * 1.2, height: u * 0.5, backgroundColor: '#ffddaa', borderRadius: '0 0 1px 1px' }, 'sr'),
        d({ bottom: u * 0.4, left: u * 1.8, width: u * 4.4, height: u * 0.7, backgroundColor: '#ffcc66', border: `1px solid ${line}`, borderRadius: 2 }, 'b'),
        d({ bottom: u * 0.4, left: u * 3.9, width: px(u * 0.25), height: u * 0.45, backgroundColor: '#e0a840' }, 'st'),
      ]
    case 'skirt':
      return [
        d({ bottom: 0, left: u * 1.7, width: u * 2.6, height: 0, borderLeft: `${u * 1.0}px solid transparent`, borderRight: `${u * 1.0}px solid transparent`, borderBottom: `${u * 1.1}px solid #ff99bb` }, 'a'),
        d({ bottom: 0, left: u * 1.9, width: u * 4.2, height: px(u * 0.22), backgroundColor: '#ffc1d6' }, 'f'),
        d({ bottom: u * 0.9, left: u * 2.7, width: u * 2.6, height: px(u * 0.2), backgroundColor: '#e87ba3' }, 'w'),
      ]
    case 'training':
      return [
        d({ bottom: 0, left: u * 1.8, width: u * 1.9, height: u * 0.9, backgroundColor: '#555555', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '0 0 2px 2px' }, 'l'),
        d({ bottom: 0, left: u * 4.3, width: u * 1.9, height: u * 0.9, backgroundColor: '#555555', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '0 0 2px 2px' }, 'r'),
        d({ bottom: 0, left: u * 2.0, width: px(u * 0.3), height: u * 0.9, backgroundColor: '#ffffff' }, 'stl'),
        d({ bottom: 0, left: u * 5.7, width: px(u * 0.3), height: u * 0.9, backgroundColor: '#ffffff' }, 'str'),
        d({ bottom: u * 0.85, left: u * 1.8, width: u * 4.4, height: px(u * 0.25), backgroundColor: '#333333' }, 'w'),
      ]
    case 'checkskirt':
      return [
        d({ bottom: 0, left: u * 1.4, width: u * 5.2, height: u * 1.1, backgroundColor: '#cc5566', border: `1px solid ${line}`, borderRadius: '0 0 2px 2px' }, 'b'),
        d({ bottom: 0, left: u * 2.6, width: px(u * 0.25), height: u * 1.1, backgroundColor: '#8a3344' }, 'p1'),
        d({ bottom: 0, left: u * 3.9, width: px(u * 0.25), height: u * 1.1, backgroundColor: '#8a3344' }, 'p2'),
        d({ bottom: 0, left: u * 5.2, width: px(u * 0.25), height: u * 1.1, backgroundColor: '#8a3344' }, 'p3'),
        d({ bottom: u * 0.45, left: u * 1.4, width: u * 5.2, height: px(u * 0.25), backgroundColor: '#f2d16b' }, 'h'),
        d({ bottom: u * 0.85, left: u * 1.8, width: u * 4.4, height: px(u * 0.25), backgroundColor: '#3a2a33' }, 'w'),
      ]
    case 'cargo':
      return [
        d({ bottom: 0, left: u * 1.6, width: u * 2.2, height: u * 0.9, backgroundColor: '#8f9a6e', border: `1px solid ${line}`, borderRadius: '0 0 2px 2px' }, 'l'),
        d({ bottom: 0, left: u * 4.2, width: u * 2.2, height: u * 0.9, backgroundColor: '#8f9a6e', border: `1px solid ${line}`, borderRadius: '0 0 2px 2px' }, 'r'),
        d({ bottom: u * 0.25, left: u * 1.85, width: u * 0.8, height: u * 0.5, backgroundColor: '#6e7a52', borderRadius: 1 }, 'pl'),
        d({ bottom: u * 0.25, left: u * 5.35, width: u * 0.8, height: u * 0.5, backgroundColor: '#6e7a52', borderRadius: 1 }, 'pr'),
        d({ bottom: u * 0.85, left: u * 1.6, width: u * 4.8, height: px(u * 0.25), backgroundColor: '#5c6644' }, 'w'),
      ]
    case 'hanbok':
      return [
        d({ bottom: 0, left: u * 0.9, width: u * 3.4, height: 0, borderLeft: `${u * 1.4}px solid transparent`, borderRight: `${u * 1.4}px solid transparent`, borderBottom: `${u * 1.2}px solid #e8637c` }, 'a'),
        d({ bottom: u * 0.15, left: u * 1.3, width: u * 5.4, height: px(u * 0.3), backgroundColor: '#f5c542' }, 'g1'),
        d({ bottom: u * 0.6, left: u * 1.8, width: u * 4.4, height: px(u * 0.3), backgroundColor: '#f5c542' }, 'g2'),
      ]
    case 'slacks':
      return [
        d({ bottom: 0, left: u * 2.1, width: u * 1.7, height: u * 0.9, backgroundColor: '#3d3d52', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '0 0 1px 1px' }, 'l'),
        d({ bottom: 0, left: u * 4.2, width: u * 1.7, height: u * 0.9, backgroundColor: '#3d3d52', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '0 0 1px 1px' }, 'r'),
        d({ bottom: 0, left: u * 2.8, width: px(u * 0.3), height: u * 0.9, backgroundColor: '#8585a8' }, 'cl'),
        d({ bottom: 0, left: u * 4.9, width: px(u * 0.3), height: u * 0.9, backgroundColor: '#8585a8' }, 'cr'),
        d({ bottom: u * 0.8, left: u * 2.1, width: u * 3.8, height: u * 0.3, backgroundColor: '#2b2b3d' }, 'w'),
        d({ bottom: u * 0.8, left: u * 3.75, width: u * 0.5, height: u * 0.3, backgroundColor: '#ffd76a' }, 'bk'),
      ]
    default:
      return [
        d({ bottom: 0, left: u * 1.8, width: u * 4.4, height: u * 1.1, backgroundColor: '#7799bb', border: `1px solid ${line}`, borderRadius: 2 }, 'b'),
        d({ bottom: 0, left: u * 3.85, width: px(u * 0.3), height: u * 0.55, backgroundColor: '#5577a0' }, 'n'),
        d({ bottom: 0, left: u * 1.8, width: u * 4.4, height: px(u * 0.2), backgroundColor: '#6688aa' }, 'h'),
      ]
  }
}

// ===== TOP (상의) =====
function renderTop(body: BodyType, u: number): ReactNode[] {
  const base = (color: string, borderColor = line) =>
    d({ top: u * 5, left: u * 1.5, width: u * 5, height: u * 2, backgroundColor: color, border: `1px solid ${borderColor}`, borderRadius: 2 }, 'base')

  switch (body) {
    case 'suit':
      return [
        base('#4a5578', 'rgba(0,0,0,0.25)'),
        d({ top: u * 5, left: u * 3.4, width: 0, height: 0, borderLeft: `${u * 0.6}px solid transparent`, borderRight: `${u * 0.6}px solid transparent`, borderTop: `${u * 0.9}px solid #ffffff` }, 'v'),
        d({ top: u * 5, left: u * 3.85, width: px(u * 0.3), height: u * 1.3, backgroundColor: '#cc5566', borderRadius: `0 0 ${u * 0.15}px ${u * 0.15}px` }, 'tie'),
        d({ top: u * 5.2, left: u * 2.3, width: u * 0.55, height: u * 0.3, backgroundColor: '#ffffff' }, 'pk'),
      ]
    case 'casual':
      return [
        base('#ff9f9f'),
        d({ top: u * 5, left: u * 3.85, width: px(u * 0.3), height: u * 1.9, backgroundColor: 'rgba(255,255,255,0.9)' }, 'pl'),
        d({ top: u * 5.4, left: u * 3.83, width: u * 0.35, height: u * 0.35, backgroundColor: '#7a5544', borderRadius: '50%' }, 'b1'),
        d({ top: u * 6.2, left: u * 3.83, width: u * 0.35, height: u * 0.35, backgroundColor: '#7a5544', borderRadius: '50%' }, 'b2'),
        d({ top: u * 5.4, left: u * 2.3, width: u * 0.9, height: u * 0.8, backgroundColor: '#e57f7f', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1 }, 'pk'),
      ]
    case 'sporty':
      return [
        base('#7fd8a0'),
        d({ top: u * 5, left: u * 1.5, width: u * 0.6, height: u * 2, backgroundColor: '#ffffff' }, 'bl'),
        d({ top: u * 5, left: u * 5.9, width: u * 0.6, height: u * 2, backgroundColor: '#ffffff' }, 'br'),
        d({ top: u * 5, left: u * 3.92, width: px(u * 0.16), height: u * 1.9, backgroundColor: '#2f6f4f' }, 'z'),
      ]
    case 'hoodie':
      return [
        // hood renders before head → sits behind it
        d({ top: u * 4.5, left: u * 1.7, width: u * 4.6, height: u * 0.7, backgroundColor: '#b28ae6', borderRadius: `0 0 ${u * 0.6}px ${u * 0.6}px` }, 'hood'),
        base('#c9a8f0'),
        d({ top: u * 5.1, left: u * 3.6, width: px(u * 0.15), height: u * 0.7, backgroundColor: '#ffffff' }, 's1'),
        d({ top: u * 5.1, left: u * 4.25, width: px(u * 0.15), height: u * 0.7, backgroundColor: '#ffffff' }, 's2'),
        d({ top: u * 6.15, left: u * 3.0, width: u * 2, height: u * 0.7, backgroundColor: '#b28ae6', borderRadius: `${u * 0.3}px ${u * 0.3}px 0 0` }, 'pk'),
      ]
    case 'shirt':
      return [
        base('#ffffff', 'rgba(0,0,0,0.2)'),
        d({ top: u * 5, left: u * 3.05, width: 0, height: 0, borderLeft: `${u * 0.45}px solid transparent`, borderRight: `${u * 0.45}px solid transparent`, borderTop: `${u * 0.6}px solid #d8dfe9` }, 'cl'),
        d({ top: u * 5, left: u * 4.35, width: 0, height: 0, borderLeft: `${u * 0.45}px solid transparent`, borderRight: `${u * 0.45}px solid transparent`, borderTop: `${u * 0.6}px solid #d8dfe9` }, 'cr'),
        d({ top: u * 4.95, left: u * 3.78, width: u * 0.45, height: u * 0.45, backgroundColor: '#e05555', borderRadius: 1 }, 'kn'),
        d({ top: u * 5.4, left: u * 3.83, width: u * 0.35, height: u * 1.3, backgroundColor: '#e05555', borderRadius: '0 0 40% 40%' }, 'tie'),
      ]
    case 'overalls':
      return [
        base('#fff2b0'),
        d({ top: u * 5, left: u * 2.1, width: u * 0.5, height: u * 2, backgroundColor: '#6f8fc9' }, 'sl'),
        d({ top: u * 5, left: u * 5.4, width: u * 0.5, height: u * 2, backgroundColor: '#6f8fc9' }, 'sr'),
        d({ top: u * 6.0, left: u * 2.1, width: u * 3.8, height: u * 0.95, backgroundColor: '#6f8fc9', borderRadius: '2px 2px 0 0' }, 'bib'),
        d({ top: u * 6.1, left: u * 2.35, width: u * 0.3, height: u * 0.3, backgroundColor: '#ffd966', borderRadius: '50%' }, 'b1'),
        d({ top: u * 6.1, left: u * 5.55, width: u * 0.3, height: u * 0.3, backgroundColor: '#ffd966', borderRadius: '50%' }, 'b2'),
      ]
    case 'stripe':
      return [
        base('#ffffff', 'rgba(0,0,0,0.2)'),
        d({ top: u * 5, left: u * 3.3, width: u * 1.4, height: u * 0.3, backgroundColor: '#3f5d9e' }, 'nk'),
        d({ top: u * 5.3, left: u * 1.5, width: u * 5, height: px(u * 0.35), backgroundColor: '#3f5d9e' }, 's1'),
        d({ top: u * 5.95, left: u * 1.5, width: u * 5, height: px(u * 0.35), backgroundColor: '#3f5d9e' }, 's2'),
        d({ top: u * 6.55, left: u * 1.5, width: u * 5, height: px(u * 0.35), backgroundColor: '#3f5d9e' }, 's3'),
      ]
    case 'hanbok':
      return [
        base('#ffc7d9'),
        d({ top: u * 5, left: u * 1.5, width: u * 0.4, height: u * 2, backgroundColor: '#9db9e8' }, 'cl'),
        d({ top: u * 5, left: u * 6.1, width: u * 0.4, height: u * 2, backgroundColor: '#9db9e8' }, 'cr'),
        d({ top: u * 5, left: u * 3.3, width: 0, height: 0, borderLeft: `${u * 0.7}px solid transparent`, borderRight: `${u * 0.7}px solid transparent`, borderTop: `${u * 0.9}px solid #ffffff` }, 'v'),
        d({ top: u * 5.6, left: u * 3.4, width: u * 0.9, height: u * 0.4, backgroundColor: '#d94f6e' }, 'kn'),
        d({ top: u * 6.0, left: u * 3.55, width: u * 0.4, height: u * 0.9, backgroundColor: '#d94f6e', borderRadius: '0 0 1px 1px' }, 'r1'),
        d({ top: u * 6.0, left: u * 4.1, width: u * 0.3, height: u * 0.7, backgroundColor: '#d94f6e', borderRadius: '0 0 1px 1px' }, 'r2'),
      ]
    default:
      return [
        base('#99ccff'),
        d({ top: u * 5, left: u * 3.2, width: u * 1.6, height: u * 0.45, backgroundColor: '#ffffff', borderRadius: `0 0 ${u * 0.45}px ${u * 0.45}px` }, 'nk'),
        d({ top: u * 6.55, left: u * 1.5, width: u * 5, height: px(u * 0.3), backgroundColor: 'rgba(255,255,255,0.75)' }, 'hem'),
      ]
  }
}

// ===== FACE (표정) =====
function renderFace(face: FaceType, u: number): ReactNode[] {
  switch (face) {
    case 'smile':
      return [
        d({ top: u * 2, left: u * 2.7, width: u * 0.9, height: u * 0.5, borderTop: '2px solid #333', borderRadius: '50% 50% 0 0' }, 'el'),
        d({ top: u * 2, left: u * 4.4, width: u * 0.9, height: u * 0.5, borderTop: '2px solid #333', borderRadius: '50% 50% 0 0' }, 'er'),
        d({ top: u * 2.9, left: u * 3.2, width: u * 1.6, height: u * 0.9, backgroundColor: '#cc4444', borderRadius: '0 0 9999px 9999px' }, 'm'),
        d({ top: u * 3.4, left: u * 3.6, width: u * 0.8, height: u * 0.35, backgroundColor: '#ff9999', borderRadius: 9999 }, 't'),
        d({ top: u * 2.7, left: u * 2.2, width: u * 0.6, height: u * 0.4, backgroundColor: '#ffb3c1', borderRadius: 9999 }, 'bl'),
        d({ top: u * 2.7, left: u * 5.2, width: u * 0.6, height: u * 0.4, backgroundColor: '#ffb3c1', borderRadius: 9999 }, 'br'),
      ]
    case 'wink':
      return [
        d({ top: u * 2, left: u * 2.8, width: u * 0.7, height: u * 0.7, backgroundColor: '#333' }, 'el'),
        d({ top: u * 2.1, left: u * 4.3, width: u * 0.9, height: u * 0.5, borderBottom: '2px solid #333', borderRadius: '0 0 50% 50%' }, 'er'),
        d({ top: u * 3, left: u * 3.3, width: u * 1.4, height: u * 0.6, borderBottom: '2px solid #cc4444', borderRadius: '0 0 9999px 9999px' }, 'm'),
        d({ top: u * 3.45, left: u * 4.1, width: u * 0.6, height: u * 0.5, backgroundColor: '#ff7788', borderRadius: '0 0 9999px 9999px' }, 't'),
      ]
    case 'sleepy':
      return [
        d({ top: u * 2.25, left: u * 2.7, width: u * 0.9, height: px(u * 0.3), backgroundColor: '#333' }, 'el'),
        d({ top: u * 2.25, left: u * 4.4, width: u * 0.9, height: px(u * 0.3), backgroundColor: '#333' }, 'er'),
        d({ top: u * 3.3, left: u * 3.5, width: u * 0.8, height: u * 0.6, backgroundColor: '#cc7777', borderRadius: 9999 }, 'm'),
        d({ top: u * 3.6, left: u * 4.4, width: u * 0.4, height: u * 0.7, backgroundColor: '#aaddff', borderRadius: 9999 }, 'dr'),
      ]
    case 'cool':
      return [
        d({ top: u * 2, left: u * 2.5, width: u * 1.3, height: u * 0.6, backgroundColor: '#111' }, 'el'),
        d({ top: u * 2, left: u * 4.2, width: u * 1.3, height: u * 0.6, backgroundColor: '#111' }, 'er'),
        d({ top: u * 2.15, left: u * 3.7, width: u * 0.6, height: px(u * 0.25), backgroundColor: '#111' }, 'bg'),
        d({ top: u * 3.3, left: u * 3.4, width: u * 1.2, height: px(u * 0.2), backgroundColor: '#cc4444' }, 'm'),
      ]
    case 'heart':
      return [
        d({ top: u * 2.05, left: u * 2.75, width: u * 0.8, height: u * 0.8, backgroundColor: '#ff4488', transform: 'rotate(45deg)' }, 'lb'),
        d({ top: u * 1.9, left: u * 2.6, width: u * 0.55, height: u * 0.55, backgroundColor: '#ff4488', borderRadius: '50%' }, 'll'),
        d({ top: u * 1.9, left: u * 3.15, width: u * 0.55, height: u * 0.55, backgroundColor: '#ff4488', borderRadius: '50%' }, 'lr'),
        d({ top: u * 2.05, left: u * 4.45, width: u * 0.8, height: u * 0.8, backgroundColor: '#ff4488', transform: 'rotate(45deg)' }, 'rb'),
        d({ top: u * 1.9, left: u * 4.3, width: u * 0.55, height: u * 0.55, backgroundColor: '#ff4488', borderRadius: '50%' }, 'rl'),
        d({ top: u * 1.9, left: u * 4.85, width: u * 0.55, height: u * 0.55, backgroundColor: '#ff4488', borderRadius: '50%' }, 'rr'),
        d({ top: u * 3, left: u * 3.3, width: u * 1.4, height: u * 0.8, backgroundColor: '#cc4444', borderRadius: '0 0 9999px 9999px' }, 'm'),
      ]
    case 'angry':
      return [
        d({ top: u * 1.55, left: u * 2.6, width: u * 1, height: px(u * 0.35), backgroundColor: '#333', transform: 'rotate(20deg)' }, 'bl'),
        d({ top: u * 1.55, left: u * 4.4, width: u * 1, height: px(u * 0.35), backgroundColor: '#333', transform: 'rotate(-20deg)' }, 'br'),
        d({ top: u * 2.1, left: u * 2.9, width: u * 0.6, height: u * 0.6, backgroundColor: '#333' }, 'el'),
        d({ top: u * 2.1, left: u * 4.5, width: u * 0.6, height: u * 0.6, backgroundColor: '#333' }, 'er'),
        d({ top: u * 3.2, left: u * 3.3, width: u * 1.4, height: u * 0.6, borderTop: '2px solid #cc4444', borderRadius: '9999px 9999px 0 0' }, 'm'),
        d({ top: u * 1.35, left: u * 5, width: u * 0.7, height: px(u * 0.3), backgroundColor: '#ff5555', transform: 'rotate(45deg)' }, 'x1'),
        d({ top: u * 1.35, left: u * 5, width: u * 0.7, height: px(u * 0.3), backgroundColor: '#ff5555', transform: 'rotate(-45deg)' }, 'x2'),
      ]
    case 'tears':
      return [
        d({ top: u * 2, left: u * 2.9, width: u * 0.6, height: u * 0.6, backgroundColor: '#333' }, 'el'),
        d({ top: u * 2, left: u * 4.5, width: u * 0.6, height: u * 0.6, backgroundColor: '#333' }, 'er'),
        d({ top: u * 2.7, left: u * 2.95, width: u * 0.45, height: u * 0.8, backgroundColor: '#66bbff', borderRadius: 9999 }, 'tl'),
        d({ top: u * 2.7, left: u * 4.55, width: u * 0.45, height: u * 0.8, backgroundColor: '#66bbff', borderRadius: 9999 }, 'tr'),
        d({ top: u * 3.3, left: u * 3.4, width: u * 1.2, height: u * 0.5, borderTop: '2px solid #cc4444', borderRadius: '9999px 9999px 0 0' }, 'm'),
      ]
    case 'surprised':
      return [
        d({ top: u * 1.8, left: u * 2.5, width: u * 1.1, height: u * 1.1, backgroundColor: '#fff', border: '2px solid #333', borderRadius: '50%' }, 'wl'),
        d({ top: u * 1.8, left: u * 4.3, width: u * 1.1, height: u * 1.1, backgroundColor: '#fff', border: '2px solid #333', borderRadius: '50%' }, 'wr'),
        d({ top: u * 2.15, left: u * 2.85, width: u * 0.4, height: u * 0.4, backgroundColor: '#333', borderRadius: '50%' }, 'pl'),
        d({ top: u * 2.15, left: u * 4.65, width: u * 0.4, height: u * 0.4, backgroundColor: '#333', borderRadius: '50%' }, 'pr'),
        d({ top: u * 3, left: u * 3.55, width: u * 0.9, height: u * 1, backgroundColor: '#aa3333', borderRadius: '50%' }, 'm'),
        d({ top: u * 1.5, left: u * 5.35, width: u * 0.5, height: u * 0.8, backgroundColor: '#aaddff', borderRadius: '0 50% 50% 50%', transform: 'rotate(45deg)' }, 'sw'),
      ]
    default:
      return [
        d({ top: u * 2, left: u * 2.8, width: u * 0.7, height: u * 0.7, backgroundColor: '#333' }, 'el'),
        d({ top: u * 2, left: u * 4.5, width: u * 0.7, height: u * 0.7, backgroundColor: '#333' }, 'er'),
        d({ top: u * 3.2, left: u * 3.4, width: u * 1.2, height: u * 0.5, backgroundColor: '#ff6666', borderRadius: 9999 }, 'm'),
      ]
  }
}

// ===== HAIR (머리) =====
function renderHair(head: HeadType, u: number): ReactNode[] {
  switch (head) {
    case 'cat':
      return [
        d({ top: -u * 0.7, left: u * 2.1, width: 0, height: 0, borderLeft: `${u * 0.8}px solid transparent`, borderRight: `${u * 0.8}px solid transparent`, borderBottom: `${u * 1.2}px solid #ffb366` }, 'ol'),
        d({ top: -u * 0.7, left: u * 4.3, width: 0, height: 0, borderLeft: `${u * 0.8}px solid transparent`, borderRight: `${u * 0.8}px solid transparent`, borderBottom: `${u * 1.2}px solid #ffb366` }, 'or'),
        d({ top: -u * 0.25, left: u * 2.45, width: 0, height: 0, borderLeft: `${u * 0.45}px solid transparent`, borderRight: `${u * 0.45}px solid transparent`, borderBottom: `${u * 0.75}px solid #ff8fb3` }, 'il'),
        d({ top: -u * 0.25, left: u * 4.65, width: 0, height: 0, borderLeft: `${u * 0.45}px solid transparent`, borderRight: `${u * 0.45}px solid transparent`, borderBottom: `${u * 0.75}px solid #ff8fb3` }, 'ir'),
        d({ top: u * 0.4, left: u * 2, width: u * 4, height: u * 0.7, backgroundColor: '#ffb366', borderRadius: `${u * 0.5}px ${u * 0.5}px 0 0`, border: '1px solid rgba(0,0,0,0.12)' }, 'b'),
      ]
    case 'bear':
      return [
        d({ top: -u * 0.5, left: u * 1.7, width: u * 1.4, height: u * 1.4, backgroundColor: '#a9764f', borderRadius: '50%', border: `1px solid ${line}` }, 'ol'),
        d({ top: -u * 0.5, left: u * 4.9, width: u * 1.4, height: u * 1.4, backgroundColor: '#a9764f', borderRadius: '50%', border: `1px solid ${line}` }, 'or'),
        d({ top: -u * 0.15, left: u * 2.05, width: u * 0.7, height: u * 0.7, backgroundColor: '#e8c39a', borderRadius: '50%' }, 'il'),
        d({ top: -u * 0.15, left: u * 5.25, width: u * 0.7, height: u * 0.7, backgroundColor: '#e8c39a', borderRadius: '50%' }, 'ir'),
        d({ top: u * 0.4, left: u * 2, width: u * 4, height: u * 0.8, backgroundColor: '#a9764f', borderRadius: `${u * 0.6}px ${u * 0.6}px 0 0`, border: '1px solid rgba(0,0,0,0.12)' }, 'b'),
      ]
    case 'bunny':
      return [
        d({ top: -u * 1.5, left: u * 2.4, width: u * 1, height: u * 2.2, backgroundColor: '#ffd1e8', borderRadius: `${u * 0.5}px`, border: '1px solid rgba(0,0,0,0.1)' }, 'ol'),
        d({ top: -u * 1.5, left: u * 4.6, width: u * 1, height: u * 2.2, backgroundColor: '#ffd1e8', borderRadius: `${u * 0.5}px`, border: '1px solid rgba(0,0,0,0.1)' }, 'or'),
        d({ top: -u * 1.2, left: u * 2.65, width: u * 0.5, height: u * 1.5, backgroundColor: '#ff9ec6', borderRadius: `${u * 0.25}px` }, 'il'),
        d({ top: -u * 1.2, left: u * 4.85, width: u * 0.5, height: u * 1.5, backgroundColor: '#ff9ec6', borderRadius: `${u * 0.25}px` }, 'ir'),
        d({ top: u * 0.4, left: u * 2.2, width: u * 3.6, height: u * 0.6, backgroundColor: '#ffd1e8', borderRadius: `${u * 0.4}px ${u * 0.4}px 0 0` }, 'b'),
      ]
    case 'crown':
      return [
        d({ top: -u * 0.3, left: u * 2.1, width: u * 3.8, height: u * 0.8, backgroundColor: '#ffd700', border: '1px solid rgba(0,0,0,0.2)', borderRadius: 1 }, 'bd'),
        d({ top: -u * 1.3, left: u * 2.1, width: 0, height: 0, borderLeft: `${u * 0.6}px solid transparent`, borderRight: `${u * 0.6}px solid transparent`, borderBottom: `${u * 1.0}px solid #ffd700` }, 'sl'),
        d({ top: -u * 1.5, left: u * 3.4, width: 0, height: 0, borderLeft: `${u * 0.6}px solid transparent`, borderRight: `${u * 0.6}px solid transparent`, borderBottom: `${u * 1.2}px solid #ffd700` }, 'sc'),
        d({ top: -u * 1.3, left: u * 4.7, width: 0, height: 0, borderLeft: `${u * 0.6}px solid transparent`, borderRight: `${u * 0.6}px solid transparent`, borderBottom: `${u * 1.0}px solid #ffd700` }, 'sr'),
        d({ top: -u * 0.15, left: u * 3.75, width: u * 0.5, height: u * 0.5, backgroundColor: '#ff5577', borderRadius: '50%' }, 'j'),
      ]
    case 'bob':
      return [
        d({ top: u * 0.2, left: u * 1.7, width: u * 4.6, height: u * 1.4, backgroundColor: '#6d4c33', borderRadius: `${u * 1.0}px ${u * 1.0}px 0 0`, border: `1px solid ${line}` }, 'c'),
        d({ top: u * 1.4, left: u * 1.7, width: u * 0.8, height: u * 2.6, backgroundColor: '#6d4c33', borderRadius: `0 0 ${u * 0.4}px ${u * 0.4}px` }, 'sl'),
        d({ top: u * 1.4, left: u * 5.5, width: u * 0.8, height: u * 2.6, backgroundColor: '#6d4c33', borderRadius: `0 0 ${u * 0.4}px ${u * 0.4}px` }, 'sr'),
        d({ top: u * 0.6, left: u * 3.1, width: u * 1.8, height: px(u * 0.3), backgroundColor: '#8a6547', borderRadius: `${u * 0.15}px` }, 'sh'),
      ]
    case 'ponytail':
      return [
        d({ top: u * 0.25, left: u * 1.9, width: u * 4.2, height: u * 1.2, backgroundColor: '#c98a4b', borderRadius: `${u * 0.9}px ${u * 0.9}px 0 0`, border: `1px solid ${line}` }, 'c'),
        d({ top: u * 1.0, left: u * 5.6, width: u * 0.7, height: u * 1.5, backgroundColor: '#c98a4b', borderRadius: `0 0 ${u * 0.35}px ${u * 0.35}px` }, 'st'),
        d({ top: u * 2.2, left: u * 5.9, width: u * 1.1, height: u * 2.6, backgroundColor: '#c98a4b', borderRadius: `${u * 0.55}px`, border: `1px solid ${line}` }, 't'),
        d({ top: u * 3.3, left: u * 5.85, width: u * 1.2, height: u * 0.4, backgroundColor: '#ff6f9c', borderRadius: 1 }, 'tie'),
        d({ top: u * 1.2, left: u * 1.9, width: u * 0.5, height: u * 0.9, backgroundColor: '#c98a4b', borderRadius: `0 0 ${u * 0.25}px 0` }, 'sl'),
      ]
    case 'ribbon':
      return [
        d({ top: u * 0.3, left: u * 1.9, width: u * 4.2, height: u * 1.1, backgroundColor: '#4a3628', borderRadius: `${u * 0.8}px ${u * 0.8}px 0 0`, border: `1px solid ${line}` }, 'c'),
        d({ top: -u * 1.0, left: u * 3.4, width: 0, height: 0, borderTop: `${u * 0.6}px solid transparent`, borderBottom: `${u * 0.6}px solid transparent`, borderLeft: `${u * 1.0}px solid #ff6f9c` }, 'wl'),
        d({ top: -u * 1.0, left: u * 4.6, width: 0, height: 0, borderTop: `${u * 0.6}px solid transparent`, borderBottom: `${u * 0.6}px solid transparent`, borderRight: `${u * 1.0}px solid #ff6f9c` }, 'wr'),
        d({ top: -u * 0.65, left: u * 4.25, width: u * 0.5, height: u * 0.5, backgroundColor: '#e0558a', borderRadius: 1 }, 'kn'),
      ]
    case 'curly':
      return [
        d({ top: -u * 0.3, left: u * 1.6, width: u * 4.8, height: u * 1.6, backgroundColor: '#8f5bab', borderRadius: `${u * 0.8}px`, border: `1px solid ${line}` }, 'b'),
        d({ top: -u * 1.0, left: u * 3.3, width: u * 1.4, height: u * 1.4, backgroundColor: '#8f5bab', borderRadius: '50%' }, 'tc'),
        d({ top: -u * 0.6, left: u * 1.5, width: u * 1.3, height: u * 1.3, backgroundColor: '#8f5bab', borderRadius: '50%' }, 'tl'),
        d({ top: -u * 0.6, left: u * 5.2, width: u * 1.3, height: u * 1.3, backgroundColor: '#8f5bab', borderRadius: '50%' }, 'tr'),
        d({ top: u * 1.1, left: u * 1.5, width: u * 1.0, height: u * 1.0, backgroundColor: '#8f5bab', borderRadius: '50%' }, 'cl'),
        d({ top: u * 1.1, left: u * 5.5, width: u * 1.0, height: u * 1.0, backgroundColor: '#8f5bab', borderRadius: '50%' }, 'cr'),
      ]
    default:
      return [
        d({ top: u * 0.3, left: u * 1.9, width: u * 4.2, height: u * 1.1, backgroundColor: '#8a5a3b', borderRadius: `${u * 0.8}px ${u * 0.8}px 0 0`, border: `1px solid ${line}` }, 'c'),
        d({ top: u * 1.2, left: u * 1.9, width: u * 0.6, height: u * 1.2, backgroundColor: '#8a5a3b', borderRadius: `0 0 ${u * 0.3}px ${u * 0.3}px` }, 'sl'),
        d({ top: u * 1.2, left: u * 5.5, width: u * 0.6, height: u * 1.2, backgroundColor: '#8a5a3b', borderRadius: `0 0 ${u * 0.3}px ${u * 0.3}px` }, 'sr'),
      ]
  }
}

// ===== ACCESSORY (악세사리) — 최상위 레이어 (모자류가 머리 위를 덮음) =====
function renderAccessory(accessory: AccessoryType, u: number): ReactNode[] {
  switch (accessory) {
    case 'glasses':
      return [
        d({ top: u * 1.7, left: u * 2.2, width: u * 1.5, height: u * 1.3, border: '2px solid #7a4a2b', borderRadius: '30%', backgroundColor: 'rgba(255,255,255,0.35)' }, 'll'),
        d({ top: u * 1.7, left: u * 4.1, width: u * 1.5, height: u * 1.3, border: '2px solid #7a4a2b', borderRadius: '30%', backgroundColor: 'rgba(255,255,255,0.35)' }, 'lr'),
        d({ top: u * 2.1, left: u * 3.6, width: u * 0.6, height: px(u * 0.25), backgroundColor: '#7a4a2b' }, 'bg'),
        d({ top: u * 2.1, left: u * 1.9, width: u * 0.35, height: px(u * 0.2), backgroundColor: '#7a4a2b' }, 'tl'),
        d({ top: u * 2.1, left: u * 5.75, width: u * 0.35, height: px(u * 0.2), backgroundColor: '#7a4a2b' }, 'tr'),
      ]
    case 'hat':
      return [
        d({ top: -u * 0.4, left: u * 1.7, width: u * 4.6, height: u * 1.8, backgroundColor: '#7fb3e6', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '60% 60% 8% 8%' }, 'dm'),
        d({ top: u * 1.1, left: u * 5.4, width: u * 1.9, height: u * 0.55, backgroundColor: '#5f93c9', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '0 40% 40% 0' }, 'bm'),
        d({ top: -u * 0.3, left: u * 3.7, width: u * 0.6, height: u * 0.5, backgroundColor: '#fff3b0', borderRadius: '50%' }, 'bt'),
      ]
    case 'scarf':
      return [
        d({ top: u * 4.2, left: u * 1.7, width: u * 4.6, height: u * 0.9, backgroundColor: '#ff9db0', border: `1px solid ${line}`, borderRadius: 2 }, 'bd'),
        d({ top: u * 4.5, left: u * 1.7, width: u * 4.6, height: px(u * 0.25), backgroundColor: '#ffe0e6' }, 'st'),
        d({ top: u * 4.9, left: u * 2.1, width: u * 1.1, height: u * 1.6, backgroundColor: '#ff9db0', border: `1px solid ${line}`, borderRadius: '0 0 3px 3px' }, 'tl'),
        d({ top: u * 6.4, left: u * 2.1, width: u * 1.1, height: u * 0.35, backgroundColor: '#ffe0e6' }, 'fr'),
      ]
    case 'headphones':
      return [
        d({ top: -u * 0.3, left: u * 1.4, width: u * 5.2, height: u * 1.6, borderTop: '3px solid #8f7ad6', borderLeft: '3px solid #8f7ad6', borderRight: '3px solid #8f7ad6', borderRadius: '50% 50% 0 0' }, 'bd'),
        d({ top: u * 1.6, left: u * 1.0, width: u * 1.1, height: u * 1.6, backgroundColor: '#8f7ad6', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '40%' }, 'cl'),
        d({ top: u * 2.0, left: u * 1.25, width: u * 0.6, height: u * 0.8, backgroundColor: '#c8f2e0', borderRadius: '40%' }, 'pl'),
        d({ top: u * 1.6, left: u * 5.9, width: u * 1.1, height: u * 1.6, backgroundColor: '#8f7ad6', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '40%' }, 'cr'),
        d({ top: u * 2.0, left: u * 6.15, width: u * 0.6, height: u * 0.8, backgroundColor: '#c8f2e0', borderRadius: '40%' }, 'pr'),
      ]
    case 'sunglasses':
      return [
        d({ top: u * 1.8, left: u * 2.2, width: u * 1.6, height: u * 1.1, backgroundColor: '#2b2b33', border: '1px solid #1a1a1f', borderRadius: '20% 20% 45% 45%' }, 'll'),
        d({ top: u * 1.8, left: u * 4.2, width: u * 1.6, height: u * 1.1, backgroundColor: '#2b2b33', border: '1px solid #1a1a1f', borderRadius: '20% 20% 45% 45%' }, 'lr'),
        d({ top: u * 1.9, left: u * 3.7, width: u * 0.6, height: px(u * 0.3), backgroundColor: '#2b2b33' }, 'bg'),
        d({ top: u * 2.0, left: u * 2.45, width: u * 0.45, height: u * 0.3, backgroundColor: '#9ad7ff', borderRadius: '50%' }, 'hl'),
      ]
    case 'bowtie':
      return [
        d({ top: u * 4.4, left: u * 2.8, width: 0, height: 0, borderLeft: `${u * 1.1}px solid #e05a6d`, borderTop: `${u * 0.6}px solid transparent`, borderBottom: `${u * 0.6}px solid transparent` }, 'wl'),
        d({ top: u * 4.4, left: u * 4.1, width: 0, height: 0, borderRight: `${u * 1.1}px solid #e05a6d`, borderTop: `${u * 0.6}px solid transparent`, borderBottom: `${u * 0.6}px solid transparent` }, 'wr'),
        d({ top: u * 4.7, left: u * 3.7, width: u * 0.6, height: u * 0.6, backgroundColor: '#b23a4a', borderRadius: 2 }, 'kn'),
      ]
    case 'mask':
      return [
        d({ top: u * 2.9, left: u * 2.5, width: u * 3, height: u * 1.4, backgroundColor: '#d3f0e8', border: `1px solid ${line}`, borderRadius: '15% 15% 40% 40%' }, 'bd'),
        d({ top: u * 3.3, left: u * 2.7, width: u * 2.6, height: px(u * 0.15), backgroundColor: 'rgba(0,0,0,0.08)' }, 'p1'),
        d({ top: u * 3.7, left: u * 2.7, width: u * 2.6, height: px(u * 0.15), backgroundColor: 'rgba(0,0,0,0.08)' }, 'p2'),
        d({ top: u * 3.0, left: u * 2.05, width: u * 0.5, height: px(u * 0.2), backgroundColor: '#b7ddd2' }, 'sl'),
        d({ top: u * 3.0, left: u * 5.45, width: u * 0.5, height: px(u * 0.2), backgroundColor: '#b7ddd2' }, 'sr'),
      ]
    case 'necklace':
      return [
        d({ top: u * 4.6, left: u * 2.8, width: u * 2.4, height: u * 1.0, borderLeft: '2px solid #f0c24b', borderRight: '2px solid #f0c24b', borderBottom: '2px solid #f0c24b', borderRadius: '0 0 50% 50%' }, 'ch'),
        d({ top: u * 5.3, left: u * 3.65, width: u * 0.7, height: u * 0.7, backgroundColor: '#ff8fb3', border: '1px solid #d96a92', borderRadius: '50%' }, 'pd'),
      ]
    default:
      return []
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
  const u = size / 8

  return (
    <div className="relative pixel-render" style={{ width: size, height: size }}>
      {/* layer order: bottom → top(body) → head → face → hair → accessory */}
      {renderBottom(bottom, u)}
      {renderTop(body, u)}
      <div
        className="absolute rounded-sm"
        style={{
          top: u * 0.5, left: u * 2,
          width: u * 4, height: u * 4,
          backgroundColor: '#ffddaa', border: `1px solid ${line}`,
        }}
      />
      {renderFace(face, u)}
      {renderHair(head, u)}
      {renderAccessory(accessory, u)}
    </div>
  )
}

const PixelAvatar = memo(PixelAvatarInner)
export default PixelAvatar
