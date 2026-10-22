# progress.md — 진행 상황과 이어서 할 일 (다른 Claude에게 넘기는 문서)

> 마지막 작업: 2026-10-20 (MVC 정리 3-9, 친구가 많아져도 느려지지 않게 3-10) / 2026-10-15 아침 (Claude — 중복 정리, 제재 기준·채팅 이용 수칙, 앱인토스 체크리스트 맞추기, 스토어 등록 파일, 아래 3-8)
> **이어받는 Claude는 이 순서로 읽기**: `CLAUDE.md` → `docs/architecture.md` → `docs/roadmap.md` "구현 현황" → 이 문서 → `docs/file-tree.md` → `openspec/changes/` 중 아직 archive 안 된 것들
> 이 문서는 하나만 두고 계속 고쳐 써요 (새 진행 문서를 만들지 않기, CLAUDE.md 1번).
> **2026-10-21: 아키텍처 기준 구현 현황·남은 일은 `docs/roadmap.md` "구현 현황"에 정리했어요.** 아래 3~7번은 10-20까지의 기록이라, 10-21 작업(카카오 지도, 국가·지역, 한국어/영어, 운영자 사이트, 새 Firebase `ururu-6164b`)은 roadmap 쪽이 최신이에요.

---

## 1. 지금 상태 한 줄

React 전환과 화면 다듬기는 끝났고, **진짜 서버(Firebase) 코드도 써 두었어요**(`RealServer`, 보안 규칙, 서버 함수, 토스 익명 키 로그인). `.env`가 비어 있으면 지금처럼 가짜 서버로 열려요. 남은 건 대부분 **미미 PC에서 할 일**: `npm install` → Firebase 프로젝트 만들기 → 에뮬레이터로 두 브라우저 확인 → 앱인토스 SDK·인증서.

## 2. 일하는 환경에서 알아둘 것

- 미미 PC 폴더: `D:\moyeo-20231013-1306`
- **미미 PC에서 아직 `npm install`을 한 번도 안 했어요.** 그래서 `npm run dev/test/build`가 미미 PC에서 실제로 돌아간 적이 없어요. 첫 실행 때 오류가 나면 그것부터 고쳐요.
  - Node 22.22.2 이상 필요 (jsdom 30, vite 8 때문)
  - 버전은 `package.json`·`docs/tech-stack.md` 1번에 고정 (npm 레지스트리에 있는 것 확인함)
- 이전 Claude들은 npm이 막힌 곳에서 일해서, **esbuild로 묶어 크롬(Playwright)으로 확인**했고, 시험은 bun으로 돌렸어요 (지금 45개 통과).
  - 그래서 **firebase 패키지로 실제 Firebase에 붙여 본 적은 없어요.** 처음 붙일 때 나는 오류는 그때 고쳐요.
  - `dist/moyeo.html`도 esbuild로 만든 것이라, 미미 PC에서 `npm run build:single`로 한 번 다시 만들면 정확해요
- `dist/moyeo.html` = 미미가 더블클릭해서 보는 결과물. **src·styles를 고치면 반드시 덮어쓰기** (CLAUDE.md 2번). `npm run build:single`
- 지울 파일은 `_to_delete/`로 옮김 (rm 금지). 지금 그 안에 작업용 tgz들과 `dist-single-mistake/`, `removed-ui/`가 있어요 → 미미가 확인 후 지울 것
- Git: 미미가 쓰기로 했지만 `git init`을 했는지 확인 못 함

## 3. 끝난 일

### 3-1. React 전환 (`openspec/changes/migrate-to-react`, archive 전)
- `src/core`, `src/data`는 v13 그대로 옮김 → 그 뒤 기능 변경으로 일부 고침 (아래 3-2)
- `src/ui`를 React 19 + 훅으로 다시 짬 (파일 64개). 원본 v13은 `_to_delete/legacy/`로 옮김 (2026-10-15)
- 원본과 화면 비교 46장(23장면 × 폰·PC) 모두 같음 확인 → 그 뒤 화면을 일부러 바꿔서 지금 정답 사진은 "승인한 React 화면" (`npm run compare:approve`)
- `vite.config.js`: `build`→`dist/`, `build:single`→`dist/moyeo.html`(덮어씀), `build:toss`→`dist-toss/`
- 시험: `tests/data.test.js`, `tests/ui.test.js` / 비교: `tools/compare/`

### 3-2. 미미 요청 화면 다듬기 (`openspec/changes/refine-screens`, archive 전)
- 홈: 카드 줄·위치 공유 알약 삭제, 지도 꽉 차게. 지도에는 **위치 공유를 켠 친구만** (`UserStore.friendsOnMap`, 친구 `isSharing`). 모르는 사람 없음
- 위치 공유는 **나 탭 설정 토글 한 곳에서만** (채팅방 토글·+ 메뉴는 하지 않기로 결정)
- 탭 왼쪽 위 제목("모여/채팅/스와이프/친구") 삭제
- 채팅 탭 안내 "두 번 터치해서 메시지 저장" / 채팅방: 프로필은 **동그라미 눌러야만** 열림, "· 프로필 보기"·맨 위 안내·말풍선 아래 시간 삭제("저장됨"만 남김)
- 스와이프: **1시간에 10명**(가장 먼저 본 사람이 1시간 채우면 한 자리씩 열림), 남은 수 글자·"눌러서 사진 n장 보기" 삭제
- 친구 탭: "친구 찾기", 받은 좋아요 설명 줄 삭제, "좋아요를 받았어요", 스토리 없을 때 안내 삭제
- 나 탭: 사진 칸 3열로 크게, 설정 설명 글 삭제, 스토리 편집 = [사진 그림 버튼=사진 추가(미리보기에만)] [올리기 그림 버튼=스토리 올리기], 크기 막대가 색 칸 위, 고른 칸 밑줄 삭제(미미가 직접), 입력 칸 "일상을 스토리로"(미미가 직접)
- 용어: 스토리 꾸미기의 "글자" → **"폰트"** (폰트 배경 / 폰트 / 폰트 테두리 / 폰트 크기). 코드 주석·문서도 같이
- 크기 규칙: `styles/base.css` `:root`에서 **앱 폭에 비례**(`--appw`, clamp). 390px에서 14/13/22/20/38px, 320px에서 글자 12px
- 이름과 나이는 어디서든 같은 글꼴·크기·굵기
- 전체 화면 프로필: 이름·나이 말고 나머지 폰트 **10px 고정** (`--fs-profile`)

### 3-3. 관심사 키워드 (`openspec/changes/add-interests`, archive 전)
- 나 탭 "관심사 n / 5" 상자: 칩 + 입력 칸 "키워드" + [+]. 최대 5개, 10자. 가입 정보와 같이 저장
- 나 탭 내 프로필 동그라미 → 내 전체 화면 프로필 미리보기

### 3-4. 빌드 대상별 기능 스위치 (`src/platform/features.js`)
| | canSwipe | canShareLocation |
|---|---|---|
| web / android | true | true |
| toss | **false** (법인 등록 뒤 true) | **false** (위치기반서비스 신고·동의 창 뒤 true) |
- toss 빌드: 탭이 채팅 · 친구 · 나 3개, 첫 탭은 채팅, 나 탭 위치 공유 토글 없음 (마지막 작업, 확인 완료)

### 3-5. 문서·지침
- `CLAUDE.md`: 원래 파일 고치기 / 결과물 덮어쓰기 / **화면에 설명 문구 넣지 않기** / 폰 비율 맞추기(확인 크기 표)
- `docs/file-tree.md`: 전체 파일 트리는 여기 한 곳만

### 3-6. 진짜 서버 준비 (2026-10-13 저녁, `add-real-server` · `add-build-targets` · `add-safety-basics`)
- **서버 고르기**: `main.jsx`가 `.env`의 `VITE_FIREBASE_API_KEY`·`PROJECT_ID`를 보고 `RealServer` / `FakeServer`. 서버 모드는 시연 사람 없이 빈 상태로 시작
- **약속(ChatServer) 넓힘**: `signIn`, `register`, `updateProfile`, `updatePhotos`, `setSharing`, `setMessageSaved`, `declineLike`, `report`, `deleteStory`, `sendStoryLike`. 서버 답을 기다리는 일(로그인·가입·아이디 찾기·탈퇴)은 Promise → `AccountService`·`FriendSearch`가 `async`, 부르는 화면(가입·찾기·탈퇴·App 시작)도 맞춤. FakeServer는 같은 모양으로 아무 일 안 함
- **화면 쪽 한 줄씩**: 저장(MessageList), 스토리 좋아요(StoryViewer), 스토리 삭제(StoryEditor), 사진(PhotoManager), 위치 토글(SettingsPanel), 신고 이유(ReportDialog: 고른 이유를 서버에 보냄), 받은 좋아요 거절(`FriendActions.decline`)
- **거리·동네 없는 사람**: 서버 사람은 `km`가 null이라 `kmText`·`joinDots`(views.jsx)로 "undefinedkm"·빈 " · "가 안 보이게. 시연 화면은 그대로
- **RealServer**: 로그인 → 내 문서 → `connect()`에서 친구·좋아요·스토리 좋아요·차단 구독, 친구마다 정보·스토리·대화·입력 중 구독. 사진은 1280px로 줄여 Storage에. 쓰기 실패 → `"error"` 배너, 인터넷 끊김 → `"offline"` 배너. **위치는 아직**(add-google-map 뒤), **소리 울리기 받기는 아직**(보내기만 기록)
- **로그인**: `src/data/login/` — `AnonKeyLogin`(토스: SDK 코드 → 서버 함수 `tossLogin` → 맞춤 토큰), `DemoLogin`(웹 서버 시험: Firebase 익명). 토스 SDK는 `src/platform/tossSdk.js`에서만, 토스 빌드가 아니면 `vite.config.js`가 묶지 않음(설치 전에도 다른 빌드 됨)
- **서버 파일**: `firestore.rules`, `storage.rules`, `firebase.json`, `firestore.indexes.json`, `functions/`(tossLogin, deleteAccount, cleanup), `.env.example`, `package.json`에 `firebase`·`firebase-tools`와 `emulators`·`deploy:server` 명령
- **문서**: `docs/guides/firebase-setup-guide.md`(새), `apps-in-toss-release-guide.md`(익명 키, outdir `dist-toss`, 위치 끔), `docs/policy/` 약관·개인정보처리방침·신고 처리 **초안**, openspec 변경 3개 tasks·spec, `code-structure-and-patterns.md`, `file-tree.md`, `tech-stack.md`
- 확인: 시험 45개 통과, 시연 빌드(가입·친구 찾기·거절·신고·탈퇴)와 토스 빌드(탭 3개)를 크롬 390·320px로 눌러 봄, 오류 없음

### 3-7. 안전 장치·대화 규칙 (2026-10-13 밤, `add-safety-basics` 1.2~1.4)
- 차단 / 차단 풀기 (채팅방 ⊘ 버튼, 나 탭 "차단한 사용자"), 서버 `blocks.kind`(report·block)
- 채팅 사진 보내기 끔 (`canSendPhoto: false`, 서버 규칙도)
- 대화 규칙: 개인정보 공유·도박·욕설 → `****` + 보낸 사람 채팅창에 경고 줄, **경고 2회 → 30일 이용 제한 화면**(닫을 수 없음), 첫 대화 상대 채팅방 맨 위 규칙 안내
  - 코드: `src/data/MessageFilter.js`(= `functions/messageFilter.js`, 시험이 같은지 확인), `ModerationStore.js`, `ui/start/BanScreen.jsx`, `nav.showBan()`
  - 서버: `firestore.rules` `isBanned()`(제한 중이면 메시지·친구 신청·스토리 거절), `moderation/{uid}`(서버 함수만 씀), 서버 함수 `moderateMessage`
  - 탈퇴해도 경고 기록은 남김 (보관 기간은 개인정보처리방침 빈칸 — 정해지면 cleanup에 지우는 코드 추가)
- 규칙 문서: `docs/policy/report-handling.md` 5-1, `terms.md` 제7조, `privacy.md` 2번
- 시험 57개 통과, 토스 빌드 320px에서 규칙 안내 → 경고 1회 → 경고 2회 제한 화면 → 다시 열어도 제한 확인

### 3-8. 중복 정리 · 제재 기준 · 출시 준비 (2026-10-15, `add-safety-basics` 1.5~1.8, `add-build-targets` 3.2b~c)
- **중복 정리** (원본은 하나만):
  - `functions/messageFilter.js`(= `src/data/MessageFilter.js` 복사본) → `_to_delete/`. 이제 원본은 `src/data/`에만 두고 `tools/copy-shared.mjs`가 `functions/shared/`로 복사(`npm run emulators`·`deploy:server`·firebase predeploy가 저절로). 제재 기준도 같은 방식(`sanctionRules.js`) → 서버 함수의 숫자 복사본(`WARNINGS_TO_BAN`, `BAN_MS`)도 없앰
  - `legacy/`(원본 v13 코드 38개, React 코드와 같은 일) → `_to_delete/legacy/` (미미가 확인 뒤 지움)
  - 채팅 사진·스토리 사진 "한 장 골라 읽기" 같은 코드 2벌 → `PhotoPicker.pickImage()` 하나
  - `styles/likes.css`의 `.acceptbtn` 두 번 쓴 것 → 하나로
  - 약관·수칙 글: 앱 화면과 제출 문서가 같은 `docs/policy/*.md`를 씀 (앱이 `?raw`로 읽음)
  - 찾아봤지만 그대로 둔 것: CSS의 다크 모드·넓은 화면 `@media` 안 같은 선택자(일부러 덮어쓰는 것), `dist/moyeo.html`·`dist-toss/`·`ururu.ait`(빌드 결과물)
- **제재 기준** (미미): 위반 1회 경고 → 2회 **7일** 정지 → 3회 이상 **영구정지**, 횟수는 줄지 않음, 중대한 위반은 운영자가 즉시 영구정지(`isPermanent`). 앱·서버 함수·`firestore.rules`·약관 제7조·운영정책 5장·개인정보처리방침 모두 맞춤
- **채팅 이용 수칙** (미미가 준 글 그대로): `docs/policy/chat-rules.md` → 첫 대화 채팅방 맨 위 전문, [이용약관]·[운영정책] 누르면 열림. 수칙 3번 경로에 맞춰 **받은 메시지 길게 눌러 신고**(그 메시지가 신고 기록에 남음)와 **프로필 위쪽 차단 버튼**을 더함. 나 탭에 **"정책"** 상자(수칙·약관·운영정책·개인정보처리방침)
- **앱인토스 비게임 체크리스트 맞추기** (토스 빌드만): 자체 뒤로 버튼 숨김 + 토스 뒤로가기로 창 닫기·첫 화면이면 종료, 라이트 모드 고정, 가입 직후 "소리 울리기" 창 안 띄움, 거리(km) 숨김. 모든 빌드: 두 손가락 확대 막기
- **문서**: `docs/policy/compliance.md`(준수사항 점검표), `docs/guides/launch-checklist.md`(실제 데이터 → 앱인토스 → 플레이 순서표, 준비물), `store/apps-in-toss/`·`store/google-play/`(등록 글 초안 + 이미지)
- **스토어 이미지**: `npm run store:images` → 토스 로고 600·세로 636×1048 4장·가로 1504×741, 플레이 아이콘 512·그래픽 1024×500·폰 1080×1920 6장
- 확인: 시험 62개 통과(bun), 시연·토스 빌드를 크롬 390px로 눌러 봄 (경고 → 7일 정지 → 영구정지, 길게 눌러 신고, 프로필 차단, 약관 링크, 토스 빌드 라이트 모드·뒤로 버튼 없음·시작 창 없음)
- **이 작업 공간은 npm이 막혀서 esbuild로 묶었어요.** 미미 PC에서 `npm run build:single`·`build:toss`로 한 번 다시 만들면 정확해요 (`.md?raw`는 Vite가 기본으로 읽어요)

### 3-9. MVC 정리·성능 점검 (2026-10-20, 미미가 준 "객체지향 복습"·"Unity 권장 아키텍처" 기준 → CLAUDE.md 6번)
- 화면(View)이 직접 Store + 서버를 바꾸던 곳 7개를 Controller로 옮김: `ChatActions`(Composer·MessageList·StoryViewer), `SafetyActions`(ReportDialog·SettingsPanel), `MeActions`(PhotoManager·SettingsPanel·StoryEditor). 이제 `.jsx`에서 `server.*`를 부르는 곳이 없음
- `sounds.notification.isEnabled = …`(밖에서 필드 바꾸기) → `NotificationSound.toggle()`
- 성능: `ChatStore.setTyping`은 값이 그대로면 알리지 않음(상대가 칠 때마다 전체 다시 그리기 방지), 나 탭 차단 목록은 한 번만 계산
- 시험: `tests/actions.test.js` 9개 추가(화면 없이 Controller 시험), 깨져 있던 features 시험(canTryAnonymous) 고침 → 71개 통과. 시연·토스 빌드 눌러 보기 오류 없음
- 그때 남겨 둔 성능 숙제 3개는 바로 아래 3-10에서 고침

### 3-10. 친구가 많아져도 느려지지 않게 (2026-10-20, 미미: "앱이 커지고 친구도 많아질 테니 성능 문제가 생기면 안 돼")
- **다시 그리기를 주제별로**: Store가 `notify(TOPIC.chats, TOPIC.chat(id))`처럼 무엇이 바뀌었는지 알리고(`core/topics.js`), 화면은 자기 주제만 구독(`useChanges`, `ui/app/ChangeHub.js`). `App`은 데이터를 구독하지 않음. 대화 줄(`ChatRow`)은 `memo` + 그 친구 주제만
  - 확인: 친구 메시지 1통에 다시 그린 대화 줄 수 — 전: 친구 4명 전부 × 2번 / 후: 그 친구 1줄 (친구 1000명이면 2000번 → 2번). 다른 탭·내 정보는 영향 없음
  - 알림을 안 보내던 Store 메서드(닉네임·관심사·사진·위치 공유·스토리 본 것·좋아요)도 주제를 붙여 알리게 함. 입력 중은 그 친구 주제만
- **서버 구독 수 고정**: 친구마다 4개(정보·스토리·대화·입력 중) → 친구 수와 상관없이 11개
  - 대화: 메시지에 `members`·`to`를 같이 쓰고 collectionGroup 질문 하나로 (`firestore.rules` `{path=**}/messages`, 색인 `members` 추가)
  - 입력 중: `typing/{받는 사람}` 문서 하나에 친구가 자기 칸만 씀
  - 친구 정보·스토리: 서버 함수 `fanOutProfile`·`fanOutStory`·`linkFeeds`·`unlinkFeeds`가 `feeds/{나}/friends/{친구}`에 복사 → 목록 하나만 구독. 공개 정보가 그대로면 복사하지 않음
  - 사진 스토리는 문서 대신 저장소(`users/{uid}/stories/`)에 올림 (문서 1MB 한도·복사 무게 방지, `storage.rules`·`cleanup` 같이)
  - 확인: `tests/server.test.js`(가짜 Firestore로 친구 300명이어도 구독 수 그대로, 메시지·입력 중·친구 소식이 맞는 친구에게). **보안 규칙·서버 함수는 여기서 에뮬레이터를 못 켜서 미미 PC에서 확인** (firebase-setup-guide 5-1에 확인 항목 추가)
  - 2026-10-20 전에 만든 시험 메시지·입력 중 데이터는 새 구조와 달라서 안 보임 → 시험 데이터라 지워도 됨 (firebase-setup-guide 5-2)
- **카카오 지도 한 번만 만들기**: 홈 탭을 떠나면 떼어 두었다가 돌아오면 다시 붙임 (`kept`, `relayout`). 확인: 탭 3번 오가기 — 전 4번 만듦 / 후 1번 만들고 3번 다시 붙임
- 시험 77개 통과, 13개 장면 사진이 바꾸기 전과 같음(지도 위 내 동그라미 가장자리 몇 점은 바꾸기 전끼리도 다르게 찍히는 흔들림), 시연·토스 빌드 눌러 보기 오류 없음

## 4. 미미가 정한 것 (바꾸지 말 것)

- 앱 이름: **우르르** (영어 Ururu), 앱인토스 appName **`ururu`** (2026-10-13, 못 바꿈 — 콘솔 등록·`apps-in-toss.config.ts`에 이 값). 화면 로고·탭 제목·소리 설정 경로 글자도 "우르르"로 바꿈. 폴더·`dist/moyeo.html`·`package.json` 이름·저장소 키(`moyeo.profile`) 같은 안 보이는 영어 이름은 그대로 `moyeo`
- 출시 순서: **앱인토스 먼저**
- 서버: **Firebase**
- 토스 첫 출시: **위치(지도) 끔**, 스와이프 끔 (친구끼리 채팅·스토리·친구 탭만)
- 초기 제한: 채팅 사진 끔, 개인정보 공유·도박·욕설 가리기
- 제재 기준 (2026-10-15): 위반 1회 경고 → 2회 7일 이용정지 → 3회 이상 영구정지, 중대한 위반 즉시 영구정지
- 채팅 이용 수칙: 미미가 준 글 그대로 (`docs/policy/chat-rules.md`)
- 가입 나이: **모든 빌드 만 19세 이상**
- 운영 서류: 운영자 **진미**, 문의 **itsjinmi@gmail.com**(나중에 바꿔도 빌드 다시 안 해도 됨), 탈퇴 뒤 기록 보관 **1년**, 시행일 = **앱인토스 제출일**, 앱 밖 탈퇴 = 문의 이메일. 제출본: `docs/policy/` 3개
- 화면에 설명·안내 문구를 덧붙이지 않기. 새 파일 대신 원래 파일 고치기

## 5. 하다가 멈춘 일: 앱인토스 실제 데이터 출시

### 5-1. 로그인(사용자 구분) — 미미 질문에 답하던 중
미미 질문: "토스 미니앱 쓰는 사람은 이미 토스에 로그인돼 있는데 왜 로그인이 필요해?"
→ 답할 내용: 맞아요, 사용자는 이미 토스에 로그인돼 있어서 **로그인 화면은 필요 없어요.** 다만 미니앱이 "이 사람이 누구인지"를 알려면 토스 SDK에 물어봐야 해요. 방법이 두 가지예요.

| 방법 | SDK | 사업자 등록 | 비고 |
|---|---|---|---|
| **익명 사용자 키** (추천, 먼저) | `User.getAnonymousKey()` → `{ hash }` (미니앱마다 사용자별 고정값). 서버 확인은 `User.createAnonymousKeyAuthCode()` → 서버가 파트너 API로 `anonKey` 교환 (mTLS) | 문서에 요구 없음 | 화면 없이 바로 사용자 구분. 아이디·닉네임·생년월일은 지금처럼 앱 안 가입 화면에서 한 번만. 토스 앱 5.232.0 이상 |
| 토스 로그인 | 동의 화면 → 인가 코드 → 서버에서 토큰·사용자 정보(복호화) | **필수** (개인사업자 가능, 면세사업자 불가) | 이름·생년월일 등 받기 가능 |

- **미미에게 확인할 것**: 익명 키 + 앱 안 가입 방식이 "토스 로그인 외 로그인 금지" 정책에 걸리지 않는지 → **앱인토스 채널톡에 미미가 문의** (질문 예: "토스 로그인 없이 User.getAnonymousKey로 사용자를 구분하고 앱 안에서 닉네임만 정하는 채팅 미니앱도 출시 가능한가요? mTLS 인증서 발급에 사업자 등록이 필요한가요?")
- 참고 문서: `https://developers-apps-in-toss.toss.im/documentation/sdk/domains-api/user/user.getanonymouskey.md`, `.../guide/authentication/anonymous-key-auth-code.md`, `.../api/user-key.md`, `.../documentation/integration/server-api.md`, `.../guide/operation/register-business.md`, 정책 `.../intro/guide.md`

### 5-2. 앱인토스 정책에서 확인한 것 (2026-10-13)
- 채팅 카테고리 = 지인·ID 기반 1:1. **신고·차단, 계정 제재 정책, 신고 대응 절차, 운영 약관을 출시 전 채널톡으로 제출**
- 랜덤 매칭·근처 사용자 탐색·이성 추천이 있으면 만남·소개팅(법인, 19세, 실명 인증) → 토스 빌드는 스와이프·지도 끔으로 피함
- 위치는 민감정보: 명시적 동의, 최소 수집, 탈퇴 시 즉시 삭제
- 사업자 등록은 토스 로그인·결제·프로모션에만 필수 (인앱 광고는 없이도 가능)

### 5-3. 순서 (누가 할지)

→ **`docs/guides/launch-checklist.md`** 한 곳에 모았어요 (0단계 내 PC 준비 → A 실제 데이터(Firebase) → B 앱인토스 → C 구글 플레이, 준비물 표).
지금까지 된 것: Claude 쪽 코드(서버·로그인·안전 장치·토스 SDK 설정·스토어 이미지)는 끝. 미미 쪽 단계는 아직 모두 ⏳.
구글 플레이 AAB는 아직 못 만들어요 (`add-google-map`, `add-mobile-apps` 먼저, 체크리스트 C단계).

### 5-4. 문서 반영 — 끝 (2026-10-13 저녁)
- `apps-in-toss-release-guide.md`, `add-build-targets`(proposal·design·tasks·spec), `refine-screens`(SHELL-20b, ACC-51c), `code-structure-and-patterns.md` 모두 고침
- `.ait` 파일을 만드는 정확한 명령은 SDK 설치 뒤 `npx ait --help`로 확인해서 안내 5번을 채우기

### 5-5. 다음 Claude가 할 일
1. 미미가 1번을 하면 나오는 설치·시험 오류 고치기 (특히 vite 8에서 `build.rollupOptions.external`이 그대로 먹는지)
2. 미미가 4번을 하면 에뮬레이터로 두 브라우저 확인(안내 5-1) → 나오는 문제 고치기 → `add-real-server` tasks 체크
3. 규칙 자동 시험: `@firebase/rules-unit-testing`을 tech-stack에 올리고 `tests/rules.test.js` (친구 아닌 사람 메시지 읽기 거절 등)
4. 콘솔에 `ururu.ait` 올려 토스 앱 QR로 TGT-04 확인 (SDK 3.x는 샌드박스 앱이 없어서 테스트 QR로만)
5. 정책 웹 주소 (구글 플레이 필수): `docs/policy/*.md`를 HTML로 만들어 Firebase Hosting에 올리는 명령(`build:policy`) — compliance.md 6장 3번
6. 플레이 빌드: `add-google-map` → `add-mobile-apps` (Capacitor, `build:android`, 안드로이드 뒤로 버튼은 `nav.back()`을 그대로 쓰기)
7. 채널톡 답이 오면 compliance.md의 ❓ 줄을 고치기

## 6. 남은 작은 질문 (미미 답 대기)
- **새로 생긴 배너 글자 확인**: 서버 모드에서만 뜨는 오류 배너 4개 — "인터넷 연결을 확인해 주세요"(SYNC-03 spec에 있던 것), "서버에 저장하지 못했어요. 다시 시도해 주세요", "로그인하지 못했어요. 인터넷 연결을 확인하고 다시 열어 주세요", "토스 앱을 최신 버전으로 업데이트해 주세요". 바꾸고 싶으면 `RealServer.js`·`login/` 맨 위 상수만 고치면 돼요
- **안전 장치 화면**: 차단 버튼(신고와 따로), 가입 화면 약관 동의 칸, 나 탭 "차단한 사용자" — 넣을지·글자를 어떻게 할지 (지금은 신고하면 차단까지 같이 돼요)
- 스토리 보기 화면 위쪽 "3시간 전 · 프로필 보기"도 지울지
- 토스 빌드에는 홈(지도)이 없어서 "소리 울리기"(홈에서 연 친구 프로필에서만 보임)를 쓸 곳이 없음 → 채팅방에서 연 프로필에도 보일지

## 7. archive 순서 (미미 PC에서 `npm run spec:check` 통과 후)
`migrate-to-react` → `refine-screens` → `add-interests` (그 뒤 swipe·home-map spec의 Purpose 글을 새 동작에 맞게 고치기)
