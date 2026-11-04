# 구조 · SOLID · 디자인 패턴

> 분류: Explanation (왜 이렇게 했는지)

> **한 줄 요약** 우르르 코드가 수업 규칙(계층, SOLID, Result, 테스트)과 디자인 패턴을 **어느 파일에서 어떻게** 쓰는지 한 곳에 모았어요. 코드를 고치기 전에 "이 일은 어느 층의 일인가"를 여기서 확인해요.
>
> - 작업 규칙(무엇을 지켜야 하나)은 `CLAUDE.md` 6번, 이 문서는 **왜 · 어디에** 그렇게 했는지예요.
> - 2026-11-03 코드를 직접 읽고 정리했어요. 파일을 옮기거나 패턴을 바꾸면 이 문서도 같이 고쳐요.

## 1. 계층: 위에서 아래로만 기대요

```
[View]        src/ui/screens · overlays · common (.jsx)   보이는 것만 그림, 입력은 Actions에 넘김
   ↓
[Controller]  src/ui/actions/*Actions.js · createNav.jsx   입력 → Store 바꾸기 → 서버에 알리기 → Result
   ↓
[Model]       src/data/*Store.js · AccountService · Validator · sanctionRules   데이터 + 규칙, React를 모름
   ↓
[Repository / DataSource]
              src/data/server/ChatServer.js  ← FakeServer(시연) / RealServer(Firebase)
              src/data/ProfileRepository.js  (브라우저 저장소)
              src/data/server/firebase/userMapper.js  (서버 문서 ↔ 화면용 데이터, Mapper)
   ↓
[Core]        src/core/ (result, config, time, topics, i18n, sound)   어디서나 쓰는 바닥 부품
```

- 아래 층은 위 층을 몰라요. 데이터가 화면을 직접 부르지 않고 **알림판(ChangeNotifier)에 "바뀌었어요"만 외쳐요** → 화면이 구독해서 스스로 다시 그림 (순환 의존 없음, ADP).
- 화면(`.jsx`)에서 `server.*`를 직접 부르는 곳은 **0곳**이에요 (2026-11-03 확인). 서버와 Store를 둘 다 바꾸는 일은 Actions에만 있어요.
- 운영자 사이트(`src/admin/`)는 바닥 부품(`core/`, `data/`)만 빌려 쓰고, 사용자 앱은 `src/admin/`을 한 줄도 불러오지 않아요 → 앱 빌드에 운영자 화면이 들어가지 않음.

### 수업(C# 2학기) 이름과 맞춰 보기

| 수업 | 우르르 | 파일 |
|---|---|---|
| Model (데이터 모양 · 규칙) | Store · Validator · sanctionRules | `src/data/*Store.js`, `Validator.js`, `sanctionRules.js` |
| DTO (서버 JSON 그대로) | Firestore 문서 (따로 클래스 없음) | `firebase/paths.js`에 이름 규칙 |
| Mapper (DTO → Model) | 서버 문서 ↔ 화면용 사람 · 메시지 | `server/firebase/userMapper.js` |
| DataSource (서버와 직접 통신) | Firebase 호출 | `RealServer.js` 안의 `loadFirebase` · `listen` · `upload` · `write` |
| Repository (DataSource 숨기기, 실패는 Result) | 서버 약속 · 저장소 | `ChatServer.js`, `ProfileRepository.js` |
| Service (입력 검증 · 규칙 · 조합) | 계정 · 친구 찾기 · 소리 울리기 · 화면 행동 | `AccountService.js`, `FriendSearch.js`, `PingService.js`, `ui/actions/*` |
| View | 화면 | `src/ui/**/*.jsx` |

## 2. SOLID: 어디서 지켰나

| 원칙 | 뜻 | 우르르에서 | 근거 파일 |
|---|---|---|---|
| **S** 단일 책임 | 클래스 하나 = 일 하나 | Store마다 데이터 하나 (사람 · 채팅 · 스토리 · 좋아요 · 제재), Actions도 행동 묶음별로 나눔 | `data/UserStore.js` · `ChatStore.js` …, `ui/actions/ChatActions.js` · `SafetyActions.js` … |
| **O** 개방-폐쇄 | 새 기능은 고치지 말고 더하기 | 빌드마다 다른 기능을 `if (android) …` 대신 **표 한 줄**로 켜고 끔. 로그인 방법은 새 파일 하나만 더하면 됨 | `platform/features.js`, `data/login/` |
| **L** 리스코프 치환 | 자식은 부모 자리에 그대로 | `FakeServer` ↔ `RealServer`를 바꿔 끼워도 화면 코드는 그대로. `NotificationSound` · `BubbleSound`는 `Sound` 자리에 | `server/ChatServer.js`, `core/sound/Sound.js` |
| **I** 인터페이스 분리 | 안 쓰는 기능 억지로 만들지 않기 | 로그인 약속은 `signIn` 하나뿐. 저장소는 저장 · 불러오기 · 지우기만 | `login/LoginProvider.js`, `ProfileRepository.js` |
| **D** 의존 역전 + 주입 | 구체 클래스 말고 약속에 기대기, 밖에서 만들어 넣기 | 모든 부품을 `main.jsx` **한 곳**에서 만들어 생성자로 넣음. 다른 곳에서 서버를 `new` 하는 곳 0곳 | `src/main.jsx` (Composition Root) |

> 자바스크립트에는 `interface`가 없어서, **부모 클래스가 "꼭 만들어야 하는 함수"를 약속**하고 자식이 안 만들면 오류를 내게 했어요 (`ChatServer`, `LoginProvider`).

## 3. 쓴 디자인 패턴

| 패턴 | 왜 썼나 | 파일 |
|---|---|---|
| **옵저버 (Observer)** | 데이터가 바뀌면 그 주제를 구독한 화면만 다시 그림 (친구가 많아져도 빠르게) | `core/ChangeNotifier.js`, `core/topics.js`, `ui/app/ChangeHub.js`, `ui/app/Observable.js`, `ui/hooks/useChanges.js` |
| **전략 (Strategy)** | 상황에 따라 바꿔 끼우기 — 서버(가짜/진짜), 로그인 방법(구글) | `server/FakeServer.js` · `RealServer.js`, `login/GoogleLogin.js` |
| **템플릿 메서드 (Template Method)** | "파일 있으면 파일, 없으면 임시 소리" 순서는 부모가, 소리 모양만 자식이 | `core/sound/Sound.js` → `NotificationSound`, `BubbleSound` |
| **저장소 (Repository)** | 어디에 저장하는지 숨김 → 나중에 서버로 바꿔도 쓰는 코드는 그대로 | `data/ProfileRepository.js`, `server/ChatServer.js` |
| **매퍼 (Mapper)** | 서버 문서 모양과 화면 데이터 모양을 한 곳에서 바꿈 | `server/firebase/userMapper.js` |
| **Result 패턴** | 흔한 실패(잘못된 입력, 인터넷 끊김)는 멈추지 않고 이유와 함께 돌려줌 | `core/result.js` → `Validator`, `AccountService`, `LoginProvider` … |
| **중재자 (Mediator)** | 채팅방 ↔ 프로필처럼 서로 여는 창이 서로를 import 하지 않게 "열기"를 한 곳에 | `ui/app/createNav.jsx` (`ctx.nav`) |
| **조립 한 곳 (Composition Root, 의존성 주입)** | 부품 만들기를 한 곳에 모아 바꿔 끼우기 · 시험이 쉬움 | `src/main.jsx`, `ui/app/AppContext.jsx` |
| **한 번만 만들기 (싱글턴 역할)** | 무거운 것은 앱이 사는 동안 하나만 — 카카오 SDK, 지도, Firebase 연결 | `platform/kakaoSdk.js`, `screens/home/KakaoMap.jsx`(`kept`), `server/firebase/firebaseApp.js` |
| **기능 스위치 (Feature Toggle)** | 빌드 대상마다 기능을 주석이 아니라 값으로 켜고 끔 | `platform/features.js` |

> 수업 표에 있는 **팩토리 · 빌더 · 상태 패턴**은 지금 필요한 곳이 없어서 쓰지 않았어요 (패턴을 위한 패턴은 만들지 않기). `main.jsx`의 `createLogin()`이 빌드에 맞는 로그인을 고르는 작은 팩토리 역할을 해요.

## 4. 실패 처리 · 시험

- **Result**: 실패해도 이상하지 않은 일 (입력 검사, 로그인 실패, 사진 10장 초과, 저장 공간 부족) → `Result.fail(이유)`
- **예외(throw)**: 일어나면 안 되는 일(버그) → 예) 자식 클래스가 약속한 함수를 안 만듦
- **서버 쓰기 실패**: `RealServer.write()`가 잡아서 "error" 배너, 인터넷 끊김은 "offline" 배너
- **시험 82개** (`tests/`): 화면 없이 Model · Controller를 시험해요. 서버는 진짜 대신 **FakeServer(가짜)** 를 넣어요 (수업의 Mock). 서버 구독 수는 가짜 Firestore로 친구 300명을 만들어 시험해요 (`server.test.js`).

## 5. 수업 규칙과 다른 점 · 남은 숙제

| 항목 | 지금 | 이유 / 할 일 |
|---|---|---|
| 중괄호 | **Airbnb + Prettier로 통일** (2026-11-03, `CLAUDE.md` 5번) | 설정은 넣었고, 코드 전체 정렬은 미미 PC에서 `npm run format` 한 번 |
| 필드 `private` | 데이터 클래스 필드가 공개 (`this.x`). 밖에서 직접 바꾸는 곳은 없음(2026-11-03 확인), 바꿀 때는 메서드로 (`CLAUDE.md` 6번) | JS의 `#private`로 바꿀 수 있지만 시험 · 서버 코드가 넓게 걸려 있어 아직 안 함 |
| 비동기 이름 끝 `Async` | 안 붙임 (`signIn`, `register` …) | C# · 자바 규칙. JS(Airbnb)에서는 붙이지 않는 게 보통이라 그대로 둬요 |
| 클래스 크기 (SRP) | `RealServer.js` 한 파일 853줄 (로그인 · 실시간 구독 · 채팅 · 친구 · 스토리 · 사진) | `openspec/changes/split-real-server`에서 기능별로 나누는 중 |
| 시험 Given / When / Then | 2026-11-03 주석 추가 | `tests/*.test.js` |
