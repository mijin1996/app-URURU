# tech-stack.md — 쓰는 기술과 울타리

> [기본 원칙 2] 기술적 탈선을 막는 울타리 (버전 고정, 금지 기술)
> 새 라이브러리를 넣고 싶으면 **먼저 이 문서를 고치고** 나서 코드에 넣어요.
> 구조·층·의존·서버는 [`architecture.md`](architecture.md)에 있어요.

---

## 1. 쓰는 기술 (버전 고정)

`package.json`에는 `^`나 `~` 없이 **정확한 버전**으로 적어요. 같은 코드를 언제 설치해도 똑같이 동작하게 하려고요.

| 분류 | 이름 | 버전 | 하는 일 |
|---|---|---|---|
| 화면 | `react`, `react-dom` | **19.3.0** | 화면을 컴포넌트로 나눠 그리기 |
| 묶기·개발 서버 | `vite` | **8.3.1** | `npm run dev`로 PC에서 바로 확인, `npm run build`로 `dist/` 만들기 |
| | `@vitejs/plugin-react` | **6.1.1** | Vite가 JSX를 읽게 해 줌 |
| 폰 앱 껍데기 | `@capacitor/core`, `@capacitor/cli` | **8.5.2** | 웹 화면을 안드로이드·iOS 앱으로 감싸기 |
| | `@capacitor/android`, `@capacitor/ios` | **8.5.2** | 안드로이드 / iOS 프로젝트 |
| 폰 기능 | `@capacitor/preferences` | **8.0.1** | 가입 정보 저장 (폰에서는 브라우저 저장소가 지워질 수 있어서) |
| | `@capacitor/app` | **8.1.1** | 안드로이드 "뒤로" 버튼 |
| 지도·위치 | `@googlemaps/js-api-loader` | **2.1.3** | 구글 지도 웹용 불러오기 (키가 있을 때만) |
| | `@capacitor/geolocation` | **8.2.2** | 폰 GPS (PC는 브라우저 위치 기능) |
| 서버 | `firebase` | **12.19.0** | 로그인, 실시간 데이터, 사진 저장 (`add-real-server`) |
| | `firebase-tools` | **15.31.0** | 에뮬레이터·배포 명령 (개발용) |
| | `firebase-functions`, `firebase-admin` | **7.4.0**, **14.5.0** | 서버 함수: 24시간 정리, 회원탈퇴, 토스 로그인 |
| 로그인 | `@capacitor-firebase/authentication` | **8.5.2** | 안드로이드 앱 안 구글 로그인 |
| 토스 | `@apps-in-toss/web-framework` | **3.8.0** | 앱인토스 미니앱 SDK + `ait` 명령 (`apps-in-toss.config.ts`, `npm run build:ait`) |
| 글꼴 | `@fontsource-variable/noto-sans-kr` | **5.3.0** | Noto Sans KR을 앱 안에 넣기 (인터넷 없어도 같은 글꼴). 굵기 4개를 파일 하나로 담는 방식이라 3.7MB로 가벼움 |
| 한 장 HTML | `vite-plugin-singlefile` | **2.3.3** | `npm run build:single`로 더블클릭해서 여는 HTML 한 장 만들기 (지금처럼) |
| 시험 | `vitest` | **5.0.2** | `data/` 규칙 자동 시험 |
| | `jsdom` | **30.1.1** | 시험할 때 쓰는 가짜 브라우저 |
| 비교 | `@playwright/test` | **1.63.0** | 원본(v13)과 React 버전을 같은 순서로 눌러 보고 사진 비교 |
| 문서 | `@fission-ai/openspec` | **1.13.2** | spec·변경 검사(`npm run spec:check`), Claude Code `/opsx:*` 명령 |
| 언어 | JavaScript (JSX) | ES2022 | TypeScript는 Phase 4 이후에 검토 |
| 지도 | 카카오 지도 JavaScript SDK | (스크립트, 버전 없음) | 홈 지도. `.env` `VITE_KAKAO_MAP_KEY`, `platform/kakaoSdk.js` (구글 지도 대신, 2026-10) |

> ⚠️ 2026-10-21 현재 **설치 안 된 것**: Capacitor 5개, `@capacitor-firebase/authentication`, `@googlemaps/js-api-loader`, `@fontsource-variable/noto-sans-kr` — 해당 단계(`add-mobile-apps` 등)를 시작할 때 설치해요. 실제 설치 목록은 `package.json` ([`architecture.md`](architecture.md) 9번).

### 컴퓨터에 필요한 것

| 하려는 일 | 필요한 것 |
|---|---|
| PC에서 개발·확인 | **Node.js 22 이상** |
| 안드로이드 빌드 | **Android Studio Otter (2025.2.1) 이상** · minSdk 24 (Android 7.0) · compile/targetSdk 36 |
| iOS 빌드 | **Mac + Xcode 26 이상** · iOS 15.0 이상 · 앱스토어에 올리려면 Apple 개발자 계정 |

> iOS는 Mac이 없으면 빌드할 수 없어요. 윈도우에서는 안드로이드와 PC만 확인할 수 있어요.

---

## 2. 금지 기술 (쓰지 않는 것과 이유)

| 금지 | 이유 | 대신 |
|---|---|---|
| Redux, Zustand, MobX 등 상태 관리 라이브러리 | 지금 쓰는 `ChangeNotifier` + Store로 충분 (YAGNI) | `useStore` 훅 하나 |
| CSS-in-JS (styled-components 등), Tailwind | 지금 CSS 9개를 **그대로** 써야 화면이 안 바뀜 | `styles/*.css` 그대로 |
| React Router | 탭 5개와 덮개 창이 전부. 주소(URL) 이동이 필요 없음 | `App`의 탭 상태 + `OverlayHost` |
| React Native, Expo | 화면을 전부 새로 그려야 해서 지금 화면이 바뀜 | Capacitor |
| UI 부품 라이브러리 (MUI, Ant Design 등) | 모양이 바뀜 | 직접 만든 부품 |
| `class` 컴포넌트 (React) | 요즘 React 방식이 아님 | 함수 컴포넌트 + 훅 |
| `for` 문 | 지금 코드 규칙 | `map`, `filter`, `forEach`, `find`, `some`, `reduce` |
| 외부 인터넷에서 글꼴·그림 불러오기 | 폰 앱은 인터넷이 없을 때도 열려야 함 | 앱 안에 넣기 (예외: 구글 지도. 못 불러오면 그림 지도로) |
| 코드에 API 키 적기 | 키가 zip·git에 퍼짐 | `.env` 파일에만 (`.env.example`은 빈 칸) |
| 폰마다 다른 지도 SDK (구글 안드로이드 SDK + 애플 지도) | 지도 코드가 두세 벌이 됨 | 구글 지도 웹용 하나 |
| `console.log` 남기기 | 커밋 전 체크리스트 | 지우기 |

---

## 3. 폴더 구조 → [`architecture.md`](architecture.md) 2번

## 4. 의존 방향 → [`architecture.md`](architecture.md) 2번 "의존 규칙"

## 5. React와 기존 코드를 잇는 규칙 → [`architecture.md`](architecture.md) 7번

## 6. 사용하는 디자인 패턴 → [`architecture.md`](architecture.md) 8번

> 3~6번은 2026-10-21에 `architecture.md`로 옮겼어요 (구조·층·의존을 한 곳에서 보려고). 번호는 다른 문서가 가리키고 있어서 남겨 둬요.

---

## 7. 자주 쓰는 문법

| 문법 | 무엇 | 예 |
|---|---|---|
| 배열 메서드 | `for` 대신 `map`, `filter`, `forEach`, `find`, `some`, `reduce` | `ChatStore.totalUnread` |
| JSX | 자바스크립트 안에 HTML 모양 쓰기. `class` 대신 `className` | 모든 `ui/*.jsx` |
| 함수 컴포넌트 | `function ChatRow({ friend }) { return <button>…</button>; }` | 모든 화면 |
| `useState` | 화면이 기억하는 값 (바뀌면 다시 그림) | 검색칸 글자, 닉네임 편집 중인지 |
| `useEffect` | 그린 다음 할 일 + 정리(타이머 끄기) | 스토리 5초 닫기, 스와이프 "n분 뒤" |
| `useRef` | 다시 그려도 유지되지만 바뀌어도 다시 그리지 않는 값, DOM 요소 잡기 | 끌기 시작 위치, 채팅 맨 아래로 스크롤 |
| `useSyncExternalStore` | React 밖의 Store를 구독 | `useStore` 훅 |
| 구조 분해 | `const { users, toast } = useCtx();` | 대부분의 화면 |
| `class / extends / super` | 클래스와 상속 (`data/`, `core/`) | `FakeServer extends ChatServer` |
| `async / await` | 기다려야 하는 일을 순서대로 | 사진 고르기, 폰 저장소 읽기 |
| CSS 변수 + `@property` | 테두리 길이 `--p`를 부드럽게 줄이기 | `base.css`의 `.ring` |
| CSS `env(safe-area-inset-*)` | 폰 노치·홈 바 부분 피하기 (PC에서는 0) | Phase 3 |
| Allman 중괄호 | 여는 중괄호를 다음 줄에 (`return {`만 같은 줄) | 모든 파일 |
| 세미콜론 뒤 줄바꿈 | `;` 하나마다 줄을 바꿔서 한 줄에 문장·속성 하나 (CSS도 `a{b:1;c:2}` 대신 속성마다 한 줄) | 모든 파일 |

---

## 8. 크기 규칙 (디자인 토큰) — 화면 폭에 맞춰 저절로

글꼴은 **Noto Sans KR 하나**, 굵기 400 · 500 · 700 · 900.
크기는 `styles/base.css` 맨 위 `:root`에서만 정해요. 폰마다 폭이 달라서 **앱 폭에 비례해 커지고 작아지며**, 너무 작거나 크지 않게 최소·최대를 둬요.
`--appw` = 앱 폭 (폰은 화면 폭, PC는 최대 440px). 값 = `clamp(최소, 앱 폭 × 기준값 ÷ 390, 최대)`

| 이름 | 320px 폰 | **390px 폰 (기준)** | 440px 이상 | 쓰는 곳 |
|---|---|---|---|---|
| `--fs` | 12px | **14px** | 16px | 일반 폰트 전부 (버튼, 목록 이름, 내가 보낸 메시지, 탭 이름, 배지 숫자) |
| `--fs-small` | 12px | **13px** | 15px | 회색·설명 폰트, **받은 메시지** |
| `--fs-title` | 19px | **22px** | 25px | 창 제목, 내 닉네임, 프로필·카드 이름 + 나이 |
| `--icon` | 18px | **20px** | 23px | 모든 아이콘 (`svg[viewBox="0 0 24 24"]`) |
| `--btn-h` | 34px | **38px** | 43px | 글자·그림 버튼과 입력 칸 높이 (양옆 16px, 알약 모양, 글자 길이만큼) |
| 토글 | 34 × 20px | 34 × 20px | 34 × 20px | 설정 3개 (고정) |
| `--fs-profile` | 10px | 10px | 10px | 프로필 보기 화면에서 이름·나이 말고 나머지 폰트 전부 (@아이디, 동네, 칩, 소개, 사진 번호, 아래 버튼·안내) (고정) |

- 이름과 나이는 어디서든 **같은 글꼴·크기·굵기·색**이에요 (스와이프 카드, 프로필, 친구 탭).
- 숫자를 바꿀 때는 `base.css` `:root` 한 곳만 고쳐요. 다른 CSS 파일에 폰트 크기 숫자를 직접 쓰지 않아요.
- 규칙에서 일부러 뺀 것: 로고(84px / 44px), 사진 없을 때 이름 첫 글자, 지도 지명(22px), 스와이프 도장(22px), 글 스토리 글자(16~48px), 프로필 동그라미 크기.


---

## 9. 실행과 빌드

### PC에서 개발
```bash
npm install          # 처음 한 번
npm run dev          # 브라우저에서 http://localhost:5173 열림. 고치면 바로 반영
npm run test         # data/ 규칙 시험
npm run compare      # 승인한 화면 사진과 지금 화면 비교
npm run build        # dist/ 에 완성본 만들기 (폰 앱과 웹 서버용)
npm run build:single # dist/moyeo.html 한 장 (더블클릭으로 PC·폰 브라우저에서 바로 열기)
npm run build:toss   # dist-toss/ 앱인토스용 웹 결과 (탭 3개: 스와이프·지도 끔, src/platform/features.js)
npm run build:ait    # build:toss + ait build → ururu.ait (앱인토스 콘솔에 올릴 파일)
npm run spec:check   # openspec validate --all --strict (문서 형식 검사)
npm run emulators    # 내 컴퓨터 안의 가짜 Firebase (.env에 VITE_FIREBASE_EMULATOR=true, Java 21 이상)
npm run deploy:server # firestore.rules·storage.rules·서버 함수를 진짜 Firebase에 올리기 (docs/guides/firebase-setup-guide.md)
npm run deploy:web    # 빌드 + 사용자 앱을 Hosting(app)에 올리기
npm run dev:admin     # 운영자 사이트 개발 서버 (http://localhost:5180/admin.html)
npm run deploy:admin  # 운영자 사이트 빌드(dist-admin/) + Hosting(admin)에 올리기
```

### 안드로이드
```bash
npm run build && npx cap sync android   # 웹 완성본을 안드로이드 프로젝트에 복사
npx cap open android                    # Android Studio가 열림 → ▶ 버튼으로 폰/에뮬레이터 실행
```

### iOS (Mac에서만)
```bash
npm run build && npx cap sync ios
npx cap open ios                        # Xcode가 열림 → 팀(Team) 고르고 ▶ 실행
```

> `npm run cap:android`, `npm run cap:ios`로 위 두 줄을 한 번에 할 수 있게 만들어요.
