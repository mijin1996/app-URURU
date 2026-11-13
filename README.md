# 우르르 (Ururu)

## 기획
- 24시간 뒤 사라지는 메시지
- 스와이프로 친구 만들기
- 사진에 글 쓰기
- 사용 가능 대상(만 19세 이상)
- 주요 기능 표를 넣었어요.
- 출처 목록 명확히 하기
- 꺼 둔 기능(지도, 무음에서도 소리 울리기, 사진 보내기)

## 흐름도
- 가입 · 로그인	구글 로그인만, 처음이면 네 칸 입력 후 가입
- 채팅	1:1 메시지, 24시간 뒤 사라짐, 개인정보·욕설 가리기
- 스와이프 · 친구	10분에 10명, 받은 좋아요 수락·거절
- 프로필	사진 10장(글 쓰기), 관심사 5개
- 안전	신고·차단, 경고 → 7일 정지 → 영구정지
- 화면	레벨업 글꼴, 밝게/어둡게, 폰 하단 탭 · PC 왼쪽 탭
- 운영자 사이트	신고 처리, 회원 관리, 운영자 계정 관리

## 적용 방법
- .env가 있으면 진짜 서버, 없으면 시연용 가짜 서버로
- URURU 규칙 docs/progress.md 참고

| 문서 | 내용 |
|---|---|
| [docs/architecture.md](docs/architecture.md) | 등급(총관리자 → 운영자 → 이용자) · 계층 · 파일 지도 |
| [docs/progress.md](docs/progress.md) | 진행 상황 |
| [docs/todo.md](docs/todo.md) | 앞으로 할 일 · 추후 변경사항 |
| [CLAUDE.md](CLAUDE.md) | Claude 작업 규칙 · 정해진 것 |




```bash
npm install
npm run dev          # 사용자 앱 http://localhost:5173
npm run dev:admin    # 운영자 사이트 http://localhost:5180/admin.html
npm run test         # 시험
npm run build        # dist/  (build:single → dist/ururu.html, build:admin → dist-admin/)
```
