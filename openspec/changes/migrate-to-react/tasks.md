# Tasks

> **진행 상황 (2026-10-13)**: 모든 그룹의 코드를 작성했어요. Claude 작업 공간에서 esbuild 묶음 + 크롬으로 원본과 23장면 × 2크기(폰·PC) 사진 비교 46개 통과, 시험 31개 통과(bun으로 같은 시험 실행).
> 남은 것: 미미 PC에서 `npm install` → `npm run test` → `npm run dev` → `npm run compare` → `npm run build:single`. 다 되면 아래 칸을 그룹별로 체크해요.

> 모든 그룹의 공통 완료 기준: 그 기능 spec의 시나리오 전부 통과 + `npm run compare` 사진이 원본과 같음 + `npm run test` 통과 + 콘솔 오류 없음 + `docs/coding-rules.md` 6번 체크리스트.
> 시나리오 번호(예: SHELL-30)는 `openspec/specs/<기능>/spec.md`의 `#### Scenario:` 이름이에요.
> 다른 기능의 창을 여는 시나리오(예: 채팅방에서 프로필 열기)는 그 기능 그룹이 끝난 뒤 11.1에서 한 번 더 확인해요.

## 1. 준비 (뼈대)

- [x] 1.1 v13 완성본을 `legacy/moyeo-v13.html`로 복사하고, 더블클릭해서 v13과 같은지 확인
- [ ] 1.2 `package.json`(버전 고정), `vite.config.js`, `index.html`, `src/main.jsx`를 만들고 `npm install` 뒤 `npm run dev`가 빈 화면 없이 뜨는지 확인
- [x] 1.3 `src/core/`, `src/data/`를 그대로 옮기고 `diff`로 원본과 한 글자도 다르지 않은지 확인
- [ ] 1.4 Vitest 설정 후 `data/` 시험(SwipeLimit, Validator, LikeStore, FriendSearch, AccountService, ChatStore, StoryStore, PingService)을 쓰고 `npm run test` 통과 확인
- [x] 1.5 `tools/compare/`에 원본·React 버전을 같은 크기(390×844, 1280×900)로 열어 같은 순서로 누르고 사진 비교하는 시험을 만들고, 원본끼리 비교해 100% 같다고 나오는지 확인
- [ ] 1.6 `npm run build:single`로 `dist/moyeo.html`이 새로 만들어지고 더블클릭으로 열리는지 확인

## 2. 공통 틀 (app-shell)

- [ ] 2.1 `AppContext`, `useStore`, `useInterval`, `useClock`을 만들고 `useStore` 시험(알림 뒤 다시 그림) 통과 확인
- [ ] 2.2 `Icon`, `views.jsx`(Avatar, Square, Photo, TypingDots, TopBar)를 만들고 같은 사람으로 그린 HTML이 원본 `views.js`와 같은지 시험으로 확인
- [ ] 2.3 `OverlayStore`, `OverlayHost`, `createNav`를 만들고 SHELL-40~43 확인 (+ `closeKinds`, `closeTop` 시험)
- [ ] 2.4 `ToastStore`, `ToastView`를 만들고 SHELL-30~34 확인 (+ 두 번 연달아 show 시험)
- [ ] 2.5 `NavBar`, `tabs.js`, `App.jsx`를 만들고 SHELL-20~26, 50~57 확인
- [ ] 2.6 `Splash`를 만들고 SHELL-10~11 확인, 로고 화면 사진 비교
- [ ] 2.7 `useDrag` 훅을 만들고 가짜 포인터 이벤트로 dx·터치 판정 시험 통과 확인 (스토리 크기 막대·프로필 사진·스와이프 카드가 같이 씀)
- [ ] 2.8 `StoryRing`을 만들고 STO-01~07 확인, 테두리 3종(안 봄 / 봄 / 나) 사진 비교 (홈·채팅·친구 목록이 같이 씀)

## 3. 계정 (account)

- [ ] 3.1 `DateWheelPicker.jsx`를 만들고 ACC-16~17, 30~34 확인 (2월·윤년, 손 뗄 때 한 칸씩 멈춤을 손으로)
- [ ] 3.2 `SignupScreen.jsx`를 만들고 ACC-10~19 확인, 사진 4장(빈 칸 / 중복 / 사용 가능 / 만 14세 미만) 비교
- [ ] 3.3 시작 흐름을 연결하고 ACC-01~03, 40~42 확인 (가입 → 새로고침 → 바로 홈)
- [ ] 3.4 `SettingsPanel.jsx`를 만들고 ACC-50~55 확인
- [ ] 3.5 회원탈퇴를 연결하고 ACC-60~63 확인 (탈퇴 → 로고 → 가입, 같은 아이디로 다시 가입 가능)

## 4. 홈 지도 (home-map)

- [ ] 4.1 `MapBackground`, `SharePill`, `PersonCard`를 만들고 MAP-01~04, 09~10 확인
- [ ] 4.2 `MapPin`을 만들고 MAP-05~08, 11 확인 (점선 없음)
- [ ] 4.3 누르기를 연결하고 MAP-20~24 확인
- [ ] 4.4 위치 움직임을 연결하고 MAP-30~31 확인 (카드 줄을 민 채 3초 기다려도 스크롤 그대로)

## 5. 채팅 (chat)

- [ ] 5.1 `ChatListScreen`, `StoryRow`, `ChatRow`를 만들고 CHAT-01~11 확인, 채팅 탭 사진 비교
- [ ] 5.2 `ChatHeader`, `MessageList`, `MessageBubble`을 만들고 CHAT-20~39 확인 (두 번 터치는 손으로)
- [ ] 5.3 `Composer`, `useVoiceRecorder`를 만들고 CHAT-40~46 확인
- [ ] 5.4 새 메시지를 연결하고 CHAT-50~51, SHELL-50 확인 (3.5초 뒤 Teo → 숫자·소리·배너 → 배너 누르면 채팅방)
- [ ] 5.5 `CallScreen`을 만들고 CHAT-60~62 확인
- [ ] 5.6 `ReportDialog`를 만들고 CHAT-70~72 확인 (신고 뒤 지도·채팅·스와이프·친구 찾기에서 사라짐)

## 6. 스토리 (story)

- [ ] 6.1 `StoryText`, `storyStyle.js`를 만들고 STO-50~53 확인 (같은 값이면 원본과 같은 style 글자인지 시험)
- [ ] 6.2 `StoryViewer`를 만들고 STO-10~17, 60 확인
- [ ] 6.3 `ColorPalette`를 만들고 STO-40~45 확인
- [ ] 6.4 `DragSlider`를 만들고 STO-25 확인
- [ ] 6.5 `StoryEditor`를 만들고 STO-20~32 확인 (칸 3개를 차례로 눌러 막대 범위 변화, "없음"이면 흐림)

## 7. 프로필 (profile)

- [ ] 7.1 `PhotoCarousel`을 만들고 PRO-02~05 확인
- [ ] 7.2 `ProfileView`, `ProfileInfo`, `ProfileActions`를 만들고 PRO-01, 06~07, 10~17 확인, 사진 5장 비교
- [ ] 7.3 `ProfileHeader`를 만들고 PRO-20~24 확인 (바꾸고 새로고침해도 유지)
- [ ] 7.4 `PhotoManager`를 만들고 PRO-30~38 확인 (11장 고르면 10장만)

## 8. 스와이프 (swipe)

- [ ] 8.1 `SwipeCard`, `SwipeScreen` 틀을 만들고 SWP-01~05, 10~11 확인
- [ ] 8.2 `useCardDrag`를 만들고 SWP-20~28 확인 (PC 마우스 + 폰 크기 터치 흉내)
- [ ] 8.3 좋아요 결과를 연결하고 SWP-30~33 확인
- [ ] 8.4 `SwipeEmpty`와 저절로 다시 그리기를 만들고 SWP-40~45 확인 (빈 화면 문구 함수 시험 3가지)

## 9. 친구 탭 (friends)

- [ ] 9.1 `FriendSearchBox`를 만들고 FRD-10~17 확인, 결과 4종 + 못 찾음 사진 비교
- [ ] 9.2 `LikeRow`, `StoryLikeRow`, `FriendsScreen`을 만들고 FRD-01, 05~06, 21~32 확인
- [ ] 9.3 `FriendList`를 만들고 FRD-40~42 확인
- [ ] 9.4 하트 숫자 FRD-50 확인 (스토리 올림 → 3초 뒤 +1 → 친구 탭 열면 빠짐)

## 10. 소리 울리기 (ping)

- [ ] 10.1 `PingPermission`의 처음 묻기를 만들고 PNG-10~16 확인 (답한 뒤 새로고침하면 안 물음)
- [ ] 10.2 `PingPermission`의 설정 안내를 만들고 PNG-20~24 확인
- [ ] 10.3 프로필 버튼을 연결하고 PNG-01~07 확인 (홈에서 연 친구 프로필에만 버튼, 30초 규칙 배너)

## 11. 마무리 (전체 확인)

- [ ] 11.1 `npm run compare` 전체(9개 기능)를 PC·폰 크기로 돌려 모두 같음 확인
- [ ] 11.2 `openspec validate --all --strict` 통과 확인
- [ ] 11.3 `docs/code-structure-and-patterns.md` 파일 표를 React 파일로 갱신하고, 표에 없는 파일이 없는지 확인
- [ ] 11.4 `build.mjs`와 예전 `src/ui/*.js`를 지우고 `npm run build`, `npm run build:single`이 그대로 되는지 확인
- [ ] 11.5 `legacy/` 폴더를 지울지 미미에게 묻기
- [ ] 11.6 `openspec archive migrate-to-react`로 변경을 보관하고 `openspec/changes/archive/`에 날짜 폴더가 생겼는지 확인
