# 세션 시작 프롬프트 (Context Recovery)

> 새 Claude Code 세션을 시작할 때 이 내용을 붙여넣어 컨텍스트를 복구하세요.

---

이 저장소에서 작업을 이어간다. 시작 전에 다음을 반드시 읽고 따른다:

1. **[CLAUDE.md](../../CLAUDE.md)** — 행동 규칙, 금지 패턴, 스타일, 파일 위치, 커밋 형식.
2. **[CONTEXT.md](../../CONTEXT.md)** — 프로젝트 목적, 기술 스택, 아키텍처, 도메인 용어, 현재 진행 상태.
3. **[.claude/rules/code-style.md](../../.claude/rules/code-style.md)** 와 **[.claude/rules/architecture.md](../../.claude/rules/architecture.md)**.
4. 작업과 가장 비슷한 기존 코드(예: `packages/client/src/features/<유사기능>/`, `packages/server/src/routes/<유사리소스>.ts`)를 찾아 패턴을 파악한다.

핵심만 다시 정리:
- Monorepo: `@maxt/client`(React/Vite), `@maxt/server`(Express/ESM), `@maxt/shared`(공유 타입).
- 스타일: TS, 세미콜론 없음, 작은따옴표, 2-space.
- 흐름: 클라 `UI → store → services → http(api)`, 서버 `route → verifyAuth → db(pool)`.
- 공유 타입은 `@maxt/shared`에. 서버 상대 import는 `.js` 확장자. SQL은 파라미터 바인딩.
- 디자인은 `theme.ts`/`cy-*`로만. 사용자 문구·에러는 한국어. 시크릿 하드코딩 금지.

작업을 마치면 **[harness/checklist.md](../checklist.md)** 로 자체 검증하고 결과를 요약한다.

---

**그리고 알려줘:** 지금 내가 집중할 작업은 → CONTEXT.md의 "현재 진행 상태 / 다음 목표"를 확인하고, 불명확하면 먼저 질문할 것.
