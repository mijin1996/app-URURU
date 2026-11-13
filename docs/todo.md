# 앞으로 할 일 · 추후 변경사항

## 출시 전 (구글 플레이)

**Firebase**
- [ ] `npx firebase deploy --only firestore:rules` — 최신 규칙(`adminLogins` 등) 올리기
- [ ] 콘솔에서 `config/bootstrap` 문서(`emails` 배열) 만들기 → 첫 총관리자 등록
- [ ] 두 계정(일반 창 + 시크릿 창)으로 가입 · 친구 · 채팅 · 사진 글 쓰기 · 신고 · 탈퇴 확인
- [ ] 옛 프로젝트 `ururu-eb3db`, Firebase Hosting 사이트 끄기

**앱 기능**
- [ ] 가입 화면 약관 동의 칸
- [ ] 탈퇴 7일 유예 (지금은 바로 삭제) + 운영자 사이트에서 한 달 안 완전 삭제
- [ ] 정책 문서 웹 주소 (`src/policy/*.md` → 웹 페이지, 플레이 필수)
- [ ] 앱 밖 계정 삭제 요청 웹 페이지 (플레이 "계정 삭제 URL")

**안드로이드 · 플레이**
- [ ] Capacitor 설치 → `android/`, 안드로이드 뒤로 버튼 → `nav.back()`, 안전 영역
- [ ] Firebase 안드로이드 앱 + SHA-1 3개(디버그 · 업로드 · 플레이 서명), 안드로이드 구글 로그인
- [ ] `.aab` 빌드, 업로드 키(keystore)는 git 밖에 보관
- [ ] 플레이 콘솔: 등록정보 · 데이터 보안 · 콘텐츠 등급 → 비공개 테스트(테스터 12명 · 14일) → 프로덕션

## 추후 구현 목록

- [ ] 2026-11-13 디자인 변경(레벨업 글꼴 · 아이콘만 탭 · 밝기 버튼 · PC 넓은 화면) 뒤 할 일: `npm run format` → `npm test` → `npm run build:single`(dist/ururu.html) → `npm run store:images`(스토어 스크린샷 다시)

- [ ] Blaze(서버 함수 모드)로 바꾸면 Storage 버킷 CORS 설정 (저장소 주소 사진을 편집기 캔버스에서 다시 읽으려면 필요)

- [ ] **지도 다시 켜기 검토** (지금 꺼 둠): 켜려면 `features.js` `canShareLocation: true` + 위치 동의 창 + 위치기반서비스사업 신고(방송통신위원회) + 카카오 SDK 도메인에 `https://app-ururu.pages.dev` + 개인정보처리방침 · 플레이 데이터 보안의 위치 줄 다시 확인
- [ ] Firebase에 남은 옛 스토리 데이터 지우기 (콘솔: Firestore `stories` 컬렉션, Storage `users/*/stories/`) — 이제 규칙이 막아서 앱에서는 안 보여요

- [ ] 결제 (구글 플레이 결제 → `entitlements/{uid}.plan = 'premium'`, 친구 위치를 동까지)
- [ ] **소리 울리기 다시 켜기** (지금 꺼 둠, `features.js` `canRing: false`): 받는 쪽 만들기(지금은 보내기만 서버에 기록) + 안드로이드 네이티브 알림(FCM + 알람 채널 · 방해 금지 무시 권한, 플레이 정책 확인). 웹앱·아이폰은 무음을 뚫을 수 없음
- [ ] 음성 메시지 · 전화 · 영상통화 (지금 `CallScreen` · 녹음은 화면만)
- [ ] 푸시 알림
- [ ] Blaze 요금제로 바꾸면: 위치 자동 삭제 TTL(`locations` · `locationsDetail`의 `expiresAt`), 24시간 지난 메시지 실제 삭제(`cleanup`), 로그인 계정까지 삭제(`adminDeleteUser`), 신고 알림 메일
- [ ] iOS

## 추후 변경사항

- [ ] `RealServer.js`(약 950줄)를 기능별 파일로 나누기 (로그인 · 구독 · 채팅 · 친구 · 사진)
- [ ] 코드 모양 한 번에 맞추기: `npm run format` → `npm run test` → 커밋
- [ ] 문의 이메일 하나로 맞추기 (정책 · 스토어 등록 글)
