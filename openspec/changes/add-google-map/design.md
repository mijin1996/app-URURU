# Design

## Context

- `migrate-to-react` 뒤라 홈 화면은 React 부품이고, 지금은 그림 SVG 위에 핀을 `%` 좌표로 놓아요 (`docs/code-structure-and-patterns.md`).
- 제 작업 환경에서는 외부 인터넷이 막혀 있어서 진짜 구글 지도를 띄워볼 수 없어요. 가짜 구글 지도로 시험하고, 진짜 확인은 키를 넣은 뒤 미미가 해요.

## Goals / Non-Goals

**Goals:**
- `.env`에 키 한 줄 넣으면 끝 (코드 수정 없음)
- 키가 없거나 실패해도 지금 앱과 똑같이 동작
- 홈 화면 코드는 어떤 지도인지 모름

**Non-Goals:**
- 서버 연동, 길찾기, 장소 검색, 다른 지도 회사 (나중에 같은 약속으로 추가)

## Decisions

### D1. 구글 지도 **웹용**(Maps JavaScript API)을 쓴다
- 앱(Capacitor)도 웹 화면이라 안드로이드·iOS·PC가 같은 코드예요.
- **대안**: 안드로이드 구글 SDK + iOS 애플 지도 → 코드가 두세 벌이 돼서 버림.

### D2. 지도와 위치를 약속(인터페이스) 뒤로 숨긴다

```text
src/data/map/
├─ MapView.js         # 약속: mount(element, center) · setPins(people) · movePin(id, latLng) · destroy()
├─ DrawnMap.js        # 지금 그림 지도 (원본 SVG + % 좌표)
└─ GoogleMap.js       # 구글 지도. 핀은 지도 위 HTML(Advanced Marker)로 그려서 원본 핀 CSS를 그대로 씀
src/data/location/
├─ LocationSource.js  # 약속: current() → Result<{ lat, lng }> · watch(onMove)
├─ FakeLocation.js    # 고정 자리
└─ DeviceLocation.js  # 폰: @capacitor/geolocation / PC: 브라우저 navigator.geolocation
```

- 홈 화면은 `MapView`, `LocationSource`만 알아요 (DIP). 새 지도 회사는 파일 하나 추가 (OCP).
- `DrawnMap`과 `GoogleMap`은 `MapView` 자리에 넣어도 똑같이 동작해야 해요 (LSP).

### D3. 키 확인과 부품 고르기는 `main.jsx` 한 곳
- `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`가 있으면 `GoogleMap` + `DeviceLocation`, 없으면 `DrawnMap` + `FakeLocation`.
- 키는 코드에 적지 않고 `.env`(zip·git에 안 들어감)에 적어요. 예시는 `.env.example`.

### D4. 실패는 Result로, 앱은 계속
- `GoogleMap.mount()`가 실패하면 `Result.fail("지도를 불러오지 못해 기본 지도를 보여줘요")` → 홈이 `DrawnMap`으로 바꿔 끼우고 배너.
- 위치 권한 거절도 `Result.fail(...)` → 기본 위치 + 배너.

### D5. 좌표는 위도·경도로 통일
- 사람 데이터에 `lat`, `lng`를 더하고, `DrawnMap`은 위도·경도를 화면 `%`로 바꿔 그려요. 그래서 키가 없어도 지금 화면 그대로예요.
- 거리 "1.2km"는 두 좌표 사이 거리 공식(하버사인)으로 계산하는 순수 함수 `core/geo.js`.

### D6. 시연 친구는 내 위치 근처로
- 키가 있으면 `FakeServer`가 시연 친구를 내 실제 위치 둘레에 흩어 놓고, 3초마다 조금씩 움직여요 (지금과 같은 흉내).

## Risks / Trade-offs

- [진짜 구글 지도를 여기서 못 띄움] → 가짜 `google.maps`로 시험 + `docs/tech-stack.md`에 "키 넣고 확인하는 순서" 체크리스트
- [요금] → 일정량 무료. 키에 **사용 한도**와 **허용 주소 제한**을 걸도록 문서에 적음
- [키가 웹 코드에 보임] → 웹용 지도 키는 원래 보이는 방식이라, 구글 콘솔에서 허용할 앱·주소만 쓰게 제한
- [폰 위치 권한 문구] → 안드로이드·iOS 권한 설명 문구는 `add-mobile-apps`에서 설정

## Migration Plan

1. 약속과 그림 지도 먼저 (키 없이 지금과 똑같은지 비교 사진)
2. 위치 약속 → 구글 지도 → 실패 처리
3. 되돌리기: `main.jsx`에서 항상 `DrawnMap`을 고르면 원래대로
