## MODIFIED Requirements

### Requirement: 로고 화면
앱은 켤 때마다 로고 화면을 1.6초 보여준 뒤 다음 화면으로 넘어가야 한다(SHALL).

#### Scenario: SHELL-10 로고 보이기
- **WHEN** 앱을 켠다
- **THEN** "우르르" 로고와 "가까운 친구와 모여"가 1.6초 보인다

#### Scenario: SHELL-11 서서히 사라지기
- **WHEN** 1.6초가 지난다
- **THEN** 다음 화면(가입 또는 홈)이 뒤에 그려지고 로고는 0.4초 동안 서서히 사라진다
