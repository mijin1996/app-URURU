/* =========================================================
   [UI] FriendActions.js — 친구 관련 "행동" 모음 (좋아요 / 친구 수락 / 소리 울리기)
   ---------------------------------------------------------
   스와이프, 프로필, 친구 탭이 같은 행동을 하니까 한곳에 모았어요. (DRY)
   (좋아요 거절도 Store + 서버 두 곳에 알려야 해서 여기에 있어요)
   하는 일: 데이터 바꾸기(Store) + 서버에 알리기 + 결과를 알림 배너로 보여주기
   ========================================================= */

import { t } from "../../core/i18n/index.js";

export class FriendActions
{
  constructor(ctx)
  {
    this.ctx = ctx;
  }

  // 좋아요 보내기 (하트). 상대가 이미 나를 좋아했으면 바로 친구
  like(userId)
  {
    const { users, likes, server, toast, nav } = this.ctx;
    const user = users.user(userId);
    const result = likes.send(userId);
    if (!result.isOk)
    {
      toast.show(result.reason);
      return;
    }
    if (result.value === "matched")
    {
      toast.show(t("friends.matched", { name: user.name }), { sub: t("friends.tapToChat"), onTap: () => nav.openChat(userId) });
      server.notifyFriendship(userId);   // 서버에 "친구가 됐어요" 알리기
    }
    else
    {
      toast.show(t("friends.likeSentTo", { name: user.name }), { sub: isFirstLike() ? t("friends.likeSentHint") : "" });
      server.sendLike(userId);
    }
    nav.refresh();
  }

  // 친구 삭제: 친구만 끊고 채팅방·프로필을 닫아요 (차단과 달리 다시 친구가 될 수 있어요)
  unfriend(userId)
  {
    const { users, server, toast, nav, overlays } = this.ctx;
    const user = users.user(userId);
    if (!users.unfriend(userId))
    {
      return;
    }
    server.unfriend(userId);
    nav.closeChatIfWith(userId);
    overlays.closeKinds(["pview", "friendList"]);
    toast.show(t("friends.removedToast", { name: user.name }));
    nav.refresh();
  }

  // 받은 좋아요에 "친구할까요?"
  accept(userId)
  {
    const { users, likes, server, toast, nav } = this.ctx;
    likes.accept(userId);
    toast.show(t("friends.nowFriends", { name: users.user(userId).name }), { sub: t("friends.tapToChat"), onTap: () => nav.openChat(userId) });
    server.notifyFriendship(userId);
  }

  // 받은 좋아요 거절: 내 목록에서 빼고, 서버에서도 그 좋아요를 지워요
  decline(userId)
  {
    const { likes, server } = this.ctx;
    likes.decline(userId);
    server.declineLike(userId);
  }

  // 친구에게 "소리 울리기" — 친구가 허용했으면 무음이어도 뽀글뽀글, 아니면 진동 + 알림
  ping(user)
  {
    const { ping, sounds, toast } = this.ctx;
    const result = ping.send(user);
    if (!result.isOk)
    {
      toast.show(result.reason);
      return;
    }
    if (result.value.isLoud)
    {
      sounds.bubble.play();   // 친구 폰에서 나는 소리를 나도 한 번 들려줌 (미리듣기)
      toast.show(t("ring.rang", { name: user.name }), { sub: t("ring.bubbles") });
    }
    else
    {
      toast.show(t("ring.vibrated", { name: user.name }), { sub: t("ring.silentOff") });
    }
  }
}

const FIRST_LIKE_KEY = "ururu.firstLikeHint";   // 이 기기에서 좋아요 안내를 본 적 있는지

// 처음 한 번만 true (저장소가 막혀 있으면 매번 보여줘요)
function isFirstLike()
{
  try
  {
    if (localStorage.getItem(FIRST_LIKE_KEY))
    {
      return false;
    }
    localStorage.setItem(FIRST_LIKE_KEY, "shown");
    return true;
  }
  catch (error)
  {
    return true;
  }
}
