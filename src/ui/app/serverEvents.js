/* =========================================================
   [UI] serverEvents.js — 서버 연결 + 주기적으로 할 일 (앱이 시작될 때 한 번)
   ---------------------------------------------------------
   1. 서버 소식(새 메시지, 친구 수락) → 알림음 + 배너
   2. 3초마다 친구 위치, 15초마다 24시간 정리, 스와이프 사람 목록은 실시간 구독(진짜 서버)
   3. 위치는 앱을 쓰는 동안만: 화면에서 내려가면 지우고 돌아오면 다시 올려요
   원본 App.connectOnce / onNewMessage / onServerEvent와 같은 일을 해요.
   ========================================================= */

import { EXPIRE_CHECK_MS } from '../../core/config.js';
import { t } from '../../core/i18n/index.js';

const LOCATION_REFRESH_MS = 5 * 60 * 1000; // 위치 다시 쓰기 (서버 자동 삭제 10분보다 짧게)

export function connectServer(ctx) {
  const { server, chats, locationTick, nav } = ctx;
  server.onMessage((fromId) => onNewMessage(ctx, fromId));
  server.onEvent((type, userId) => onServerEvent(ctx, type, userId));
  server.connect();
  server.startLocationUpdates(() => locationTick.emit()); // 핀만 다시 그림 (MapPin이 구독)
  // 위치는 앱을 쓰는 동안만 (2026-11-03 미미): 켤 때 · 화면으로 돌아올 때 올리고, 화면에서 내려가면 바로 지워요.
  // 켜 있는 동안 5분마다 다시 써서 서버 자동 삭제(10분 뒤, RealServer LOCATION_TTL_MS)를 미뤄요.
  // 앱이 살아 있는 동안 한 번만 다는 이벤트·타이머라 정리하지 않아요
  if (server.savesRegion) {
    ctx.meActions.refreshRegion();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        server.clearLocation();
      } else {
        ctx.meActions.refreshRegion();
      }
    });
    window.addEventListener('pagehide', () => server.clearLocation());
    setInterval(() => !document.hidden && ctx.meActions.refreshRegion(), LOCATION_REFRESH_MS);
  }
  // 스와이프: 가입한 사람 목록을 실시간 구독 (진짜 서버만 있는 기능, 스와이프를 끈 빌드는 안 불러와요)
  if (ctx.features.canSwipe && server.loadSwipeUsers) {
    server.loadSwipeUsers(); // 실시간 구독 한 번 (새로 가입한 사람은 생기고, 탈퇴한 사람은 사라져요)
  }
  setInterval(() => {
    if (chats.removeExpired()) {
      nav.refresh();
    }
  }, EXPIRE_CHECK_MS);
}

// 새 메시지: 보고 있는 방이면 그냥 읽음, 아니면 빨간 숫자 + 알림음 + 누르면 그 채팅방으로
function onNewMessage(ctx, fromId) {
  const { users, chats, sounds, toast, nav, moderation } = ctx;
  if (moderation.isBanned()) {
    return; // 이용 제한 중에는 알림도 띄우지 않아요 (제한 안내 화면만)
  }
  if (nav.isChatOpenWith(fromId)) {
    return;
  }
  const last = chats.lastMessage(fromId);
  chats.addUnread(fromId);
  sounds.notification.play();
  toast.show(users.user(fromId).name, {
    sub: last ? last.text : t('chat.newMessage'),
    onTap: () => nav.openChat(fromId),
  });
}

function onServerEvent(ctx, type, userId) {
  const { users, sounds, toast, nav } = ctx;
  // 진짜 서버의 문제 소식: userId 자리에 이유 글이 와요 (인터넷 끊김, 서버가 거절함)
  if (type === 'offline' || type === 'error') {
    toast.show(userId);
    return;
  }
  // 탈퇴한 사람: 그 사람과 열린 채팅방·프로필을 닫고 다시 그려요 (Store에서는 이미 빠졌어요)
  if (type === 'gone') {
    nav.closeChatIfWith(userId);
    ctx.overlays.closeKinds(['pview']);
    nav.refresh();
    return;
  }
  // 서버가 이용 제한을 걸었어요 (다른 기기에서 받은 경고까지 합쳐서)
  if (type === 'banned') {
    nav.showBan();
    return;
  }
  if (ctx.moderation.isBanned()) {
    return; // 이용 제한 중에는 친구 수락 알림도 띄우지 않아요
  }
  const name = users.user(userId).name;
  sounds.notification.play();
  if (type === 'accepted') {
    toast.show(t('friends.nowFriends', { name }), {
      sub: t('friends.acceptedHint'),
      onTap: () => nav.openChat(userId),
    });
    nav.refresh();
  }
}
