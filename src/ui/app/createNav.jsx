/* =========================================================
   [UI] createNav.jsx — ctx.nav 만들기: 화면 이동 / 창 열기 (Mediator)
   ---------------------------------------------------------
   채팅방은 프로필을 열고, 프로필은 채팅방을 열어요. 둘이 서로를 import 하면 순환 구조가 생겨요. (ADP 위반)
   그래서 "열기"는 여기만 알고, 다른 부품은 ctx.nav.openChat() 처럼 빌려 써요.
   함수 이름은 원본(v13 App.createNav)과 같아서 FriendActions 같은 코드는 그대로예요.
   ========================================================= */

import { CallScreen } from "../overlays/CallScreen.jsx";
import { ChatRoom } from "../overlays/chat/ChatRoom.jsx";
import { FriendList } from "../overlays/FriendList.jsx";
import { askPingPermission, openPingGuide } from "../overlays/PingPermission.jsx";
import { ProfileView } from "../overlays/profile/ProfileView.jsx";
import { openPolicySheet } from "../overlays/PolicySheet.jsx";
import { openBlockDialog, openReportDialog, openUnfriendDialog } from "../overlays/ReportDialog.jsx";
import { StoryViewer } from "../overlays/StoryViewer.jsx";
import { BanScreen } from "../start/BanScreen.jsx";

export function createNav(ctx)
{
  const { overlays, tabs, changes, users, stories } = ctx;
  const isChatWith = (userId) => (item) => item.kind === "chat" && item.meta.userId === userId;

  // 구독 중인 부품을 모두 다시 그려요 (사용자가 누른 뒤 한 번). 데이터 변화는 Store가 주제별로 알려서 이걸 안 불러도 돼요
  // 원본의 refresh / refreshNav / refreshIfShowingStories가 모두 이것 하나로 같아요
  const refresh = () => changes.emitAll();

  return {
    goTab: (tabId) => tabs.set(tabId),
    currentTab: () => tabs.current,
    refresh,
    refreshNav: refresh,
    refreshIfShowingStories: refresh,

    isChatOpenWith: (userId) => overlays.has(isChatWith(userId)),
    closeChatIfWith: (userId) => overlays.closeWhere(isChatWith(userId)),

    openChat(userId)
    {
      overlays.closeKinds(["scrim", "pview", "story", "chat"]);   // 알림을 눌러 어디서 오든 채팅방만 남게
      overlays.open({ kind: "chat", meta: { userId }, render: (close) => <ChatRoom userId={userId} close={close} /> });
    },

    // options: { isFromChat, isGrow, source }
    openProfile(userId, options = {})
    {
      overlays.closeKinds(["pview"]);
      overlays.open({ kind: "pview", render: (close) => <ProfileView userId={userId} {...options} close={close} /> });
    },

    // options: { source } — "home"이면 프로필에서 "소리 울리기"가 보임
    openStory(userId, { source = "" } = {})
    {
      const user = users.user(userId);
      if (!stories.hasActive(user))
      {
        return;
      }
      if (userId !== "me")
      {
        stories.markSeen(user);
      }
      overlays.open({ kind: "story", render: (close) => <StoryViewer userId={userId} source={source} close={close} /> });
      refresh();   // 뒤 화면의 테두리를 회색으로
    },

    openCall(userId)
    {
      overlays.open({ kind: "call", render: (close) => <CallScreen userId={userId} close={close} /> });
    },

    // message: 메시지를 길게 눌러 신고하면 그 메시지 (신고 기록에 같이 남아요)
    openReport: (userId, message = null) => openReportDialog(ctx, userId, message),

    // 정책 문서 보기 (docs/policy/의 파일 이름: "chat-rules.md", "terms.md" …)
    openPolicy: (file) => openPolicySheet(ctx, file),

    // 이용 제한 중이면 모든 창을 닫고 제한 안내로 덮어요 (닫을 수 없음). 제한 중이었으면 true
    showBan()
    {
      const { moderation } = ctx;
      if (!moderation.isBanned())
      {
        return false;
      }
      overlays.closeKinds(["scrim", "pview", "story", "chat", "call", "friendList", "signup"]);
      if (!overlays.has((item) => item.kind === "ban"))
      {
        overlays.open({ kind: "ban", render: () => <BanScreen bannedUntil={moderation.bannedUntil} isPermanent={moderation.isPermanent} /> });
      }
      return true;
    },
    openBlock: (userId) => openBlockDialog(ctx, userId),
    openUnfriend: (userId) => openUnfriendDialog(ctx, userId),

    // 토스 뒤로가기·안드로이드 뒤로 버튼: 맨 위 창을 닫아요. 닫을 창이 없으면 false (부르는 쪽이 앱을 나가요)
    // 이용정지 안내·가입 화면·로고는 뒤로 버튼으로 닫히지 않아요
    back()
    {
      const isClosed = overlays.closeTop(["ban", "signup", "splash"]);
      changes.emitAll();
      return isClosed;
    },

    openFriendList()
    {
      overlays.open({ kind: "friendList", render: (close) => <FriendList close={close} /> });
    },

    askPing: () => askPingPermission(ctx),
    openPingGuide: () => openPingGuide(ctx),

    // 회원탈퇴: 계정을 지우고 처음(로고 → 가입)부터 다시 시작
    // 화면에 남은 내 사진·스토리까지 깨끗이 비우려고 페이지를 새로 불러와요 (원본과 같음, KISS)
    // 서버에서 못 지웠으면 이유를 보여주고 그대로 둬요 (다시 누를 수 있게)
    async withdraw()
    {
      const result = await ctx.account.withdraw();
      if (!result.isOk)
      {
        ctx.toast.show(result.reason);
        return;
      }
      window.location.reload();
    }
  };
}
