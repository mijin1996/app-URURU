/* =========================================================
   [Data] ChatStore.js — 메시지 보관 (대화, 안 읽은 수, 입력 중, 저장, 24시간 삭제)
   ========================================================= */

import { TOPIC } from "../core/topics.js";
import { MESSAGE_LIFETIME } from "../core/config.js";
import { uid } from "../core/dom.js";
import { Result } from "../core/result.js";
import { t } from "../core/i18n/index.js";

export class ChatStore
{
  constructor(notifier, users, chats = {}, unread = {})
  {
    this.notifier = notifier;
    this.users = users;        // 신고한 사람의 안 읽은 수를 빼려고 필요
    this.chats = chats;        // userId → 메시지 배열
    this.unread = unread;      // userId → 안 읽은 개수
    this.typing = {};          // userId → 상대가 지금 입력 중인지
  }

  /* ---------- 읽기 ---------- */
  messages(id)
  {
    return this.chats[id] || [];
  }

  // 대화 목록 미리보기·순서에는 안내 줄(경고)은 빼요
  lastMessage(id)
  {
    const list = this.messages(id).filter((m) => m.type !== "notice");
    return list[list.length - 1] || null;
  }

  // 첫 대화인지: 주고받은 메시지가 하나도 없어요 (안내 줄 빼고)
  isFirstChat(id)
  {
    return !this.lastMessage(id);
  }

  // 누구와든 주고받은 메시지가 하나라도 있는지 (채팅 탭 수칙 타일)
  hasAnyChat()
  {
    return Object.keys(this.chats).some((id) => !!this.lastMessage(id));
  }

  lastAt(id)
  {
    const last = this.lastMessage(id);
    return last ? last.at : 0;
  }

  unreadOf(id)
  {
    return this.unread[id] || 0;
  }

  isTyping(id)
  {
    return !!this.typing[id];
  }

  // 하단 채팅 아이콘의 빨간 숫자
  totalUnread()
  {
    return Object.entries(this.unread)
      .filter(([id]) => !this.users.isReported(id))
      .reduce((sum, [, count]) => sum + count, 0);
  }

  /* ---------- 바꾸기 ---------- */
  addMessage(userId, message)
  {
    if (!this.chats[userId])
    {
      this.chats[userId] = [];
    }
    this.chats[userId].push(message);
    this.notifier.notify(TOPIC.chats, TOPIC.chat(userId));
  }

  // 서버에서 받은 메시지 넣기: 같은 id가 있으면 바뀐 칸(저장 등)만 덮어써요. 새 메시지면 true
  upsertMessage(userId, message)
  {
    const existing = this.messages(userId).find((m) => m.id === message.id);
    if (existing)
    {
      Object.assign(existing, message);
      this.notifier.notify(TOPIC.chat(userId));   // 있던 메시지가 바뀐 것(저장 등): 순서는 그대로라 그 친구만
      return false;
    }
    if (!this.chats[userId])
    {
      this.chats[userId] = [];
    }
    this.chats[userId].push(message);
    this.chats[userId].sort((a, b) => a.at - b.at);
    this.notifier.notify(TOPIC.chats, TOPIC.chat(userId));
    return true;
  }

  removeMessage(userId, messageId)
  {
    this.chats[userId] = this.messages(userId).filter((m) => m.id !== messageId);
    this.notifier.notify(TOPIC.chats, TOPIC.chat(userId));
  }

  // 채팅방 안에만 보이는 안내 줄 (경고 문구). 나에게만 보이고 서버로 가지 않아요
  addNotice(userId, text)
  {
    this.addMessage(userId, { id: `notice-${uid()}`, from: "system", type: "notice", text, at: Date.now() });
  }

  addUnread(userId)
  {
    this.unread[userId] = this.unreadOf(userId) + 1;
    this.notifier.notify(TOPIC.chats, TOPIC.chat(userId));
  }

  markRead(userId)
  {
    if (!this.unread[userId])
    {
      return;
    }
    this.unread[userId] = 0;
    this.notifier.notify(TOPIC.chats, TOPIC.chat(userId));
  }

  // 같은 값이면 알리지 않고, 바뀌어도 그 친구 줄·채팅방만 (상대가 글자를 칠 때마다 목록 전체를 다시 그리지 않게)
  setTyping(userId, isTyping)
  {
    if (!!this.typing[userId] === isTyping)
    {
      return;
    }
    this.typing[userId] = isTyping;
    this.notifier.notify(TOPIC.chat(userId));
  }

  // 두 번 터치로 저장 / 해제. 저장된 메시지는 24시간이 지나도 안 지워져요.
  toggleSave(userId, messageId)
  {
    const message = this.messages(userId).find((m) => m.id === messageId);
    if (!message)
    {
      return Result.fail(t("chat.messageNotFound"));
    }
    message.isSaved = !message.isSaved;
    this.notifier.notify(TOPIC.chat(userId));
    return Result.ok(message.isSaved);
  }

  // 24시간 지난 메시지 지우기. 지운 게 있으면 true
  removeExpired()
  {
    const changedIds = Object.keys(this.chats).filter((id) =>
    {
      const before = this.chats[id].length;
      this.chats[id] = this.chats[id].filter((m) => m.isSaved || Date.now() - m.at < MESSAGE_LIFETIME);
      return this.chats[id].length !== before;
    });
    if (changedIds.length)
    {
      this.notifier.notify(TOPIC.chats, ...changedIds.map(TOPIC.chat));
    }
    return changedIds.length > 0;
  }
}
