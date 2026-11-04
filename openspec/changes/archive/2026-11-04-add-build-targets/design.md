# Design

## Context

- 구글 플레이 앱은 Capacitor로 웹 빌드를 안드로이드 앱에 넣어요 (add-mobile-apps).
- 시연용 한 장 HTML은 서버 없이 가짜 서버로 모든 기능을 보여줘요.

**Goals:** 코드 하나, 명령만 바꿔 빌드. 화면 코드는 "어디용인지" 모르고 "이 기능을 켜도 되는지"만 알아요 (DIP).

## Decisions

### D1. 빌드 대상
- `vite build --mode android` / 그 밖 → `import.meta.env.MODE` → `src/platform/target.js`가 `"android"` · `"web"`으로 바꿔요.

### D2. 기능 표 (`src/platform/features.js`)
- 대상마다 켜고 끌 기능을 한 표에. 끈 기능의 코드는 지우지 않고 스위치만 꺼서 계속 시험돼요.
- 탭 표는 `canSwipe`가 false면 스와이프 탭을, `canShareLocation`이 false면 홈(지도) 탭을 빼요.
- 버린 대안: 화면마다 `if (target === …)` → 대상이 늘면 고칠 곳이 흩어져서

### D3. 로그인 (`src/data/login/`)
```
LoginProvider.js   약속: signIn(firebase, options) → Result<uid>
└─ GoogleLogin.js  웹: Firebase 팝업 / 안드로이드: 휴대폰 구글 계정 선택 창
```
- `RealServer`는 약속만 알아서, 로그인 방법을 바꿔도 서버 코드는 그대로예요.

## Risks

- [안드로이드 웹뷰에서 구글 로그인 팝업이 막힘] → 플러그인 `@capacitor-firebase/authentication`으로 휴대폰 계정 선택 창 사용, Firebase에 SHA-1 등록
