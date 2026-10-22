/* =========================================================
   [UI] FriendList.jsx — 친구 목록 (친구 탭의 "친구 목록" 버튼)
   ========================================================= */

import { useState } from "react";
import { useCtx } from "../app/AppContext.jsx";
import { Icon } from "../common/Icon.jsx";
import { StoryRing } from "../common/StoryRing.jsx";
import { Avatar, joinDots } from "../common/views.jsx";
import { t } from "../../core/i18n/index.js";

const AVATAR_SIZE = 52;
const TITLE_STYLE = { flex: 1, fontSize: 17 };
const LIST_STYLE = { gap: 0, padding: "6px 0" };

export function FriendList({ close })
{
  const { users, nav, features } = useCtx();
  const [friends] = useState(() => users.friends());   // 연 순간의 목록 (원본과 같음)
  return (
    <div className="overlay" id="friendList">
      <header className="chathead">
        {features.ownBackButtons && <button className="iconbtn" id="flBack" aria-label={t("common.back")} onClick={close}><Icon name="back" /></button>}
        <b style={TITLE_STYLE}>{t("friends.listCount", { n: friends.length })}</b>
      </header>
      <div className="msgs" style={LIST_STYLE}>
        {friends.map((friend) => (
          <button key={friend.id} className="row" data-fprofile={friend.id} onClick={() => nav.openProfile(friend.id)}>
            <StoryRing user={friend}><Avatar user={friend} size={AVATAR_SIZE} /></StoryRing>
            <span className="mid"><span className="nm">{friend.name}</span><span className="pv">{joinDots(`@${friend.handle}`, friend.home)}</span></span>
          </button>
        ))}
      </div>
    </div>
  );
}
