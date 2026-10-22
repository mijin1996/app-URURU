/* =========================================================
   [Data] FakeServer.js — 진짜 서버 흉내 (시연용)
   ---------------------------------------------------------
   진짜 서버 없이도 앱을 눌러볼 수 있게, 상대방이 하는 일을 흉내 내요.
   - 메시지를 보내면 잠시 "입력 중"이었다가 자동 답장
   - 좋아요를 보내면 잠시 뒤 상대가 수락
   - 스토리를 올리면 친구가 좋아요
   - 친구 위치가 3초마다 조금씩 움직임
   ========================================================= */

import { DEMO, LOCATION_TICK_MS } from "../../core/config.js";
import { uid } from "../../core/dom.js";
import { Result } from "../../core/result.js";
import { ChatServer } from "./ChatServer.js";
import { t } from "../../core/i18n/index.js";

const AUTO_REPLIES = [t("demo.reply1"), t("demo.reply2"), t("demo.reply3"), t("demo.reply4"), t("demo.reply5"), t("demo.reply6"), t("demo.reply7")];
const STORY_LIKERS = 2;                      // 내 스토리에 좋아요를 누를 친구 수
const MAP_BOUNDS = { minX: 12, maxX: 88, minY: 18, maxY: 78 };   // 지도 밖으로 안 나가게 (%)
const MOVE_STEP = 4;                         // 한 번에 움직이는 최대 거리 (%)

export class FakeServer extends ChatServer
{
  constructor(users, chats, likes)
  {
    super();
    this.users = users;
    this.chats = chats;
    this.likes = likes;
  }

  // 가짜 서버에는 계정이 없어서, 이 기기에 저장된 가입 정보를 쓰라고 알려줘요
  signIn()
  {
    return Promise.resolve(Result.ok({ isLocal: true, profile: null }));
  }

  register(profile)
  {
    const isTaken = this.isHandleTaken(profile.handle);
    return Promise.resolve(isTaken ? Result.fail(t("check.handleTaken", { handle: profile.handle })) : Result.ok(profile));
  }

  // 가짜 서버는 이 기기 안에만 있어서 따로 올릴 곳이 없어요
  updateProfile(profile) {}
  updatePhotos(photos) {}
  setSharing(isSharing) {}
  setRegion(region, country) {}
  unfriend(userId) {}
  setMessageSaved(userId, messageId, isSaved) {}
  declineLike(fromId) {}
  report(userId, reason, message = null, extra = {}) {}
  block(userId) {}
  unblock(userId) {}
  deleteStory() {}
  sendStoryLike(userId, storyAt, isLiked) {}

  // 진짜 앱: 서버와 실시간 연결 시작 / 시연: 잠시 뒤 Teo에게서 첫 메시지가 와요
  connect()
  {
    setTimeout(() => this.fakeReply("teo", t("demo.firstMessage")), DEMO.firstMessageMs);
  }

  sendMessage(toId, message)
  {
    this.chats.addMessage(toId, { ...message, id: uid(), from: "me", at: Date.now() });
    this.fakeReply(toId);
  }

  // 진짜 앱: socket.emit("typing", toId) → 상대 목록/채팅방에 "입력 중" 애니메이션
  sendTyping(toId) {}

  sendPing(toId, isLoud)
  {
    this.fakeReply(toId, isLoud ? t("demo.ringReply") : t("demo.vibrateReply"));
  }

  // (시연) 잠시 뒤 상대가 "친구할까요?"를 눌러 수락
  sendLike(toId)
  {
    setTimeout(() =>
    {
      const isBlocked = this.users.isReported(toId) || this.likes.wasPassed(toId);
      if (isBlocked)
      {
        return;
      }
      this.users.addFriend(toId);
      this.emitEvent("accepted", toId);
      this.fakeReply(toId, t("demo.likeReply"));
    }, DEMO.likeAcceptMs);
  }

  // 친구가 됐다고 서버에 알림 → (시연) 상대가 인사 메시지를 보냄
  notifyFriendship(userId)
  {
    this.fakeReply(userId, t("demo.friendReply"));
  }

  // 아이디 중복 확인. 진짜 앱에서는 서버가 전체 사용자 중에서 찾아줘요
  isHandleTaken(handle)
  {
    return this.users.isHandleTaken(handle);
  }

  // 아이디로 사람 찾기. 진짜 앱에서는 서버가 전체 사용자 중에서 찾아줘요
  findUserByHandle(handle)
  {
    return Promise.resolve(this.users.findByHandle(handle));
  }

  // 회원탈퇴. 진짜 앱에서는 서버가 계정·사진·스토리를 지우고 아이디를 다시 쓸 수 있게 풀어줘요
  deleteAccount(handle)
  {
    return Promise.resolve(Result.ok(true));
  }

  // (시연) 친구 둘이 차례로 내 스토리에 좋아요
  publishStory(storyAt)
  {
    this.users.friends().slice(0, STORY_LIKERS).forEach((friend, i) =>
    {
      setTimeout(() =>
      {
        const story = this.users.me.story;
        const isSameStory = story && story.at === storyAt;   // 그사이 지웠거나 새로 올렸으면 무시
        if (!isSameStory)
        {
          return;
        }
        this.likes.receive(friend.id, "story", storyAt);
        this.emitEvent("storyLike", friend.id);
      }, DEMO.storyLikeMs * (i + 1));
    });
  }

  // 진짜 앱: 친구 폰의 GPS 좌표를 서버가 실시간으로 보내줌
  startLocationUpdates(onMove)
  {
    setInterval(() =>
    {
      this.users.friends().forEach((friend) =>
      {
        const x = clamp(friend.x + randomStep(), MAP_BOUNDS.minX, MAP_BOUNDS.maxX);
        const y = clamp(friend.y + randomStep(), MAP_BOUNDS.minY, MAP_BOUNDS.maxY);
        this.users.moveUser(friend, x, y);
      });
      onMove();
    }, LOCATION_TICK_MS);
  }

  // 상대가 잠시 입력하다가 답장하는 흉내
  fakeReply(fromId, text)
  {
    const reply = text || AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    setTimeout(() =>
    {
      if (this.users.isReported(fromId))
      {
        return;
      }
      this.chats.setTyping(fromId, true);
      setTimeout(() =>
      {
        this.chats.setTyping(fromId, false);
        this.chats.addMessage(fromId, { id: uid(), from: fromId, type: "text", text: reply, at: Date.now() });
        this.emitMessage(fromId);
      }, DEMO.replyTypingMs);
    }, DEMO.replyWaitMs);
  }
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const randomStep = () => (Math.random() - 0.5) * MOVE_STEP;
