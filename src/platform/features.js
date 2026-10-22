/* =========================================================
   [Platform] features.js — 빌드 대상마다 켜고 끄는 기능 표
   ---------------------------------------------------------
   왜 주석으로 막지 않고 스위치로 끄나요?
   코드는 그대로 살아 있고 구글 플레이·시연 빌드에서 계속 쓰이고 시험돼요.
   그래서 나중에 앱인토스에서도 켜고 싶으면 아래 false를 true로 한 단어만 바꾸면 돼요.

   canSwipe          스와이프 탭 (모르는 사람 카드)
   canShareLocation  홈 지도 탭 + 나 탭 "친구와 위치 공유" (위치는 민감정보라 동의 창과
                     위치기반서비스사업 신고를 마친 뒤 켜요)
   canTryAnonymous   가입 화면 [익명으로 계속하기] — 시험용. 익명 계정은 만든 지 하루(24시간)가 지나면 못 써요
                     (앱: GoogleLogin.js, 서버: firestore.rules·storage.rules의 anonExpired). 시험이 끝나면 false로
   (지도에는 어느 빌드든 위치 공유를 켠 친구만 보여서 따로 스위치가 없어요)

   앱인토스 출시 체크리스트 때문에 토스 빌드만 다른 것:
   askPingOnStart    가입 직후 "소리 울리기를 받을까요?" 창을 저절로 띄우기
                     (토스: 진입 직후 동의 창이 저절로 뜨면 안 돼요. 나 탭 설정에서는 그대로 켤 수 있어요)
   lightThemeOnly    폰이 다크 모드여도 밝은 화면만 (토스: 라이트 모드로 구현)
   ownBackButtons    채팅방·친구 목록 왼쪽 위 뒤로 버튼 (토스: 토스 내비게이션 바의 뒤로가기와 같이 보이면 안 돼요.
                     대신 토스 뒤로가기·안드로이드 뒤로 버튼이 맨 위 창을 닫고, 닫을 창이 없으면 미니앱을 나가요)

   앱인토스: 모르는 사람과 연결하는 기능이 있으면 "만남·소개팅"으로 분류돼서
             사업자(법인)를 낸 다음에 켜요.
   ========================================================= */

import { TARGET } from "./target.js";

// canSendPhoto  채팅방 사진 보내기 (초기 안전 장치로 모든 빌드에서 끔. 켜려면 firestore.rules의 type 목록에도 'photo'를 다시 넣기)
// filterMessages 대화 규칙: 개인정보 공유·도박·욕설을 ****로 가리고 위반 횟수 세기 (data/MessageFilter.js, data/sanctionRules.js)
const FEATURES_BY_TARGET =
{
  web: { canTryAnonymous: true, canSwipe: true, canShareLocation: true, canSendPhoto: false, filterMessages: true, askPingOnStart: true, lightThemeOnly: false, ownBackButtons: true },
  android: { canTryAnonymous: true, canSwipe: true, canShareLocation: true, canSendPhoto: false, filterMessages: true, askPingOnStart: true, lightThemeOnly: false, ownBackButtons: true },
  // 법인 등록 뒤 canSwipe, 위치 신고 뒤 canShareLocation을 true로
  toss: { canTryAnonymous: false, canSwipe: false, canShareLocation: false, canSendPhoto: false, filterMessages: true, askPingOnStart: false, lightThemeOnly: true, ownBackButtons: false }
};

export function featuresFor(target)
{
  return FEATURES_BY_TARGET[target] || FEATURES_BY_TARGET.web;
}

export const features = featuresFor(TARGET);
