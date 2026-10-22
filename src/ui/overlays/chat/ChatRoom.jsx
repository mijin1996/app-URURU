/* =========================================================
   [UI] ChatRoom.jsx — 채팅방 틀: 위쪽 + 메시지 + 입력창
   ---------------------------------------------------------
   원본 ChatRoom.js(240줄)는 혼자 다 했어요. 고칠 이유가 4가지라 4개로 나눴어요. (SRP)
     ChatHeader   뒤로 / 프로필 / 전화 / 신고
     MessageList  메시지 + 입력 중 + 두 번 터치 저장
     Composer     평소 입력창 ↔ 녹음 입력창
   이 친구의 주제(chat:id, user:id)만 구독해요. 다른 친구의 메시지로는 다시 그리지 않아요.
   "지금 이 방이 열려 있나?"는 OverlayStore가 알아요 (nav.isChatOpenWith).
   ========================================================= */

import { useEffect, useState } from "react";
import { useCtx } from "../../app/AppContext.jsx";
import { TOPIC } from "../../../core/topics.js";
import { useChanges } from "../../hooks/useChanges.js";
import { ChatHeader } from "./ChatHeader.jsx";
import { Composer } from "./Composer.jsx";
import { MessageList } from "./MessageList.jsx";

export function ChatRoom({ userId, close })
{
  const { users, chats } = useCtx();
  useChanges(TOPIC.chat(userId), TOPIC.user(userId));   // 이 친구의 메시지·입력 중·정보가 바뀔 때만
  // 열 때 한 번만 정해요: 첫 대화면 이번에 열려 있는 동안 계속 규칙 안내가 보여요
  const [isFirstChat] = useState(() => chats.isFirstChat(userId));

  useEffect(() =>
  {
    chats.markRead(userId);
  }, [userId]);

  return (
    <div className="overlay" id="chat">
      <ChatHeader user={users.user(userId)} close={close} />
      <MessageList userId={userId} isFirstChat={isFirstChat} />
      <Composer userId={userId} />
    </div>
  );
}
