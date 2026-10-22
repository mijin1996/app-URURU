/* =========================================================
   tools/store-images/make-store-images.mjs — 스토어에 올릴 이미지를 실제 앱 화면으로 찍기
   ---------------------------------------------------------
   npm run store:images
     (먼저 npm run build:single 과 npm run build:toss 로 두 빌드를 만들어 두세요.
      처음 한 번: npx playwright install chromium)

   만드는 것 (덮어써요):
   store/apps-in-toss/images/
     logo-600.png                 앱 로고 600×600 PNG (배경색 꽉 참, 투명·둥근 모서리 없음)
     screenshot-1~4.png           세로 스크린샷 636×1048 PNG 4장 (토스 빌드: 채팅·친구·나만)
     screenshot-landscape.png     가로 스크린샷 1504×741 PNG 1장
   store/google-play/images/
     icon-512.png                 앱 아이콘 512×512 PNG (꽉 찬 사각형. 둥근 모양은 구글 플레이가 알아서 잘라요)
     feature-graphic.jpg          그래픽 이미지 1024×500 (알파 없음)
     phone-1~6.jpg                휴대전화 스크린샷 1080×1920 (9:16, 알파 없음, 원래 기능 전부 켠 빌드)

   화면은 시연 데이터(가짜 사람)로 찍어요. 시계·무작위 수를 고정해서 매번 같은 사진이 나와요.
   다른 HTML로 찍고 싶으면: node tools/store-images/make-store-images.mjs --toss <파일> --web <파일>
   ========================================================= */

import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const option = (name, fallback) =>
{
  const index = args.indexOf(name);
  return index >= 0 ? resolve(args[index + 1]) : join(ROOT, fallback);
};
const TOSS_HTML = option("--toss", "dist-toss/index.html");
const WEB_HTML = option("--web", "dist/moyeo.html");
const BRAND_HTML = join(ROOT, "tools", "store-images", "brand.html");
const TOSS_DIR = join(ROOT, "store", "apps-in-toss", "images");
const PLAY_DIR = join(ROOT, "store", "google-play", "images");

const START_TIME = new Date("2026-10-15T12:00:00+09:00");
const PROFILE = { handle: "mimi2026", name: "미미", birthDate: "2001-03-15", pingPermission: "granted" };
const AFTER_SPLASH_MS = 2400;
const HIDE_TOAST = ".toast{display:none!important}";

// 장면: 어떤 탭을 누르고 어디를 누를지 (id·클래스는 tools/compare와 같아요)
const tab = (id) => ({ click: `.nav button[data-tab="${id}"]` });
const TOSS_SCENES = [
  { file: "screenshot-1.png", steps: [tab("messages")] },
  { file: "screenshot-2.png", steps: [tab("messages"), { click: '[data-chat="teo"]' }] },
  { file: "screenshot-3.png", steps: [tab("likes")] },
  { file: "screenshot-4.png", steps: [tab("me")] }
];
const PLAY_SCENES = [
  { file: "phone-1.jpg", steps: [] },
  { file: "phone-2.jpg", steps: [tab("messages")] },
  { file: "phone-3.jpg", steps: [tab("messages"), { click: '[data-chat="teo"]' }] },
  { file: "phone-4.jpg", steps: [tab("swipe")] },
  { file: "phone-5.jpg", steps: [tab("likes")] },
  { file: "phone-6.jpg", steps: [{ click: '.pin[data-id="teo"]' }, { wait: 600 }] }
];

async function openApp(browser, html, viewport, scale)
{
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale, colorScheme: "light" });
  await page.clock.install({ time: START_TIME });
  await page.addInitScript((profile) =>
  {
    let seed = 42;
    Math.random = () =>
    {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    localStorage.setItem("moyeo.profile", JSON.stringify(profile));
  }, PROFILE);
  await page.goto(pathToFileURL(html).href);
  await page.clock.runFor(AFTER_SPLASH_MS);
  await page.addStyleTag({ content: HIDE_TOAST });
  return page;
}

async function shootScenes(browser, html, scenes, dir, viewport, scale, type)
{
  const shots = [];
  for (const scene of scenes)   // 장면마다 새로 열어서 서로 영향이 없게 (순서대로 찍어야 해서 for)
  {
    const page = await openApp(browser, html, viewport, scale);
    for (const step of scene.steps)
    {
      if (step.click)
      {
        await page.click(step.click);
      }
      await page.clock.runFor(step.wait || 500);
      await page.waitForTimeout(700);   // 창이 밀려 들어오는 CSS 움직임은 실제 시간으로 끝나서 기다려요
    }
    const path = join(dir, scene.file);
    await page.screenshot({ path, type, ...(type === "jpeg" ? { quality: 92 } : {}) });
    shots.push(path);
    await page.close();
  }
  return shots;
}

async function shootBrand(browser, kind, size, path, options = {})
{
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  await page.goto(`${pathToFileURL(BRAND_HTML).href}?kind=${kind}`);
  await page.waitForTimeout(800);   // 글꼴
  await page.screenshot({ path, ...options });
  await page.close();
}

// 가로 스크린샷: 세로 화면 3장을 브랜드 색 바탕에 나란히
async function shootLandscape(browser, shots, path)
{
  const page = await browser.newPage({ viewport: { width: 1504, height: 741 } });
  // 빈 페이지에서는 file:// 그림을 못 읽어서, 그림 내용을 글자(base64)로 넣어요
  const images = shots.map((shot) => `<img src="data:image/png;base64,${readFileSync(shot).toString("base64")}">`).join("");
  await page.setContent(`<style>
    body{margin:0;height:741px;display:flex;align-items:center;justify-content:center;gap:56px;background:#7a5cff}
    img{height:640px;border-radius:28px;box-shadow:0 16px 40px rgba(0,0,0,.25)}
  </style>${images}`);
  await page.waitForTimeout(300);
  await page.screenshot({ path });
  await page.close();
}

mkdirSync(TOSS_DIR, { recursive: true });
mkdirSync(PLAY_DIR, { recursive: true });
const browser = await chromium.launch();
const tossShots = await shootScenes(browser, TOSS_HTML, TOSS_SCENES, TOSS_DIR, { width: 318, height: 524 }, 2, "png");
await shootLandscape(browser, tossShots.slice(0, 3), join(TOSS_DIR, "screenshot-landscape.png"));
await shootBrand(browser, "icon", { width: 600, height: 600 }, join(TOSS_DIR, "logo-600.png"));
await shootScenes(browser, WEB_HTML, PLAY_SCENES, PLAY_DIR, { width: 360, height: 640 }, 3, "jpeg");
await shootBrand(browser, "icon", { width: 512, height: 512 }, join(PLAY_DIR, "icon-512.png"));
await shootBrand(browser, "feature", { width: 1024, height: 500 }, join(PLAY_DIR, "feature-graphic.jpg"), { type: "jpeg", quality: 95 });
await browser.close();
console.log("store/apps-in-toss/images, store/google-play/images 에 이미지를 만들었어요");
