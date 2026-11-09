/* =========================================================
   [Platform] features.js — 빌드 대상마다 켜고 끄는 기능 표
   ---------------------------------------------------------
   왜 주석으로 막지 않고 스위치로 끄나요?
   코드는 그대로 살아 있고 시험돼요. 켜고 싶으면 false를 true로 한 단어만 바꾸면 돼요.

   canSwipe          스와이프 탭 (모르는 사람 카드)
   canShareLocation  홈 지도 탭 + 나 탭 "친구와 위치 공유" (위치는 민감정보라 동의 창과
                     위치기반서비스사업 신고를 마친 뒤 켜요). 2026-11-09 미미: 지도는 나중에 → 모든 빌드 false
   canTryAnonymous   가입 화면 [익명으로 계속하기] — 시험용. 익명 계정은 만든 지 하루(24시간)가 지나면 못 써요
                     (앱: GoogleLogin.js, 서버: firestore.rules·storage.rules의 anonExpired).
                     2026-11-03 미미: 로그인은 구글만 → 모든 빌드 false
   (지도에는 어느 빌드든 위치 공유를 켠 친구만 보여서 따로 스위치가 없어요)

   canRing           "소리 울리기" 전부: 나 탭 "무음에서도 소리 받기" · 친구 프로필 [울리기] · 가입 직후 묻는 창.
                     웹앱은 무음을 뚫고 울릴 수 없고 받는 쪽 코드도 아직 없어서 꺼 둠
                     (안드로이드 네이티브 알림을 붙인 뒤 다시 켜요). 2026-11-09 미미 → 모든 빌드 false
   askPingOnStart    가입 직후 "소리 울리기를 받을까요?" 창을 저절로 띄우기 (canRing이 켜져 있을 때만)
   lightThemeOnly    폰이 다크 모드여도 밝은 화면만
   ownBackButtons    채팅방·친구 목록 왼쪽 위 뒤로 버튼
   ========================================================= */

import { TARGET } from './target.js';

// canSendPhoto  채팅방 사진 보내기 (초기 안전 장치로 모든 빌드에서 끔. 켜려면 firestore.rules의 type 목록에도 'photo'를 다시 넣기)
// filterMessages 대화 규칙: 개인정보 공유·도박·욕설을 ****로 가리고 위반 횟수 세기 (data/MessageFilter.js, data/sanctionRules.js)
const FEATURES_BY_TARGET = {
  web: {
    canTryAnonymous: false,
    canSwipe: true,
    canShareLocation: false,
    canRing: false,
    canSendPhoto: false,
    filterMessages: true,
    askPingOnStart: true,
    lightThemeOnly: false,
    ownBackButtons: true,
  },
  android: {
    canTryAnonymous: false,
    canSwipe: true,
    canShareLocation: false,
    canRing: false,
    canSendPhoto: false,
    filterMessages: true,
    askPingOnStart: true,
    lightThemeOnly: false,
    ownBackButtons: true,
  },
};

export function featuresFor(target) {
  return FEATURES_BY_TARGET[target] || FEATURES_BY_TARGET.web;
}

export const features = featuresFor(TARGET);
