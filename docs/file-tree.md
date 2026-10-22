# file-tree.md — 프로젝트 전체 파일 트리

> 프로젝트 폴더 안의 **모든 파일과 폴더**를 한 트리에 한 줄 설명으로 모았어요. 코드, 문서(docs), 기능 명세(openspec), 시험, 도구가 전부 여기 있어요.
> 파일을 더하거나 지우면 **같은 작업 안에서** 이 트리도 고쳐요.
>
> - 파일마다 자세한 설명(하는 일, 담당 기능, 구현 방법, 쓴 패턴): [`code-structure-and-patterns.md`](code-structure-and-patterns.md)
> - OpenSpec 문서 쓰는 법(spec, 변경 폴더): [`code-structure-and-patterns.md`](code-structure-and-patterns.md) 8번
>
> **표시**
> - `⏳ 변경이름`: 아직 없고, 그 변경(`openspec/changes/<변경이름>/`)을 할 때 생기는 파일
> - `(만들어짐)`: 명령을 실행하면 생기는 결과물이라 git에 올리지 않는 폴더 (`.gitignore`)

```text
moyeo/
├─ CLAUDE.md                          # Claude가 지킬 작업 지침 (원래 파일 고치기, 화면에 설명 문구 넣지 않기 등)
├─ index.html                         # Vite 입구. <div id="app"> 하나와 src/main.jsx 연결
├─ package.json                       # npm 명령(dev, build, build:single, build:toss, build:ait, test, compare, store:images, emulators, deploy:server, spec:check)과 버전 고정
├─ vite.config.js                     # Vite 설정: React, 상대 경로, 모드별 결과 폴더, 시험(Vitest) 설정
├─ .gitignore                         # git에 안 올릴 것: node_modules, dist*, .env, *.ait, 비교 사진, functions/shared, _to_delete
├─ .env.example                       # Firebase 설정·지도 키 칸 (빈 칸만). 복사해서 .env로 → 채우면 진짜 서버, 비우면 시연 모드
├─ capacitor.config.json              # ⏳ add-mobile-apps — 앱 이름 "우르르", 앱 id, 웹 폴더(dist)
├─ apps-in-toss.config.ts             # 앱인토스 설정 (SDK 3.x): appName ururu, 대표 색, 권한 없음, 묶을 폴더 dist-toss
├─ firebase.json                      # Firebase 설정: 규칙 파일, 서버 함수 폴더, 에뮬레이터 포트 (add-real-server)
├─ firestore.rules                    # 서버 데이터 보안 규칙: 친구만 대화·스토리, 좋아요 받은 사람만 친구 맺기, 신고한 사이 차단
├─ firestore.indexes.json             # 24시간 정리에 쓰는 색인 (메시지 시각, 스토리 좋아요)
├─ storage.rules                      # 사진 저장소 보안 규칙: 내 사진은 나만, 대화 사진은 두 친구만
├─ ururu.ait                          # (만들어짐) npm run build:ait 결과 — 앱인토스 콘솔에 올리는 파일
│
├─ store/                             # 스토어 등록용 글·그림 (대상마다 폴더 하나, 이미지는 npm run store:images로 덮어씀)
│  ├─ apps-in-toss/
│  │  ├─ README.md                    # 콘솔에 넣을 것: 이름·부제·설명·카테고리·이메일, 채널톡 제출 문서 목록
│  │  └─ images/                      # logo-600.png, screenshot-1~4.png(636×1048), screenshot-landscape.png(1504×741) — 토스 빌드 화면
│  └─ google-play/
│     ├─ README.md                    # 지금 상태(AAB 아직), 등록정보·짧은/자세한 설명, 앱 콘텐츠 설문, 데이터 보안 초안
│     └─ images/                      # icon-512.png, feature-graphic.jpg(1024×500), phone-1~6.jpg(1080×1920) — 전체 기능 빌드 화면
│
├─ docs/                              # 프로젝트 문서
│  ├─ mission.md                      # [기본 원칙 1] 왜 만드나, 누구를 위한 앱인가, 하지 않는 것
│  ├─ architecture.md                 # 구조·층·의존 방향·MVC·서버(무료/서버 함수 모드)·컬렉션·로그인·빌드 대상·운영자 사이트·패턴 (코드 고치기 전에 먼저, 2026-10-21)
│  ├─ tech-stack.md                   # [기본 원칙 2] 버전 고정, 금지 기술, 문법, 크기 규칙, 실행·빌드 방법 (구조는 architecture.md)
│  ├─ roadmap.md                      # [기본 원칙 3] Phase 단위 일정, "구현 현황"(된 것·안 된 것·남은 일), 공통 완료 기준
│  ├─ coding-rules.md                 # [기본 원칙 4] 코드 작성 지침 (원문 그대로)
│  ├─ code-structure-and-patterns.md  # 파일마다 하는 일·기능·구현 방법·패턴 + OpenSpec 문서 쓰는 법
│  ├─ file-tree.md                    # 지금 이 문서: 프로젝트 전체 파일 트리
│  ├─ progress.md                     # 진행 상황과 이어서 할 일 (다른 Claude에게 넘길 때 먼저 읽기)
│  ├─ guides/                         # 따라 하는 안내
│  │  ├─ google-maps-api-key-guide.md          # 구글 지도 API 키 받기
│  │  ├─ google-play-console-release-guide.md  # 구글 플레이 콘솔에 올리기
│  │  ├─ apps-in-toss-release-guide.md         # 앱인토스(토스 미니앱)에 올리기
│  │  ├─ firebase-setup-guide.md               # Firebase 프로젝트 만들기, .env 넣기, 요금제·예산 알림, 규칙·함수 올리기, 토스 인증서
│  │  └─ launch-checklist.md                   # 순서표: 내 PC 준비 → 실제 데이터(Firebase) → 앱인토스 → 구글 플레이 (누가 할지, 준비물)
│  └─ policy/                         # 약관·정책 원본. 앱의 나 탭 "정책"이 이 .md를 그대로 읽어 보여줘요 (채널톡 제출용)
│     ├─ chat-rules.md                # 채팅 이용 수칙 안내 (미미가 준 글) — 첫 대화 채팅방 맨 위, 나 탭 정책
│     └─ terms.md                     # 이용약관 (금지 행동, 신고·차단, 경고 → 7일 정지 → 영구정지)
│                                     # 정책 문서는 이 두 개만 (privacy·report-handling·compliance는 _to_delete/policy/, 2026-10-20)
│
├─ openspec/                          # OpenSpec: "지금 앱이 하는 일"(specs)과 "바꾸려는 일"(changes)
│  ├─ config.yaml                     # OpenSpec 설정: 한국어, 프로젝트 요약, 꼭 읽을 문서, 꼭 지킬 규칙
│  ├─ specs/                          # 지금 앱이 하는 일 (진실의 원본). 기능마다 spec.md 하나
│  │  ├─ app-shell/spec.md            # 공통 틀: 로고, 하단 탭, 알림 배너, 덮개 창, 크기 규칙 (SHELL-)
│  │  ├─ account/spec.md              # 가입, 아이디, 가입 정보 유지, 설정, 회원탈퇴 (ACC-)
│  │  ├─ profile/spec.md              # 전체 화면 프로필, 사진 10장, 닉네임 (PRO-)
│  │  ├─ home-map/spec.md             # 홈 지도, 위치 공유, 친구 핀과 거리 (MAP-)
│  │  ├─ chat/spec.md                 # 채팅 목록, 채팅방, 24시간 메시지, 전화, 신고 (CHAT-)
│  │  ├─ story/spec.md                # 스토리 테두리, 보기, 만들기, 좋아요 (STO-)
│  │  ├─ swipe/spec.md                # 스와이프, 1시간 10명, X 1시간 숨김 (SWP-)
│  │  ├─ friends/spec.md              # 아이디 찾기, 받은 좋아요, 친구 목록 (FRD-)
│  │  └─ ping/spec.md                 # 소리 울리기와 무음 권한 (PNG-)
│  └─ changes/                        # 바꾸려는 일. 변경마다 폴더 하나 (안의 파일은 code-structure-and-patterns.md 8번)
│     ├─ migrate-to-react/            # Phase 2: 화면·동작 그대로 React로 — proposal, design, tasks (동작이 안 바뀌어 specs 없음)
│     ├─ add-google-map/              # Phase 2.5: 키만 넣으면 구글 지도 + 내 실제 위치 — proposal, design, tasks, specs/home-map
│     ├─ add-mobile-apps/             # Phase 3: Capacitor로 안드로이드·iOS 앱 — proposal, design, tasks, specs/account·app-shell·chat
│     ├─ add-real-server/             # Phase 4: Firebase로 실제 사용자끼리 — proposal, design, tasks, specs/account·sync
│     ├─ add-safety-basics/           # Phase 4.5: 차단·약관·위치 동의·신고 처리 — proposal, design, tasks, specs/account·chat·home-map
│     ├─ add-build-targets/           # Phase 5: 토스용(친구 채팅) · 구글 플레이용(전체) 빌드 — proposal, design, tasks, specs/build-targets
│     ├─ add-interests/               # 나 탭 관심사 키워드 (프로필·스와이프 카드 칩) — proposal, tasks, specs/profile
│     ├─ refine-screens/              # 화면 다듬기: 지도는 위치 공유한 친구만, 문구 줄이기, 스와이프 10명, 스토리 버튼 — proposal, tasks, specs/7개
│     ├─ rename-app/                 # 앱 이름 모여 → 우르르 (로고·탭 제목·설정 경로 글자, appName ururu) — proposal, tasks, specs/app-shell·account·ping
│     └─ archive/                     # 끝난 변경 (날짜 붙여 보관)
│        └─ 2026-10-13-remove-friend-links/   # 지도에서 나와 친구 사이 점선 지우기 — proposal, tasks, specs/app-shell·home-map
│
├─ .claude/                           # Claude Code에서 쓰는 OpenSpec 명령 (OpenSpec이 만듦)
│  ├─ commands/opsx/                  # /opsx:propose · apply · archive · explore · sync · update
│  └─ skills/                         # 위 명령이 쓰는 안내 6개 (openspec-propose, -apply-change, -archive-change, -explore, -sync-specs, -update-change)
│
├─ styles/                            # CSS 9개 — 원본 그대로 (클래스 이름 바꾸지 않기)
│  ├─ base.css                        # 색(밝은/어두운), 글꼴, 크기 규칙(--fs 등), 앱 틀, 탭바, 아바타, 스토리 테두리, 버튼, 배너, 팔레트, 달력
│  ├─ start.css                       # 로고 화면, 가입 화면, 아이디 검사 문구, 생년월일 칸
│  ├─ home.css                        # 꽉 찬 지도, 핀
│  ├─ chat.css                        # 스토리 줄, 대화 목록, 채팅방, 말풍선, 입력창, 전화 화면, 신고 창
│  ├─ swipe.css                       # 카드, 도장, X·하트 버튼, 남은 수, 다 봤을 때 안내
│  ├─ likes.css                       # 친구 탭: 검색칸, 받은 좋아요 줄, 친구 목록 버튼
│  ├─ profile.css                     # 전체 화면 프로필, 사진 넘기기, 아래 버튼
│  ├─ story.css                       # 스토리 보기, 글 스토리 글자(배경 상자), 좋아요 버튼
│  ├─ me.css                          # 나 탭: 내 정보, 사진 격자, 스토리 만들기, 색 칸, 크기 막대, 토글, 회원탈퇴
│  └─ platform.css                    # ⏳ add-mobile-apps — 폰 안전 영역(노치·홈 바) 피하기
│
├─ src/
│  ├─ main.jsx                        # 시작점(Composition Root): 부품을 모두 만들어 ctx에 담고 <App> 실행, CSS 9개 불러오기
│  │
│  ├─ core/                           # [Core] 거의 안 바뀜 — 원본 그대로
│  │  ├─ config.js                    # 정해진 숫자와 문구 (시간, 개수 제한, 색, 설정 경로)
│  │  ├─ result.js                    # Result 패턴: 성공/실패 + 실패 이유
│  │  ├─ time.js                      # "5분", "23시간 남음", 만 나이, 달마다 날짜 수, 최신순 정렬
│  │  ├─ dom.js                       # $ / $$ (요소 찾기), esc (특수문자 바꾸기), uid (고유 번호)
│  │  ├─ icons.js                     # SVG 아이콘 표 + icon(name) (크기는 모두 20px)
│  │  ├─ ChangeNotifier.js            # "데이터가 바뀌었어요" 알림판 — notify(...주제)
│  │  ├─ topics.js                    # 알림 주제 이름표: users·chats·stories·likes·me·moderation + user(id)·chat(id)
│  │  ├─ geo.js                       # ⏳ add-google-map — 위도·경도 두 점 사이 거리
│  │  └─ sound/
│  │     ├─ AudioEngine.js            # 브라우저 소리 장치 준비 + 음 하나 내기
│  │     ├─ Sound.js                  # 부모: "소리 파일 있으면 파일, 없으면 임시 소리"
│  │     ├─ NotificationSound.js      # 새 메시지 "띵-동" (끌 수 있음)
│  │     ├─ BubbleSound.js            # 소리 울리기 "뽀글뽀글"
│  │     └─ ToggleSound.js            # 토글 "톡" (켤 때 높게, 끌 때 낮게)
│  │
│  ├─ data/                           # [Data] 가끔 바뀜 — 원본 그대로 (React를 모름)
│  │  ├─ sampleData.js                # 시연용 사람·메시지·좋아요 (진짜 서버가 생기면 지움)
│  │  ├─ UserStore.js                 # 사람 정보: 나, 다른 사람, 친구, 지도에 보일 친구, 신고, 아이디 중복, 내 사진
│  │  ├─ ChatStore.js                 # 메시지: 대화, 안 읽은 수, 입력 중, 저장, 24시간 삭제
│  │  ├─ StoryStore.js                # 스토리: 24시간, 남은 비율, 봤는지, 내 좋아요
│  │  ├─ LikeStore.js                 # 좋아요: 보내기, 받기, 수락, 거절, X(1시간 숨김), 스와이프에 보여줄 사람
│  │  ├─ SwipeLimit.js                # 스와이프 1시간에 10명 세기
│  │  ├─ FriendSearch.js              # 아이디로 친구 찾기
│  │  ├─ AccountService.js            # 내 계정: 가입, 아이디 검사, 불러오기, 닉네임, 관심사, 권한, 회원탈퇴
│  │  ├─ ProfileRepository.js         # 가입 정보 저장 / 불러오기 / 지우기 (브라우저 저장소)
│  │  ├─ MessageFilter.js             # 대화 규칙 검사: 개인정보 공유·도박·욕설을 ****로 가리고 걸린 종류를 알려줌 (서버 함수도 씀 → copy-shared)
│  │  ├─ sanctionRules.js             # 제재 기준 한 곳: 위반 1회 경고 → 2회 7일 정지 → 3회 이상 영구정지 (서버 함수도 씀 → copy-shared)
│  │  ├─ ModerationStore.js           # 내 위반 횟수와 이용정지 (기준은 sanctionRules). 서버 moderation/{uid}가 정답
│  │  ├─ Validator.js                 # 입력 검사: 아이디, 닉네임, 생년월일, 관심사, 스토리 글
│  │  ├─ PingService.js               # 소리 울리기 규칙: 친구만, 30초에 한 번
│  │  ├─ imageReader.js               # 사진 파일을 화면에 쓸 수 있는 주소로 읽기
│  │  ├─ server/
│  │  │  ├─ ChatServer.js             # 부모: "서버가 꼭 해야 할 일" 약속 목록
│  │  │  ├─ FakeServer.js             # 가짜 서버: 자동 답장, 입력 중, 수락, 스토리 좋아요, 위치 이동
│  │  │  ├─ RealServer.js             # 진짜 서버 (Firebase): 로그인·가입, 실시간 구독 → Store 채우기, 쓰기 실패는 배너
│  │  │  └─ firebase/                 # RealServer가 쓰는 도구 (필요할 때만 불러옴)
│  │  │     ├─ firebaseApp.js         # Firebase 연결 (.env 설정, 오프라인 저장, 에뮬레이터)
│  │  │     ├─ paths.js               # 문서 이름 규칙 (pairId = "작은uid_큰uid") — firestore.rules와 같게
│  │  │     ├─ userMapper.js          # 서버 문서 ↔ 화면용 사람·메시지·가입 정보
│  │  │     └─ shrinkImage.js         # 올리기 전에 사진 줄이기 (1280px, JPEG)
│  │  ├─ map/                         # ⏳ add-google-map
│  │  │  ├─ MapView.js                # 약속: mount · setPins · movePin · destroy
│  │  │  ├─ DrawnMap.js               # 지금 그림 지도 (원본 SVG + % 좌표)
│  │  │  └─ GoogleMap.js              # 구글 지도 (핀은 지도 위 HTML로, 원본 핀 CSS 그대로)
│  │  ├─ location/                    # ⏳ add-google-map
│  │  │  ├─ LocationSource.js         # 약속: current() · watch(onMove)
│  │  │  ├─ FakeLocation.js           # 고정 자리
│  │  │  └─ DeviceLocation.js         # 폰 GPS / PC 브라우저 위치
│  │  ├─ storage/                     # ⏳ add-mobile-apps
│  │  │  ├─ WebStorage.js             # 브라우저 저장소
│  │  │  └─ DeviceStorage.js          # 폰 저장소 (@capacitor/preferences)
│  │  └─ login/                       # 빌드마다 다른 로그인 방법 (add-build-targets) — 서버 모드에서만 씀
│  │     ├─ LoginProvider.js          # 약속: signIn({ auth, functions }) → Result<uid>
│  │     ├─ AnonKeyLogin.js           # 토스: 익명 사용자 키 → 서버 함수 tossLogin → 맞춤 토큰 (화면 없음)
│  │     ├─ DemoLogin.js              # Firebase 익명 로그인 (지금은 안 씀, 남겨 둠)
│  │     ├─ GoogleLogin.js            # 안드로이드·웹: 구글·페이스북·시험용 익명(하루) 로그인 (가입 화면 버튼, 안드로이드는 Capacitor 플러그인)
│  │     └─ EmailLogin.js             # ⏳ add-build-targets — 이메일·비밀번호 (안드로이드)
│  │
│  ├─ platform/                       # [Platform] 빌드 대상과 폰 전용 기능 (Capacitor는 여기와 data/storage에만)
│  │  ├─ target.js                    # 지금 빌드가 어디용인지 (web / toss / android) — vite --mode 값
│  │  ├─ features.js                  # 빌드 대상별 켜고 끄는 기능 표 (스와이프·위치·사진·대화 규칙 + 토스 체크리스트용 뒤로 버튼·라이트 모드·시작 창)
│  │  ├─ tossSdk.js                   # 앱인토스 SDK (토스 빌드에서만): 익명 사용자 키, 토스 뒤로가기 → 창 닫기·미니앱 종료
│  │  ├─ isNative.js                  # ⏳ add-mobile-apps — 폰 앱으로 열렸는지 한 곳에서만 확인
│  │  └─ backButton.js                # ⏳ add-mobile-apps — 안드로이드 뒤로 버튼 = 맨 위 창 닫기
│  │
│  └─ ui/                             # [UI] 자주 바뀜 — 여기만 React. 그리는 HTML(태그·클래스·순서)은 v13과 같음
│     ├─ app/
│     │  ├─ App.jsx                   # 지휘자: 시작 순서(로고 → 가입/홈), 지금 탭, 탭바, 덮개 창·배너 자리
│     │  ├─ AppContext.jsx            # ctx를 React 안으로 넘기는 통로 (useCtx)
│     │  ├─ Observable.js             # 구독·구독 끊기가 되는 알림판 (탭·창 목록·배너·1초/3초 시계)
│     │  ├─ ChangeHub.js              # 주제별 알림판: 바뀐 주제를 구독한 부품만 다시 그림 (nav.refresh = emitAll)
│     │  ├─ TabStore.js               # 지금 보고 있는 탭
│     │  ├─ tabs.js                   # 탭 표 5줄 (+ 빌드에서 꺼진 기능의 탭은 숨김)
│     │  ├─ OverlayStore.js           # 덮개 창 목록 (원본 Layers 대신)
│     │  ├─ OverlayHost.jsx           # 덮개 창 목록을 연 순서대로 그림
│     │  ├─ createNav.jsx             # ctx.nav: 탭 이동, 창 열기 (원본과 같은 함수 이름)
│     │  └─ serverEvents.js           # 서버 소식(새 메시지·수락·스토리 좋아요) + 1초·3초·15초 타이머
│     ├─ hooks/
│     │  ├─ useStore.js               # 알림판 구독 → 바뀌면 다시 그림 (useSyncExternalStore)
│     │  ├─ useChanges.js             # 데이터 주제만 구독 → 그 주제가 바뀔 때만 다시 그림
│     │  ├─ useKept.js                # 탭을 옮겨도 남는 화면 값 (쓰던 스토리 글, 검색칸 …)
│     │  ├─ useDrag.js                # 포인터 끌기 공통 (사진 넘기기, 스와이프 카드, 크기 막대)
│     │  └─ useInterval.js            # setInterval + 자동 정리
│     ├─ actions/                    # [Controller] 입력 → Store 바꾸기 → 서버에 알리기 (View는 server를 직접 부르지 않음)
│     │  ├─ FriendActions.js          # 친구 행동: 좋아요, 수락, 거절, 소리 울리기 (+ 배너)
│     │  ├─ ChatActions.js            # 채팅: 글·음성·사진 보내기, 대화 규칙 검사·경고, 입력 중, 두 번 터치 저장, 스토리 좋아요
│     │  ├─ SafetyActions.js          # 신고(길게 누른 메시지 포함), 차단, 차단 풀기 + 열린 창 닫기
│     │  └─ MeActions.js              # 나 탭: 프로필 사진 추가·삭제, 위치 공유·알림음 토글, 스토리 올리기·지우기
│     ├─ common/
│     │  ├─ Icon.jsx                  # <Icon name="heart" /> — 그림은 core/icons.js 그대로
│     │  ├─ views.jsx                 # 작은 조각: Avatar, Square, Photo, TypingAnim, Dots, TopBar
│     │  ├─ NavBar.jsx                # 하단 탭바 + 빨간 숫자
│     │  ├─ ToastStore.js             # 위쪽 알림 배너 하나 기억 + toast.show()
│     │  ├─ ToastView.jsx             # 배너 그리기
│     │  ├─ Modal.jsx                 # 어두운 바깥(Scrim) + 가운데 팝업(Modal) 틀
│     │  ├─ StoryRing.jsx             # 시간 따라 줄어드는 스토리 테두리 (1초마다 이것만 다시 그림)
│     │  ├─ storyStyle.js             # 글 스토리 모양 계산 (style 객체)
│     │  ├─ StoryText.jsx             # 글 스토리 글자 한 덩어리
│     │  ├─ DragSlider.jsx            # 좌우로 끄는 크기 막대
│     │  ├─ PhotoCarousel.jsx         # 사진 좌우 넘기기
│     │  ├─ PhotoPicker.js            # 사진 고르기 창 열기 + pickImage(한 장 골라 읽기: 채팅·스토리 사진)
│     │  ├─ PolicyText.jsx            # docs/policy/*.md를 화면에 그리기 + 정책 문서 목록(POLICY_DOCS)
│     │  ├─ ChatRulesTile.jsx         # 채팅 이용 수칙 타일 (X로 닫기): 채팅 탭(대화한 적 없을 때) + 첫 대화 채팅방
│     │  ├─ ColorPalette.jsx          # 색 팔레트 창 + palette.open()
│     │  └─ DateWheelPicker.jsx       # 아이폰식 년·월·일 바퀴 + datePicker.open()
│     ├─ start/
│     │  ├─ Splash.jsx                # 로고 화면
│     │  ├─ SignupScreen.jsx          # 가입 화면
│     │  └─ BanScreen.jsx             # 이용정지 안내 (7일 정지 / 영구정지, 닫을 수 없음)
│     ├─ screens/                     # 하단 탭 5개, 탭마다 폴더 하나
│     │  ├─ home/
│     │  │  ├─ HomeScreen.jsx         # 홈 탭 틀: 제목 + 꽉 찬 지도 (위치 공유를 켠 친구 + 나)
│     │  │  ├─ KakaoMap.jsx           # 카카오 지도 (VITE_KAKAO_MAP_KEY). 키가 없거나 실패하면 MapBackground
│     │  │  ├─ MapBackground.jsx      # 직접 그린 지도 그림 (SVG, 카카오 지도 대신)
│     │  │  └─ MapPin.jsx             # 핀 (친구 / 나). 3초마다 핀만 다시 그림
│     │  ├─ chat/
│     │  │  ├─ ChatListScreen.jsx     # 채팅 탭 틀
│     │  │  ├─ StoryRow.jsx           # 스토리 줄 (내 칸 + 친구 칸들)
│     │  │  └─ ChatRow.jsx            # 대화 한 줄 + 미리보기 규칙
│     │  ├─ swipe/
│     │  │  ├─ SwipeScreen.jsx        # 스와이프 탭 틀: 남은 수 + 카드 + 버튼 / 다 봤을 때 안내
│     │  │  ├─ SwipeCard.jsx          # 카드 하나
│     │  │  ├─ useCardDrag.js         # 카드 끌기: 기울기, 도장, 날리기, 터치
│     │  │  └─ SwipeEmpty.jsx         # 다 봤을 때 문구 (swipeEmptyText)
│     │  ├─ friends/
│     │  │  ├─ FriendsScreen.jsx      # 친구 탭 틀 (원본 LikesScreen)
│     │  │  ├─ FriendSearchBox.jsx    # 아이디 검색칸 + 결과 한 줄
│     │  │  └─ LikeRow.jsx            # 받은 좋아요 줄, 내 스토리 좋아요 줄, 프로필 버튼
│     │  └─ me/
│     │     ├─ MeScreen.jsx           # 나 탭: 부품 5개를 붙이기만 함
│     │     ├─ ProfileHeader.jsx      # 내 정보 + 닉네임 바꾸기 (동그라미 누르면 내 프로필 미리보기)
│     │     ├─ PhotoManager.jsx       # 프로필 사진 10장
│     │     ├─ InterestEditor.jsx     # 관심사 키워드 5개 (칩 + 입력 칸)
│     │     ├─ StoryEditor.jsx        # 스토리 만들기
│     │     ├─ storyParts.js          # 꾸미기 세 칸 표 (배경 / 글자 / 테두리)
│     │     └─ SettingsPanel.jsx      # 설정(위치 공유는 여기서만), 신고한 사용자, 차단한 사용자, 정책(문서 4개), 회원탈퇴
│     └─ overlays/                    # 덮개 창. 큰 것은 폴더, 작은 것은 파일 하나
│        ├─ chat/
│        │  ├─ ChatRoom.jsx           # 채팅방 틀
│        │  ├─ ChatHeader.jsx         # 뒤로(토스 빌드는 없음) / 프로필 / 전화 / 차단 / 신고
│        │  ├─ MessageList.jsx        # 메시지들 + 입력 중 + 두 번 터치 저장 + 길게 눌러 신고 + 첫 대화 채팅 이용 수칙
│        │  ├─ MessageBubble.jsx      # 글 / 사진 / 음성 말풍선
│        │  ├─ Composer.jsx           # 평소 입력창 ↔ 녹음 입력창
│        │  └─ useVoiceRecorder.js    # 녹음 흉내 (59초 자동 보내기)
│        ├─ profile/
│        │  ├─ ProfileView.jsx        # 전체 화면 프로필 틀 (위쪽: 닫기 · 차단)
│        │  ├─ ProfileInfo.jsx        # 닉네임·나이·@아이디·동네·칩·소개
│        │  └─ ProfileActions.jsx     # 연 곳·관계에 따른 버튼
│        ├─ StoryViewer.jsx           # 스토리 보기
│        ├─ FriendList.jsx            # 친구 목록
│        ├─ CallScreen.jsx            # 전화 화면
│        ├─ ReportDialog.jsx          # 신고 창(길게 누른 메시지도 같이), 차단 창
│        ├─ PolicySheet.jsx           # 정책 문서 보기 창 (아래에서 올라옴)
│        └─ PingPermission.jsx        # 무음 소리 받기: 묻기 창 + 설정 안내 창
│
├─ tests/                             # npm run test (Vitest)
│  ├─ helpers.js                      # 시험 도구: data 부품 만들기, 시계 당기기
│  ├─ data.test.js                    # data/ 규칙 시험 (스와이프 제한, 입력 검사, 좋아요, 메시지, 스토리, 소리 울리기, 대화 규칙, 제재 기준)
│  ├─ server.test.js                  # 진짜 서버 구독 시험 (가짜 Firestore): 친구 300명이어도 구독 수 그대로, 메시지·입력 중·친구 소식이 맞는 친구에게
│  ├─ actions.test.js                 # Controller(actions) 시험: 화면 없이 보내기·경고·정지·신고·차단·토글·스토리 (+ 같은 값이면 알리지 않기)
│  └─ ui.test.js                      # React 없이 시험하는 UI 규칙 (덮개 창·뒤로 버튼, 배너, 빈 화면 문구, 스토리 글자, 빌드별 기능, 채팅 이용 수칙)
│
├─ tools/
│  ├─ copy-shared.mjs                 # 앱과 서버 함수가 같이 쓰는 파일(MessageFilter, sanctionRules)을 functions/shared/로 복사 (emulators·deploy 전에 저절로)
│  ├─ store-images/                   # npm run store:images — 실제 앱 화면으로 스토어 이미지 찍기
│  │  ├─ make-store-images.mjs        # 토스·플레이 규격대로 찍어서 store/*/images에 덮어쓰기
│  │  └─ brand.html                   # 앱 아이콘(600·512)·그래픽 이미지(1024×500) 원본
│  └─ compare/                        # npm run compare (Playwright): 원본과 React 버전 화면 사진 비교
│     ├─ playwright.config.js         # 비교할 HTML(dist/moyeo.html), 정답 사진 위치 (compare:approve로 새로 승인)
│     ├─ compare.spec.js              # 장면 23개 × 폰·PC 크기를 같은 순서로 눌러 찍기
│     └─ __screens__/                 # (만들어짐) 승인한 정답 사진
│
├─ functions/                         # 서버 함수 (Firebase, 서울 지역). 따로 npm install (functions 폴더 안에서)
│  ├─ package.json                    # firebase-functions, firebase-admin 버전 고정
│  ├─ index.js                        # tossLogin(토스 코드 → mTLS → 맞춤 토큰), deleteAccount(모든 데이터 삭제), cleanup(매시간 24시간 정리), moderateMessage(대화 규칙 위반 → 경고·7일 정지·영구정지)
│  └─ shared/                         # (만들어짐) tools/copy-shared.mjs가 src/data/에서 복사한 MessageFilter.js, sanctionRules.js — 고치지 않기
├─ android/                           # ⏳ add-mobile-apps — Capacitor 안드로이드 프로젝트 (Android Studio로 열기)
├─ ios/                               # ⏳ add-mobile-apps — Capacitor iOS 프로젝트 (Mac + Xcode로 열기)
│
├─ node_modules/                      # (만들어짐) npm install로 받은 라이브러리
├─ dist/                              # (만들어짐) npm run build 결과 (폰 앱·웹 서버용)
│  └─ moyeo.html                      # (만들어짐) npm run build:single 결과. 더블클릭으로 바로 열림 (v13 때부터 같은 자리)
├─ dist-toss/                         # (만들어짐) npm run build:toss 결과 (앱인토스용, 탭 3개: 스와이프·지도 끔). apps-in-toss.config.ts의 webBundleDir. npm run build:ait면 ururu.ait까지
├─ test-results/, playwright-report/  # (만들어짐) npm run compare 결과와 다른 점 사진
└─ _to_delete/                        # 지울 것 모음 (옛 안내 문서, 예전 zip, 작업용 묶음, 원본 v13 legacy/, 예전 functions/messageFilter.js 복사본). 확인 뒤 직접 지우기
```

- `src/platform/kakaoSdk.js` — 카카오 지도 SDK 한 번만 불러오기 (홈 지도 + 지역 찾기가 같이 씀, 2026-10-20)
- `src/platform/region.js` — 프로필 "➤ 나라·지역" 글자 만들기 (위치 공유 켬: 시·도 시·군·구까지 / 끔: 나라만, 2026-10-20)
- `src/ui/common/Logo.jsx` — "우르르" 로고 글자 하나 (로고·가입·이용정지 화면 공통, 모양은 styles/start.css .logo 한 곳, 2026-10-20)
- `src/ui/common/Tag.jsx` — 관심사 태그 하나 (알록달록 네모, 스와이프·프로필·나 탭 공통, 모양은 styles/base.css .tag, 2026-10-20)
- `src/core/i18n/index.js` — 화면 글자 언어 KR/EN: t("이름표") → 지금 언어의 글자 (2026-10-20)
- `src/core/i18n/ko.js` — 한국어 화면 글자 전부 (이름표: 글자)
- `src/core/i18n/en.js` — 영어 화면 글자 전부 (ko.js와 같은 이름표)
- `docs/policy/terms.en.md`, `docs/policy/chat-rules.en.md` — 이용약관·채팅 이용 수칙 영어판
- `src/ui/common/LanguageSwitch.jsx` — 언어 바 [KR | EN] (가입 화면 오른쪽 위 · 나 탭 설정, 모양은 styles/base.css .langswitch)
- `docs/fonts.md` — 글자(폰트) 정리: 글꼴·크기 이름표·굵기·움직임이 어디서 정해지고 어느 화면에 쓰이는지 (2026-10-21)
- `admin.html` — 운영자 사이트 (아이디 12자리 로그인, 주소 ururu-admin.web.app, 사용자 앱과 따로, docs/guides/admin-guide.md, 2026-10-21)
- `dist-admin/` — 운영자 사이트 빌드 결과 (`npm run build:admin`, git에 안 올림)
- `src/admin/` — 운영자 사이트 코드: `main.jsx`(시작) · `AdminApp.jsx`(화면) · `AdminService.js`(서버 일) · `adminText.js`(글자)
- `styles/admin.css` — 운영자 사이트 모양
- `docs/guides/admin-guide.md` — 운영자 사이트 사용·보안·운영자 추가 안내
- `docs/guides/admin-roles.md` — 운영자 권한 흐름 설계 (최종관리자 · 총관리자 · 운영자, 2단계 승인, 2026-10-21)
