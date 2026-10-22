/* =========================================================
   [UI] ChatListScreen.jsx — 채팅 탭: 스토리 줄 + 대화 목록
   ---------------------------------------------------------
   - 스토리 줄: 맨 앞 내 스토리, 뒤로 스토리를 올린 친구만 (StoryRow)
   - 대화 목록: 모든 친구가 프로필과 함께, 최근 대화 순 (ChatRow)
   - 채팅 이용 수칙 타일은 여기(채팅 목록)에는 없고 채팅방 안에만 보여요 (MessageList)
   ========================================================= */

import { useCtx } from "../../app/AppContext.jsx";
import { Icon } from "../../common/Icon.jsx";
import { ChatRow } from "./ChatRow.jsx";
import { StoryRow } from "./StoryRow.jsx";
import { TOPIC } from "../../../core/topics.js";
import { useChanges } from "../../hooks/useChanges.js";
import { t } from "../../../core/i18n/index.js";

export function ChatListScreen()
{
  useChanges(TOPIC.users, TOPIC.chats);   // 친구 목록·대화 순서가 바뀔 때만 (줄 안의 내용은 ChatRow가 따로)
  const { users, chats } = useCtx();
  const friends = users.friends().sort((a, b) => chats.lastAt(b.id) - chats.lastAt(a.id));
  return (
    <>
      <StoryRow />
      <div className="banner">
        <Icon name="bell" />
        <div><b>{t("chat.disappearNotice")}</b></div>
      </div>
      <h2 className="sect">{t("chat.title")}</h2>
      {friends.map((friend) => <ChatRow key={friend.id} friend={friend} />)}
    </>
  );
}
