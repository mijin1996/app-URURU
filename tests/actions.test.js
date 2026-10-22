/* =========================================================
   tests/actions.test.js — Controller(actions) 시험: 화면 없이 "입력 → Store·서버" 확인
   (Unity의 EditMode 시험처럼, 화면을 띄우지 않고 가짜 서버·가짜 배너로 시험해요)
   ========================================================= */

import { afterEach, describe, expect, it, vi } from "vitest";
import { ModerationStore } from "../src/data/ModerationStore.js";
import { ChatActions } from "../src/ui/actions/ChatActions.js";
import { MeActions } from "../src/ui/actions/MeActions.js";
import { SafetyActions } from "../src/ui/actions/SafetyActions.js";
import { NotificationSound } from "../src/core/sound/NotificationSound.js";
import { createWorld, memoryProfiles, setNow, START } from "./helpers.js";

afterEach(() =>
{
  vi.restoreAllMocks();
});

// 화면 쪽 부품(배너·창 이동·창 목록)은 가짜로 넣어요 (의존성 주입)
function createCtx()
{
  const world = createWorld();
  return {
    ...world,
    moderation: new ModerationStore(world.notifier, memoryProfiles()),
    features: { filterMessages: true },
    toast: { show: vi.fn() },
    nav: { showBan: vi.fn(), refresh: vi.fn(), closeChatIfWith: vi.fn(), isChatOpenWith: () => true },
    overlays: { closeKinds: vi.fn() },
    sounds: { toggle: { play: vi.fn() }, notification: new NotificationSound({ tone: vi.fn() }, "") }
  };
}

describe("ChatActions (보내기 · 경고 · 저장)", () =>
{
  it("규칙에 걸린 부분은 가려서 서버로 보내고, 1회째는 채팅창에 경고 줄", () =>
  {
    setNow(START);
    const ctx = createCtx();
    const send = vi.spyOn(ctx.server, "sendMessage");
    const isSent = new ChatActions(ctx).sendText("teo", "바카라 하러 갈래");
    expect(isSent).toBe(true);
    expect(send).toHaveBeenCalledWith("teo", { type: "text", text: "**** 하러 갈래", flags: ["gambling"] });
    expect(ctx.chats.messages("teo").at(-1).type).toBe("notice");
    expect(ctx.nav.showBan).not.toHaveBeenCalled();
  });

  it("2회째는 이용정지 화면, 정지 중에는 보내지 않는다", () =>
  {
    setNow(START);
    const ctx = createCtx();
    const actions = new ChatActions(ctx);
    actions.sendText("teo", "바카라");
    actions.sendText("teo", "바카라");
    expect(ctx.nav.showBan).toHaveBeenCalledTimes(1);
    const send = vi.spyOn(ctx.server, "sendMessage");
    expect(actions.sendText("teo", "안녕")).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it("빈 글은 보내지 않는다", () =>
  {
    const ctx = createCtx();
    expect(new ChatActions(ctx).sendText("teo", "   ")).toBe(false);
  });

  it("두 번 터치 저장은 Store와 서버에 같이", () =>
  {
    const ctx = createCtx();
    const save = vi.spyOn(ctx.server, "setMessageSaved");
    const messageId = ctx.chats.messages("teo")[0].id;
    const result = new ChatActions(ctx).toggleSave("teo", messageId);
    expect(result.isOk).toBe(true);
    expect(save).toHaveBeenCalledWith("teo", messageId, result.value);
  });
});

describe("SafetyActions (신고 · 차단 · 풀기)", () =>
{
  it("신고: Store·서버(그 메시지까지)·열린 창 닫기·배너", () =>
  {
    const ctx = createCtx();
    const report = vi.spyOn(ctx.server, "report");
    const message = { id: "m1", text: "나쁜 말", at: START };
    new SafetyActions(ctx).report("teo", "불쾌한 메시지", message);
    expect(ctx.users.reported.has("teo")).toBe(true);
    expect(report).toHaveBeenCalledWith("teo", "불쾌한 메시지", message);
    expect(ctx.nav.closeChatIfWith).toHaveBeenCalledWith("teo");
    expect(ctx.toast.show).toHaveBeenCalled();
  });

  it("차단했다가 풀면 차단 목록에서 빠진다", () =>
  {
    const ctx = createCtx();
    const actions = new SafetyActions(ctx);
    actions.block("teo");
    expect(ctx.users.blockedUsers().map((user) => user.id)).toContain("teo");
    actions.unblock("teo");
    expect(ctx.users.blockedUsers().map((user) => user.id)).not.toContain("teo");
  });
});

describe("MeActions (설정 토글 · 스토리)", () =>
{
  it("알림음 토글은 의미 있는 메서드로 바뀌고 '톡' 소리", () =>
  {
    const ctx = createCtx();
    new MeActions(ctx).toggleSound();
    expect(ctx.sounds.notification.isEnabled).toBe(false);
    expect(ctx.sounds.toggle.play).toHaveBeenCalledWith(false);
  });

  it("스토리 올리기·지우기는 Store와 서버에 같이", () =>
  {
    setNow(START);
    const ctx = createCtx();
    const publish = vi.spyOn(ctx.server, "publishStory");
    const remove = vi.spyOn(ctx.server, "deleteStory");
    const actions = new MeActions(ctx);
    actions.publishStory({ text: "안녕", img: "" });
    expect(publish).toHaveBeenCalledWith(START);
    actions.deleteStory();
    expect(remove).toHaveBeenCalled();
  });
});

describe("ChatStore.setTyping (같은 값이면 알리지 않기)", () =>
{
  it("입력 중 신호가 그대로면 화면을 다시 그리라고 하지 않는다", () =>
  {
    const world = createWorld();
    world.chats.setTyping("teo", true);
    const before = world.notifyCount();
    world.chats.setTyping("teo", true);
    expect(world.notifyCount()).toBe(before);
  });
});
