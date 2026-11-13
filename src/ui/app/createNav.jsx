/* =========================================================
   [UI] createNav.jsx — ctx.nav 만들기: 화면 이동 / 창 열기 (Mediator)
   ---------------------------------------------------------
   채팅방은 프로필을 열고, 프로필은 채팅방을 열어요. 둘이 서로를 import 하면 순환 구조가 생겨요. (ADP 위반)
   그래서 "열기"는 여기만 알고, 다른 부품은 ctx.nav.openChat() 처럼 빌려 써요.
   함수 이름은 원본(v13 App.createNav)과 같아서 FriendActions 같은 코드는 그대로예요.
   ========================================================= */

import { CallScreen } from '../overlays/CallScreen.jsx';
import { ChatRoom } from '../overlays/chat/ChatRoom.jsx';
import { FriendList } from '../overlays/FriendList.jsx';
import { askPingPermission, openPingGuide } from '../overlays/PingPermission.jsx';
import { ProfileView } from '../overlays/profile/ProfileView.jsx';
import { openPolicySheet } from '../overlays/PolicySheet.jsx';
import { openCreditsSheet } from '../overlays/CreditsSheet.jsx';
import {
  openBlockDialog,
  openReportDialog,
  openUnfriendDialog,
} from '../overlays/ReportDialog.jsx';
import { BanScreen } from '../start/BanScreen.jsx';
import { WIDE_SCREEN_QUERY } from '../../core/config.js';

// PC 넓은 화면인지 (시험 환경처럼 window가 없으면 폰으로)
const isWideScreen = () =>
  typeof window !== 'undefined' && window.matchMedia?.(WIDE_SCREEN_QUERY).matches === true;
// PC에서 탭을 옮기면 닫는 창: 폰에서는 이 창들이 탭바를 덮어서 탭을 못 누르지만, PC에서는 왼쪽 탭이 늘 보여요
const WIDE_TAB_OVERLAYS = ['chat', 'pview', 'friendList'];

export function createNav(ctx) {
  const { overlays, tabs, changes } = ctx;
  const isChatWith = (userId) => (item) => item.kind === 'chat' && item.meta.userId === userId;

  // 구독 중인 부품을 모두 다시 그려요 (사용자가 누른 뒤 한 번). 데이터 변화는 Store가 주제별로 알려서 이걸 안 불러도 돼요
  const refresh = () => changes.emitAll();

  return {
    goTab(tabId) {
      if (isWideScreen()) {
        overlays.closeKinds(WIDE_TAB_OVERLAYS);
      }
      tabs.set(tabId);
    },
    currentTab: () => tabs.current,
    refresh,
    refreshNav: refresh,

    isChatOpenWith: (userId) => overlays.has(isChatWith(userId)),
    closeChatIfWith: (userId) => overlays.closeWhere(isChatWith(userId)),

    openChat(userId) {
      overlays.closeKinds(['scrim', 'pview', 'chat']); // 알림을 눌러 어디서 오든 채팅방만 남게
      if (isWideScreen()) {
        overlays.closeKinds(['friendList']);
        tabs.set('messages'); // PC는 채팅 목록 옆 칸에 대화방이 열려서, 목록 탭으로
      }
      overlays.open({
        kind: 'chat',
        meta: { userId },
        render: (close) => <ChatRoom userId={userId} close={close} />,
      });
    },

    // options: { isFromChat, isGrow, source }
    openProfile(userId, options = {}) {
      overlays.closeKinds(['pview']);
      overlays.open({
        kind: 'pview',
        render: (close) => <ProfileView userId={userId} {...options} close={close} />,
      });
    },

    openCall(userId) {
      overlays.open({
        kind: 'call',
        render: (close) => <CallScreen userId={userId} close={close} />,
      });
    },

    // message: 메시지를 길게 눌러 신고하면 그 메시지 (신고 기록에 같이 남아요)
    openReport: (userId, message = null) => openReportDialog(ctx, userId, message),

    // 정책 문서 보기 (src/policy/의 파일 이름: "chat-rules.md", "terms.md" …)
    openPolicy: (file) => openPolicySheet(ctx, file),

    // 출처 (글꼴 · 라이브러리, core/credits.js)
    openCredits: () => openCreditsSheet(ctx),

    // 이용 제한 중이면 모든 창을 닫고 제한 안내로 덮어요 (닫을 수 없음). 제한 중이었으면 true
    showBan() {
      const { moderation } = ctx;
      if (!moderation.isBanned()) {
        return false;
      }
      overlays.closeKinds(['scrim', 'pview', 'chat', 'call', 'friendList', 'signup']);
      if (!overlays.has((item) => item.kind === 'ban')) {
        overlays.open({
          kind: 'ban',
          render: () => (
            <BanScreen bannedUntil={moderation.bannedUntil} isPermanent={moderation.isPermanent} />
          ),
        });
      }
      return true;
    },
    openBlock: (userId) => openBlockDialog(ctx, userId),
    openUnfriend: (userId) => openUnfriendDialog(ctx, userId),

    // 안드로이드 뒤로 버튼: 맨 위 창을 닫아요. 닫을 창이 없으면 false (부르는 쪽이 앱을 나가요)
    // 이용정지 안내·가입 화면·로고는 뒤로 버튼으로 닫히지 않아요
    back() {
      const isClosed = overlays.closeTop(['ban', 'signup', 'splash']);
      changes.emitAll();
      return isClosed;
    },

    openFriendList() {
      overlays.open({ kind: 'friendList', render: (close) => <FriendList close={close} /> });
    },

    askPing: () => askPingPermission(ctx),
    openPingGuide: () => openPingGuide(ctx),

    // 회원탈퇴: 계정을 지우고 처음(로고 → 가입)부터 다시 시작
    // 화면에 남은 내 사진까지 깨끗이 비우려고 페이지를 새로 불러와요 (원본과 같음, KISS)
    // 서버에서 못 지웠으면 이유를 보여주고 그대로 둬요 (다시 누를 수 있게)
    async withdraw() {
      const result = await ctx.account.withdraw();
      if (!result.isOk) {
        ctx.toast.show(result.reason);
        return;
      }
      window.location.reload();
    },

    async signOut() {
      const result = await ctx.account.signOut();
      if (!result.isOk) {
        ctx.toast.show(result.reason);
        return;
      }
      window.location.reload();
    },
  };
}
