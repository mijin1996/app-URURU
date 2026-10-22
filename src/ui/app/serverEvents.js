/* =========================================================
   [UI] serverEvents.js — 서버 연결 + 주기적으로 할 일 (앱이 시작될 때 한 번)
   ---------------------------------------------------------
   1. 서버 소식(새 메시지, 친구 수락, 스토리 좋아요) → 알림음 + 배너
   2. 1초마다 스토리 테두리, 3초마다 친구 위치, 15초마다 24시간 정리, 스와이프 사람 목록은 실시간 구독(진짜 서버)
   원본 App.connectOnce / onNewMessage / onServerEvent와 같은 일을 해요.
   ========================================================= */

import { EXPIRE_CHECK_MS, TICK_MS } from "../../core/config.js";
import { t } from "../../core/i18n/index.js";

export function connectServer(ctx)
{
  const { server, chats, stories, clock, locationTick, nav } = ctx;
  server.onMessage((fromId) => onNewMessage(ctx, fromId));
  server.onEvent((type, userId) => onServerEvent(ctx, type, userId));
  server.connect();
  server.startLocationUpdates(() => locationTick.emit());   // 핀만 다시 그림 (MapPin이 구독)
  // 프로필 "➤ 나라 지역": 진짜 서버에서 앱을 켤 때마다 지금 위치로 (바뀌었을 때만 서버에 써요)
  if (server.savesRegion)
  {
    ctx.meActions.refreshRegion();
  }
  // 스와이프: 가입한 사람 목록을 실시간 구독 (진짜 서버만 있는 기능, 스와이프를 끈 빌드는 안 불러와요)
  if (ctx.features.canSwipe && server.loadSwipeUsers)
  {
    server.loadSwipeUsers();   // 실시간 구독 한 번 (새로 가입한 사람은 생기고, 탈퇴한 사람은 사라져요)
  }
  setInterval(() => clock.emit(), TICK_MS);                 // 테두리만 다시 그림 (StoryRing이 구독)
  setInterval(() =>
  {
    // || 대신 둘 다 꼭 실행되게 따로 변수에 담아요 (앞이 true면 뒤를 건너뛰는 걸 막으려고)
    const hasRemovedMessages = chats.removeExpired();
    const hasRemovedStories = stories.removeExpired();
    if (hasRemovedMessages || hasRemovedStories)
    {
      nav.refresh();
    }
  }, EXPIRE_CHECK_MS);
}

// 새 메시지: 보고 있는 방이면 그냥 읽음, 아니면 빨간 숫자 + 알림음 + 누르면 그 채팅방으로
function onNewMessage(ctx, fromId)
{
  const { users, chats, sounds, toast, nav, moderation } = ctx;
  if (moderation.isBanned())
  {
    return;   // 이용 제한 중에는 알림도 띄우지 않아요 (제한 안내 화면만)
  }
  if (nav.isChatOpenWith(fromId))
  {
    return;
  }
  const last = chats.lastMessage(fromId);
  chats.addUnread(fromId);
  sounds.notification.play();
  toast.show(users.user(fromId).name, { sub: last ? last.text : t("chat.newMessage"), onTap: () => nav.openChat(fromId) });
}

function onServerEvent(ctx, type, userId)
{
  const { users, sounds, toast, nav } = ctx;
  // 진짜 서버의 문제 소식: userId 자리에 이유 글이 와요 (인터넷 끊김, 서버가 거절함)
  if (type === "offline" || type === "error")
  {
    toast.show(userId);
    return;
  }
  // 탈퇴한 사람: 그 사람과 열린 채팅방·프로필을 닫고 다시 그려요 (Store에서는 이미 빠졌어요)
  if (type === "gone")
  {
    nav.closeChatIfWith(userId);
    ctx.overlays.closeKinds(["pview"]);
    nav.refresh();
    return;
  }
  // 서버가 이용 제한을 걸었어요 (다른 기기에서 받은 경고까지 합쳐서)
  if (type === "banned")
  {
    nav.showBan();
    return;
  }
  if (ctx.moderation.isBanned())
  {
    return;   // 이용 제한 중에는 친구 수락·스토리 좋아요 알림도 띄우지 않아요
  }
  const name = users.user(userId).name;
  sounds.notification.play();
  if (type === "accepted")
  {
    toast.show(t("friends.nowFriends", { name }), { sub: t("friends.acceptedHint"), onTap: () => nav.openChat(userId) });
    nav.refresh();
  }
  if (type === "storyLike")
  {
    toast.show(t("friends.likedMyStory", { name }), { sub: t("friends.tapToSee"), onTap: () => nav.goTab("likes") });
  }
}
