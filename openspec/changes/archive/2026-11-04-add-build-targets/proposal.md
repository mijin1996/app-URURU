# Proposal

## Why

같은 코드로 **구글 플레이(안드로이드)** 앱과 **시연용 웹**을 만들어요. 빌드마다 켜는 기능과 로그인 방법이 달라서, 화면 코드에 "어디용이면 ~" 같은 if를 흩뿌리지 않고 한 곳(표)에서 정해요.

## What Changes

| 명령 | 결과 | 로그인 | 기능 |
|---|---|---|---|
| `npm run build` | `dist/` (웹 · 안드로이드 앱에 들어가는 파일) | 구글 | 전부 |
| `npm run build:android` (add-mobile-apps에서 추가) | 안드로이드 앱 | 구글 (휴대폰 계정 선택 창) | 전부 |
| `npm run build:single` | `dist/ururu.html` 시연용 한 장 | 없음 (가짜 서버) | 전부 |

- 로그인을 약속(`LoginProvider`) 뒤로 숨겨요: `GoogleLogin` 하나 (2026-11-04: 예전 시험용 `DemoLogin`은 합쳐서 없앰)
- 켜고 끌 기능을 표(`src/platform/features.js`)로 모아요: `canSwipe`, `canShareLocation`, `canSendPhoto`, `filterMessages` …
- 지금 빌드가 어디용인지는 `src/platform/target.js` (Vite `--mode`)

**하지 않는 것**: iOS 앱스토어 출시(빌드 준비는 `add-mobile-apps`)

## Capabilities

### New Capabilities
- `build-targets`: 빌드 대상별 기능 · 로그인 규칙

## Impact

- 새 파일: `src/platform/target.js`, `src/platform/features.js`, `src/data/login/`
- 의존성: `@capacitor-firebase/authentication` 8.5.2 (add-mobile-apps)
- 필요한 준비: 구글 플레이 개발자 계정
