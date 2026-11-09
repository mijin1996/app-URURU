# 진행 상황 (2026-11-09)

## 지금 상태

- 사용자 앱 · 운영자 사이트 코드 완성, 진짜 서버(Firebase `ururu-6164b`)에 연결됨. `.env`가 없으면 가짜 서버(시연)로 열려요.
- 배포: GitHub `master` push → Cloudflare Pages (app-ururu.pages.dev · ururu-admin.pages.dev).
- 출시 목표: 구글 플레이. 안드로이드 빌드(Capacitor)는 아직 시작 전.
- 요금제: Firebase 무료(Spark) 모드 (`VITE_SERVER_FUNCTIONS=false`) — 서버 함수 · TTL 없이 동작하게 맞춰 둠.

## 된 것

| 영역 | 내용 |
|---|---|
| 화면 틀 | React 19, 하단 탭 5개(홈 · 채팅 · 스와이프 · 친구 · 나), 덮개 창, 알림 배너, 주제별 다시 그리기 |
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
