# Proposal

## Why

우르르를 **앱인토스(토스 미니앱)**와 **구글 플레이** 두 곳에 올리고 싶어요. 두 곳은 규칙이 달라요. 앱인토스는 토스 로그인 말고 다른 로그인을 둘 수 없고 19세 이상만 되며, 모르는 사람과 연결하는 기능(스와이프, 주변 사람 찾기)이 있으면 "만남·소개팅"으로 분류되어 법인이 필요해요. 그래서 **코드는 하나로 두고, 빌드할 때 어디용인지 골라서** 다르게 만들어요.

## What Changes

- 빌드 대상 2개 (+ 시연용 웹):

| 명령 | 결과 | 로그인 | 기능 |
|---|---|---|---|
| `npm run build:toss` | `dist-toss/` → `moyeo.ait` (앱인토스) | **익명 사용자 키** (로그인 화면 없음, 처음 한 번 가입 화면) | **친구 채팅만**: 탭 3개(채팅·친구·나), 스와이프·지도·위치 공유 없음, 친구는 아이디로 추가 |
| `npm run build:android` | `.aab` (구글 플레이) | **구글 · 이메일 계정 연동** (다른 계정은 나중에 추가) | **전부** |
| `npm run build:single` | 더블클릭 HTML | 없음 (시연 모드) | 전부 |

- 로그인을 약속(`LoginProvider`) 뒤로 숨겨요: `AnonKeyLogin`(토스 익명 사용자 키), `GoogleLogin`, `EmailLogin`, `DemoLogin`(웹에서 서버 시험용 Firebase 익명 로그인). 토스 로그인(`TossLogin`, 사업자 필요)·카카오·애플은 나중에 파일 하나씩 추가.
- 켜고 끌 기능을 표(`features`)로 모아요: `canSwipe`, `canShareLocation`, `minAge` (지도의 모르는 사람 표시는 `refine-screens`에서 모든 빌드에서 없앰). **주석으로 막지 않고 스위치(true/false)로 끄기** — 코드는 그대로 살아 있고 구글 플레이 빌드에서 계속 쓰이고 시험되니까, 나중에 토스에서도 켜려면 `false`를 `true`로 한 단어만 바꾸면 돼요.
- 앱인토스 SDK(`@apps-in-toss/web-framework`)를 넣고 `apps-in-toss.config.ts`를 만들어요.
- **선행 조건**: `add-real-server`, `add-safety-basics`, `add-mobile-apps` 완료.

**하지 않는 것**: iOS 앱스토어 출시(빌드 준비는 `add-mobile-apps`에 있음), 앱인토스 결제·광고.

## Capabilities

### New Capabilities
- `build-targets`: 빌드 대상마다 다른 로그인, 기능, 나이 제한

### Modified Capabilities
없음 (각 기능의 동작은 같고, 어떤 기능을 켤지만 빌드 대상이 정함)

## Impact

- 새 파일: `src/platform/target.js`(지금 빌드 대상), `src/platform/features.js`(대상별 기능 표), `src/platform/tossSdk.js`(토스 SDK 불러오기), `src/data/login/`(LoginProvider, AnonKeyLogin, GoogleLogin, EmailLogin, DemoLogin), `apps-in-toss.config.ts`, `functions/index.js`의 `tossLogin`(토스 일회용 코드 → anonKey → Firebase 맞춤 토큰)
- 의존성: `@apps-in-toss/web-framework`(버전은 설치할 때 `docs/tech-stack.md`에 고정), `@capacitor-firebase/authentication` 8.5.2
- 필요한 준비: 앱인토스 콘솔 가입, mTLS 인증서 발급(익명 키 교환용), 채널톡 확인(익명 키 방식이 정책에 맞는지), 구글 플레이 개발자 계정. 사업자 등록은 토스 로그인을 쓸 때만
