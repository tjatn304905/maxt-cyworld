import type { ItemCategory } from '../../types'

// 디자인은 전부 클라이언트(PixelAvatar)가 그린다. 이 카탈로그는 서버 아이템을
// 디자인 키에 연결하는 이름표 — 서버가 renderKey를 안 주는 경우(구버전 응답)에도
// 카테고리+이름만으로 디자인을 판별할 수 있게 한다.
const NAME_TO_KEY: Record<string, string> = {
  // HAIR (이름 변형 포함)
  'HAIR:기본 머리': 'hair:default',
  'HAIR:기본 헤어': 'hair:default',
  'HAIR:고양이 귀': 'hair:cat',
  'HAIR:곰돌이 귀': 'hair:bear',
  'HAIR:토끼 귀': 'hair:bunny',
  'HAIR:왕관': 'hair:crown',
  'HAIR:황금 왕관': 'hair:crown',
  'HAIR:단발머리': 'hair:bob',
  'HAIR:포니테일': 'hair:ponytail',
  'HAIR:리본 머리': 'hair:ribbon',
  'HAIR:곱슬 파마': 'hair:curly',
  // FACE
  'FACE:기본 얼굴': 'face:default',
  'FACE:미소': 'face:smile',
  'FACE:윙크': 'face:wink',
  'FACE:졸린 얼굴': 'face:sleepy',
  'FACE:졸림': 'face:sleepy',
  'FACE:시크한 얼굴': 'face:cool',
  'FACE:시크': 'face:cool',
  'FACE:하트눈': 'face:heart',
  'FACE:화남': 'face:angry',
  'FACE:눈물': 'face:tears',
  'FACE:놀람': 'face:surprised',
  // CLOTHES (상의)
  'CLOTHES:기본 티셔츠': 'top:default',
  'CLOTHES:기본 상의': 'top:default',
  'CLOTHES:정장': 'top:suit',
  'CLOTHES:정장 상의': 'top:suit',
  'CLOTHES:캐주얼': 'top:casual',
  'CLOTHES:캐주얼 셔츠': 'top:casual',
  'CLOTHES:캐주얼 상의': 'top:casual',
  'CLOTHES:스포티': 'top:sporty',
  'CLOTHES:스포티 상의': 'top:sporty',
  'CLOTHES:스포티 트랙재킷': 'top:sporty',
  'CLOTHES:후드티': 'top:hoodie',
  'CLOTHES:셔츠와 넥타이': 'top:shirt',
  'CLOTHES:멜빵': 'top:overalls',
  'CLOTHES:줄무늬 티셔츠': 'top:stripe',
  'CLOTHES:한복 저고리': 'top:hanbok',
  // BOTTOM
  'BOTTOM:기본 하의': 'bottom:default',
  'BOTTOM:기본 바지': 'bottom:default',
  'BOTTOM:청바지': 'bottom:jeans',
  'BOTTOM:반바지': 'bottom:shorts',
  'BOTTOM:치마': 'bottom:skirt',
  'BOTTOM:트레이닝': 'bottom:training',
  'BOTTOM:트레이닝 바지': 'bottom:training',
  'BOTTOM:체크치마': 'bottom:checkskirt',
  'BOTTOM:카고바지': 'bottom:cargo',
  'BOTTOM:한복치마': 'bottom:hanbok',
  'BOTTOM:정장바지': 'bottom:slacks',
  // ACCESSORY
  'ACCESSORY:없음': 'accessory:none',
  'ACCESSORY:No Accessory': 'accessory:none',
  'ACCESSORY:안경': 'accessory:glasses',
  'ACCESSORY:모자': 'accessory:hat',
  'ACCESSORY:목도리': 'accessory:scarf',
  'ACCESSORY:헤드폰': 'accessory:headphones',
  'ACCESSORY:선글라스': 'accessory:sunglasses',
  'ACCESSORY:나비넥타이': 'accessory:bowtie',
  'ACCESSORY:마스크': 'accessory:mask',
  'ACCESSORY:목걸이': 'accessory:necklace',
}

export function resolveRenderKey(
  category: ItemCategory,
  name: string,
  renderKey?: string | null
): string | null {
  return renderKey ?? NAME_TO_KEY[`${category}:${name}`] ?? null
}
