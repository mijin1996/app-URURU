/* =========================================================
   tests/helpers.js — 시험에서 같이 쓰는 도구
   ---------------------------------------------------------
   createWorld(): main.jsx와 같은 방법으로 data 부품을 만들어요 (화면 없이)
   setNow(ms):    Date.now()가 돌려줄 시각을 정해요 (시계 당기기)
   ========================================================= */

import { vi } from "vitest";
import { ChangeNotifier } from "../src/core/ChangeNotifier.js";
import { HOUR } from "../src/core/config.js";
import { AccountService } from "../src/data/AccountService.js";
import { ChatStore } from "../src/data/ChatStore.js";
import { FriendSearch } from "../src/data/FriendSearch.js";
import { LikeStore } from "../src/data/LikeStore.js";
import { PingService } from "../src/data/PingService.js";
import { createMe, createSampleChats, createSampleLikes, createSampleUsers } from "../src/data/sampleData.js";
import { StoryStore } from "../src/data/StoryStore.js";
import { UserStore } from "../src/data/UserStore.js";
import { FakeServer } from "../src/data/server/FakeServer.js";

export const START = Date.UTC(2026, 9, 13, 3, 0, 0);   // 시험 시작 시각 (아무 날이나 고정)

export function setNow(ms)
{
  vi.spyOn(Date, "now").mockReturnValue(ms);
}

// 저장소 흉내 (ProfileRepository와 같은 약속: load / save / clear)
export function memoryProfiles()
{
  let saved = null;
  return {
    load: () => (saved ? { isOk: true, value: saved } : { isOk: false, reason: "가입 정보가 없어요" }),
    save: (profile) =>
    {
      saved = profile;
    },
    clear: () =>
    {
      saved = null;
    },
    get saved()
    {
      return saved;
    }
  };
}

export function createWorld(now = START)
{
  const notifier = new ChangeNotifier();
  let notifyCount = 0;
  notifier.subscribe(() =>
  {
    notifyCount += 1;
  });
  const users = new UserStore(notifier, createMe(), createSampleUsers(now));
  users.me.handle = "mimi2026";
  users.me.name = "미미";
  users.me.birthDate = "2001-03-15";
  const chats = new ChatStore(notifier, users, createSampleChats(now), { seoyeon: 1 });
  const stories = new StoryStore(notifier, users);
  const likes = new LikeStore(notifier, users, createSampleLikes(now));
  const server = new FakeServer(users, chats, likes);
  const profiles = memoryProfiles();
  return {
    notifier, users, chats, stories, likes, server, profiles,
    account: new AccountService(users, profiles, server),
    ping: new PingService(server),
    friendSearch: new FriendSearch(server, users),
    notifyCount: () => notifyCount,
    hour: HOUR
  };
}
