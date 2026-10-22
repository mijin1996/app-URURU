# roadmap.md — 단계별 일정

> [기본 원칙 3] 점진적 전체 일정표 (Phase 단위 범위 관리)
> 한 Phase가 **완료 기준을 모두 통과해야** 다음 Phase로 넘어가요. 중간에 새 기능을 끼워 넣지 않아요.

---

## 한눈에 보기

> 2026-10-21 실제 코드를 기준으로 상태를 다시 맞췄어요. 자세한 구현 현황과 남은 일은 바로 아래 **"구현 현황"**.

| Phase | 이름 | 상태 | 끝나면 손에 쥐는 것 |
|---|---|---|---|
| 0 | 순수 자바스크립트 시제품 | ✅ 완료 (v13) | `_to_delete/legacy/` (원본 보관) |
| 1 | 문서 정리 (OpenSpec) | ✅ 완료 | `docs/`, `openspec/` |
| 2 | React로 옮기기 | ✅ 코드 완료 · ⏳ 미미 확인·archive | `npm run dev`로 PC에서 동작 · 변경 `migrate-to-react`, `refine-screens`, `add-interests`, `rename-app` |
| 2.5 | 실제 지도 | 🔄 **구글 → 카카오 지도로 바꿈** · 내 위치까지 됨, 친구 실제 위치는 아직 | 카카오 지도 + "내 위치로" 버튼 · 변경 `add-google-map`(이름은 그대로) |
| 3 | 폰 앱 껍데기 (Capacitor) | ❌ 시작 안 함 | `android/`, `ios/` · 변경 `add-mobile-apps` |
| 4 | 진짜 서버 (Firebase) | 🔄 코드 완료 · **새 프로젝트 `ururu-6164b` 연결(10-21)** · 두 사람 확인 남음 | 실제 사용자끼리 좋아요·친구·채팅·스토리 · 변경 `add-real-server` |
| 4.5 | 안전 장치 | 🔄 차단·신고·대화 규칙·제재·운영자 사이트 됨 · 동의 칸·정책 웹 주소 남음 | 변경 `add-safety-basics` |
| 5 | 빌드 대상 나누기 + 출시 | 🔄 웹·토스 빌드 됨 · 안드로이드 빌드·토스 실기기 확인 남음 | 변경 `add-build-targets` |
| 6 | 그 다음 | 📋 나중 | 푸시 알림, 통화, 음성 메시지, 앱 지워도 가입 유지 |

---

## 구현 현황 (2026-10-21, 코드 기준)

> 체크 표시(`tasks.md`)보다 **실제 코드**를 기준으로 적었어요. `tasks.md`는 미미 확인 뒤 한꺼번에 체크하고 archive해요.
> 이 표가 바뀌면 여기만 고쳐요 (새 현황 문서를 만들지 않기, CLAUDE.md 1번).

### 1. 아키텍처

구조·층·의존·서버·로그인·빌드 대상 그림은 **[`architecture.md`](architecture.md)** 한 곳에 있어요. 계획과 달라진 점(카카오 지도, 무료 모드, 설치 안 된 패키지)은 그 문서 9번.

### 2. 된 것

| 영역 | 된 것 | 어디 |
|---|---|---|
| 화면 틀 | React 전환, 탭 5개(토스 3개), 덮개 창, 알림 배너, 주제별 다시 그리기(친구 많아도 빠르게) | `ui/app/`, `core/topics.js` |
| 가입·로그인 | 구글 · 페이스북 · 익명(시험용) 로그인 → 가입(아이디·닉네임·생년월일·**국가·지역**, 만 19세 이상) → 홈, 회원탈퇴 | `start/SignupScreen.jsx`, `data/login/`, `platform/region.js`, `core/countries.js` |
| 언어 | 한국어/영어 전환 (글자는 `core/i18n/ko.js`·`en.js`), 가입 화면·나 탭 단추 | `ui/common/LanguageSwitch.jsx` |
| 홈 지도 | 카카오 지도, "내 위치로" 버튼, 위치 공유 켠 친구만 핀 | `screens/home/` |
| 채팅 | 친구끼리 1:1 글자 메시지, 입력 중, 두 번 눌러 저장, 24시간 뒤 안 보임, 대화 규칙 가리기 | `overlays/chat/`, `data/MessageFilter.js` |
| 스토리 | 사진·글 스토리, 테두리 24시간, 좋아요, 삭제 | `StoryViewer`, `me/StoryEditor` |
| 프로필 | 사진 10장, 닉네임, 관심사 5개, 국가·지역 표시 | `overlays/profile/`, `me/` |
| 스와이프 | 실제 가입자만, 1시간에 10명, 넘긴 사람은 1시간마다 랜덤으로 다시, 탈퇴한 사람 안 보임 | `screens/swipe/`, `data/SwipeLimit.js` |
| 친구 | 아이디로 찾기, 받은 좋아요 수락·거절, 친구 삭제 | `screens/friends/`, `actions/FriendActions.js` |
| 안전 | 신고(이유 + 자세한 내용 500자 + 사진 1장), 차단·차단 풀기, 경고 → 7일 → 영구정지, 정지 화면, 정책 4종 앱 안에서 보기 | `SafetyActions`, `ReportDialog`, `BanScreen`, `docs/policy/` |
| 운영자 사이트 | 앱과 따로(주소·로그인), 아이디 12자리 로그인·처음 등록(성명·닉네임·생년월일·이메일), 신고 목록(최신순·첨부·양쪽 정보), 처리 완료·경고·정지·영구정지·풀기, 처리자 "성명 · 아이디 일부" 기록, 회원 목록·검색·삭제(총관리자)·삭제 기록, 아이디 발급 | `src/admin/`, `admin.html`, `docs/guides/admin-guide.md` |
| 서버 | `RealServer`(Firebase), 보안 규칙(친구만 메시지·스토리, 운영자 권한), 오프라인·실패 배너, 사용자 이메일을 비공개 문서에 | `data/server/`, `firestore.rules` |
| 빌드 | 웹(`dist/`), 한 장(`dist/moyeo.html`), 토스(`dist-toss/`, `ururu.ait`), 운영자(`dist-admin/`), 기능 스위치 | `vite.config.js`, `platform/features.js` |
| 시험 | 82개 (`data` 51 · `ui` 15 · `actions` 9 · `server` 7) | `tests/` |
| 배포 | 새 Firebase `ururu-6164b`에 사용자 앱 올림 (2026-10-21) | `.env`, `.firebaserc` |

### 3. 아직 안 된 것 (흉내만 있거나 없음)

| 기능 | 지금 | 해야 할 것 |
|---|---|---|
| 친구 실제 위치 | 지도에 내 위치만 진짜, 친구 핀 위치는 그림 | `locations/{uid}` 쓰기·친구만 읽기(규칙은 있음), 위치 동의 창 |
| 소리 울리기 받기 | 보내기만 서버에 기록 | 받는 쪽 구독 + 알림 (푸시는 Phase 6) |
| 음성 메시지 | 녹음 흉내(시간만), 들을 수 없음 | 마이크 녹음 → 저장(Storage는 Blaze 필요) → 재생 |
| 전화·영상통화 | 화면만 (`CallScreen.jsx`) | WebRTC 등 (Phase 6) |
| 채팅 사진 | 일부러 끔 (`canSendPhoto: false`) | 정책 정해지면 켜기 |
| 운영자 2단계 승인 | 설계만 (`docs/guides/admin-roles.md`, B안) | 신청 → 총관리자 승인 → 최종관리자 승인, `config/root`, 구글 첫 설정 없애기 |
| 신고 알림 메일 | 없음 (무료 모드) | Blaze 때 서버 함수 |
| 24시간 뒤 메시지 실제 삭제 | 화면에서만 안 보임 | `cleanup` 서버 함수 (Blaze) |
| 폰 앱 | 없음 | Capacitor `android/`, 안드로이드 구글 로그인, SHA-1 |

### 4. 남은 일 (순서대로)

**A. 새 Firebase 연결 마무리 (지금)**
1. 콘솔: Firestore 데이터베이스 만들기(서울, 프로덕션) → `npx firebase deploy --only firestore`
2. 콘솔: Authentication 로그인 방법에 **이메일/비밀번호** 켜기 (운영자 사이트)
3. 운영자 사이트 주소: `ururu-admin`은 다른 프로젝트가 써서 못 씀 → 새 이름으로 `npx firebase hosting:sites:create <이름>` → `.firebaserc` 12줄 → 승인된 도메인 → `npm run deploy:admin`
4. 페이스북 개발자: 리디렉션 URI `https://ururu-6164b.firebaseapp.com/__/auth/handler`
5. 카카오: JavaScript SDK 도메인에 `http://localhost:5173` 추가 (지금 5175만)
6. 브라우저 두 개로 확인: 가입·좋아요·친구·채팅·스토리·신고·탈퇴 (`add-real-server` 3.1~4.6, `firebase-setup-guide.md` 5-1)
7. 다 되면 옛 프로젝트 `ururu-eb3db` 삭제 (itsjinmi 계정)

**B. 운영자**
1. 첫 총관리자 아이디 만들기 (지금 방식: 구글 첫 설정 `unidevpeer@gmail.com`)
2. B안 2단계 승인 구현 (`admin-roles.md` 7번)

**C. 출시 전 필수 (앱인토스·구글 플레이 공통)**
1. 가입 화면 약관 동의 칸 (SAFE-10~11), 위치 동의 창 (SAFE-20~21)
2. 정책 웹 주소: `docs/policy/*.md` → Hosting (`build:policy`, compliance.md 6장)
3. 앱 밖 탈퇴 안내(문의 이메일) 웹 페이지 (SAFE-12)
4. 위치기반서비스사업 신고 확인 (방송통신위원회)
5. 앱인토스: 채널톡 문의(익명 키 로그인 가능 여부) → `ururu.ait` 업로드 → 토스 앱 QR 확인
6. 문의 이메일 정하기: 정책은 `unidevpeer@gmail.com`, 스토어 README·progress는 아직 `itsjinmi@gmail.com`

**D. 기능 채우기**
1. 친구 실제 위치 공유 (위 3번 표)
2. 소리 울리기 받기
3. 개발 서버 포트 고정 (`vite.config.js` `server.port 5173, strictPort`) — 카카오 도메인이 매번 맞게

**E. 구글 플레이**
1. `add-mobile-apps`: Capacitor 설치, `android/`, 뒤로 버튼, 안전 영역
2. `build:android` → `.aab`, Firebase에 안드로이드 앱 + SHA-1, 안드로이드 구글 로그인 (`add-build-targets` 2.2)

**F. 문서 정리**
1. ~~`tech-stack.md`: 구글 지도 → 카카오, 설치 안 된 패키지 표시~~ → 2026-10-21 `architecture.md` 만들며 반영. Phase 2.5·3 설명 글 속 구글 지도 문장은 그 변경을 시작할 때 고치기
2. `progress.md`: 10-16~21 작업(카카오 지도, 국가·지역, i18n, 운영자 사이트, 새 Firebase) 추가
3. `tasks.md` 체크 → `npm run spec:check` → archive (`migrate-to-react` → `refine-screens` → `add-interests` → `rename-app`)
4. 안내 글 속 옛 주소 `ururu-eb3db` (`vite.config.js` 31줄, `admin-guide.md`)

**G. 나중 (Phase 6)**: 푸시 알림, 음성 메시지·통화, 앱 지워도 가입 유지, Blaze 전환(서버 함수: 24시간 삭제·신고 메일·로그인 계정 삭제), iOS

---

## Phase 0 — 순수 자바스크립트 시제품 ✅

모든 기능이 브라우저에서 돌아가는 시제품. 서버·GPS·지도·통화는 흉내.
기능 목록은 `openspec/specs/<기능>/spec.md`에 요구사항과 시나리오로 옮겨 적었어요.

> **순서 변경 (2026-10-13, 미미 결정)**: 앱인토스를 먼저 내요. 그래서 Phase 5의 "빌드 대상·기능 스위치"(`src/platform/target.js`, `features.js`, `npm run build:toss`)를 Phase 2와 함께 앞당겨 만들었어요. 나머지 Phase 5 일(토스 로그인, `.ait` 묶기)은 서버(Phase 4)가 필요해서 그대로예요.

## Phase 1 — 문서 정리 ✅

- [x] `docs/`: `mission.md`, `tech-stack.md`, `roadmap.md`, `coding-rules.md`, `code-structure-and-patterns.md`, `file-tree.md`
- [x] `openspec/specs/`: 기능 9개, 지금 동작을 요구사항·시나리오로
- [x] `openspec/changes/`: `migrate-to-react`, `add-google-map`, `add-mobile-apps`, `add-real-server`, `add-safety-basics`, `add-build-targets`
- [x] `openspec validate --all --strict` 통과
- [x] 미미 확인 (이 문서들을 보고 "이대로 가자") — 2026-10-13

## Phase 2 — React로 옮기기

**목표**: 겉으로 보기에 아무것도 바뀌지 않는 것. 바뀌는 건 속(그리는 방법)뿐이에요.

| 순서 | 할 일 | 기능 폴더 |
|---|---|---|
| 2-1 | 원본 보관(`legacy/`), Vite + React 뼈대, `core/`·`data/` 그대로 옮기기, 시험 붙이기 | 모든 폴더의 tasks 1번 |
| 2-2 | 공통 틀: App, 하단 탭, 알림 배너, 덮개 창 관리 | `app-shell` |
| 2-3 | 로고 → 가입 → 홈 흐름, 회원탈퇴 | `account` |
| 2-4 | 홈 지도 | `home-map` |
| 2-5 | 채팅 목록, 채팅방 | `chat` |
| 2-6 | 스토리 테두리, 보기, 만들기 | `story` |
| 2-7 | 프로필 보기, 사진 10장, 닉네임 | `profile` |
| 2-8 | 스와이프 | `swipe` |
| 2-9 | 친구 탭 | `friends` |
| 2-10 | 소리 울리기, 권한 창 | `ping` |
| 2-11 | 전체 비교 시험 통과 → `legacy/` 지우기 여부 미미에게 확인 → 2026-10-15 중복 정리로 `_to_delete/legacy/`로 옮김 (미미가 확인 뒤 지움) | — |

화면 하나를 옮길 때마다 원본과 사진을 나란히 비교하고, 그 기능 spec의 시나리오를 전부 체크해요. 하나라도 다르면 다음 화면으로 넘어가지 않아요. 자세한 순서는 `openspec/changes/migrate-to-react/tasks.md`예요.

## Phase 2.5 — 실제 지도 준비

자세한 순서는 `openspec/changes/add-google-map/tasks.md`예요.

- 전 세계 사용자를 위해 **구글 지도 웹용(Maps JavaScript API)**을 써요. 앱도 웹 화면이라 안드로이드·iOS·PC가 같은 코드예요.
- `.env`에 `VITE_GOOGLE_MAPS_API_KEY` 한 줄만 넣으면 실제 지도 + 내 실제 위치. 없으면 지금 그림 지도.
- 지도를 못 불러오면 그림 지도로 넘어가고 배너로 알려줘요 (Result 패턴).
- 친구의 **실제** 위치는 서버가 필요해서 Phase 4. 그 전까지 시연 친구는 내 실제 위치 근처에 놓여요.
- 한국: 2026년 2월 정부가 구글의 정밀 지도 데이터 반출을 조건부로 허가해서 점점 자세해질 예정이에요.

## Phase 3 — 폰 앱 껍데기 (Capacitor)

자세한 순서는 `openspec/changes/add-mobile-apps/tasks.md`예요.

| 순서 | 할 일 | 왜 필요한가 |
|---|---|---|
| 3-1 | Capacitor 설치, `android/` · `ios/` 만들기 | 폰 앱 프로젝트 |
| 3-2 | 글꼴을 앱 안에 넣기 | 인터넷이 없어도 같은 글꼴 |
| 3-3 | 안전 영역(노치, 홈 바) 피하기 | 폰에서 위·아래가 가려지지 않게. PC는 0이라 그대로 |
| 3-4 | 안드로이드 "뒤로" 버튼 = 맨 위 창 닫기 (창이 없으면 앱 나가기) | 안드로이드 사용자가 당연히 기대하는 동작 |
| 3-5 | 가입 정보를 폰 저장소(Preferences)에 저장 | iOS는 브라우저 저장소를 지울 때가 있어서 "회원탈퇴 전까지 유지"가 깨질 수 있음 |
| 3-6 | 앱 이름 "우르르", 앱 아이콘 자리, 세로 화면 고정 | |
| 3-7 | 빌드 방법을 `tech-stack.md` 9번에 맞게 확인 | |

> 3-3, 3-4, 3-5는 **원본에 없던 것을 더하는 것**이에요. 원래 동작을 바꾸지 않고, 폰에서만 필요한 부분을 채워요.

## Phase 4 — 진짜 서버 (Firebase)

자세한 순서는 `openspec/changes/add-real-server/tasks.md`예요.

- `RealServer extends ChatServer`를 Firebase와 연결. 화면 코드는 거의 그대로 (DIP).
- `.env`에 Firebase 설정이 있으면 진짜 서버, 없으면 지금 시연 모드.
- 친구만 정확한 위치·메시지를 읽을 수 있게 **서버 보안 규칙**으로 막아요. 모르는 사람은 대략의 거리만.
- 24시간 삭제, 회원탈퇴는 서버 함수로 (Blaze 종량제 요금제 필요).

## Phase 4.5 — 안전 장치 (두 스토어 공통)

자세한 순서는 `openspec/changes/add-safety-basics/tasks.md`예요. 구글 플레이와 앱인토스가 **둘 다** 요구하는 것: 차단, 약관 동의, 신고 처리 절차, 위치 동의. 구글 플레이는 **웹 회원탈퇴 링크**도.

## Phase 5 — 빌드 대상 나누기 + 출시

자세한 순서는 `openspec/changes/add-build-targets/tasks.md`예요.

| | 앱인토스 | 구글 플레이 |
|---|---|---|
| 명령 | `npm run build:toss` → `moyeo.ait` | `npm run build:android` → `.aab` |
| 기능 | **친구 채팅만** (스와이프·모르는 사람 표시 없음 → "만남·소개팅" 분류를 피해서 법인 없이 가능) | 전체 |
| 로그인 | 토스 자동 로그인 (처음 한 번 동의, 사업자 등록 필요) | 구글·이메일 계정 연동 |
| 나이 | 19세 이상 | 18세 이상 (권장, 미미 확인 필요) |
| 안내 | `docs/guides/apps-in-toss-release-guide.md` | `docs/guides/google-play-release-guide.md` |

> ⚠️ 한국에서 친구에게 위치를 보여주는 서비스는 「위치정보법」상 **위치기반서비스사업 신고**(방송통신위원회) 대상일 수 있어요. 출시 전에 꼭 확인하세요.

## Phase 6 — 그 다음 (나중)

1. 앱을 지웠다 깔아도 가입 유지 (키체인 / Block Store) → 아래 표
2. 푸시 알림 + Apple "중요 알림" 사용 신청 (거절되면 시간 민감 알림) → 아래 표
3. 음성 메시지 실제 녹음, 음성 통화
4. 스와이프 남은 수를 서버에 저장
5. 알림음 · 거품 소리 파일 (`SOUND_FILES`)
6. iOS 앱스토어 출시
7. TypeScript 검토

이 일들은 시작할 때 `openspec/changes/`에 변경 폴더로 하나씩 만들어요 (`/opsx:propose`).

### 앱을 지웠다 깔아도 가입 유지

앱을 지우면 폰 안의 저장 내용도 지워져요. 그래서 계정은 **서버**에 두고, 폰에는 "누구인지" 열쇠만 안전한 곳에 둬요.

| 할 일 | iPhone | Android |
|---|---|---|
| 계정 | 서버 (아이디, 닉네임, 생년월일, 사진) | 서버 |
| 로그인 열쇠 | 키체인 (지금 iOS는 앱을 지워도 남음. 공식 약속은 아니라 다시 로그인 화면도 필요) | Google Block Store |
| 열쇠가 없을 때 | 아이디 + 비밀번호 또는 Apple 로그인 | 아이디 + 비밀번호 또는 Google 로그인 |
| 회원탈퇴 | 서버 계정 + 키체인 열쇠 삭제 | 서버 계정 + Block Store 열쇠 삭제 |

코드에서는 `ProfileRepository`(저장 방법)만 바꾸면 되고 화면은 그대로예요 (Repository 패턴).

### 무음에서도 소리 울리기 (진짜 권한)

| 단계 | iPhone | Android |
|---|---|---|
| 1. 개발자 | Apple에 "중요 알림(Critical Alerts)" 사용 신청 → 승인 필요 (건강·안전 앱 위주) | 신청 필요 없음 |
| 2. 사용자 | 승인된 앱만 권한 창을 띄울 수 있음. 거절하면 폰 설정에서 | 알림 허용, 방해 금지까지 뚫으려면 설정에서 |
| 승인이 안 나면 | "시간 민감 알림"(집중 모드는 뚫지만 무음 스위치는 못 뚫음) + 진동 | — |

[허용]을 누르면 폰의 시스템 권한 창을, [설정 열기]를 누르면 폰의 앱 설정 화면을 열도록 `src/platform/notifications.js`를 더해요. 화면은 그대로예요.

---

## 공통 완료 기준 (DoD — Definition of Done)

모든 변경 `tasks.md`의 칸은 아래를 **전부** 만족해야 체크해요.

| # | 기준 | 확인 방법 |
|---|---|---|
| 1 | 그 기능 spec의 시나리오가 전부 원본과 같다 | 손으로 눌러보기 + `npm run compare` |
| 2 | 원본과 화면 사진이 같다 (시간·위치처럼 매번 바뀌는 부분은 가리고 비교) | `npm run compare` |
| 3 | `npm run test` 통과 | Vitest |
| 4 | 브라우저 콘솔에 빨간 오류가 없다 | 개발자 도구 |
| 5 | PC 크롬 + 폰 크기(390 × 844) 둘 다 확인 | `npm run compare`가 두 크기로 찍음 |
| 6 | [`coding-rules.md`](coding-rules.md) 6번 체크리스트 통과 | 아래 표 |

### 코드 작성 지침 체크리스트 (Phase마다 다시 채움)

| 항목 | Phase 0 결과 | Phase 2 결과 |
|---|---|---|
| 잘 돌아가나? | 브라우저 자동 시험으로 모든 기능 확인 | |
| 복붙 코드 없나? | `views.js`, `AccountService.save`, `AudioEngine`으로 모음 | |
| 클래스마다 역할 하나? | App 900줄을 30여 개 파일로 나눔 | |
| 이름만 보고 뜻이 보이나? | `isFriend`, `hasLikedMe`, `canAddMore` | |
| 실패할 수 있는 작업은 Result? | 입력 검사, 아이디, 사진, 가입 정보, 좋아요, 소리 울리기 | |
| 주석 + K&R? | 파일마다 맨 위 "하는 일", 중간에 "왜" | |
| 안 쓰는 코드·디버그 로그? | `console.log` 없음 | |
