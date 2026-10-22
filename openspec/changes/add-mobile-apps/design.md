# Design

## Context

- `migrate-to-react`가 끝나면 웹 화면은 `npm run build`로 `dist/`에 만들어져요.
- Capacitor는 이 `dist/`를 폰 앱 안의 웹 화면(WebView)으로 보여줘요. 그래서 화면 코드는 하나예요.
- 폰에만 있는 기능은 화면 코드가 직접 부르지 않고 `src/platform/`, `src/data/storage/`를 거쳐요 (`docs/architecture.md` 2번 의존 방향).

## Goals / Non-Goals

**Goals:**
- `npm run cap:android` / `npm run cap:ios` 한 줄로 앱 프로젝트를 최신 화면으로 맞추기
- 폰에서만 필요한 것을 더하되 PC 화면·동작은 그대로

**Non-Goals:**
- 앱스토어·플레이스토어 올리기, 앱 아이콘 디자인
- 푸시 알림, 중요 알림 권한, 서버 계정 (→ `docs/roadmap.md` Phase 4)

## Decisions

### D1. Capacitor 8 (React Native·Expo 아님)
- 같은 웹 화면을 감싸서 `migrate-to-react` 결과를 그대로 써요. React Native는 화면을 전부 새로 그려야 해서 버렸어요.

### D2. 폰 기능은 Adapter 뒤에 숨긴다

```text
src/platform/
├─ isNative.js        # Capacitor.isNativePlatform() 한 곳에서만 확인
└─ backButton.js      # @capacitor/app backButton → overlays.closeTop() → 홈 → App.exitApp(). 웹에서는 아무것도 안 함
src/data/storage/
├─ WebStorage.js      # 브라우저 저장소 (원본 ProfileRepository 안의 코드를 꺼낸 것)
└─ DeviceStorage.js   # 폰 저장소 (@capacitor/preferences)
```

- 어느 저장소를 쓸지는 `main.jsx` 한 곳에서 정해요 (DIP). 화면 코드와 `AccountService`는 몰라요.

### D3. 폰 저장소를 "미리 읽기"로 감싼다
폰 저장소는 기다려야 하는(async) 방식이고 원본 `ProfileRepository.load()`는 바로 돌려주는(sync) 방식이에요. 화면 코드를 안 바꾸려고:
1. `main.jsx`가 그리기 **전에** `await storage.preload()`로 한 번 읽어 메모리에 둬요.
2. `load()`는 메모리에서 바로 돌려줘요.
3. `save()`·`clear()`는 메모리를 바로 바꾸고 폰 저장소에는 뒤에서 써요.

### D4. 안전 영역은 새 CSS 파일 하나
- `styles/platform.css`에서 `.app`에 `env(safe-area-inset-*)` 여백을 줘요. PC에서는 값이 0이라 그대로예요. 원본 CSS 9개는 안 고쳐요.

### D5. 글꼴은 `@fontsource-variable/noto-sans-kr`
- 굵기 4개를 파일 하나에 담는 방식이라 3.7MB로 가벼워요. `base.css` 글꼴 이름 맨 앞에 `"Noto Sans KR Variable"`만 더해요.

### D6. 키보드는 먼저 확인하고 필요할 때만 고친다
- 원본 CSS 그대로 두고 안드로이드·iOS에서 확인해요. 가려지면 `@capacitor/keyboard`를 `docs/tech-stack.md`에 먼저 올린 뒤 고쳐요 (YAGNI).

## Risks / Trade-offs

- [iOS는 Mac 없이 빌드 불가] → `ios/` 프로젝트까지만 만들고, 실행 방법을 `docs/tech-stack.md` 9번에 적어 둠
- [변수 글꼴이 원래 글꼴과 글자 모양이 아주 조금 다를 수 있음] → `npm run compare`로 PC 사진 비교
- [WebView에서 `window.location.reload()`] → 회원탈퇴 뒤 앱 안에서 새로고침이 되는지 에뮬레이터로 확인

## Migration Plan

1. `migrate-to-react` 완료 확인
2. Capacitor 설치 → `npx cap add android`, `npx cap add ios`
3. 폰 기능 하나씩 더하고 그때마다 PC 비교 사진이 그대로인지 확인
4. 되돌리기: `android/`, `ios/`, `src/platform/`, `styles/platform.css`를 지우면 웹 버전은 그대로
