/* =========================================================
   tests/ui.test.js — React 없이 시험할 수 있는 UI 규칙
   (덮개 창 목록, 알림 배너, 스와이프 빈 화면 문구, 스토리 글자 모양, 빌드별 기능 표)
   ========================================================= */

import { existsSync, readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MINUTE } from "../src/core/config.js";
import { featuresFor } from "../src/platform/features.js";
import { Observable } from "../src/ui/app/Observable.js";
import { OverlayStore } from "../src/ui/app/OverlayStore.js";
import { storyTextStyle } from "../src/ui/common/storyStyle.js";
import { ToastStore } from "../src/ui/common/ToastStore.js";
import { swipeEmptyText } from "../src/ui/screens/swipe/SwipeEmpty.jsx";
import { START } from "./helpers.js";

afterEach(() =>
{
  vi.useRealTimers();
});

describe("Observable", () =>
{
  it("emit하면 버전이 오르고, 구독을 끊으면 더는 안 불린다", () =>
  {
    const observable = new Observable();
    const listener = vi.fn();
    const unsubscribe = observable.subscribe(listener);
    observable.emit();
    expect(observable.getVersion()).toBe(1);
    unsubscribe();
    observable.emit();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("OverlayStore (SHELL-40~43)", () =>
{
  const open = (store, kind) => store.open({ kind, render: () => null });

  it("연 순서대로 쌓이고 closeTop은 맨 위만 닫는다", () =>
  {
    const store = new OverlayStore();
    open(store, "chat");
    open(store, "pview");
    open(store, "scrim");
    expect(store.items.map((item) => item.kind)).toEqual(["chat", "pview", "scrim"]);
    expect(store.closeTop()).toBe(true);
    expect(store.items.map((item) => item.kind)).toEqual(["chat", "pview"]);
  });

  it("closeKinds는 그 종류만, 창이 없으면 closeTop은 false", () =>
  {
    const store = new OverlayStore();
    open(store, "chat");
    open(store, "story");
    open(store, "pview");
    store.closeKinds(["story", "pview"]);
    expect(store.items.map((item) => item.kind)).toEqual(["chat"]);
    store.closeKinds(["chat"]);
    expect(store.closeTop()).toBe(false);
  });

  it("open이 돌려준 함수로 그 창만 닫는다", () =>
  {
    const store = new OverlayStore();
    const closeFirst = open(store, "scrim");
    open(store, "scrim");
    closeFirst();
    expect(store.items).toHaveLength(1);
  });
});

describe("ToastStore (SHELL-30~34)", () =>
{
  it("두 번 연달아 show하면 마지막 것 하나만 남고, 시간이 지나면 빈다", () =>
  {
    vi.useFakeTimers();
    const toast = new ToastStore();
    toast.show("첫째");
    toast.show("둘째", { onTap: () => {} });
    expect(toast.current.title).toBe("둘째");
    vi.advanceTimersByTime(2400);   // 첫째 배너의 시간이 지나도 둘째는 남아요
    expect(toast.current.title).toBe("둘째");
    vi.advanceTimersByTime(1600);   // 누를 수 있는 배너는 4초
    expect(toast.current).toBe(null);
  });
});

describe("swipeEmptyText (SWP-41~43)", () =>
{
  it("10명 다 봄", () =>
  {
    expect(swipeEmptyText(0, START + 30 * MINUTE, START)).toEqual({
      reason: "10분에 10명까지 볼 수 있어요.", when: "30분 뒤에 다시 볼 수 있어요."
    });
  });
  it("사람은 없고 X 한 사람이 돌아올 예정", () =>
  {
    expect(swipeEmptyText(3, START + 90 * 1000, START).when).toBe("2분 뒤에 다시 볼 수 있어요.");
  });
  it("아무도 없음", () =>
  {
    expect(swipeEmptyText(3, 0, START)).toEqual({
      reason: "프로필을 다 봤어요.", when: "새로운 사람이 생기면 보여드릴게요."
    });
  });
});

describe("storyTextStyle (STO-50~53)", () =>
{
  it("배경 상자·폰트 크기·테두리 그림자를 원본과 같은 값으로 계산한다", () =>
  {
    const style = storyTextStyle({ text: "안녕", bg: "#ff8a3d", bgSize: 10, textColor: "#ffffff", textSize: 30, stroke: "#131218", strokeWidth: 2 }, 0.4);
    expect(style.fontSize).toBe("12.0px");
    expect(style.padding).toBe("4.0px 5.6px");
    expect(style.borderRadius).toBe("4.8px");
    expect(style.textShadow.split(",")).toHaveLength(16);
    expect(style.textShadow.startsWith("0.8px 0.0px 0 #131218")).toBe(true);
  });
  it("테두리·배경이 없으면 그림자 none, 상자 없음", () =>
  {
    const style = storyTextStyle({ text: "안녕", bg: "", stroke: "", strokeWidth: 0 });
    expect(style.textShadow).toBe("none");
    expect(style.background).toBeUndefined();
  });
});

describe("features (빌드 대상별 기능)", () =>
{
  it("앱인토스는 스와이프와 위치가 꺼져 있고, 나머지는 켜져 있다", () =>
  {
    expect(featuresFor("toss")).toEqual({
      canTryAnonymous: false, canSwipe: false, canShareLocation: false, canSendPhoto: false, filterMessages: true,
      askPingOnStart: false, lightThemeOnly: true, ownBackButtons: false
    });
    expect(featuresFor("android")).toMatchObject({ askPingOnStart: true, lightThemeOnly: false, ownBackButtons: true });
    expect(featuresFor("android").canSwipe).toBe(true);
    expect(featuresFor("web").canSwipe).toBe(true);
    expect(featuresFor("모르는값")).toEqual(featuresFor("web"));
  });
});

describe("OverlayStore.closeTop (토스·안드로이드 뒤로 버튼)", () =>
{
  it("맨 위 창을 닫고, 닫을 창이 없으면 false", () =>
  {
    const overlays = new OverlayStore();
    overlays.open({ kind: "chat", render: () => null });
    overlays.open({ kind: "pview", render: () => null });
    expect(overlays.closeTop()).toBe(true);
    expect(overlays.has((item) => item.kind === "pview")).toBe(false);
    expect(overlays.closeTop()).toBe(true);
    expect(overlays.closeTop()).toBe(false);
  });

  it("이용정지 안내처럼 남겨야 하는 창은 닫지 않는다", () =>
  {
    const overlays = new OverlayStore();
    overlays.open({ kind: "ban", render: () => null });
    expect(overlays.closeTop(["ban"])).toBe(true);
    expect(overlays.has((item) => item.kind === "ban")).toBe(true);
  });
});

describe("채팅 이용 수칙 (docs/policy/chat-rules.md)", () =>
{
  const POLICY_DIR = new URL("../docs/policy/", import.meta.url);
  const text = readFileSync(new URL("chat-rules.md", POLICY_DIR), "utf8");

  it("미미가 정한 다섯 항목과 신고·차단 경로가 들어 있다", () =>
  {
    ["1. 금지 행위", "2. 불법촬영물 경고", "3. 신고·차단", "4. 개인정보 보호", "5. 제재 기준"].forEach((title) =>
    {
      expect(text).toContain(title);
    });
    expect(text).toContain("[메시지 길게 누르기 > 신고]");
    expect(text).toContain("[프로필 > 차단]");
  });

  it("링크한 정책 문서가 모두 있다", () =>
  {
    const linked = [...text.matchAll(/\]\(([^)]+\.md)\)/g)].map((match) => match[1]);
    expect(linked).toEqual([]);   // 2026-10-20: 수칙 글에서 다른 문서 링크를 뺌 (정책 문서는 terms·chat-rules 두 개)
    linked.forEach((file) =>
    {
      // new URL(`…${file}`, import.meta.url) 꼴은 Vite가 폴더 전체 불러오기로 바꿔서, 폴더 주소를 먼저 만들어요
      expect(existsSync(new URL(file, POLICY_DIR))).toBe(true);
    });
  });
});
