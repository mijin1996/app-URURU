# Proposal

## Why

미미가 위치·로그인·개인정보를 이렇게 정했어요 (2026-11-03).

- 위치는 **켠 사람만**, **앱을 쓰는 동안만** 서버에 둔다 (일반적이지 않지만 개인정보를 가장 적게 남기는 쪽)
- 친구에게는 **시·도까지**("대한민국 경기도"), **결제한 사람에게만 동까지**("경기도 평택시 서정동") — 결제 모델
- 로그인은 **구글만**. 가입 순서(아이디 · 닉네임 · 생년월일 · 국가)는 그대로
- 개인정보처리방침 전문이 없었음 → 새로 씀
- `package.json` 이름을 `ururu`로

## What Changes

- 위치
  - `region.js` `findArea()` → `{ province, detail }`. 좌표는 카카오에 지역 이름을 물을 때만 쓰고 저장하지 않음
  - 새 컬렉션 `locations/{uid}` `{ country, province, viewers, updatedAt, expiresAt }` (친구 누구나), `locationsDetail/{uid}` `{ detail, viewers, updatedAt, expiresAt }` (결제한 친구만), `entitlements/{uid}` `{ plan, until }` (서버·운영자만 씀)
  - 친구는 `where('viewers', 'array-contains', 나)` 질문 하나만 구독 (친구 수와 상관없이 1~2개)
  - 앱이 화면에서 내려가면(`visibilitychange` hidden · `pagehide`) 바로 지움, 돌아오면 다시 올림, 켜 있는 동안 5분마다 다시 씀
  - 못 지웠을 때: `expiresAt` = 쓴 시각 + 10분, Firestore TTL이 지움
  - 프로필 `users.region`은 쓰지 않음 (늘 ""). 예전 값이 있으면 앱이 지움. 프로필 글자는 "나라" + 지금 받는 지역
  - 친구가 생기거나 끊기면 `viewers`를 다시 씀 (1초 모아서 한 번)
- 로그인: `canTryAnonymous` 모든 빌드 false, 페이스북 버튼 · 로그인 방법 · 번역 키 없앰
- 가입 화면: **[시작하기] 버튼 없앰** — 구글 버튼 하나로 인증 + 가입 (칸 검사는 구글을 누를 때, 마지막 칸 Enter = 구글). `account` spec의 "시작하기" 시나리오는 archive 때 "구글 버튼"으로 바꿈
- 개인정보처리방침: `docs/policy/privacy.md` 전문 + `privacy.en.md`, 앱 정책 목록(`PolicyText.jsx`)에 추가, 번역 키 `me.privacy`
- `package.json` · `package-lock.json` 이름 `ururu`

## Capabilities

### Modified Capabilities
- `map` / `profile`: 친구 지역 글자 (시·도 / 결제 시 동), 앱을 쓰는 동안만
- `account`: 구글 로그인만
- `safety`: 개인정보처리방침 화면

## Impact

- `src/platform/region.js`, `src/platform/features.js`
- `src/data/UserStore.js` (`setLiveRegion`), `src/data/server/RealServer.js` · `ChatServer.js` · `FakeServer.js`, `firebase/paths.js` · `userMapper.js`, `login/GoogleLogin.js`
- `src/ui/actions/MeActions.js`, `src/ui/app/serverEvents.js`, `src/ui/start/SignupScreen.jsx`, `src/ui/common/PolicyText.jsx`, `src/core/i18n/ko.js` · `en.js`
- `firestore.rules` (`locations` · `locationsDetail` · `entitlements`)
- 콘솔: Firestore TTL 정책 2개 (`locations.expiresAt`, `locationsDetail.expiresAt`)
- `tests/data.test.js`
