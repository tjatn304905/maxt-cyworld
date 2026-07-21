# CONTEXT.md

> ⚠️ 초안입니다. 진행하면서 계속 수정할 것. ("현재 진행 상태"는 자주 갱신)

## 한 줄 요약
싸이월드 미니홈피 감성(미니미·BGM·도트 UI)을 차용한 **사내 팀 역사 아카이빙 웹앱**.

## 기술 스택 (확정)
- **구조**: Monorepo (npm workspaces) — `packages/client`, `packages/server`, `packages/shared`
- **Frontend**: React + Vite + TypeScript, Zustand, Tailwind (`cy-*` 커스텀), axios → 배포: **Vercel**
- **Backend**: Node.js + Express + TypeScript (ESM) → 배포: **Render**
- **DB**: PostgreSQL (Supabase DB), `pg` 풀
- **Storage**: Supabase Storage (이미지 아카이빙)
- **Auth**: JWT 자체 인증 (Access Token, `localStorage: maxt-token`)

## 아키텍처

```
┌─────────────────────────────┐        ┌──────────────────────────┐
│  client (React/Vite)        │  HTTP  │  server (Express/ESM)    │
│                             │ /api   │                          │
│  features/*  ──┐            │ ─────► │  routes/*  ──┐           │
│  components/ui │            │  JWT   │  middleware  │           │
│  store/* (zustand)          │        │  (verifyAuth)│           │
│       │                     │        │       │      │           │
│  services/* ── http(axios)  │        │  db/pool ────┼──► PostgreSQL (Supabase)
└───────┼─────────────────────┘        └───────┼──────┘
        │                                       │
        └────── @maxt/shared (공유 타입) ───────┘
                                              Supabase Storage (이미지)
```

데이터 흐름
- 클라이언트: `UI → store → services → http(/api)`
- 서버: `route → verifyAuth → db(pool) → PostgreSQL`

## 주요 도메인 용어
- **History Post**: 팀 역사 기록 글(이벤트/워크샵/회의 등). DB 기반(`/api/posts`). 대표 이미지·좋아요·댓글 포함.
- **Diary / Board**: 초기 로컬 데이터 기반 화면 (일부 legacy, 점진적으로 DB로 이전 중).
- **Miniroom / Avatar(미니미)**: 사용자별 아바타. `avatar_items`(HAIR/FACE/CLOTHES/ACCESSORY) 조합. 가입 시 기본 아바타 자동 생성.
- **BGM**: 미니홈피 감성용 배경음악 (`bgmStore`).
- **Mood**: 사용자 현재 기분 상태 표시.

## 현재 진행 상태 (TODO: 갱신)
- [x] 기본 모노레포 + 클라이언트 화면 골격 (home/diary/board/photo/miniroom)
- [x] JWT 인증 (login/signup/me)
- [x] History Post / 댓글 / 좋아요 / 아바타 API (DB 기반)
- [ ] Supabase Storage 이미지 업로드 연동
- [ ] legacy Diary/Board → DB 이전
- [ ] 배포 파이프라인(Vercel/Render) 정리

## 다음 목표
(여기에 지금 집중할 작업을 적어두세요)