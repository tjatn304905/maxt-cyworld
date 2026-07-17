-- ============================================================
-- 005_board_categories.sql — 게시판 카테고리 4종 개편
--   신규: '회식' | '체육/워크숍' | 'New Face' | '기타'
--   기존 글(Event/Workshop/Meeting/Free/Notice 등)은 전부 '기타'로 이관
--   (팀 운영 규칙 문서 기준, 기존 글은 추후 재작성 예정)
-- 실행: Supabase SQL Editor에서 1회 수동 실행 (idempotent)
-- ============================================================
BEGIN;

UPDATE history_posts
SET category = '기타'
WHERE category NOT IN ('회식', '체육/워크숍', 'New Face', '기타');

COMMIT;
