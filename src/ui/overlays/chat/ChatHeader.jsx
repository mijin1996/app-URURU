/* =========================================================
   [UI] ChatHeader.jsx — 채팅방 위쪽: 뒤로 / 상대 프로필 / 전화 / 차단 / 신고
   ---------------------------------------------------------
   상대가 입력 중이면 이름 아래에 "입력 중 ●●●", 아니면 거리만 (내 입력창 위에는 아무것도 안 띄움)
   상대 프로필은 프로필 동그라미를 눌렀을 때만 열려요 (이름·거리 글자는 눌러도 아무 일 없음)
   ========================================================= */

import { useCtx } from "../../app/AppContext.jsx";
import { Icon } from "../../common/Icon.jsx";
import { Avatar, kmText, TypingAnim } from "../../common/views.jsx";
import { t } from "../../../core/i18n/index.js";

const HEADER_AVATAR_SIZE = 38;

export function ChatHeader({ user, close })
{
  const { chats, nav, features } = useCtx();
  const back = () =>
  {
    close();
    nav.refresh();
  };
  return (
    <header className="chathead">
      {features.ownBackButtons && <button className="iconbtn" id="cBack" aria-label={t("common.back")} onClick={back}><Icon name="back" /></button>}
      <div className="who">
        {/* 채팅방에서 연 프로필은 버튼 없이 프로필만 */}
        <button className="avbtn" id="cWho" aria-label={t("friends.profileOf", { name: user.name })} onClick={() => nav.openProfile(user.id, { isFromChat: true })}>
          <Avatar user={user} size={HEADER_AVATAR_SIZE} />
        </button>
        <span><b>{user.name}</b><small id="cStatus">{chats.isTyping(user.id) ? <TypingAnim /> : kmText(user)}</small></span>
      </div>
      <button className="iconbtn" id="cCall" aria-label={t("chat.call")} onClick={() => nav.openCall(user.id)}><Icon name="phone" /></button>
      <button className="iconbtn danger" id="cBlock" aria-label={t("common.block")} onClick={() => nav.openBlock(user.id)}><Icon name="block" /></button>
      <button className="iconbtn danger" id="cReport" aria-label={t("common.report")} onClick={() => nav.openReport(user.id)}><Icon name="flag" /></button>
    </header>
  );
}
