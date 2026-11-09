# CLAUDE.md — 우르르(ururu) 프로젝트에서 Claude가 지킬 작업 지침

> Claude Code와 Claude가 이 폴더에서 일할 때 맨 먼저 읽는 파일이에요.
> **일을 시작하기 전에 이 순서로 읽어요**:
> 1. 이 파일 전체 — 규칙 1~7 + **8번 "미미가 정한 것"** (바꾸지 말 것)
> 2. `docs/progress.md` — 지금 상태 · 한 일
> 3. `docs/todo.md` — 앞으로 할 일
> 4. `docs/architecture.md` — 등급(총관리자 → 운영자 → 이용자) · 계층 · 파일 지도
>
> 문서는 `docs/`에 이 3개만 둬요. 다른 .md 문서를 새로 만들지 않아요.
> 정책 문서는 `src/policy/`의 `terms.md` · `chat-rules.md` · `privacy.md` + 영어판. 앱이 그대로 읽어요.

## 1. 파일은 새로 만들지 말고 원래 파일을 고친다

- 이미 있는 파일과 **같은 일을 하는 파일**을 새로 만들지 않는다. 원래 파일을 고치거나 덮어쓴다.
  - 예) 한 장짜리 HTML은 언제나 `dist/ururu.html` 하나. `dist-single/`, `ururu-new.html`, `ururu (2).html` 같은 새 폴더·새 이름 금지
  - 예) 문서를 고칠 때 `architecture-v2.md`를 만들지 말고 `architecture.md`를 고친다
- 결과물이 나오는 자리(폴더·파일 이름)를 바꿔야 할 때는 **먼저 미미에게 묻는다**.
- 정말 새 파일이 필요하면(새 기능의 새 부품 등) 만들기 전에 비슷한 파일이 이미 있는지 먼저 찾아본다. 새 최상위 폴더를 만들 때만 `docs/architecture.md` 파일 지도에 한 줄 더한다.
- 앱과 서버 함수가 같이 쓰는 코드(`MessageFilter.js`, `sanctionRules.js`)도 원본은 `src/data/` 하나. 서버용 복사는 `tools/copy-shared.mjs`가 해요 (`functions/shared/`는 고치지 않기).
- 약관·정책·수칙 글은 `src/policy/*.md` 하나. 앱 화면도 이 파일을 그대로 읽어요.
- 지워야 할 파일은 지우지 말고 `_to_delete/`로 옮긴다 (미미가 확인하고 직접 지움).

## 2. 코드를 고치면 결과물도 같이 맞춘다

- `dist/ururu.html`은 `src/`와 `styles/`를 한 파일로 묶은 **결과물**이라, 원본을 고쳐도 다시 만들기 전에는 바뀌지 않는다.
- 그래서 `src/`나 `styles/`를 고쳤으면 `dist/ururu.html`도 새 코드로 덮어쓴다 (`npm run build:single`). 미미는 이 파일을 더블클릭해서 확인한다.
- `npm run dev`로 열어 둔 화면은 저장하는 순간 바로 바뀐다. `.md` 문서는 앱 화면에 영향이 없다. **단, `src/policy/*.md`(약관·수칙)는 앱이 읽어서 보여주므로 고치면 다시 빌드한다.**
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
- 가로로 화면 밖으로 넘치는 요소가 없어야 한다 (가로 스크롤은 일부러 만든 줄만)
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

## 5. 코드 모양: Airbnb + Prettier (2026-11-03 미미, Allman에서 바꿈)

- 웹 파일(`.js` · `.jsx` · `.css` · `.json` · `.html`)은 **Airbnb 스타일 가이드 + Prettier** — 큰 프로젝트 · 회사에서 가장 많이 쓰는 기본 모양
  - 여는 중괄호 `{`는 **같은 줄 끝** (`if (x) {`, `} else {`), 들여쓰기 2칸, 세미콜론 붙임, JS 문자열은 작은따옴표 `'`(JSX 속성은 `"`), 한 줄 최대 100자, 여러 줄 목록 끝에 쉼표
  - 한 줄에 문장(CSS 속성) 하나 — Prettier가 저절로 맞춰요
- **손으로 맞추지 않고 `npm run format`** 으로 정렬한다. 커밋 전 확인은 `npm run format:check` (설정: `.prettierrc.json`, 정렬에서 빼는 것: `.prettierignore`)
- `firestore.rules` · `storage.rules`는 Prettier가 못 읽어서 손으로 같은 모양(같은 줄 `{`, 2칸)
- 2026-10-20 ~ 11-02에는 Allman이었어요. 옛 코드가 남아 있으면 `npm run format` 한 번이면 바뀌어요

```css
.signup h2 {
  margin: 0;
  font-size: var(--fs-title);
}
```

```js
if (result.isOk) {
  showName(result.value);
} else {
  toast.show(result.reason);
}
```

## 6. 구조와 성능 — MVC 나누기 (2026-10-20 미미, 생존코딩 "객체지향 복습"·"Unity 권장 아키텍처" 정리 기준)

모든 코드를 고치거나 새로 쓸 때 아래를 지킨다. 우르르(React)에서 같은 역할을 하는 자리는 이렇다. 구조 · 패턴은 `docs/architecture.md` (바꾸면 그 문서도 고친다).

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
  - 1초·3초마다 바뀌는 것은 그 부품만 (`MapPin`↔`locationTick`)
- 서버 구독 수는 **친구 수와 상관없이 일정**하게: 친구마다 따로 구독하지 않는다. 사람마다 "받는 곳" 하나(대화는 `members` 질문 하나, `typing/{나}`, `feeds/{나}/friends`)를 두고, 여러 명에게 퍼뜨리는 일은 서버 함수(`fanOut*`)가 한다
- 무거운 것은 한 번만 만든다: 지도(`KakaoMap`의 `kept`), SDK (`loadKakaoSdk`). 사진은 문서에 넣지 않고 저장소에 올려 주소만 쓴다
- **값이 그대로면 알리지 않는다** (강의 `SetScore`의 `if (Score == score) return;`처럼). 알림 한 번 = 화면 다시 그리기 한 번
- 그릴 때마다 무거운 찾기·계산을 반복하지 않는다 (강의의 `GameObject.Find`·매 프레임 `GetComponent` 금지와 같음). 한 번 계산해서 변수에 담기, DOM 찾기는 누를 때만
- 구독·타이머·이벤트는 **정리한다** (강의의 `OnDestroy`에서 `-=`): `useEffect`의 return, `useInterval`, `removeEventListener`. 앱이 살아 있는 동안 한 번만 만드는 것(서버 연결)은 예외로 주석에 적는다
- 외부 SDK·큰 파일은 **한 번만**, 필요할 때만 불러온다 (`import()`, `loadKakaoSdk`처럼)
- 목록은 고유 `key`로 그린다

## 7. 그 밖

- **주석은 꼭 필요한 곳만**: 파일 맨 위 "이 파일이 하는 일" 몇 줄 + 코드만 봐서는 **이유가 안 보이는 곳**(순서가 중요한 곳, 숫자를 고른 이유, 서버 규칙과 맞춰야 하는 값). 코드가 그대로 말해 주는 것은 쓰지 않는다. 날짜·누가 정했는지 같은 기록은 주석이 아니라 `docs/progress.md`에.

- 애매하면 짐작해서 만들지 말고 미미에게 짧게 묻는다.
- 요청받은 일에 필요한 것이 없으면(계정, 키, 인증서, 설정값, 설치 프로그램, 파일 등) "없어요"로 끝내지 않는다. **어디서 받는지 → 어떻게 받는지 → 어디에 넣는지 → Claude에게 무엇을 알려주면 되는지**를 순서대로 알려준다.
- 작업을 끝내면 `docs/progress.md`(한 일)와 `docs/todo.md`(남은 일)를 같은 작업 안에서 고친다.

## 8. 미미가 정한 것 (바꾸지 말 것)

- 앱 이름: **우르르** (영어 Ururu), 구글 플레이 앱 이름도 우르르. 패키지 이름(applicationId)은 Capacitor 설치 때 정하고, 플레이에 한 번 올리면 못 바꿈. 화면 로고·탭 제목·소리 설정 경로 글자도 "우르르"로 바꿈. `package.json` 이름은 **`ururu`** (2026-11-03 미미). **모든 파일·안 보이는 이름도 `ururu`로 통일** (2026-11-04 미미): 한 장 HTML `dist/ururu.html`, 저장소 키 `ururu.*`(예전 `moyeo.*` 값은 앱이 처음 켤 때 한 번 옮김, `ProfileRepository`), 서버 함수 패키지 `ururu-functions`. 새로 만드는 이름에 `moyeo`를 쓰지 않음
- 출시: **구글 플레이** (2026-10-30)
- 서버: **Firebase 프로젝트 하나** (`ururu-6164b`) — 데이터 · 로그인 · 서버 함수 · 보안 규칙. 화면 파일은 **Cloudflare Pages**에 올림: 사용자 앱 · 운영자 사이트 프로젝트 2개, GitHub push하면 저절로 배포 (2026-11-03, 무료 상업 이용 · 트래픽 무제한이라서. Firebase Hosting · Render는 안 씀)
- 지도: **카카오 지도로 계속** (2026-11-03, 구글 지도 `add-google-map`은 하지 않음)
- 지도 · 위치 공유: **꺼 둠** (2026-11-09, `features.js` `canShareLocation: false`, 나중에 다시 검토). 스와이프는 켬
- 스토리: **없앰** (2026-11-09). 글 꾸미기는 프로필 사진 올리기(My photos)로 옮김
- 로그인: **구글만** (2026-11-03). 페이스북 · 익명 버튼 없앰. 가입 순서(아이디 · 닉네임 · 생년월일 · 국가)는 그대로
- 위치 (2026-11-03): **켠 사람만**, **앱을 쓰는 동안만** 서버에 둠 — 화면에서 내려가면 바로 지우고, 못 지웠을 때는 10분 뒤 서버가 자동 삭제(Firestore TTL). 친구에게는 **시·도까지**("대한민국 경기도"), **결제한 사람에게만 동까지**("경기도 평택시 서정동", `entitlements/{uid}.plan = 'premium'`, 결제 기능은 아직 없음). 프로필(`users`)에는 지역을 저장하지 않음
- 초기 제한: 채팅 사진 끔, 개인정보 공유·도박·욕설 가리기
- 제재 기준 (2026-10-15): 위반 1회 경고 → 2회 7일 이용정지 → 3회 이상 영구정지, 중대한 위반 즉시 영구정지
- 채팅 이용 수칙: 미미가 준 글 그대로 (`src/policy/chat-rules.md`)
- 가입 나이: **모든 빌드 만 19세 이상**
- 운영 서류: 운영자 **진미**, 문의 **unidevpeer@gmail.com**(나중에 바꿔도 빌드 다시 안 해도 됨), 탈퇴 뒤 보관: 계정·프로필 **7일** 유지 후 삭제(이용자에게 보이는 기준), 운영자 확인 뒤 서버에서 완전 삭제 **한 달**, 신고·위반·이용정지 기록도 **한 달** (탈퇴자가 없으면 그 기록도 함께 소멸, 2026-11-03 미미, 예전 1년·3개월), 시행일 = **구글 플레이 출시일** (10-30), 앱 밖 탈퇴 = 문의 이메일. 제출본: `src/policy/` 3개 (`terms.md` · `chat-rules.md` · `privacy.md`)
- 화면에 설명·안내 문구를 덧붙이지 않기. 새 파일 대신 원래 파일 고치기
- 코드 모양: **Airbnb + Prettier** (2026-11-03, 큰 프로젝트·회사 기본이라서. 그전 Allman). 5번
