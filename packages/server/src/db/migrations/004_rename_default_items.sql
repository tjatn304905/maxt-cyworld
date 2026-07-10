-- ============================================================
-- 004_rename_default_items.sql — 초기 seed의 영어 아이템명을 한국어로 정정
-- 실행: Supabase SQL Editor에서 1회 수동 실행 (idempotent)
-- ============================================================
BEGIN;

UPDATE avatar_items SET name = '기본 머리'   WHERE render_key = 'hair:default'    AND name <> '기본 머리';
UPDATE avatar_items SET name = '기본 얼굴'   WHERE render_key = 'face:default'    AND name <> '기본 얼굴';
UPDATE avatar_items SET name = '기본 티셔츠' WHERE render_key = 'top:default'     AND name <> '기본 티셔츠';
UPDATE avatar_items SET name = '없음'        WHERE render_key = 'accessory:none'  AND name <> '없음';

COMMIT;
