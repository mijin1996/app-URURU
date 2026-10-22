# CLAUDE.md — 우르르(옛 이름 모여) 프로젝트에서 Claude가 지킬 작업 지침

> Claude Code와 Claude가 이 폴더에서 일할 때 맨 먼저 읽는 파일이에요.
> **일을 시작하기 전에 이 순서로 읽어요** (2026-10-21):
> 1. `docs/architecture.md` — 구조 · 층 · 의존 방향 · 서버 · 로그인 · 빌드 대상 (**코드를 고치기 전에 꼭**)
> 2. `docs/roadmap.md` "구현 현황" — 된 것 · 안 된 것 · 남은 일 순서 (최신)
> 3. `docs/progress.md` — 지금까지의 작업 기록과 미미가 정한 것
> 4. `docs/file-tree.md` — 파일 위치 / `docs/code-structure-and-patterns.md` — 파일마다 하는 일
>
> 코드 규칙은 `docs/coding-rules.md`, 쓰는 기술 버전·금지 기술·실행 명령은 `docs/tech-stack.md`. 출시 순서는 `docs/guides/launch-checklist.md`. 정책 문서는 `docs/policy/`의 `terms.md`(이용약관)·`chat-rules.md`(채팅 이용 수칙) 두 개만 (2026-10-20 미미).

## 1. 파일은 새로 만들지 말고 원래 파일을 고친다

- 이미 있는 파일과 **같은 일을 하는 파일**을 새로 만들지 않는다. 원래 파일을 고치거나 덮어쓴다.
  - 예) 한 장짜리 HTML은 언제나 `dist/moyeo.html` 하나. `dist-single/`, `moyeo-new.html`, `moyeo (2).html` 같은 새 폴더·새 이름 금지
  - 예) 문서를 고칠 때 `roadmap-v2.md`를 만들지 말고 `roadmap.md`를 고친다
- 결과물이 나오는 자리(폴더·파일 이름)를 바꿔야 할 때는 **먼저 미미에게 묻는다**.
- 정말 새 파일이 필요하면(새 기능의 새 부품 등) 만들기 전에 비슷한 파일이 이미 있는지 `docs/file-tree.md`에서 확인하고, 만든 뒤 `docs/file-tree.md`와 `docs/code-structure-and-patterns.md`를 같은 작업 안에서 고친다.
- 앱과 서버 함수가 같이 쓰는 코드(`MessageFilter.js`, `sanctionRules.js`)도 원본은 `src/data/` 하나. 서버용 복사는 `tools/copy-shared.mjs`가 해요 (`functions/shared/`는 고치지 않기).
- 약관·정책·수칙 글은 `docs/policy/*.md` 하나. 앱 화면도 이 파일을 그대로 읽어요.
- 지워야 할 파일은 지우지 말고 `_to_delete/`로 옮긴다 (미미가 확인하고 직접 지움).

## 2. 코드를 고치면 결과물도 같이 맞춘다

- `dist/moyeo.html`은 `src/`와 `styles/`를 한 파일로 묶은 **결과물**이라, 원본을 고쳐도 다시 만들기 전에는 바뀌지 않는다.
- 그래서 `src/`나 `styles/`를 고쳤으면 `dist/moyeo.html`도 새 코드로 덮어쓴다 (`npm run build:single`). 미미는 이 파일을 더블클릭해서 확인한다.
- `npm run dev`로 열어 둔 화면은 저장하는 순간 바로 바뀐다. `.md` 문서는 앱 화면에 영향이 없다. **단, `docs/policy/*.md`(약관·수칙)는 앱이 읽어서 보여주므로 고치면 다시 빌드한다.**
- 화면을 바꾸면 스토어 이미지도 다시 찍는다 (`npm run store:images` → `store/*/images` 덮어씀).

## 3. 화면에 설명 문구를 넣지 않는다

- 요청받은 기능을 만들 때 화면에 **설명·안내 글을 덧붙이지 않는다**.
  - 예) 안내 문장("~할 수 있어요", "~하면 ~돼요"), 기능 설명 배너, 예시가 든 입력 칸 안내("예: 러닝, 카페"), 버튼 옆 부연 글, 시간·상태 보조 글
- 화면에 보이는 글자는 미미가 정한 것만 쓴다. 꼭 필요해 보이면 **만들기 전에 먼저 묻는다**.
- 설명은 화면이 아니라 코드 주석과 `docs/`에 쓴다.

## 4. 어떤 폰 비율에서도 화면이 맞게

폰마다 폭·높이·비율이 달라서, 화면은 **화면 크기에 맞춰 늘고 줄게** 만든다.

- 폭은 고정 px 대신 `%`, `1fr`, `flex:1`, `min()`/`max()`/`clamp()`로. 화면 높이를 다 쓰는 곳(지도, 스와이프 카드)은 `flex:1`로 남는 높이를 채운다
- 폰트·아이콘·버튼 크기는 `styles/base.css` `:root`의 크기 규칙(`--fs`, `--fs-small`, `--fs-title`, `--icon`, `--btn-h`)만 쓴다. 이 값들은 앱 폭에 맞춰 저절로 커지고 작아진다 (`docs/tech-stack.md` 8번). 다른 곳에 크기 숫자를 직접 쓰지 않는다
- 이름과 나이는 어디서든 같은 글꼴·크기·굵기로
- 가로로 화면 밖으로 넘치는 요소가 없어야 한다 (가로 스크롤은 일부러 만든 줄만: 스토리 줄 등)
- 긴 글자(이름, 동네)는 줄임표(…)나 줄바꿈으로 처리해서 버튼·칸을 밀어내지 않게
- 폰 노치·홈 바는 `env(safe-area-inset-*)`로 피한다 (Phase 3, `styles/platform.css`)
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

- **주석은 꼭 필요한 곳만**: 파일 맨 위 "이 파일이 하는 일" 몇 줄 + 코드만 봐서는 **이유가 안 보이는 곳**(순서가 중요한 곳, 숫자를 고른 이유, 서버 규칙과 맞춰야 하는 값). 코드가 그대로 말해 주는 것은 쓰지 않는다. 날짜·누가 정했는지 같은 기록은 주석이 아니라 `docs/progress.md`에.

- 화면이나 동작이 바뀌는 일은 `openspec/changes/<이름>/`에 변경으로 남긴다 (`openspec/config.yaml` 규칙).
- 애매하면 짐작해서 만들지 말고 미미에게 짧게 묻는다.
- 요청받은 일에 필요한 것이 없으면(계정, 키, 인증서, 설정값, 설치 프로그램, 파일 등) "없어요"로 끝내지 않는다. **어디서 받는지 → 어떻게 받는지 → 어디에 넣는지 → Claude에게 무엇을 알려주면 되는지**를 순서대로 알려준다 (모아 둔 곳: `docs/guides/launch-checklist.md` "없는 것 가져오는 법").
