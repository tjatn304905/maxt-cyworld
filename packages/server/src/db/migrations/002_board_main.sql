-- ============================================================
-- 002_board_main.sql — 게시판 중심 개편: 다이어리 이관, PHOTO 글 삭제,
--                      post_type 축 제거
-- 실행: Supabase SQL Editor에서 1회 수동 실행 (idempotent)
-- ============================================================
BEGIN;

-- 1. 다이어리 글을 게시판으로 이관 (카테고리는 유지)
UPDATE history_posts SET post_type = 'BOARD' WHERE post_type = 'DIARY';

-- 2. PHOTO 샘플 글 연쇄 삭제 (이미지 없는 껍데기 — 사진첩은 이제 이미지 집계 뷰)
DELETE FROM post_images WHERE post_id IN (SELECT id FROM history_posts WHERE post_type = 'PHOTO');
DELETE FROM comments    WHERE post_id IN (SELECT id FROM history_posts WHERE post_type = 'PHOTO');
DELETE FROM likes       WHERE post_id IN (SELECT id FROM history_posts WHERE post_type = 'PHOTO');
DELETE FROM history_posts WHERE post_type = 'PHOTO';

-- 3. post_type 축 제거 (게시글 유형이 게시판 하나로 수렴)
ALTER TABLE history_posts DROP CONSTRAINT IF EXISTS history_posts_post_type_check;
DROP INDEX IF EXISTS idx_history_posts_post_type;
ALTER TABLE history_posts DROP COLUMN IF EXISTS post_type;

COMMIT;
