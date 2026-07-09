# 아키텍처 규칙 (architecture)

## 모노레포 경계
```
packages/
  shared/   @maxt/shared  — client·server 공유 타입(only). 런타임 의존성 최소.
  client/   @maxt/client  — React/Vite SPA.
  server/   @maxt/server  — Express API (ESM).
```
- `shared` → 다른 패키지에 의존하지 않는다 (순수 타입/상수).
- `client`와 `server`는 **서로 직접 import하지 않는다.** 공유가 필요하면 `shared`를 통한다.
- 공유 타입 import: `import type { User } from '@maxt/shared'`.

## 클라이언트 레이어 (위 → 아래로만 의존)
```
features/ , components/        (화면·UI)
        │
        ▼
store/ (zustand)               (전역 상태 · 액션)
        │
        ▼
services/ (api 함수)           (도메인별 호출 함수)
        │
        ▼
services/http.ts (axios api)   (단일 HTTP 인스턴스 · JWT 인터셉터)
```
규칙
- 컴포넌트/훅에서 **직접 fetch/axios 금지** → `services/`를 호출.
- 모든 인증 필요 호출은 `http.ts`의 `api` 인스턴스를 사용(토큰 자동 첨부, 401 자동 로그아웃).
- feature는 폴더로 응집: `features/<name>/`에 `Page`, 하위 컴포넌트, `useXxx` 훅, `data.ts`를 함께 둔다.
- 재사용 UI는 `components/ui`(`Cy*`), 레이아웃은 `components/layout`, 그 외 공통은 `components/shared`.

## 서버 레이어
```
index.ts  →  routes/<resource>.ts  →  middleware/auth.ts  →  db/pool.ts  →  PostgreSQL
```
규칙
- 라우트는 리소스 단위 파일(`routes/posts.ts`, `routes/auth.ts` …)로 나누고 `index.ts`에 등록.
- 인증 필요 라우트는 `verifyAuth` 미들웨어를 거친다. 사용자 식별은 `(req as AuthRequest).userId`.
- DB 접근은 `db/pool.ts`의 단일 풀을 통해서만. 쿼리는 파라미터 바인딩.
- 비밀번호는 `bcryptjs` 해시, 토큰은 `signToken`(JWT). 시크릿은 `process.env`.

## 데이터 / 스토리지
- 영속 데이터: PostgreSQL (Supabase DB). 스키마 변경은 `db/seed.ts` 등 마이그레이션 흐름과 함께.
- 이미지 등 바이너리: Supabase Storage. DB에는 URL/메타만 저장(`imageUrl`, `isRepresentative`).
- 일부 화면은 아직 로컬 `data.ts` 기반(legacy). 신규 기능은 DB 기반으로 만든다.

## 설정 / 환경
- 클라이언트 env: `import.meta.env.*` (Vite). 서버 env: `process.env.*`.
- 배포: client → Vercel, server → Render, DB/Storage → Supabase.
- 환경별 값(API origin, DB URL, JWT/Supabase 키)은 절대 커밋하지 않는다.

## 의존성 추가 원칙
- 새 라이브러리 추가는 신중히. 기존 스택(axios, zustand, pg, express, bcryptjs)으로 해결 가능한지 먼저 확인.
- 추가가 필요하면 어느 workspace에 넣을지(`-w @maxt/client` 등) 명확히 하고 이유를 남긴다.
