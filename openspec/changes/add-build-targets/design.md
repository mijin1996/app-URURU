# Design

## Context

- 앱인토스는 토스 앱 안의 **웹뷰**에서 웹 빌드를 열어요. Vite 빌드 결과를 `.ait` 파일로 묶어 올려요.
- 구글 플레이는 Capacitor 안드로이드 빌드(`add-mobile-apps`)를 `.aab`로 올려요.
- 두 곳의 차이: 로그인(토스 안에서는 다른 로그인 화면 금지 / 자유), 나이(19+ / 직접 정함), 분류 규칙(모르는 사람 연결이 있으면 토스에서는 만남·소개팅 → 법인 필요), 위치(민감정보: 신고·동의 창 필요).

## Goals / Non-Goals

**Goals:** 코드 하나, 명령만 바꿔 두 곳용 빌드. 화면 코드에 "토스면 ~" 같은 if를 흩뿌리지 않기.
**Non-Goals:** iOS 스토어 출시, 결제·광고.

## Decisions

### D1. 빌드 대상은 빌드할 때 한 번만 정한다
- `vite build --mode toss` / `--mode android` / `--mode demo` → `import.meta.env.MODE`
- `src/platform/target.js`가 이 값을 한 번 읽고, 다른 코드는 `target`만 봐요.

### D2. 기능은 주석이 아니라 스위치 표로 끈다 (Table-driven, OCP)

**왜 주석이 아닌가**
| | 주석으로 막기 | 스위치(true/false)로 끄기 |
|---|---|---|
| 다시 켤 때 | 여러 파일의 주석을 찾아 풀어야 함 | 표의 한 단어만 바꿈 |
| 코드가 낡지 않나 | 주석 처리된 코드는 실행·시험이 안 돼서 다른 코드가 바뀌면 조용히 망가짐 | 구글 플레이 빌드에서 매일 실행·시험돼서 늘 살아 있음 |
| 코드 지침 | "안 쓰는 코드 지우기" 위반 | 지침에 맞음 |
| 실수 | 주석 하나 빼먹으면 반쯤 켜진 상태 | 한 곳에서만 정해서 반쯤 켜질 일 없음 |


```js
// src/platform/features.js — 빌드 대상마다 켤 기능 (새 대상 = 한 줄 추가). 지금 코드에 있는 것은 canSwipe, canShareLocation
const FEATURES_BY_TARGET = {
  web:     { canSwipe: true,  canShareLocation: true },
  android: { canSwipe: true,  canShareLocation: true },
  // 토스: 친구끼리만. 법인 등록 뒤 canSwipe, 위치기반서비스 신고·동의 창 뒤 canShareLocation을 true로
  toss:    { canSwipe: false, canShareLocation: false }
};
// minAge는 미미 결정 뒤 추가 (토스 19, 구글 플레이 18?, 시연 14 — CLAUDE.md 8번 진행 6)
```

- 탭 표(`tabs.js`)는 `canSwipe`가 false면 스와이프 탭을, `canShareLocation`이 false면 홈(지도) 탭을 빼요. 그래서 토스 빌드는 채팅 · 친구 · 나 3칸이고 첫 탭은 채팅이에요. 나 탭의 "친구와 위치 공유" 토글도 `canShareLocation`을 따라요.
- 지도는 `refine-screens` 뒤로 어느 빌드든 위치 공유를 켠 친구만 보여요. `Validator`의 나이는 `minAge`를 받아요 (추가 예정).
- 화면 코드는 "토스인지" 모르고 "스와이프를 켜도 되는지"만 알아요 (DIP).

### D3. 로그인은 약속 뒤로

```text
src/data/login/
├─ LoginProvider.js   약속: signIn({ auth, functions }) → Result<uid>
├─ AnonKeyLogin.js    토스: User.createAnonymousKeyAuthCode() → 서버 함수 tossLogin → Firebase 맞춤 토큰 (화면 없음)
├─ GoogleLogin.js     @capacitor-firebase/authentication (안드로이드 앱 안 구글 로그인) — 아직
├─ EmailLogin.js      Firebase 이메일·비밀번호 (구글 계정이 없는 사람용) — 아직
└─ DemoLogin.js       웹에서 서버 시험: Firebase 익명 로그인 (화면 없음, 브라우저마다 다른 사람)
```

- **토스는 익명 사용자 키로 (2026-10-13 결정, 채널톡 확인 중)**: 사용자는 이미 토스에 로그인돼 있어서 로그인 화면이 없어요. 미니앱이 토스 SDK에 일회용 코드를 받아 서버 함수에 넘기면, 서버 함수가 토스 파트너 API(mTLS)로 `anonKey`를 받아 Firebase uid(`toss` + 해시)를 정하고 맞춤 토큰을 돌려줘요. 앱이 보낸 키는 믿지 않아요.
  - 왜 토스 로그인이 아닌가: 토스 로그인은 **사업자 등록이 필수**이고 동의 창이 생겨요. 익명 키는 화면 없이 사용자를 구분할 수 있고, 아이디·닉네임·생년월일은 지금 가입 화면에서 한 번만 받아요.
  - 토스 SDK는 `src/platform/tossSdk.js`에서만 불러오고, 토스 빌드가 아니면 `vite.config.js`가 묶지 않아요 (설치 전에도 다른 빌드가 됨).
- 로그인 화면은 안드로이드만 (`GoogleLogin`·`EmailLogin` 버튼). 토스·웹은 화면 없이 바로 로그인.

### D4. 앱인토스 설정 파일
- `apps-in-toss.config.ts` (SDK 3.x, 예전 이름 granite.config.ts): `appName: "ururu"`, `brand.primaryColor`, `permissions: []`, `webBundleDir: "dist-toss"`. 화면 이름 "우르르"는 콘솔에서. (아래는 SDK 2.x 문서 기준이었던 옛 메모) `brand.displayName: "우르르"`(콘솔과 같게, 못 바꿈), `brand`, `web.port: 5173`, `web.commands.build: "vite build --mode toss"`, **`outdir: "dist-toss"`**(`dist/`에는 `moyeo.html`이 있어서 섞지 않기), `permissions: []`(위치 끈 빌드).

## Risks / Trade-offs

- [익명 키 + 앱 안 가입이 "토스 로그인 외 로그인 금지" 정책에 걸릴 수 있음] → 채널톡 답을 받기 전까지 출시 준비만. 걸리면 `TossLogin`(사업자 등록)으로 바꾸고 `AnonKeyLogin` 대신 끼움 (RealServer는 그대로)
- [mTLS 인증서 준비에 시간] → 앱인토스 콘솔 준비를 가장 먼저 시작
- [토스 웹뷰에서 구글 지도 주소 제한] → `docs/guides/google-maps-api-key-guide.md` 5번에 토스 도메인 추가
- [나이] → 2026-10-13 미미 결정: 모든 빌드 만 19세 (`MIN_AGE`). 빌드별 `minAge` 스위치는 필요 없어짐

## Migration Plan

1. `features`·`target` 먼저 (시연 빌드가 지금과 같은지 비교)
2. 로그인 약속 → 토스 익명 키 → 구글 로그인
3. `build:toss` → PC 브라우저 확인 → `.ait` 업로드 → 토스 앱 테스트 QR (`docs/guides/apps-in-toss-release-guide.md`)
4. `build:android` → `.aab` (`docs/guides/google-play-release-guide.md`)
