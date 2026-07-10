-- ============================================================
-- 001_upgrade.sql — role 3단계 / BGM / 아바타 확장 / post_type
-- 실행: Supabase SQL Editor에서 1회 수동 실행 (idempotent)
-- ============================================================
BEGIN;

-- ---------- A. 권한: role 3단계 ----------
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('ADMIN', 'WRITER', 'USER'));

-- 기존에 게시글을 작성한 일반 회원은 WRITER로 승격 (권한 강화로 인한 회귀 방지)
UPDATE users SET role = 'WRITER'
WHERE role = 'USER'
  AND id IN (SELECT DISTINCT author_id FROM history_posts WHERE author_id IS NOT NULL);

-- ---------- B. BGM ----------
CREATE TABLE IF NOT EXISTS bgm_tracks (
  id          serial PRIMARY KEY,
  title       varchar(200) NOT NULL,
  artist      varchar(200) NOT NULL,
  file_url    text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO bgm_tracks (title, artist, file_url, sort_order)
SELECT v.title, v.artist, v.file_url, v.sort_order
FROM (VALUES
  ('추억의 8비트',  'Retro Wave',  '/bgm/track-01.wav', 0),
  ('픽셀 산책',     'Chip Melody', '/bgm/track-02.wav', 1),
  ('미니룸의 오후', 'Dot Sound',   '/bgm/track-03.wav', 2)
) AS v(title, artist, file_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM bgm_tracks);

-- ---------- C. 아바타: render_key + 하의(BOTTOM) ----------
ALTER TABLE avatar_items ADD COLUMN IF NOT EXISTS render_key varchar(50);
CREATE UNIQUE INDEX IF NOT EXISTS idx_avatar_items_render_key
  ON avatar_items (render_key);

ALTER TABLE avatar_items DROP CONSTRAINT IF EXISTS avatar_items_category_check;
ALTER TABLE avatar_items
  ADD CONSTRAINT avatar_items_category_check
  CHECK (category IN ('HAIR', 'FACE', 'CLOTHES', 'BOTTOM', 'ACCESSORY'));

ALTER TABLE avatars ADD COLUMN IF NOT EXISTS bottom_id int REFERENCES avatar_items(id);

-- 기존 기본 아이템에 render_key 백필
UPDATE avatar_items SET render_key = 'hair:default'   WHERE category = 'HAIR'      AND is_default = TRUE AND render_key IS NULL;
UPDATE avatar_items SET render_key = 'face:default'   WHERE category = 'FACE'      AND is_default = TRUE AND render_key IS NULL;
UPDATE avatar_items SET render_key = 'top:default'    WHERE category = 'CLOTHES'   AND is_default = TRUE AND render_key IS NULL;
UPDATE avatar_items SET render_key = 'accessory:none' WHERE category = 'ACCESSORY' AND is_default = TRUE AND render_key IS NULL;

-- 커스터마이징 옵션 아이템 (render_key variant는 클라이언트 PixelAvatar가 CSS로 렌더)
INSERT INTO avatar_items (category, name, image_url, is_default, render_key)
SELECT v.category, v.name, '', v.is_default, v.render_key
FROM (VALUES
  ('HAIR',      '고양이 귀',    FALSE, 'hair:cat'),
  ('HAIR',      '곰돌이 귀',    FALSE, 'hair:bear'),
  ('HAIR',      '토끼 귀',      FALSE, 'hair:bunny'),
  ('HAIR',      '왕관',         FALSE, 'hair:crown'),
  ('FACE',      '미소',         FALSE, 'face:smile'),
  ('FACE',      '윙크',         FALSE, 'face:wink'),
  ('FACE',      '졸린 얼굴',    FALSE, 'face:sleepy'),
  ('FACE',      '시크한 얼굴',  FALSE, 'face:cool'),
  ('CLOTHES',   '정장',         FALSE, 'top:suit'),
  ('CLOTHES',   '캐주얼',       FALSE, 'top:casual'),
  ('CLOTHES',   '스포티',       FALSE, 'top:sporty'),
  ('CLOTHES',   '후드티',       FALSE, 'top:hoodie'),
  ('BOTTOM',    '기본 하의',    TRUE,  'bottom:default'),
  ('BOTTOM',    '청바지',       FALSE, 'bottom:jeans'),
  ('BOTTOM',    '반바지',       FALSE, 'bottom:shorts'),
  ('BOTTOM',    '치마',         FALSE, 'bottom:skirt'),
  ('BOTTOM',    '트레이닝',     FALSE, 'bottom:training'),
  ('ACCESSORY', '안경',         FALSE, 'accessory:glasses'),
  ('ACCESSORY', '모자',         FALSE, 'accessory:hat'),
  ('ACCESSORY', '목도리',       FALSE, 'accessory:scarf'),
  ('ACCESSORY', '헤드폰',       FALSE, 'accessory:headphones')
) AS v(category, name, is_default, render_key)
ON CONFLICT (render_key) DO NOTHING;

-- 기존 사용자 아바타에 기본 하의 백필
UPDATE avatars SET bottom_id = (
  SELECT id FROM avatar_items WHERE render_key = 'bottom:default'
) WHERE bottom_id IS NULL;

-- ---------- D. 게시글: post_type ----------
ALTER TABLE history_posts
  ADD COLUMN IF NOT EXISTS post_type varchar(20) NOT NULL DEFAULT 'BOARD';
ALTER TABLE history_posts DROP CONSTRAINT IF EXISTS history_posts_post_type_check;
ALTER TABLE history_posts
  ADD CONSTRAINT history_posts_post_type_check
  CHECK (post_type IN ('DIARY', 'PHOTO', 'BOARD'));
CREATE INDEX IF NOT EXISTS idx_history_posts_post_type ON history_posts (post_type);

-- 기존 히스토리 게시물(Event/Workshop/Meeting 카테고리)은 다이어리로 분류
UPDATE history_posts SET post_type = 'DIARY'
WHERE category IN ('Event', 'Workshop', 'Meeting');

COMMIT;
