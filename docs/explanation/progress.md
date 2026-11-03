# 진행 상황 · 남은 과제 · 작업 기록

> 분류: Explanation (왜 이렇게 했는지 · 지금까지 한 일)

> **한 줄 요약** 지금 상태와 남은 과제는 **진행 0번**이 최신이에요. 진행 1~3번은 2026-10-20까지의 작업 기록, 진행 5번은 구글 플레이 출시 때 알아둘 것이라 지우지 않고 그대로 둬요.
>
> - 2026-11-03: `CLAUDE.md` 8번에서 이 파일로 옮겼어요 (CLAUDE.md는 규칙만). "미미가 정한 것"은 규칙이라 `CLAUDE.md` 8번에 남겼어요.
> - 기능마다 자세한 체크 목록은 `openspec/changes/<변경>/tasks.md`, 이 파일의 0-4는 **여러 변경을 넘나드는 순서표**예요.

### 진행 0. 2026-11-03 기준 정리 — 바뀐 것 · 완료 · 진행 중 · 남은 과제

> 10-21 이후 실제로 한 일과 구현 현황을 이 섹션 한 곳에 모았어요. **지금 상태는 이 0번을 먼저 보세요.**
> 아래 1~7번은 10-20까지의 기록이라 지우지 않고 그대로 둬요. 0번과 다르면 0번이 최신이에요.

#### 0-1. 바뀐 것 (아래 옛 기록과 다른 점)

| 항목 | 지금 (10-30) | 옛 기록 |
|---|---|---|
| 출시 방향 | **구글 플레이** (10-30 미미 결정, 앱인토스에는 올리지 않음) | 예전: "앱인토스 먼저" → 진행 4·5를 플레이 기준으로 고침 |
| PC 폴더 | `D:\mj_Server\URRUURRUURU\app-URURU` | 2번 `D:\moyeo-20231013-1306` |
| Git | GitHub 비공개 저장소 `mijin1996/app-URURU`, 브랜치 `master` | 2번 "git init 했는지 확인 못 함" |
| npm | 미미 PC에서 `npm install` · `npm run dev` 동작 확인 (`localhost:5173`) | 2번 "한 번도 안 했어요" |
| `.env` | 파일 이름이 `env`(점 없음)라 Vite가 못 읽어 가짜 서버로 열리던 것 → **`.env`로 고침** (10-30). Firebase `ururu-6164b` · 카카오 키 · `VITE_SERVER_FUNCTIONS=false`(무료 모드). git에 안 올림 | — |
| Firebase · 카카오 | 프로젝트 `ururu-6164b`, 카카오 지도 키 등록됨 | 옛 프로젝트 `ururu-eb3db` |
| 웹 공개 | **Cloudflare Pages** (2026-11-03 미미: 서버는 Firebase 하나, 화면 파일만 Cloudflare. 사용자 앱 · 운영자 사이트 프로젝트 2개, GitHub push로 자동 배포) | 10-30: Render 등록 중 → 11-03 오전: Firebase Hosting으로 배포까지 함 → 11-03 저녁: Cloudflare로 바꿈 |

#### 0-2. 완료한 것 (코드 기준)

| 영역 | 된 것 |
|---|---|
| 화면 틀 | React 19 전환, 탭 5개, 덮개 창, 알림 배너, 주제별 다시 그리기(친구가 많아도 빠르게) |
| 가입 · 로그인 | **구글만** (2026-11-03, 페이스북 · 익명 · [시작하기] 버튼 없앰 — 구글 버튼 하나로 인증 + 가입) → 가입(아이디 · 닉네임 · 생년월일 · 국가, 만 19세 이상), 회원탈퇴 |
| 언어 | 한국어 / 영어 전환 (`core/i18n/`) |
| 홈 지도 | 카카오 지도, "내 위치로", 위치 공유 켠 친구만 핀 |
| 위치 (11-03) | 켠 사람만 · 앱을 쓰는 동안만 `locations`(시·도, 친구 누구나) · `locationsDetail`(동, 결제한 친구만). 화면에서 내리면 바로 삭제, 못 지우면 10분 뒤 TTL. 프로필 `users.region`은 더 이상 안 씀(예전 값은 앱이 지움) — `openspec/changes/update-location-privacy` |
| 채팅 | 친구끼리 1:1 글자 메시지, 입력 중, 두 번 눌러 저장, 24시간 뒤 안 보임, 대화 규칙 가리기 |
| 스토리 · 프로필 | 사진 · 글 스토리(24시간, 좋아요, 삭제), 사진 10장, 관심사 5개 |
| 스와이프 · 친구 | 1시간에 10명, 아이디로 친구 찾기, 받은 좋아요 수락 · 거절, 친구 삭제 |
| 안전 | 신고(이유 · 500자 · 사진 1장), 차단, 경고 → 7일 → 영구정지, 정지 화면, 정책 4종 앱 안에서 보기 |
| 운영자 사이트 | `admin.html` → `src/admin/` (앱과 주소 · 로그인 따로), 아이디 12자리, 신고 처리, 회원 목록 · 검색 · 삭제(총관리자), 아이디 발급 |
| 서버 | `RealServer`(Firebase), `firestore.rules` · `storage.rules`, 오프라인 · 실패 배너, 구독 수 고정(친구 수와 상관없이 11개) |
| 빌드 | 웹 `dist/`, 한 장 `dist/moyeo.html`, 운영자 `dist-admin/`, 기능 스위치(`platform/features.js`) |
| 시험 | 82개 (`data` 51 · `ui` 15 · `actions` 9 · `server` 7) |
| 문서 · 스토어 | 정책(`docs/policy/`), 플레이 등록 글 · 이미지(`UploadPlatform/google-play/`) |

#### 0-3. 진행 중

| Phase | 상태 | 남은 것 |
|---|---|---|
| 2 React | 코드 완료 | 미미 확인 → `tasks.md` 체크 → archive |
| 2.5 지도 | 카카오 지도 · 내 위치 됨 | 친구 실제 위치 |
| 4 진짜 서버 | `ururu-6164b` 연결, `.env` 고침 | 두 사람(브라우저 두 개)으로 전 기능 확인 |
| 4.5 안전 장치 | 차단 · 신고 · 제재 · 운영자 사이트 됨 | 약관 동의 칸, 위치 동의 창, 정책 웹 주소 |
| 5 빌드 · 출시 | 웹 빌드 됨, Cloudflare Pages로 옮기는 중 | 안드로이드 빌드(`.aab`) |
| 3 폰 앱 | ❌ 시작 안 함 | Capacitor `android/` |

#### 0-4. 남은 과제 (구글 플레이 기준, 순서대로)

**A. Firebase 마무리**
- [ ] Firestore 데이터베이스(서울, 프로덕션) 있는지 확인 → `npx firebase deploy --only firestore` (보안 규칙 올리기)
- [ ] Authentication 로그인 방법에 **이메일/비밀번호** 켜기 (운영자 사이트용). 사용자 로그인은 **Google만** 켜 두기 (페이스북 · 익명은 꺼도 됨)
- [ ] **Firestore TTL 정책 2개** (위치 자동 삭제): 콘솔 → Firestore → TTL → 정책 만들기 → 컬렉션 그룹 `locations`, 필드 `expiresAt` / 한 번 더 `locationsDetail`, `expiresAt`
- [ ] 브라우저 두 개로 확인: 가입 · 좋아요 · 친구 · 채팅 · 스토리 · 신고 · 탈퇴
- [ ] 첫 총관리자 아이디 만들기 (`docs/how-to/operate-admin-site.md` 3번)
- [ ] 다 되면 옛 프로젝트 `ururu-eb3db` 삭제

**B. 웹 공개 (Cloudflare Pages, 2026-11-03 Firebase Hosting에서 바꿈 — 순서는 `docs/how-to/operate-admin-site.md` "Cloudflare Pages 프로젝트 만들기")**
- [ ] Cloudflare 계정 이메일 인증 (대시보드 위 파란 안내 "Resend verification email")
- [ ] 사용자 앱 프로젝트: Build `npm run build`, Output `dist`, 환경 변수 `NODE_VERSION=22` + `.env`의 `VITE_…`
- [ ] 운영자 사이트 프로젝트: Build `npm run build:admin`, Output `dist-admin` (index.html · `_headers`는 빌드가 저절로 만듦)
- [ ] Firebase 승인된 도메인: `localhost` + 두 `.pages.dev` 주소. Render 주소 · 안 쓸 `web.app` 주소는 빼도 됨
- [ ] 카카오 JavaScript SDK 도메인: `http://localhost:5173` + 사용자 앱 `.pages.dev` — `localhost:5175` · `web.app` · `firebaseapp.com`은 빼기. 안드로이드 앱을 만들면 `https://localhost` 추가
- [ ] 새 주소로 로그인 · 지도 · 채팅 확인되면 Firebase Hosting에 올려 둔 사이트 끄기 (`npx firebase hosting:disable`), Render 사이트 지우기

**C. 출시 전 필수**
- [ ] 가입 화면 약관 동의 칸 (SAFE-10~11), 위치 동의 창 (SAFE-20~21)
- [ ] 정책 웹 주소: `docs/policy/*.md` → 웹 페이지 (`build:policy`, 플레이 필수). 개인정보처리방침 전문은 씀 (2026-11-03, `privacy.md` · `privacy.en.md`, 앱 "나" 탭 정책 목록에도 추가)
- [x] 보관 기간 맞춤 (2026-11-03 미미): 회원 정보 탈퇴 뒤 **한 달**, 신고·위반·이용정지 기록도 **한 달** (회원 정보와 함께 소멸) — `privacy.md` · `terms.md` 제6조 5항 · 제8조 3항 · CLAUDE.md (영어판도)
- [x] 탈퇴 (2026-11-03 미미): 계정·프로필 **7일** 유지 후 삭제, 운영자 확인 뒤 서버 완전 삭제 **한 달** — 약관 제8조 2항 · 개인정보처리방침
- [ ] 탈퇴 코드 맞추기: 지금 앱은 탈퇴하면 **바로** 지움 → 7일 유예(탈퇴 표시 + 7일 뒤 삭제) · 한 달 안 완전 삭제(운영자 사이트)로 바꾸기
- [ ] 앱 밖 탈퇴 안내 웹 페이지 (SAFE-12, 플레이 "계정 삭제 URL")
- [ ] 위치기반서비스사업 신고 확인 (방송통신위원회)
- [ ] 문의 이메일 하나로 맞추기 (정책 `unidevpeer@gmail.com` / 스토어 README · 4번 `itsjinmi@gmail.com`)

**D. 구글 플레이**
- [ ] `add-mobile-apps`: Capacitor 설치, `android/`, 뒤로 버튼(`nav.back()`), 안전 영역
- [ ] Firebase에 안드로이드 앱 + SHA-1, 안드로이드 구글 로그인
- [ ] `build:android` → `.aab`, 업로드 키(keystore) 따로 보관 (git에 올리지 않기)
- [ ] 플레이 콘솔 개발자 계정(25달러) → 등록정보 · 데이터 보안 · 콘텐츠 등급 (`UploadPlatform/google-play/`)
- [ ] 개인 계정이면 비공개 테스트 **테스터 12명 · 14일** → 프로덕션 신청

**E. 기능 채우기**
- [x] 친구 위치 공유 (시·도 / 결제 시 동) — 2026-11-03 코드 · 규칙. **미미 PC에서 `npm run test` · `npx firebase deploy --only firestore`(규칙) 확인**
- [ ] 결제 기능 (구글 플레이 결제 → 서버 함수가 `entitlements/{uid}` = `{ plan: 'premium', until }` 씀). 그 전에는 운영자가 콘솔에서 직접 만들어 시험
- [ ] 소리 울리기 받기
- [ ] 운영자 2단계 승인 · 최종관리자 (`docs/explanation/admin-roles.md` B안)
- [x] 개발 서버 포트 고정 (`vite.config.js` `server.port 5173, strictPort`) — 2026-11-03

**F. 나중 (Blaze · Phase 6)**
- 음성 메시지 · 전화 · 영상통화, 푸시 알림, 24시간 뒤 메시지 실제 삭제(`cleanup`), 신고 알림 메일, 로그인 계정까지 삭제(`adminDeleteUser`), 앱 지워도 가입 유지, iOS

**G. 문서**
- [ ] `tasks.md` 체크 → `npm run spec:check` → archive (`migrate-to-react` → `refine-screens` → `add-interests` → `rename-app`)
  - 2026-11-03: 코드로 확인되는 칸은 체크함 (migrate-to-react 51/55). 남은 칸은 모두 **미미 PC에서** 할 일: `npm run test` · `npm run build:single` · `npm run compare:approve` → `npm run spec:check` → `npx openspec archive <이름>`
  - 없앤 문서(tech-stack · code-structure · guides)를 고치라는 칸과 앱인토스 칸은 "해당 없음"으로 줄을 긋고 체크함
  - `add-google-map`: 카카오 지도로 계속하기로 함 (2026-11-03 미미) → 이 변경은 보관하지 않고 `_to_delete/`로 옮길 것. 친구 실제 위치는 카카오 기준 새 변경으로
- [ ] 코드 모양 Airbnb + Prettier로 통일 (2026-11-03 미미 결정) — 설정·규칙은 넣음. **미미 PC에서 `npm run format` 한 번 → `npm run test` → 커밋** (`style:` 또는 `refactor: 코드 모양 Airbnb + Prettier로 정렬`)
- [x] 문서 정리 (2026-11-03): docs를 Diátaxis 4분류로, CLAUDE.md는 규칙만(기록 → 이 파일), file-tree를 실제 파일과 맞춤, 깨진 링크 고침, `store:images`가 옛 `store/` 대신 `UploadPlatform/`에 쓰게 고침, 개인정보처리방침 → `docs/policy/privacy.md`
- [x] `package.json` 이름 `moyeo` → `ururu` (2026-11-03, `package-lock.json` 첫 줄도). `npm` 명령에 `ururu@0.8.0`으로 보여요
- [x] 옛 주소 `ururu-eb3db` 고치기 — 코드 · 문서에 더 이상 없음 (2026-11-03 확인)

#### 0-5. 앱인토스용으로 만들어 둔 코드 (플레이에서는 안 씀)

구글 플레이로만 내기로 해서 아래는 쓰지 않아요. 플레이 빌드에는 들어가지 않으니 지금은 그대로 두고, 정리할 때는 `_to_delete/`로 옮겨요 (1번 규칙).
- 토스 빌드: `build:toss` · `dist-toss/` · `ururu.ait`, `apps-in-toss.config.ts`, `src/platform/tossSdk.js`, `features.js`의 toss 줄
- 토스 로그인: `src/data/login/AnonKeyLogin.js`, 서버 함수 `tossLogin`
- 등록 자료: `UploadPlatform/apps-in-toss/`
- `index.html`의 두 손가락 확대 막기는 플레이에서도 쓰는 설정이라 그대로 (주석의 "앱인토스 출시 체크리스트" 문구만 옛것)

---

### 진행 1. 지금 상태 한 줄

React 전환과 화면 다듬기는 끝났고, **진짜 서버(Firebase) 코드도 써 두었어요**(`RealServer`, 보안 규칙, 서버 함수). `.env`가 비어 있으면 지금처럼 가짜 서버로 열려요. 남은 건 대부분 **미미 PC에서 할 일**: `npm install` → Firebase 프로젝트 만들기 → 에뮬레이터로 두 브라우저 확인 → 안드로이드 앱(Capacitor) → 구글 플레이 등록.

### 진행 2. 일하는 환경에서 알아둘 것

- 미미 PC 폴더: `D:\moyeo-20231013-1306`
- **미미 PC에서 아직 `npm install`을 한 번도 안 했어요.** 그래서 `npm run dev/test/build`가 미미 PC에서 실제로 돌아간 적이 없어요. 첫 실행 때 오류가 나면 그것부터 고쳐요.
  - Node 22.22.2 이상 필요 (jsdom 30, vite 8 때문)
  - 버전은 `package.json`에 고정 (npm 레지스트리에 있는 것 확인함)
- 이전 Claude들은 npm이 막힌 곳에서 일해서, **esbuild로 묶어 크롬(Playwright)으로 확인**했고, 시험은 bun으로 돌렸어요 (지금 45개 통과).
  - 그래서 **firebase 패키지로 실제 Firebase에 붙여 본 적은 없어요.** 처음 붙일 때 나는 오류는 그때 고쳐요.
  - `dist/moyeo.html`도 esbuild로 만든 것이라, 미미 PC에서 `npm run build:single`로 한 번 다시 만들면 정확해요
- `dist/moyeo.html` = 미미가 더블클릭해서 보는 결과물. **src·styles를 고치면 반드시 덮어쓰기** (`CLAUDE.md` 2번). `npm run build:single`
- 지울 파일은 `_to_delete/`로 옮김 (rm 금지). 지금 그 안에 작업용 tgz들과 `dist-single-mistake/`, `removed-ui/`가 있어요 → 미미가 확인 후 지울 것
- Git: 미미가 쓰기로 했지만 `git init`을 했는지 확인 못 함

### 진행 3. 끝난 일

#### 3-1. React 전환 (`openspec/changes/migrate-to-react`, archive 전)
- `src/core`, `src/data`는 v13 그대로 옮김 → 그 뒤 기능 변경으로 일부 고침 (아래 3-2)
- `src/ui`를 React 19 + 훅으로 다시 짬 (파일 64개). 원본 v13은 `_to_delete/legacy/`로 옮김 (2026-10-15)
- 원본과 화면 비교 46장(23장면 × 폰·PC) 모두 같음 확인 → 그 뒤 화면을 일부러 바꿔서 지금 정답 사진은 "승인한 React 화면" (`npm run compare:approve`)
- `vite.config.js`: `build`→`dist/`, `build:single`→`dist/moyeo.html`(덮어씀)
- 시험: `tests/data.test.js`, `tests/ui.test.js` / 비교: `tools/compare/`

#### 3-2. 미미 요청 화면 다듬기 (`openspec/changes/refine-screens`, archive 전)
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

#### 3-3. 관심사 키워드 (`openspec/changes/add-interests`, archive 전)
- 나 탭 "관심사 n / 5" 상자: 칩 + 입력 칸 "키워드" + [+]. 최대 5개, 10자. 가입 정보와 같이 저장
- 나 탭 내 프로필 동그라미 → 내 전체 화면 프로필 미리보기

#### 3-4. 빌드 대상별 기능 스위치 (`src/platform/features.js`)
| | canSwipe | canShareLocation |
|---|---|---|
| web / android | true | true |
| toss (앱인토스용, 안 씀) | false | false |
- android(구글 플레이) 빌드: 탭 5개 전부, 스와이프 · 지도 · 위치 공유 켬. 위치는 동의 창 · 위치기반서비스사업 신고 뒤에 공개

#### 3-5. 문서·지침
- `CLAUDE.md`: 원래 파일 고치기 / 결과물 덮어쓰기 / **화면에 설명 문구 넣지 않기** / 폰 비율 맞추기(확인 크기 표)
- `docs/reference/file-tree.md`: 전체 파일 트리는 여기 한 곳만

#### 3-6. 진짜 서버 준비 (2026-10-13 저녁, `add-real-server` · `add-build-targets` · `add-safety-basics`)
- **서버 고르기**: `main.jsx`가 `.env`의 `VITE_FIREBASE_API_KEY`·`PROJECT_ID`를 보고 `RealServer` / `FakeServer`. 서버 모드는 시연 사람 없이 빈 상태로 시작
- **약속(ChatServer) 넓힘**: `signIn`, `register`, `updateProfile`, `updatePhotos`, `setSharing`, `setMessageSaved`, `declineLike`, `report`, `deleteStory`, `sendStoryLike`. 서버 답을 기다리는 일(로그인·가입·아이디 찾기·탈퇴)은 Promise → `AccountService`·`FriendSearch`가 `async`, 부르는 화면(가입·찾기·탈퇴·App 시작)도 맞춤. FakeServer는 같은 모양으로 아무 일 안 함
- **화면 쪽 한 줄씩**: 저장(MessageList), 스토리 좋아요(StoryViewer), 스토리 삭제(StoryEditor), 사진(PhotoManager), 위치 토글(SettingsPanel), 신고 이유(ReportDialog: 고른 이유를 서버에 보냄), 받은 좋아요 거절(`FriendActions.decline`)
- **거리·동네 없는 사람**: 서버 사람은 `km`가 null이라 `kmText`·`joinDots`(views.jsx)로 "undefinedkm"·빈 " · "가 안 보이게. 시연 화면은 그대로
- **RealServer**: 로그인 → 내 문서 → `connect()`에서 친구·좋아요·스토리 좋아요·차단 구독, 친구마다 정보·스토리·대화·입력 중 구독. 사진은 1280px로 줄여 Storage에. 쓰기 실패 → `"error"` 배너, 인터넷 끊김 → `"offline"` 배너. **위치는 아직**(add-google-map 뒤), **소리 울리기 받기는 아직**(보내기만 기록)
- **로그인**: `src/data/login/` — `GoogleLogin`(웹 · 구글 플레이: 구글 로그인, 안드로이드는 Capacitor 뒤 SHA-1 필요), `DemoLogin`(웹 서버 시험: Firebase 익명). `AnonKeyLogin`은 앱인토스용이라 플레이 빌드에서는 안 씀
- **서버 파일**: `firestore.rules`, `storage.rules`, `firebase.json`, `firestore.indexes.json`, `functions/`(tossLogin, deleteAccount, cleanup), `.env.example`, `package.json`에 `firebase`·`firebase-tools`와 `emulators`·`deploy:server` 명령
- **문서**: `docs/policy/` 약관·개인정보처리방침·신고 처리 **초안**, openspec 변경 3개 tasks·spec, `file-tree.md`
- 확인: 시험 45개 통과, 시연 빌드(가입·친구 찾기·거절·신고·탈퇴)를 크롬 390·320px로 눌러 봄, 오류 없음

#### 3-7. 안전 장치·대화 규칙 (2026-10-13 밤, `add-safety-basics` 1.2~1.4)
- 차단 / 차단 풀기 (채팅방 ⊘ 버튼, 나 탭 "차단한 사용자"), 서버 `blocks.kind`(report·block)
- 채팅 사진 보내기 끔 (`canSendPhoto: false`, 서버 규칙도)
- 대화 규칙: 개인정보 공유·도박·욕설 → `****` + 보낸 사람 채팅창에 경고 줄, **경고 2회 → 30일 이용 제한 화면**(닫을 수 없음), 첫 대화 상대 채팅방 맨 위 규칙 안내
  - 코드: `src/data/MessageFilter.js`(= `functions/messageFilter.js`, 시험이 같은지 확인), `ModerationStore.js`, `ui/start/BanScreen.jsx`, `nav.showBan()`
  - 서버: `firestore.rules` `isBanned()`(제한 중이면 메시지·친구 신청·스토리 거절), `moderation/{uid}`(서버 함수만 씀), 서버 함수 `moderateMessage`
  - 탈퇴해도 경고 기록은 남김 (보관 기간은 개인정보처리방침 빈칸 — 정해지면 cleanup에 지우는 코드 추가)
- 규칙 문서: `terms.md` 제7조
- 시험 57개 통과, 320px에서 규칙 안내 → 경고 1회 → 경고 2회 제한 화면 → 다시 열어도 제한 확인

#### 3-8. 중복 정리 · 제재 기준 · 출시 준비 (2026-10-15, `add-safety-basics` 1.5~1.8, `add-build-targets` 3.2b~c)
- **중복 정리** (원본은 하나만):
  - `functions/messageFilter.js`(= `src/data/MessageFilter.js` 복사본) → `_to_delete/`. 이제 원본은 `src/data/`에만 두고 `tools/copy-shared.mjs`가 `functions/shared/`로 복사(`npm run emulators`·`deploy:server`·firebase predeploy가 저절로). 제재 기준도 같은 방식(`sanctionRules.js`) → 서버 함수의 숫자 복사본(`WARNINGS_TO_BAN`, `BAN_MS`)도 없앰
  - `legacy/`(원본 v13 코드 38개, React 코드와 같은 일) → `_to_delete/legacy/` (미미가 확인 뒤 지움)
  - 채팅 사진·스토리 사진 "한 장 골라 읽기" 같은 코드 2벌 → `PhotoPicker.pickImage()` 하나
  - `styles/likes.css`의 `.acceptbtn` 두 번 쓴 것 → 하나로
  - 약관·수칙 글: 앱 화면과 제출 문서가 같은 `docs/policy/*.md`를 씀 (앱이 `?raw`로 읽음)
  - 찾아봤지만 그대로 둔 것: CSS의 다크 모드·넓은 화면 `@media` 안 같은 선택자(일부러 덮어쓰는 것), `dist/moyeo.html`(빌드 결과물)
- **제재 기준** (미미): 위반 1회 경고 → 2회 **7일** 정지 → 3회 이상 **영구정지**, 횟수는 줄지 않음, 중대한 위반은 운영자가 즉시 영구정지(`isPermanent`). 앱·서버 함수·`firestore.rules`·약관 제7조·운영정책 5장·개인정보처리방침 모두 맞춤
- **채팅 이용 수칙** (미미가 준 글 그대로): `docs/policy/chat-rules.md` → 첫 대화 채팅방 맨 위 전문, [이용약관]·[운영정책] 누르면 열림. 수칙 3번 경로에 맞춰 **받은 메시지 길게 눌러 신고**(그 메시지가 신고 기록에 남음)와 **프로필 위쪽 차단 버튼**을 더함. 나 탭에 **"정책"** 상자(수칙·약관·운영정책·개인정보처리방침)
- **모든 빌드**: 두 손가락 확대 막기 (플레이 빌드의 뒤로 버튼은 Capacitor 뒤 안드로이드 뒤로 버튼 → `nav.back()`)
- **문서**: `UploadPlatform/google-play/`(플레이 등록 글 초안 + 이미지)
- **스토어 이미지**: `npm run store:images` → 플레이 아이콘 512·그래픽 1024×500·폰 1080×1920 6장
- 확인: 시험 62개 통과(bun), 시연 빌드를 크롬 390px로 눌러 봄 (경고 → 7일 정지 → 영구정지, 길게 눌러 신고, 프로필 차단, 약관 링크)
- **이 작업 공간은 npm이 막혀서 esbuild로 묶었어요.** 미미 PC에서 `npm run build:single`로 한 번 다시 만들면 정확해요 (`.md?raw`는 Vite가 기본으로 읽어요)

#### 3-9. MVC 정리·성능 점검 (2026-10-20, 미미가 준 "객체지향 복습"·"Unity 권장 아키텍처" 기준 → `CLAUDE.md` 6번)
- 화면(View)이 직접 Store + 서버를 바꾸던 곳 7개를 Controller로 옮김: `ChatActions`(Composer·MessageList·StoryViewer), `SafetyActions`(ReportDialog·SettingsPanel), `MeActions`(PhotoManager·SettingsPanel·StoryEditor). 이제 `.jsx`에서 `server.*`를 부르는 곳이 없음
- `sounds.notification.isEnabled = …`(밖에서 필드 바꾸기) → `NotificationSound.toggle()`
- 성능: `ChatStore.setTyping`은 값이 그대로면 알리지 않음(상대가 칠 때마다 전체 다시 그리기 방지), 나 탭 차단 목록은 한 번만 계산
- 시험: `tests/actions.test.js` 9개 추가(화면 없이 Controller 시험), 깨져 있던 features 시험(canTryAnonymous) 고침 → 71개 통과. 시연 빌드 눌러 보기 오류 없음
- 그때 남겨 둔 성능 숙제 3개는 바로 아래 3-10에서 고침

#### 3-10. 친구가 많아져도 느려지지 않게 (2026-10-20, 미미: "앱이 커지고 친구도 많아질 테니 성능 문제가 생기면 안 돼")
- **다시 그리기를 주제별로**: Store가 `notify(TOPIC.chats, TOPIC.chat(id))`처럼 무엇이 바뀌었는지 알리고(`core/topics.js`), 화면은 자기 주제만 구독(`useChanges`, `ui/app/ChangeHub.js`). `App`은 데이터를 구독하지 않음. 대화 줄(`ChatRow`)은 `memo` + 그 친구 주제만
  - 확인: 친구 메시지 1통에 다시 그린 대화 줄 수 — 전: 친구 4명 전부 × 2번 / 후: 그 친구 1줄 (친구 1000명이면 2000번 → 2번). 다른 탭·내 정보는 영향 없음
  - 알림을 안 보내던 Store 메서드(닉네임·관심사·사진·위치 공유·스토리 본 것·좋아요)도 주제를 붙여 알리게 함. 입력 중은 그 친구 주제만
- **서버 구독 수 고정**: 친구마다 4개(정보·스토리·대화·입력 중) → 친구 수와 상관없이 11개
  - 대화: 메시지에 `members`·`to`를 같이 쓰고 collectionGroup 질문 하나로 (`firestore.rules` `{path=**}/messages`, 색인 `members` 추가)
  - 입력 중: `typing/{받는 사람}` 문서 하나에 친구가 자기 칸만 씀
  - 친구 정보·스토리: 서버 함수 `fanOutProfile`·`fanOutStory`·`linkFeeds`·`unlinkFeeds`가 `feeds/{나}/friends/{친구}`에 복사 → 목록 하나만 구독. 공개 정보가 그대로면 복사하지 않음
  - 사진 스토리는 문서 대신 저장소(`users/{uid}/stories/`)에 올림 (문서 1MB 한도·복사 무게 방지, `storage.rules`·`cleanup` 같이)
  - 확인: `tests/server.test.js`(가짜 Firestore로 친구 300명이어도 구독 수 그대로, 메시지·입력 중·친구 소식이 맞는 친구에게). **보안 규칙·서버 함수는 여기서 에뮬레이터를 못 켜서 미미 PC에서 확인**
  - 2026-10-20 전에 만든 시험 메시지·입력 중 데이터는 새 구조와 달라서 안 보임 → 시험 데이터라 지워도 됨
- **카카오 지도 한 번만 만들기**: 홈 탭을 떠나면 떼어 두었다가 돌아오면 다시 붙임 (`kept`, `relayout`). 확인: 탭 3번 오가기 — 전 4번 만듦 / 후 1번 만들고 3번 다시 붙임
- 시험 77개 통과, 13개 장면 사진이 바꾸기 전과 같음(지도 위 내 동그라미 가장자리 몇 점은 바꾸기 전끼리도 다르게 찍히는 흔들림), 시연 빌드 눌러 보기 오류 없음

### 진행 4. 미미가 정한 것 → `CLAUDE.md` 8번 (규칙이라 옮김, 2026-11-03)

### 진행 5. 지금 할 일: 구글 플레이 출시

> 체크 목록은 진행 0-4 (A → B → C → D 순서). 여기에는 플레이 기준으로 알아둘 것만 모아요. "미미가 정한 것"은 `CLAUDE.md` 8번.

#### 5-1. 로그인
- 구글 플레이 앱은 웹과 같은 **구글 로그인**(`GoogleLogin`). 안드로이드에서는 Capacitor로 앱을 만든 뒤 Firebase에 안드로이드 앱 등록 + **SHA-1** 지문이 있어야 해요 (디버그 키 · 업로드 키 · 플레이 앱 서명 키 3개 모두)

#### 5-2. 구글 플레이 정책에서 확인할 것 (채팅 앱)
- 사용자끼리 대화하는 앱(UGC): **신고 · 차단 · 운영 기준**이 앱 안에 있어야 함 → 신고 · 차단 · 제재 · 운영자 사이트는 됨
- **계정 삭제**: 앱 안 회원탈퇴(됨) + 앱 밖에서 삭제 요청하는 **웹 주소** 필요 (0-4 C)
- **개인정보처리방침 웹 주소** 필수 (0-4 C)
- **데이터 보안 양식**: 위치 · 사진 · 이메일 · 생년월일 · 메시지 수집 여부와 이유
- **위치 권한**: 앱을 쓰는 동안만 요청, 동의 창 먼저 (0-4 C)
- **타깃 연령 · 콘텐츠 등급**: 가입 만 19세 이상에 맞춰 설문

#### 5-3. 순서 (누가 할지)
| 순서 | 할 일 | 누가 |
|---|---|---|
| 1 | Firebase 마무리 · 두 사람 확인 (0-4 A) | 미미 PC + Claude |
| 2 | 약관 동의 칸 · 위치 동의 창 · 정책 웹 주소 · 탈퇴 안내 페이지 (0-4 C) | Claude |
| 3 | Capacitor 설치 · `android/` · 뒤로 버튼 · 안전 영역 · `build:android` (0-4 D) | Claude, 설치는 미미 PC |
| 4 | Firebase 안드로이드 앱 + SHA-1, 업로드 키(keystore) 만들어 보관 | 미미 |
| 5 | 플레이 콘솔 개발자 계정(25달러) → 등록정보 · 데이터 보안 · 콘텐츠 등급 (`UploadPlatform/google-play/`) | 미미 |
| 6 | 비공개 테스트 (개인 계정이면 테스터 12명 · 14일) → 프로덕션 신청 | 미미 |
