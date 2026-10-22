/* =========================================================
   [UI] LikeRow.jsx — 친구 탭의 한 줄들
   ---------------------------------------------------------
   LikeRow:      나에게 온 좋아요 ("친구할까요?" / X 거절)
   StoryLikeRow: 내 스토리에 온 좋아요
   ProfileButton: 왼쪽 프로필 동그라미 (누르면 프로필)
   ========================================================= */

import { ago } from "../../../core/time.js";
import { useCtx } from "../../app/AppContext.jsx";
import { Icon } from "../../common/Icon.jsx";
import { Avatar } from "../../common/views.jsx";
import { t } from "../../../core/i18n/index.js";

const AVATAR_SIZE = 52;

export function ProfileButton({ user })
{
  const { nav } = useCtx();
  return (
    <button className="avbtn" data-profile={user.id} aria-label={t("friends.profileOf", { name: user.name })} onClick={() => nav.openProfile(user.id)}>
      <Avatar user={user} size={AVATAR_SIZE} />
    </button>
  );
}

export function LikeRow({ like })
{
  const { users, friendActions } = useCtx();
  const user = users.user(like.from);
  return (
    <div className="likerow">
      <ProfileButton user={user} />
      <div className="mid"><div className="nm">{`${user.name} `}<span>{user.age}</span></div></div>
      <button className="acceptbtn" data-accept={user.id} onClick={() => friendActions.accept(user.id)}>{t("friends.beFriends")}</button>
      <button className="iconbtn" data-pass={user.id} aria-label={t("friends.declineOf", { name: user.name })} onClick={() => friendActions.decline(user.id)}><Icon name="x" /></button>
    </div>
  );
}

export function StoryLikeRow({ like })
{
  const { users } = useCtx();
  const user = users.user(like.from);
  return (
    <div className="likerow">
      <ProfileButton user={user} />
      <div className="mid"><div className="nm">{user.name}</div><small>{t("friends.likedMyStoryAt", { at: ago(like.at) })}</small></div>
      <span className="minilike"><Icon name="heartFill" /></span>
    </div>
  );
}
