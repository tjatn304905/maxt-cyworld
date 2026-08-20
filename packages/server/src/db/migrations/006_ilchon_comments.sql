-- ============================================================
-- 006_ilchon_comments.sql — 일촌평 (미니홈피 홈에 남기는 한 줄 평)
--   게시글 댓글(comments)과 별개로 홈피 자체에 남기는 방명록성 한 줄 코멘트
-- 실행: Supabase SQL Editor에서 1회 수동 실행 (idempotent)
-- ============================================================
BEGIN;

CREATE TABLE IF NOT EXISTS ilchon_comments (
  id          serial PRIMARY KEY,
  user_id     uuid REFERENCES users(id),
  content     varchar(100) NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ilchon_comments_created_at
  ON ilchon_comments (created_at DESC);

COMMIT;
