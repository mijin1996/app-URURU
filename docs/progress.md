# 진행 상황 (2026-11-13)

## 지금 상태

- 사용자 앱 · 운영자 사이트 코드 완성, 진짜 서버(Firebase `ururu-6164b`)에 연결됨. `.env`가 없으면 가짜 서버(시연)로 열려요.
- 배포: GitHub `master` push → Cloudflare Pages (app-ururu.pages.dev · ururu-admin.pages.dev).
- 출시 목표: 구글 플레이. 안드로이드 빌드(Capacitor)는 아직 시작 전.
- 요금제: Firebase 무료(Spark) 모드 (`VITE_SERVER_FUNCTIONS=false`) — 서버 함수 · TTL 없이 동작하게 맞춰 둠.

## 된 것

| 영역 | 내용 |
|---|---|
| 화면 틀 | React 19, 하단 탭 5개(홈 · 채팅 · 스와이프 · 친구 · 나, 아이콘만), 위 밝기 버튼(밝게 · 어둡게), 덮개 창, 알림 배너, 주제별 다시 그리기 |
| 가입 · 로그인 | 구글 로그인 → 가입(아이디 · 닉네임 · 생년월일 · 국가, 만 19세 이상), 로그아웃, 회원탈퇴 |
| 언어 | 한국어 / 영어 |
| 홈 지도 | 코드는 있지만 **꺼 둠** (2026-11-09, `features.js` `canShareLocation: false`) — 탭 · 위치 공유 설정 모두 안 보임 |
| 채팅 | 친구끼리 1:1 글자 메시지, 입력 중, 두 번 눌러 저장, 24시간 뒤 사라짐, 개인정보 · 도박 · 욕설 가리기 |
| 프로필 | 사진 10장 (올릴 때 사진에 글 쓰기: 폰트 크기 · 색 · 배경 · 테두리 · 기울임), 관심사 5개 |
| 스와이프 · 친구 | 10분에 10명, 아이디로 친구 찾기, 받은 좋아요 수락 · 거절, 친구 삭제 |
| 소리 울리기 | 코드는 있지만 **꺼 둠** (2026-11-09, `features.js` `canRing: false`) |
| 안전 | 신고(이유 · 500자 · 사진 1장 · 길게 눌러 메시지 신고), 차단, 경고 → 7일 → 영구정지, 정지 화면, 정책 문서 앱 안에서 보기 |
| 운영자 사이트 | 총관리자 → 운영자 2단계. 아이디 12자리 발급 → 처음 등록 → 닉네임 + 성명 로그인, 신고 처리, 회원 목록 · 검색 · 삭제(운영자 모두), 운영자 관리(총관리자) |
| 서버 | `RealServer`, `firestore.rules` · `storage.rules`, 오프라인 · 실패 배너, 구독 수 고정 |
| 빌드 · 배포 | `dist/`, 한 장 `dist/ururu.html`(항상 가짜 서버), `dist-admin/`, GitHub Actions → Cloudflare Pages |
| 스토어 자료 | 플레이 등록 글 · 아이콘 · 그래픽 · 스크린샷 6장 (`UploadPlatform/google-play/`) |

## 2026-11-13 디자인

- **글꼴을 레벨업으로**: 하다 타입 레벨업(SIL OFL 1.1)을 `styles/fonts/LevelUp/`에 넣고 `base.css` `@font-face` + `--display` · `--body`를 레벨업으로. 굵기는 Regular(500 이하) · Bold(600 이상) 두 개, 없는 글자만 Noto Sans KR. 운영자 사이트(`admin.css`)는 그대로.
- **하단 탭 글자 삭제**: 채팅 · 스와이프 · 친구 · 나 글자를 지우고 아이콘 + 지금 탭 점만 (`NavBar.jsx`). 이름은 `aria-label`로만 남김.
- **어두운 화면 + 밝기 버튼**: 화면 맨 위 오른쪽에 해/달 아이콘 버튼(`ThemeButton.jsx`, `.topbar`). 밝게 ↔ 어둡게 2가지, 처음엔 폰 설정을 따르고 바꾸면 `ururu.theme`에 기억(`data/ThemeStore.js`, `MeActions.toggleTheme`). 색은 원래 있던 `base.css` `[data-theme='dark']`. `lightThemeOnly` 빌드는 버튼 없이 늘 밝게.
- 로고 화면은 앱 이름(로고)만 ("너와 나 함께" 글 삭제, `app.tagline` 글자도 삭제), 1.6초 → 1.2초 뒤 바로 로그인 · 가입 화면. 가입 화면 오른쪽 위에도 밝기 버튼(언어 바 왼쪽).
- 나 탭 정책 상자에 [출처] → 출처 창(`CreditsSheet.jsx`): 레벨업 · Noto Sans KR · React · Firebase(지도를 켠 빌드는 카카오 지도도). 표는 `core/credits.js` 한 곳, 시험 2개.
- 가입 화면은 언제나 네 칸부터 (예전 "이 기기에서 가입한 적 있으면 로고 + 구글 버튼만" 없앰). 이미 가입한 사람은 칸을 비운 채 구글을 누르면 바로 시작. 밝기 버튼은 동그라미 테두리 · 바탕 없이 아이콘만.
- 어두운 화면에서 채팅방이 목록과 구분되게: 채팅방 바탕 `--chat-bg` · 받은 말풍선 · 입력 칸 `--bubble-them`을 조금 밝게 (밝은 화면은 그대로).
- 아이콘 `sun` · `moon` 추가, 글자 `app.theme`(화면 읽기용), 시험 `ThemeStore` 3개 (`tests/data.test.js`).
- **PC 넓은 화면 배치** (폭 900px 이상, CLAUDE.md 4번도 바꿈): 하단 탭 → 왼쪽 세로 탭(밝기 버튼은 그 아래), 채팅 탭은 목록 | 대화방 2단(`#chat` 창이 오른쪽 칸), 나 탭 상자 2단(화면 폭을 채움), 스와이프 카드 · 상대 프로필 · 전화는 높이를 다 쓰는 4:5 비율로 같은 크기, 아래 창은 가운데 폰 폭, 알림 배너는 오른쪽 위. 로고 · 가입 · 이용정지(탭이 없을 때)는 PC에서도 가운데 폰 틀. CSS는 `base.css` 맨 아래 `@media (min-width: 900px)` 한 곳(`:has(.nav > button)`), 칸 너비 변수 `--rail` · `--list` · `--content-max` · `--panel-max`. `App.jsx` 화면에 `tab-<탭>` 클래스, `createNav`: PC에서 탭을 옮기면 대화방 · 프로필 · 친구 목록 창을 닫고, 대화방을 열면 채팅 탭으로 (`config.js` `WIDE_SCREEN_QUERY`).

## 2026-11-09 정리

- 자잘한 md 삭제: `openspec/`(명세 · 변경 기록), `.claude/` openspec 명령, `docs/` 하위 문서(how-to · reference · tutorials · admin-roles). `docs/`는 이 문서 · `architecture.md` · `todo.md` 3개만.
- 정책 문서는 앱이 읽는 파일이라 `docs/policy/` → `src/policy/`로 옮김 (`PolicyText.jsx`, 시험 경로 맞춤).
- 등급을 **총관리자 → 운영자 → 이용자**로 확정. 설계만 있던 "최종관리자 · 2단계 승인"(admin-roles B안)은 하지 않음.
- 안 쓰는 코드 삭제: `dom.js`의 `$$` · `esc`, `time.js`의 `messageLeftText` + 글자 2개(`story.minutesLeft` · `hoursLeft`), CSS `.ad-btn.big` · `.ad-gate` · `.pvinfo .loc` · `.swcount`, 파일 안에서만 쓰는 함수의 `export`.
- `package.json`에서 `spec:check` 명령과 `@fission-ai/openspec` 제거 (`package-lock.json`도 같이 정리).
- 주석 맞춤: 회원 삭제는 운영자 모두 (코드 · 규칙은 이미 그랬고 주석만 "총관리자만"으로 남아 있었음).
- 관심사 태그 기울임 글자 (지도 핀 이름표는 그대로).
- **스토리 기능 전체 삭제**: 나 탭 My story, 채팅 탭 스토리 줄, 스토리 보기, 테두리, 스토리 좋아요(친구 탭 · 알림), StoryStore, 서버 코드(Real/FakeServer · `firestore.rules` · `storage.rules` · 색인 · 서버 함수 `fanOutStory` · 정리), 시험, 정책 문서의 스토리 문구.
- 스토리의 글 꾸미기(글 · 폰트 크기 · 색 · 배경 · 테두리 · 기울임)는 **My photos 사진 올리기**로 옮김: 사진을 고르면 편집기(`PhotoEditor.jsx`)가 사진마다 열리고, 쓴 글은 사진에 그려서(`drawPhotoText.js`) 올려요.
- **지도 끔**: `canShareLocation: false` → 홈 지도 탭 · 나 탭 위치 공유 설정이 안 보이고 앱은 채팅 탭부터 시작. 지도를 누르면 열리던 내 핀/친구 핀은 이제 프로필을 열어요.
- 올린 사진을 누르면 다시 편집: 원본 + 그때 쓴 글 모양으로 열려요. 원본 · 글 모양은 비공개 문서 `users/{uid}/private/photoEdits`에 남겨서 다른 기기에서도 다시 고칠 수 있어요.
- My photos 제목 줄 오른쪽 확장 아이콘 → 내 전체 화면 프로필 미리보기. 사진 지우기 X는 바탕 없는 빨간 X.
- 모든 탭 화면 위쪽에 여유 24px (+ 폰 노치 영역).
- **소리 울리기 숨김**: `features.js` `canRing: false` → 나 탭 "무음에서도 소리 받기" 줄, 친구 프로필 [울리기] 버튼, 가입 직후 묻는 창이 안 보여요. 웹앱은 무음을 뚫고 울릴 수 없고 받는 쪽 코드도 없어서. 코드(`PingService` · `PingPermission.jsx`)는 그대로 남김.
