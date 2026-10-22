/* =========================================================
   [UI] MapPin.jsx — 지도 위 핀 (위치 공유를 켠 친구 / 나)
   ---------------------------------------------------------
   ctx.locationTick(3초마다)을 구독해서 핀만 다시 그려요.
   left/top만 바뀌고, CSS의 transition 덕분에 부드럽게 움직여요 (원본 updatePins와 같은 결과).
   ========================================================= */

import { useCtx } from "../../app/AppContext.jsx";
import { StoryRing } from "../../common/StoryRing.jsx";
import { Avatar, joinDots, kmText } from "../../common/views.jsx";
import { useStore } from "../../hooks/useStore.js";
import { t } from "../../../core/i18n/index.js";

const ME_SIZE = 58;
const FRIEND_SIZE = 46;
const FROM_HOME = { source: "home" };   // 프로필/스토리에 "홈에서 열었음"을 알려줌

const position = (user) => ({ left: `${user.x}%`, top: `${user.y}%` });

// 친구 핀: 46px 프로필 + "이름 · 거리"
export function MapPin({ user })
{
  const { locationTick, stories, nav } = useCtx();
  useStore(locationTick);
  const open = () =>
  {
    if (stories.hasActive(user))
    {
      nav.openStory(user.id, FROM_HOME);
    }
    else
    {
      nav.openProfile(user.id, FROM_HOME);
    }
  };
  return (
    <button className="pin" data-id={user.id} style={position(user)} aria-label={user.name} onClick={open}>
      <StoryRing user={user}><Avatar user={user} size={FRIEND_SIZE} /></StoryRing><span className="tag">{joinDots(user.name, kmText(user))}</span>
    </button>
  );
}

export function MyPin()
{
  const { users, stories, nav, toast } = useCtx();
  const { me } = users;
  const open = () =>
  {
    if (stories.hasActive(me))
    {
      nav.openStory("me");
    }
    else
    {
      toast.show(t("map.postStoryHint"));
    }
  };
  return (
    <button className={`pin me ${me.isSharing ? "" : "ghost"}`} style={position(me)} aria-label={t("app.me")} onClick={open}>
      <StoryRing user={me}><Avatar user={me} size={ME_SIZE} /></StoryRing><span className="tag">{t("map.mePin", { name: me.name })}</span>
    </button>
  );
}
