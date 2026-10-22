# Proposal

## Why

지금 앱(v13)은 순수 자바스크립트가 HTML 글자를 직접 만들어 넣는 방식이에요. 화면이 커질수록 "어디를 다시 그려야 하는지"를 손으로 챙겨야 해서 실수가 생기기 쉬워요. 다음 단계인 폰 앱(`add-mobile-apps`)과 이후 기능 추가를 버티려면, 화면 그리는 부분을 React 컴포넌트로 나누는 게 안전해요.

## What Changes

- 화면 그리는 코드(`src/ui/`)를 React 함수 컴포넌트와 훅으로 다시 짜요.
- `src/core/`, `src/data/`는 **한 글자도 바꾸지 않고** 그대로 옮겨요.
- `styles/*.css` 9개도 그대로 쓰고, React가 만드는 HTML의 태그·클래스·순서를 원본과 똑같이 맞춰요.
- 묶기 도구를 esbuild(`build.mjs`)에서 Vite로 바꿔요. `npm run dev`(개발), `npm run build`(완성본), `npm run build:single`(더블클릭 HTML 한 장)을 만들어요.
- 자동 시험을 더해요: `npm run test`(Vitest, `data/` 규칙), `npm run compare`(Playwright, 원본과 화면 사진 비교).
- 비교용 원본을 `legacy/moyeo-v13.html`로 보관해요. 전환이 끝나면 지울지 미미에게 물어봐요.
- **사용자가 보는 화면과 동작은 하나도 바뀌지 않아요.** 그래서 spec은 바뀌지 않아요 (`skip_specs: true`). `openspec/specs/`의 모든 시나리오가 완료 기준이에요.

## Capabilities

### New Capabilities
없음

### Modified Capabilities
없음. 모든 capability(app-shell, account, profile, home-map, chat, story, swipe, friends, ping)의 동작이 그대로여야 해요.

## Impact

- 코드: `src/ui/` 전부 새로 작성 (`.js` → `.jsx`), `src/main.js` → `src/main.jsx`, `index.html`
- 지움: `build.mjs`, `dist/moyeo.html`(새 빌드 결과로 대체)
- 의존성 추가: react, react-dom, vite, @vitejs/plugin-react, vite-plugin-singlefile, vitest, jsdom, @playwright/test (버전은 `docs/tech-stack.md`)
- 문서: `docs/code-structure-and-patterns.md`의 파일 표를 React 파일로 갱신
