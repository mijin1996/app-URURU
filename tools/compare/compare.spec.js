/* =========================================================
   tools/compare/compare.spec.js — 같은 순서로 눌러보고 승인한 화면 사진과 비교
   ---------------------------------------------------------
   - 시계를 고정하고(page.clock) 무작위 수도 고정해서 매번 같은 화면이 나오게 해요
   - 폰 크기(390×844)와 PC 크기(1280×900) 두 번 찍어요
   - 친구 핀은 3초마다 무작위로 움직여서, 3초가 지난 장면에서는 핀을 숨기고 비교해요
   ========================================================= */

import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { expect, test as base } from "@playwright/test";

// appFile: 어떤 HTML을 열지 (playwright.config.js의 use에서 정함)
const test = base.extend({ appFile: ["dist/moyeo.html", { option: true }] });

const START_TIME = new Date("2026-10-13T12:00:00+09:00");
const SAVED_PROFILE = { handle: "mimi2026", name: "미미", birthDate: "2001-03-15", pingPermission: "granted" };
const AFTER_SPLASH_MS = 2200;
const HIDE_PINS = ".pin[data-id]{visibility:hidden!important}";
const SIZES = [
  { name: "phone", width: 390, height: 844 },
  { name: "pc", width: 1280, height: 900 }
];

// 작은 동작들 (원본과 React 버전 모두 같은 id·클래스를 써서 그대로 눌러요)
const wait = (ms) => async (page) => page.clock.runFor(ms);
const tap = (selector) => async (page) =>
{
  await page.click(selector);
  await page.clock.runFor(400);
};
const tab = (id) => tap(`.nav button[data-tab="${id}"]`);
const type = (selector, text) => async (page) => page.fill(selector, text);

const SCENES = [
  { name: "splash", startMs: 500 },
  { name: "signup", profile: null, startMs: 2400 },
  { name: "signup-taken", profile: null, startMs: 2400, steps: [type("#suHandle", "teo24"), type("#suName", "미미"), tap("#suGo")] },
  { name: "datepicker", profile: null, startMs: 2400, steps: [tap("#suBirth")] },
  { name: "home" },
  { name: "chat", steps: [tab("messages")] },
  { name: "swipe", steps: [tab("swipe")] },
  { name: "friends", steps: [tab("likes")] },
  { name: "me", steps: [tab("me")] },
  { name: "chatroom", steps: [tab("messages"), tap('[data-chat="andy"]')] },
  { name: "profile-stranger", steps: [tab("likes"), tap('[data-profile="ibrahim"]')] },
  { name: "profile-home", steps: [tap('.pin[data-id="seoyeon"]')] },
  { name: "story", steps: [tap('.pin[data-id="teo"]')] },
  { name: "report", steps: [tab("messages"), tap('[data-chat="teo"]'), tap("#cReport")] },
  { name: "palette", steps: [tab("me"), tap('[data-part="bg"]')] },
  { name: "friend-list", steps: [tab("likes"), tap("#friendsBtn")] },
  { name: "ping-guide", steps: [tab("me"), tap("#swPing")] },
  { name: "ping-ask", profile: { ...SAVED_PROFILE, pingPermission: "unknown" }, startMs: 3000 },
  { name: "search", steps: [tab("likes"), type("#friendSearch", "harin22"), tap("#friendSearchGo")] },
  { name: "swipe-empty", steps: [tab("swipe"), tap("#swYes"), wait(300), tap("#swNo"), wait(300), tap("#swYes"), wait(300), tap("#swNo"), wait(300)] },
  { name: "call", movingPins: true, steps: [tab("messages"), tap('[data-chat="teo"]'), tap("#cCall"), wait(4000)] },
  { name: "new-message-banner", movingPins: true, startMs: 8200 },
  { name: "story-likes", movingPins: true, steps: [tab("me"), type("#storyText", "안녕"), tap("#storyPost"), wait(7000), tab("likes")] }
];

async function openApp(page, appFile, scene)
{
  await page.clock.install({ time: START_TIME });
  const profile = scene.profile === undefined ? SAVED_PROFILE : scene.profile;
  await page.addInitScript((saved) =>
  {
    let seed = 42;   // 무작위 수 고정 (자동 답장 문구, 친구 위치)
    Math.random = () =>
    {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    if (saved)
    {
      localStorage.setItem("moyeo.profile", JSON.stringify(saved));
    }
  }, profile);
  await page.goto(pathToFileURL(resolve(appFile)).href);
  await page.clock.runFor(scene.startMs || AFTER_SPLASH_MS);
}

SIZES.forEach((size) =>
{
  SCENES.forEach((scene) =>
  {
    test(`${size.name} · ${scene.name}`, async ({ page, appFile }) =>
    {
      await page.setViewportSize(size);
      await openApp(page, appFile, scene);
      // 동작을 순서대로 하나씩 (앞 동작이 끝나야 다음 동작)
      await (scene.steps || []).reduce((done, step) => done.then(() => step(page)), Promise.resolve());
      // 움직이는 친구 핀은 숨기고 찍어요 (가리개는 핀 자리마다 위치가 달라서 안 맞음)
      if (scene.movingPins)
      {
        await page.addStyleTag({ content: HIDE_PINS });
      }
      await expect(page).toHaveScreenshot(`${size.name}-${scene.name}.png`);
    });
  });
});
