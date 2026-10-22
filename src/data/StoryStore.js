/* =========================================================
   [Data] StoryStore.js — 스토리 규칙 (24시간, 남은 비율, 봤는지, 내가 누른 좋아요)
   ---------------------------------------------------------
   스토리 내용 자체는 각 사람 정보(user.story)에 붙어 있고,
   이 Store는 "스토리를 어떻게 다루는지" 규칙을 맡아요.
   ========================================================= */

import { TOPIC } from "../core/topics.js";
import { STORY_LIFETIME } from "../core/config.js";
import { Result } from "../core/result.js";
import { t } from "../core/i18n/index.js";

export class StoryStore
{
  constructor(notifier, users)
  {
    this.notifier = notifier;
    this.users = users;
    this.seenStoryAt = {};          // userId → 내가 본 스토리의 올린 시각 (새 스토리면 다시 "안 봄")
    this.likedStories = new Set();  // 내가 좋아요 누른 친구 스토리 "userId:올린시각"
  }

  /* ---------- 읽기 ---------- */
  // 올린 지 24시간이 안 된 스토리만 "있는" 것으로 봐요
  hasActive(user)
  {
    return !!(user && user.story && Date.now() - user.story.at < STORY_LIFETIME);
  }

  // 남은 비율 (1 = 방금 올림, 0 = 24시간 다 됨). 테두리 길이를 정할 때 씀
  leftRatio(user)
  {
    if (!user || !user.story)
    {
      return 0;
    }
    const leftMs = STORY_LIFETIME - (Date.now() - user.story.at);
    return Math.max(0, leftMs) / STORY_LIFETIME;
  }

  isSeen(user)
  {
    return !!user.story && this.seenStoryAt[user.id] === user.story.at;
  }

  friendsWithStory()
  {
    return this.users.friends().filter((u) => this.hasActive(u));
  }

  isLiked(user)
  {
    return !!user.story && this.likedStories.has(storyKey(user));
  }

  /* ---------- 바꾸기 ---------- */
  markSeen(user)
  {
    if (!user.story || this.seenStoryAt[user.id] === user.story.at)
    {
      return;
    }
    this.seenStoryAt[user.id] = user.story.at;
    this.notifier.notify(TOPIC.stories, TOPIC.user(user.id));
  }

  // 내 스토리 올리기. 올린 시각을 돌려줘서 서버에 알릴 때 씀
  publishMine(storyData)
  {
    this.users.me.story = { ...storyData, at: Date.now() };
    this.notifier.notify(TOPIC.stories, TOPIC.me, TOPIC.user(this.users.me.id));
    return this.users.me.story.at;
  }

  deleteMine()
  {
    this.users.me.story = null;
    this.notifier.notify(TOPIC.stories, TOPIC.me, TOPIC.user(this.users.me.id));
  }

  toggleLike(user)
  {
    if (!this.hasActive(user))
    {
      return Result.fail(t("story.storyGone"));
    }
    const key = storyKey(user);
    if (this.likedStories.has(key))
    {
      this.likedStories.delete(key);
    }
    else
    {
      this.likedStories.add(key);
    }
    this.notifier.notify(TOPIC.stories, TOPIC.user(user.id));
    return Result.ok(this.likedStories.has(key));
  }

  // 24시간 지난 스토리 지우기. 지운 게 있으면 true
  removeExpired()
  {
    const expired = [this.users.me, ...this.users.users].filter((user) => user.story && !this.hasActive(user));
    expired.forEach((user) =>
    {
      user.story = null;
    });
    if (expired.length)
    {
      this.notifier.notify(TOPIC.stories, TOPIC.me, ...expired.map((user) => TOPIC.user(user.id)));
    }
    return expired.length > 0;
  }
}

// 같은 사람이 새 스토리를 올리면 다른 스토리로 구분하려고 "사람:올린시각"을 열쇠로 써요
function storyKey(user)
{
  return `${user.id}:${user.story.at}`;
}
