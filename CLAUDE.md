# CLAUDE.md — 우르르(옛 이름 모여) 프로젝트에서 Claude가 지킬 작업 지침

> Claude Code와 Claude가 이 폴더에서 일할 때 맨 먼저 읽는 파일이에요.
> **일을 시작하기 전에 이 순서로 읽어요** (2026-10-21):
> 1. 이 파일 **8번 "진행 상황"** — 지금 상태 · 남은 과제 · 미미가 정한 것 · 작업 기록 (옛 progress.md를 2026-10-30에 합침, 진행 0번이 최신)
> 2. `docs/file-tree.md` — 파일 위치
>
> 코드 규칙은 `docs/coding-rules.md`. 정책 문서는 `docs/policy/`의 `terms.md`(이용약관)·`chat-rules.md`(채팅 이용 수칙) 두 개만 (2026-10-20 미미).

## 1. 파일은 새로 만들지 말고 원래 파일을 고친다

- 이미 있는 파일과 **같은 일을 하는 파일**을 새로 만들지 않는다. 원래 파일을 고치거나 덮어쓴다.
  - 예) 한 장짜리 HTML은 언제나 `dist/moyeo.html` 하나. `dist-single/`, `moyeo-new.html`, `moyeo (2).html` 같은 새 폴더·새 이름 금지
  - 예) 문서를 고칠 때 `file-tree-v2.md`를 만들지 말고 `file-tree.md`를 고친다
- 결과물이 나오는 자리(폴더·파일 이름)를 바꿔야 할 때는 **먼저 미미에게 묻는다**.
- 정말 새 파일이 필요하면(새 기능의 새 부품 등) 만들기 전에 비슷한 파일이 이미 있는지 `docs/file-tree.md`에서 확인하고, 만든 뒤 `docs/file-tree.md`를 같은 작업 안에서 고친다.
- 앱과 서버 함수가 같이 쓰는 코드(`MessageFilter.js`, `sanctionRules.js`)도 원본은 `src/data/` 하나. 서버용 복사는 `tools/copy-shared.mjs`가 해요 (`functions/shared/`는 고치지 않기).
- 약관·정책·수칙 글은 `docs/policy/*.md` 하나. 앱 화면도 이 파일을 그대로 읽어요.
- 지워야 할 파일은 지우지 말고 `_to_delete/`로 옮긴다 (미미가 확인하고 직접 지움).

## 2. 코드를 고치면 결과물도 같이 맞춘다

- `dist/moyeo.html`은 `src/`와 `styles/`를 한 파일로 묶은 **결과물**이라, 원본을 고쳐도 다시 만들기 전에는 바뀌지 않는다.
- 그래서 `src/`나 `styles/`를 고쳤으면 `dist/moyeo.html`도 새 코드로 덮어쓴다 (`npm run build:single`). 미미는 이 파일을 더블클릭해서 확인한다.
- `npm run dev`로 열어 둔 화면은 저장하는 순간 바로 바뀐다. `.md` 문서는 앱 화면에 영향이 없다. **단, `docs/policy/*.md`(약관·수칙)는 앱이 읽어서 보여주므로 고치면 다시 빌드한다.**
- 화면을 바꾸면 스토어 이미지도 다시 찍는다 (`npm run store:images` → `UploadPlatform/*/images` 덮어씀).

## 3. 화면에 설명 문구를 넣지 않는다

- 요청받은 기능을 만들 때 화면에 **설명·안내 글을 덧붙이지 않는다**.
  - 예) 안내 문장("~할 수 있어요", "~하면 ~돼요"), 기능 설명 배너, 예시가 든 입력 칸 안내("예: 러닝, 카페"), 버튼 옆 부연 글, 시간·상태 보조 글
- 화면에 보이는 글자는 미미가 정한 것만 쓴다. 꼭 필요해 보이면 **만들기 전에 먼저 묻는다**.
- 설명은 화면이 아니라 코드 주석과 `docs/`에 쓴다.

## 4. 어떤 폰 비율에서도 화면이 맞게

폰마다 폭·높이·비율이 달라서, 화면은 **화면 크기에 맞춰 늘고 줄게** 만든다.

- 폭은 고정 px 대신 `%`, `1fr`, `flex:1`, `min()`/`max()`/`clamp()`로. 화면 높이를 다 쓰는 곳(지도, 스와이프 카드)은 `flex:1`로 남는 높이를 채운다
- 폰트·아이콘·버튼 크기는 `styles/base.css` `:root`의 크기 규칙(`--fs`, `--fs-small`, `--fs-title`, `--icon`, `--btn-h`)만 쓴다. 이 값들은 앱 폭에 맞춰 저절로 커지고 작아진다. 다른 곳에 크기 숫자를 직접 쓰지 않는다
- 이름과 나이는 어디서든 같은 글꼴·크기·굵기로
- 가로로 화면 밖으로 넘치는 요소가 없어야 한다 (가로 스크롤은 일부러 만든 줄만: 스토리 줄 등)
- 긴 글자(이름, 동네)는 줄임표(…)나 줄바꿈으로 처리해서 버튼·칸을 밀어내지 않게
- 폰 노치·홈 바는 `env(safe-area-inset-*)`로 피한다 (Phase 3)
- PC에서는 지금처럼 가운데에 폰 모양 틀(폭 최대 440px)로 보인다 (app-shell SHELL-01)
- 화면을 바꾸면 아래 크기에서 넘침·잘림이 없는지 확인한다

| 확인할 크기 (폭 × 높이) | 대표 기기 |
|---|---|
| 320 × 568 | 가장 작은 폰 (아이폰 SE 1세대) |
| 360 × 640 | 작은 안드로이드 |
| 390 × 844 | 아이폰 13·14·15 (기준 크기) |
| 412 × 915 | 갤럭시 S 시리즈 |
| 430 × 932 | 큰 아이폰 (Pro Max) |
| 1280 × 900 | PC |

## 5. 코드 모양: Allman + 세미콜론 뒤 줄바꿈

- **Allman**: 여는 중괄호 `{`는 **다음 줄에** 따로 (`docs/coding-rules.md` 5번, 2026-10-20 미미: K&R → Allman)
  - 예외: 자바스크립트 `return {`는 같은 줄에 둔다 (`return` 뒤에서 줄을 바꾸면 자동 세미콜론 때문에 undefined를 돌려줘요)
  - 한 줄짜리 `{ }`, `({`, `{{`, 템플릿 문자열 안은 그대로
- **세미콜론(`;`)이 있으면 항상 줄을 바꾼다.** 한 줄에는 `;`로 끝나는 문장(속성)이 하나만
  - 자바스크립트: `a = 1; b = 2;` ✗ → 두 줄로
  - CSS: `.signup h2{margin:0;font-size:var(--fs-title)}` ✗ → 아래처럼

```css
.signup h2
{
  margin: 0;
  font-size: var(--fs-title);
}
```

- 모든 코드에 적용함 (2026-10-13: 세미콜론 줄바꿈 / 2026-10-20: Allman — `src/`, `styles/`, `tests/`, `tools/`, `functions/index.js`, `vite.config.js`. `firestore.rules`·`storage.rules`는 아직 K&R). 새로 쓰거나 고치는 줄도 이 모양으로 쓴다

## 6. 구조와 성능 — MVC 나누기 (2026-10-20 미미, 생존코딩 "객체지향 복습"·"Unity 권장 아키텍처" 정리 기준)

모든 코드를 고치거나 새로 쓸 때 아래를 지킨다. 우르르(React)에서 같은 역할을 하는 자리는 이렇다.

| 강의 | 하는 일 | 우르르에서 |
|---|---|---|
| **Model** | 데이터 + 데이터 규칙, 바뀌면 알림 | `src/data/*Store.js`, `Validator`, `sanctionRules` (React를 모름) |
| **View** | 보이는 것만 그리고, 입력을 Controller에 넘김 | `src/ui/screens`, `src/ui/overlays`, `src/ui/common` (`.jsx`) |
| **Controller** | 입력 → Store 바꾸기 → 서버에 알리기 → 결과 | `src/ui/actions/*Actions.js`, `createNav.jsx`(창 이동) |
| **Repository / DataSource** | 저장소에 어떻게 접근하는지 숨김, 바꿔 끼우기 | `ProfileRepository`, `ChatServer` → `FakeServer`/`RealServer` |
| 의존성 주입 | 부품은 밖에서 만들어 넣어 줌 | `src/main.jsx`가 한 곳에서 만들어 `ctx`로 넣음 |
| 테스트 (EditMode) | 화면 없이 Model·Controller 시험 | `tests/data.test.js`, `tests/actions.test.js` |

**구조**
- View(`.jsx`)는 `server.*`를 직접 부르지 않고, Store와 서버를 둘 다 바꾸는 일은 **Actions**에 둔다. View는 결과(Result)를 받아 배너·애니메이션만 한다
- 상태는 밖에서 필드에 직접 넣지 않고 **의미 있는 메서드**로 바꾼다 (`sound.isEnabled = …` ✗ → `sound.toggle()`)
- 기능 하나 = 폴더 하나 (`ui/screens/<탭>/`, `ui/overlays/<창>/`). 공통 부품은 `ui/common`, 데이터는 `src/data`
- 숫자·이름은 상수로 (`core/config.js`, 파일 맨 위 `const`) — 강의의 `RouteNames`처럼 오타를 막는다
- 새 Store·Actions를 만들면 시험도 같이 쓴다

**성능**
- 다시 그리기는 필요한 곳만 (2026-10-20 미미: 앱이 커지고 친구가 많아져도 느려지면 안 됨)
  - Store는 바뀐 것의 **주제**를 붙여 알린다: `notifier.notify(TOPIC.chats, TOPIC.chat(id))` (`core/topics.js`). 주제 없는 `notify()`는 전부 다시 그리기라 쓰지 않는다
  - 화면은 자기가 그리는 주제만 구독한다: `useChanges(TOPIC.users, TOPIC.chats)`. `App`은 데이터를 구독하지 않는다
  - 긴 목록의 한 줄은 `memo` + 그 사람의 작은 주제(`chat(id)`, `user(id)`)만 구독 → 한 명이 바뀌면 그 줄만 (`ChatRow`)
  - 1초·3초마다 바뀌는 것은 그 부품만 (`StoryRing`↔`clock`, `MapPin`↔`locationTick`)
- 서버 구독 수는 **친구 수와 상관없이 일정**하게: 친구마다 따로 구독하지 않는다. 사람마다 "받는 곳" 하나(대화는 `members` 질문 하나, `typing/{나}`, `feeds/{나}/friends`)를 두고, 여러 명에게 퍼뜨리는 일은 서버 함수(`fanOut*`)가 한다
- 무거운 것은 한 번만 만든다: 지도(`KakaoMap`의 `kept`), SDK (`loadKakaoSdk`). 사진은 문서에 넣지 않고 저장소에 올려 주소만 쓴다
- **값이 그대로면 알리지 않는다** (강의 `SetScore`의 `if (Score == score) return;`처럼). 알림 한 번 = 화면 다시 그리기 한 번
- 그릴 때마다 무거운 찾기·계산을 반복하지 않는다 (강의의 `GameObject.Find`·매 프레임 `GetComponent` 금지와 같음). 한 번 계산해서 변수에 담기, DOM 찾기는 누를 때만
- 구독·타이머·이벤트는 **정리한다** (강의의 `OnDestroy`에서 `-=`): `useEffect`의 return, `useInterval`, `removeEventListener`. 앱이 살아 있는 동안 한 번만 만드는 것(서버 연결)은 예외로 주석에 적는다
- 외부 SDK·큰 파일은 **한 번만**, 필요할 때만 불러온다 (`import()`, `loadKakaoSdk`처럼)
- 목록은 고유 `key`로 그린다

## 7. 그 밖

- **주석은 꼭 필요한 곳만**: 파일 맨 위 "이 파일이 하는 일" 몇 줄 + 코드만 봐서는 **이유가 안 보이는 곳**(순서가 중요한 곳, 숫자를 고른 이유, 서버 규칙과 맞춰야 하는 값). 코드가 그대로 말해 주는 것은 쓰지 않는다. 날짜·누가 정했는지 같은 기록은 주석이 아니라 이 파일 8번(진행 상황)에.

- 화면이나 동작이 바뀌는 일은 `openspec/changes/<이름>/`에 변경으로 남긴다 (`openspec/config.yaml` 규칙).
- 애매하면 짐작해서 만들지 말고 미미에게 짧게 묻는다.
- 요청받은 일에 필요한 것이 없으면(계정, 키, 인증서, 설정값, 설치 프로그램, 파일 등) "없어요"로 끝내지 않는다. **어디서 받는지 → 어떻게 받는지 → 어디에 넣는지 → Claude에게 무엇을 알려주면 되는지**를 순서대로 알려준다.

## 8. 진행 상황 (옛 progress.md, 2026-10-30 합침)

> 지금 상태 · 바뀐 것 · 남은 과제는 **진행 0번**이 최신이에요. 진행 1~7번은 2026-10-20까지의 작업 기록이라 지우지 않고 그대로 둬요.
> 진행 문서를 새로 만들지 않고 이 8번만 계속 고쳐 써요 (1번 규칙).

### 진행 0. 2026-10-30 기준 정리 — 바뀐 것 · 완료 · 진행 중 · 남은 과제

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
| 웹 공개 | **Render Static Site 등록 중** (아래 0-4 B). 원래 설계는 Firebase Hosting(`npm run deploy:web` → `ururu-6164b.web.app`) | — |

#### 0-2. 완료한 것 (코드 기준)

| 영역 | 된 것 |
|---|---|
| 화면 틀 | React 19 전환, 탭 5개, 덮개 창, 알림 배너, 주제별 다시 그리기(친구가 많아도 빠르게) |
| 가입 · 로그인 | 구글 · 페이스북 · 익명(시험용) → 가입(아이디 · 닉네임 · 생년월일 · 국가 · 지역, 만 19세 이상), 회원탈퇴 |
| 언어 | 한국어 / 영어 전환 (`core/i18n/`) |
| 홈 지도 | 카카오 지도, "내 위치로", 위치 공유 켠 친구만 핀 |
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
| 5 빌드 · 출시 | 웹 빌드 됨, Render 등록 중 | 안드로이드 빌드(`.aab`) |
| 3 폰 앱 | ❌ 시작 안 함 | Capacitor `android/` |

#### 0-4. 남은 과제 (구글 플레이 기준, 순서대로)

**A. Firebase 마무리**
- [ ] Firestore 데이터베이스(서울, 프로덕션) 있는지 확인 → `npx firebase deploy --only firestore` (보안 규칙 올리기)
- [ ] Authentication 로그인 방법에 **이메일/비밀번호** 켜기 (운영자 사이트용)
- [ ] 브라우저 두 개로 확인: 가입 · 좋아요 · 친구 · 채팅 · 스토리 · 신고 · 탈퇴
- [ ] 첫 총관리자 아이디 만들기 (`admin-guide.md` 3번)
- [ ] 다 되면 옛 프로젝트 `ururu-eb3db` 삭제

**B. 웹 공개 (Render)**
- [ ] 사용자 앱: Render **Static Site** (Web Service 아님) — Build `npm install && npm run build`, Publish `dist`, 환경 변수 = `.env` 값, Rewrite `/*` → `/index.html`
- [ ] Render 주소를 Firebase 승인된 도메인 · 카카오 Web 사이트 도메인에 추가
- [ ] 운영자 사이트 올릴 곳 정하기: Render Static Site 하나 더(`npm run build:admin`, Publish `dist-admin`, `/admin.html`) 또는 Firebase Hosting 새 사이트 이름(`ururu-admin`은 사용 불가)

**C. 출시 전 필수**
- [ ] 가입 화면 약관 동의 칸 (SAFE-10~11), 위치 동의 창 (SAFE-20~21)
- [ ] 정책 웹 주소: `docs/policy/*.md` → 웹 페이지 (`build:policy`, 플레이 필수)
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
- [ ] 친구 실제 위치 공유 (`locations/{uid}`, 규칙은 있음)
- [ ] 소리 울리기 받기
- [ ] 운영자 2단계 승인 · 최종관리자 (`admin-roles.md` B안)
- [ ] 개발 서버 포트 고정 (`vite.config.js` `server.port 5173, strictPort`)

**F. 나중 (Blaze · Phase 6)**
- 음성 메시지 · 전화 · 영상통화, 푸시 알림, 24시간 뒤 메시지 실제 삭제(`cleanup`), 신고 알림 메일, 로그인 계정까지 삭제(`adminDeleteUser`), 앱 지워도 가입 유지, iOS

**G. 문서**
- [ ] `tasks.md` 체크 → `npm run spec:check` → archive (`migrate-to-react` → `refine-screens` → `add-interests` → `rename-app`)
- [ ] 옛 주소 `ururu-eb3db` 고치기 (`vite.config.js` 31줄, `admin-guide.md`)

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
- `dist/moyeo.html` = 미미가 더블클릭해서 보는 결과물. **src·styles를 고치면 반드시 덮어쓰기** (CLAUDE.md 2번). `npm run build:single`
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
- `docs/file-tree.md`: 전체 파일 트리는 여기 한 곳만

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

#### 3-9. MVC 정리·성능 점검 (2026-10-20, 미미가 준 "객체지향 복습"·"Unity 권장 아키텍처" 기준 → CLAUDE.md 6번)
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

### 진행 4. 미미가 정한 것 (바꾸지 말 것)

- 앱 이름: **우르르** (영어 Ururu), 구글 플레이 앱 이름도 우르르. 패키지 이름(applicationId)은 Capacitor 설치 때 정하고, 플레이에 한 번 올리면 못 바꿈. 화면 로고·탭 제목·소리 설정 경로 글자도 "우르르"로 바꿈. 폴더·`dist/moyeo.html`·`package.json` 이름·저장소 키(`moyeo.profile`) 같은 안 보이는 영어 이름은 그대로 `moyeo`
- 출시: **구글 플레이** (2026-10-30, 앱인토스에는 올리지 않음)
- 서버: **Firebase**
- 플레이 빌드: 지도 · 스와이프 · 위치 공유 켬 (`features.js` android). 위치는 동의 창 · 위치기반서비스사업 신고 뒤 공개
- 초기 제한: 채팅 사진 끔, 개인정보 공유·도박·욕설 가리기
- 제재 기준 (2026-10-15): 위반 1회 경고 → 2회 7일 이용정지 → 3회 이상 영구정지, 중대한 위반 즉시 영구정지
- 채팅 이용 수칙: 미미가 준 글 그대로 (`docs/policy/chat-rules.md`)
- 가입 나이: **모든 빌드 만 19세 이상**
- 운영 서류: 운영자 **진미**, 문의 **unidevpeer@gmail.com**(나중에 바꿔도 빌드 다시 안 해도 됨), 탈퇴 뒤 기록 보관 **1년**, 시행일 = **구글 플레이 출시일** (10-30, 예전 "앱인토스 제출일"에서 바꿈), 앱 밖 탈퇴 = 문의 이메일. 제출본: `docs/policy/` 3개
- 화면에 설명·안내 문구를 덧붙이지 않기. 새 파일 대신 원래 파일 고치기

### 진행 5. 지금 할 일: 구글 플레이 출시

> 체크 목록은 진행 0-4 (A → B → C → D 순서). 여기에는 플레이 기준으로 알아둘 것만 모아요.

#### 5-1. 로그인
- 구글 플레이 앱은 웹과 같은 **구글 로그인**(`GoogleLogin`). 안드로이드에서는 Capacitor로 앱을 만든 뒤 Firebase에 안드로이드 앱 등록 + **SHA-1** 지문이 있어야 해요 (디버그 키 · 업로드 키 · 플레이 앱 서명 키 3개 모두)
- 페이스북 로그인도 쓰면 페이스북 개발자 쪽에 안드로이드 키 해시 등록

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
