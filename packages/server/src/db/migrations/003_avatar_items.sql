-- ============================================================
-- 003_avatar_items.sql — 아바타 아이템 확장 (카테고리당 9종, 총 45종)
-- 실행: Supabase SQL Editor에서 1회 수동 실행 (idempotent)
-- ============================================================
BEGIN;

INSERT INTO avatar_items (category, name, image_url, is_default, render_key)
SELECT v.category, v.name, '', FALSE, v.render_key
FROM (VALUES
  -- HAIR 신규 4종
  ('HAIR',      '단발머리',       'hair:bob'),
  ('HAIR',      '포니테일',       'hair:ponytail'),
  ('HAIR',      '리본 머리',      'hair:ribbon'),
  ('HAIR',      '곱슬 파마',      'hair:curly'),
  -- FACE 신규 4종
  ('FACE',      '하트눈',         'face:heart'),
  ('FACE',      '화남',           'face:angry'),
  ('FACE',      '눈물',           'face:tears'),
  ('FACE',      '놀람',           'face:surprised'),
  -- CLOTHES(상의) 신규 4종
  ('CLOTHES',   '셔츠와 넥타이',  'top:shirt'),
  ('CLOTHES',   '멜빵',           'top:overalls'),
  ('CLOTHES',   '줄무늬 티셔츠',  'top:stripe'),
  ('CLOTHES',   '한복 저고리',    'top:hanbok'),
  -- BOTTOM 신규 4종
  ('BOTTOM',    '체크치마',       'bottom:checkskirt'),
  ('BOTTOM',    '카고바지',       'bottom:cargo'),
  ('BOTTOM',    '한복치마',       'bottom:hanbok'),
  ('BOTTOM',    '정장바지',       'bottom:slacks'),
  -- ACCESSORY 신규 4종
  ('ACCESSORY', '선글라스',       'accessory:sunglasses'),
  ('ACCESSORY', '나비넥타이',     'accessory:bowtie'),
  ('ACCESSORY', '마스크',         'accessory:mask'),
  ('ACCESSORY', '목걸이',         'accessory:necklace')
) AS v(category, name, render_key)
ON CONFLICT (render_key) DO NOTHING;

COMMIT;
