# Tasks

> 선행 조건: `add-real-server`, `add-safety-basics`, `add-mobile-apps` 완료.
> 공통 완료 기준: `npm run build:single` 시연 빌드가 지금과 같음 (TGT-20, `npm run compare`).

## 1. 빌드 대상과 기능 표

- [x] 1.1 `src/platform/target.js`, `features.js`를 만들고 `--mode`별로 값이 맞게 읽히는지 시험 (`tests/ui.test.js`)
- [ ] 1.2 탭 표·지도가 `features`를 따르게 하고 (주석으로 막은 코드가 하나도 없는지 `grep`으로 확인) TGT-01~03, 10을 각 모드로 확인 — 탭·지도·위치 토글은 끝(2026-10-13). 나이(`minAge`, TGT-05·12)는 미미 결정 뒤
- [ ] 1.3 `package.json`에 `build:toss`, `build:android`, `build:single` 명령을 만들고 셋 다 오류 없이 끝나는지 확인 — `build:toss`·`build:single` 있음, `build:android`는 `add-mobile-apps` 뒤

## 2. 로그인

- [x] 2.1 `LoginProvider` 약속과 `DemoLogin`을 만들고 TGT-20 확인 (설정 없는 시연 빌드는 로그인 없이 그대로)
- [ ] 2.2 `GoogleLogin`, `EmailLogin`을 만들고 안드로이드 에뮬레이터에서 TGT-11~11b 확인
- [ ] 2.3 서버 함수 `tossLogin`과 `AnonKeyLogin`을 만들고 토스 앱 테스트 QR로 TGT-04~04b, 06 확인 (SDK 3.x는 샌드박스 앱 없음) — 코드와 시험(가짜 SDK)은 끝, 실제 확인은 mTLS 인증서 뒤

## 3. 앱인토스

- [x] 3.1 `@apps-in-toss/web-framework` 버전을 `docs/tech-stack.md`에 고정하고 `apps-in-toss.config.ts` 작성 (3.8.0, `ait init` 대신 직접)
- [ ] 3.2 `npm run build:toss`로 `dist-toss/`가 생기고, 앱인토스 도구로 `moyeo.ait`를 만들어 100MB 이하인지 확인
- [x] 3.2b 앱인토스 출시 체크리스트 화면 규칙: 자체 뒤로 버튼 숨김 + 토스 뒤로가기(`nav.back`, `listenTossBack`), 라이트 모드, 진입 직후 창 없음, 거리 숨김, 확대 막기 — TGT-07~09c, 시험 3개, 토스 빌드 브라우저 확인 (2026-10-15). 토스 뒤로가기는 토스 앱 테스트 QR로 다시 확인
- [x] 3.2c 스토어 이미지: `npm run store:images` (`tools/store-images/`) → `store/apps-in-toss/images`, `store/google-play/images`
- [ ] 3.3 콘솔 업로드 → 토스 앱 QR 테스트를 `docs/guides/apps-in-toss-release-guide.md` 순서대로 해서 되는지 확인

## 4. 마무리

- [ ] 4.1 `docs/code-structure-and-patterns.md`, `docs/guides/google-play-release-guide.md`, `apps-in-toss-release-guide.md`을 실제 명령에 맞게 고침
- [ ] 4.2 `openspec validate --all --strict` 통과 후 `openspec archive add-build-targets`
