/* =========================================================
   tests/server.test.js — 진짜 서버(RealServer)의 구독 시험 (Firebase 없이 가짜 Firestore로)
   ---------------------------------------------------------
   친구가 1명이든 300명이든 구독 수가 같은지 (2026-10-20 성능),
   한 질문으로 받은 메시지·입력 중·친구 소식이 맞는 친구에게 들어가는지 확인해요.
   (보안 규칙 자체는 미미 PC의 에뮬레이터로 확인: docs/guides/firebase-setup-guide.md 5-1)
   ========================================================= */

import { afterEach, describe, expect, it, vi } from "vitest";
import { ModerationStore } from "../src/data/ModerationStore.js";
import { RealServer } from "../src/data/server/RealServer.js";
import { typingLeftMs } from "../src/data/server/firebase/userMapper.js";
import { createWorld, memoryProfiles, setNow, START } from "./helpers.js";

afterEach(() =>
{
  vi.restoreAllMocks();
});

const ME = "uidme";

// RealServer는 인터넷 끊김을 window에서 들어요 (Vitest는 jsdom이 있고, 없는 곳에서도 돌게)
globalThis.window = globalThis.window || { addEventListener: () => {} };

// 가짜 Firestore: 질문은 글자로 만들고, onSnapshot은 기억만 해 둬요 (시험이 직접 소식을 흘려보냄)
function fakeFirestore()
{
  const listeners = [];
  const path = (...parts) => parts.join("/");
  const firestore =
  {
    collection: (db, ...parts) => path(...parts),
    collectionGroup: (db, id) => `group:${id}`,
    doc: (db, ...parts) => path(...parts),
    query: (base, ...filters) => [base, ...filters].join(" "),
    where: (field, op, value) => `${field}${op}${value}`,
    orderBy: (field) => `order:${field}`,
    onSnapshot: (target, onNext) =>
    {
      listeners.push({ target, onNext });
      return () => {};
    },
    getDoc: async (target) => ({ exists: () => true, data: () => ({ handle: target.split("/")[1], name: target.split("/")[1] }) })
  };
  return { firestore, listeners, find: (text) => listeners.find((l) => l.target.includes(text)) };
}

// 기본은 서버 함수 모드(feeds). 무료 모드를 시험할 때는 env로 { VITE_SERVER_FUNCTIONS: "false" }
const FUNCTIONS_ENV = { VITE_SERVER_FUNCTIONS: "true" };

function createServer(env = FUNCTIONS_ENV)
{
  const world = createWorld();
  const moderation = new ModerationStore(world.notifier, memoryProfiles());
  const server = new RealServer({ users: world.users, chats: world.chats, likes: world.likes, moderation }, env, null);
  const fake = fakeFirestore();
  server.sdk = { firestore: fake.firestore };
  server.fb = { db: "db" };
  server.uid = ME;
  server.connect();
  return { server, world, fake };
}

// 컬렉션 소식 한 묶음 (docChanges)
function changes(list)
{
  return { docChanges: () => list.map(({ type = "added", id, data }) => ({ type, doc: { id, data: () => data } })) };
}

// 친구 300명이 한꺼번에 생겼을 때 늘어난 구독 수
async function listenersAdded(env)
{
  const { fake } = createServer(env);
  const before = fake.listeners.length;
  const friendships = fake.find("friendships");
  const friends = Array.from({ length: 300 }, (_, i) => `f${String(i).padStart(3, "0")}`);
  friendships.onNext(changes(friends.map((id) => ({ id: [ME, id].sort().join("_"), data: { users: [ME, id].sort(), by: id } }))));
  await Promise.resolve();
  return fake.listeners.length - before;
}

describe("RealServer 구독 수 (친구 수와 상관없이 같게)", () =>
{
  it("서버 함수 모드: 친구가 300명이 돼도 구독이 늘지 않는다", async () =>
  {
    expect(await listenersAdded(FUNCTIONS_ENV)).toBe(0);
  });

  it("무료 모드(VITE_SERVER_FUNCTIONS 없음): 친구 한 명당 정보·스토리 구독 2개", async () =>
  {
    expect(await listenersAdded({})).toBe(600);
  });

  it("모든 대화는 질문 하나(members), 입력 중은 내 문서 하나, 친구 소식은 목록 하나", () =>
  {
    const { fake } = createServer();
    expect(fake.find(`group:messages membersarray-contains${ME}`)).toBeTruthy();
    expect(fake.find(`typing/${ME}`)).toBeTruthy();
    expect(fake.find(`feeds/${ME}/friends`)).toBeTruthy();
  });
});

describe("RealServer 받은 소식을 맞는 친구에게", () =>
{
  it("메시지는 members에서 상대를 찾아 그 친구 대화에 넣는다", () =>
  {
    setNow(START);
    const { world, fake } = createServer();
    const messages = fake.find("group:messages");
    messages.onNext(changes([]));   // 처음 불러오기 끝
    const notified = vi.fn();
    world.notifier.subscribe(notified);
    messages.onNext(changes([{ id: "m1", data: { from: "teo", to: ME, members: [ME, "teo"].sort(), type: "text", text: "안녕", at: START } }]));
    expect(world.chats.lastMessage("teo").text).toBe("안녕");
    expect(notified).toHaveBeenCalledWith(expect.arrayContaining(["chat:teo"]));
  });

  it("입력 중은 그 친구만 켜지고, 시간이 지난 칸은 꺼진다", () =>
  {
    setNow(START);
    const { world, fake } = createServer();
    fake.find(`typing/${ME}`).onNext({ exists: () => true, data: () => ({ teo: START - 500, andy: START - 10000 }) });
    expect(world.chats.isTyping("teo")).toBe(true);
    expect(world.chats.isTyping("andy")).toBe(false);
  });

  it("친구 소식(feeds)은 정보와 스토리를 같이 넣는다", () =>
  {
    const { world, fake } = createServer();
    fake.find(`feeds/${ME}/friends`).onNext(changes([{ id: "newfriend", data: { profile: { handle: "newbie", name: "새친구", age: 25 }, story: { text: "hi", at: START } } }]));
    const user = world.users.user("newfriend");
    expect(user.name).toBe("새친구");
    expect(user.isFriend).toBe(true);
    expect(user.story.text).toBe("hi");
  });

  it("typingLeftMs: 마지막으로 친 뒤 남은 시간", () =>
  {
    expect(typingLeftMs({ a: 1000, b: 0 }, 2000, 3000)).toEqual({ a: 2000, b: 1000 });
    expect(typingLeftMs({ a: 0 }, 5000, 3000)).toEqual({ a: 0 });
  });
});
