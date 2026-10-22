## ADDED Requirements

### Requirement: 폰 안전 영역
앱은 폰의 노치·상태 표시줄·홈 바 부분을 피해서 그려야 한다(SHALL). PC에서는 화면이 원래와 똑같아야 한다(SHALL).

#### Scenario: SHELL-P1 노치가 있는 아이폰
- **WHEN** 노치나 홈 바가 있는 아이폰에서 앱을 연다
- **THEN** 제목과 하단 탭이 노치·홈 바에 가려지지 않는다

#### Scenario: SHELL-P1b PC
- **WHEN** PC 브라우저에서 연다
- **THEN** 화면이 이 변경 전과 똑같다

### Requirement: 안드로이드 뒤로 버튼
안드로이드 앱은 "뒤로" 버튼을 누르면 맨 위 창부터 차례로 닫아야 한다(SHALL).

#### Scenario: SHELL-P2 창이 열려 있음
- **WHEN** 덮개 창이 열린 상태에서 뒤로 버튼을 누른다
- **THEN** 맨 위 창 하나만 닫힌다

#### Scenario: SHELL-P2b 다른 탭
- **WHEN** 창이 없고 홈이 아닌 탭에서 뒤로 버튼을 누른다
- **THEN** 홈 탭으로 간다

#### Scenario: SHELL-P2c 홈
- **WHEN** 창이 없고 홈 탭에서 뒤로 버튼을 누른다
- **THEN** 앱에서 나간다

### Requirement: 앱 안 글꼴
앱은 인터넷 연결 없이도 Noto Sans KR 글꼴로 보여야 한다(SHALL).

#### Scenario: SHELL-P3 인터넷 없음
- **WHEN** 인터넷을 끄고 앱을 연다
- **THEN** 인터넷이 있을 때와 같은 글꼴로 보인다

### Requirement: 폰 앱 기본 설정
폰 앱은 이름이 "우르르"이고 세로 화면으로만 보여야 한다(SHALL).

#### Scenario: SHELL-P4 앱 이름
- **WHEN** 앱을 설치한다
- **THEN** 홈 화면에 "우르르"라는 이름으로 보인다

#### Scenario: SHELL-P4b 세로 고정
- **WHEN** 폰을 가로로 돌린다
- **THEN** 화면이 세로 그대로다
