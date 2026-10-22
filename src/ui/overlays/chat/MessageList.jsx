/* =========================================================
   [UI] MessageList.jsx — 채팅방 메시지들
   ---------------------------------------------------------
   - 두 번 터치하면 저장/해제 (노란 테두리, 24시간이 지나도 안 지워짐)
   - 한 번 터치는 음성 메시지 재생(흉내)
   - 상대가 입력 중이면 마지막에 점 세 개 말풍선
   - 다시 그릴 때마다 맨 아래(최신 메시지)로
   - 말풍선 아래 시간 글자는 없어요
   - 받은 메시지를 길게 누르면 그 메시지로 신고 창 (채팅 이용 수칙 3번 "메시지 길게 누르기 > 신고")
   - 첫 대화 상대면(열 때 주고받은 메시지가 없으면) 맨 위에 채팅 이용 수칙 타일 (ChatRulesTile)
     X로 닫거나 메시지를 주고받으면 사라져요. 한 번이라도 대화한 상대는 다음부터 안 보여요
   클릭은 목록 하나에만 달고 closest(".bub[data-id]")로 찾아요 (이벤트 위임, 원본과 같음)
   ========================================================= */

import { useLayoutEffect, useRef, useState } from "react";
import { DOUBLE_TAP_MS, LONG_PRESS_MS } from "../../../core/config.js";
import { useCtx } from "../../app/AppContext.jsx";
import { ChatRulesTile } from "../../common/ChatRulesTile.jsx";
import { Dots } from "../../common/views.jsx";
import { MessageRow } from "./MessageBubble.jsx";
import { t } from "../../../core/i18n/index.js";

const VOICE_PLAY_MS = 2000;   // 음성 재생(흉내) 애니메이션 시간

export function MessageList({ userId, isFirstChat })
{
  const { chats, toast, nav, chatActions } = useCtx();
  const box = useRef(null);
  const lastTapAt = useRef({});                         // 메시지 id → 마지막으로 누른 시각
  const press = useRef({ timer: 0, isLong: false });    // 길게 누르기 (받은 메시지 신고)
  const [popped, setPopped] = useState({ id: null, count: 0 });   // 방금 저장/해제한 말풍선 (톡 튀는 효과)
  const [playingIds, setPlayingIds] = useState([]);
  const [isRulesClosed, setIsRulesClosed] = useState(false);
  const showRules = isFirstChat && !isRulesClosed && !chats.lastMessage(userId);

  // 그려지기 "전에" 내려서 깜빡임이 없어요
  useLayoutEffect(() =>
  {
    box.current.scrollTop = box.current.scrollHeight;
  });

  const toggleSave = (messageId) =>
  {
    const result = chatActions.toggleSave(userId, messageId);
    if (!result.isOk)
    {
      toast.show(result.reason);
      return;
    }
    toast.show(result.value ? t("chat.savedToast") : t("chat.unsavedToast"));
    setPopped((previous) => ({ id: messageId, count: previous.count + 1 }));
  };

  const playVoice = (messageId) =>
  {
    setPlayingIds((ids) => [...ids, messageId]);
    setTimeout(() => setPlayingIds((ids) => ids.filter((id) => id !== messageId)), VOICE_PLAY_MS);
  };

  // 받은 메시지를 길게 누르면 신고 창. 손을 떼면 그 뒤에 오는 클릭(저장)은 건너뛰어요
  const cancelPress = () => clearTimeout(press.current.timer);
  const onPressStart = (event) =>
  {
    const bubble = event.target.closest(".m.them .bub[data-id]");
    press.current.isLong = false;
    cancelPress();
    if (!bubble)
    {
      return;
    }
    const message = chats.messages(userId).find((item) => item.id === bubble.dataset.id);
    press.current.timer = setTimeout(() =>
    {
      press.current.isLong = true;
      nav.openReport(userId, message);
    }, LONG_PRESS_MS);
  };

  const onBubbleTap = (event) =>
  {
    const bubble = event.target.closest(".bub[data-id]");
    if (!bubble || press.current.isLong)
    {
      press.current.isLong = false;
      return;
    }
    const id = bubble.dataset.id;
    const now = Date.now();
    const isDoubleTap = now - (lastTapAt.current[id] || 0) < DOUBLE_TAP_MS;
    if (isDoubleTap)
    {
      lastTapAt.current[id] = 0;
      toggleSave(id);
      return;
    }
    lastTapAt.current[id] = now;
    if (bubble.dataset.voice !== undefined)
    {
      playVoice(id);
    }
  };

  // key에 저장 횟수를 붙이면 그 말풍선만 새로 만들어져서 "톡" 효과가 매번 다시 나와요
  const rowKey = (message) => (message.id === popped.id ? `${message.id}:${popped.count}` : message.id);
  return (
    <div className="msgs" id="msgs" ref={box} onClick={onBubbleTap} onPointerDown={onPressStart} onPointerUp={cancelPress}
      onPointerLeave={cancelPress} onPointerCancel={cancelPress} onScroll={cancelPress} onContextMenu={(event) => event.preventDefault()}>
      {showRules && <ChatRulesTile id="chatRules" onClose={() => setIsRulesClosed(true)} />}
      {chats.messages(userId).map((message) => (
        <MessageRow key={rowKey(message)} message={message}
          isPopped={message.id === popped.id} isPlaying={playingIds.includes(message.id)} />
      ))}
      {chats.isTyping(userId) && <div className="m them"><div className="bub typingbub"><Dots /></div></div>}
    </div>
  );
}
