/* =========================================================
   [UI] ChatRow.jsx — 대화 목록 한 줄
   ---------------------------------------------------------
   미리보기 규칙 (CHAT-09): 입력 중 > 마지막 메시지 > "대화를 시작해 보세요"
   ========================================================= */

import { ago } from "../../../core/time.js";
import { memo } from "react";
import { useCtx } from "../../app/AppContext.jsx";
import { Avatar, TypingAnim } from "../../common/views.jsx";
import { TOPIC } from "../../../core/topics.js";
import { useChanges } from "../../hooks/useChanges.js";
import { t } from "../../../core/i18n/index.js";

const ROW_AVATAR_SIZE = 56;
const MESSAGE_LABELS = { photo: t("common.photo"), voice: t("chat.voiceMessage") };

// 마지막 메시지 → "나: 응 방금! · 5분"
export function lastMessagePreview(last)
{
  if (!last)
  {
    return t("chat.startConversation");
  }
  const body = MESSAGE_LABELS[last.type] || last.text;
  return t("chat.lastMessage", { me: last.from === "me" ? t("chat.mePrefix") : "", body, at: ago(last.at) });
}

// memo: 목록(ChatListScreen)이 다시 그려져도 이 줄은 자기 친구의 주제가 바뀔 때만 다시 그려요
// (친구가 많아져도 한 명의 메시지·입력 중이 다른 줄을 다시 그리지 않게)
export const ChatRow = memo(function ChatRow({ friend })
{
  const { chats, nav } = useCtx();
  useChanges(TOPIC.chat(friend.id), TOPIC.user(friend.id));
  const unread = chats.unreadOf(friend.id);
  const preview = chats.isTyping(friend.id) ? <TypingAnim /> : lastMessagePreview(chats.lastMessage(friend.id));
  return (
    <button className="row" data-chat={friend.id} onClick={() => nav.openChat(friend.id)}>
      <Avatar user={friend} size={ROW_AVATAR_SIZE} />
      <span className="mid"><span className="nm">{friend.name}</span><span className={`pv ${unread ? "new" : ""}`}>{preview}</span></span>
      {unread ? <span className="badge">{unread}</span> : null}
    </button>
  );
});
