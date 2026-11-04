/* =========================================================
   tools/store-images/make-store-images.mjs — 스토어에 올릴 이미지를 실제 앱 화면으로 찍기
   ---------------------------------------------------------
   npm run store:images
     (먼저 npm run build:single 로 dist/ururu.html을 만들어 두세요.
      처음 한 번: npx playwright install chromium)

   만드는 것 (덮어써요):
   UploadPlatform/google-play/images/
     icon-512.png                 앱 아이콘 512×512 PNG (꽉 찬 사각형. 둥근 모양은 구글 플레이가 알아서 잘라요)
     feature-graphic.jpg          그래픽 이미지 1024×500 (알파 없음)
     phone-1~6.jpg                휴대전화 스크린샷 1080×1920 (9:16, 알파 없음, 원래 기능 전부 켠 빌드)

   화면은 시연 데이터(가짜 사람)로 찍어요. 시계·무작위 수를 고정해서 매번 같은 사진이 나와요.
   다른 HTML로 찍고 싶으면: node tools/store-images/make-store-images.mjs --web <파일>
   ========================================================= */

import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? resolve(args[index + 1]) : join(ROOT, fallback);
};
const WEB_HTML = option('--web', 'dist/ururu.html');
const BRAND_HTML = join(ROOT, 'tools', 'store-images', 'brand.html');
const PLAY_DIR = join(ROOT, 'UploadPlatform', 'google-play', 'images');

const START_TIME = new Date('2026-10-15T12:00:00+09:00');
const PROFILE = {
  handle: 'mimi2026',
  name: '미미',
  birthDate: '2001-03-15',
  pingPermission: 'granted',
};
const AFTER_SPLASH_MS = 2400;
const HIDE_TOAST = '.toast{display:none!important}';

// 장면: 어떤 탭을 누르고 어디를 누를지 (id·클래스는 tools/compare와 같아요)
const tab = (id) => ({ click: `.nav button[data-tab="${id}"]` });
const PLAY_SCENES = [
  { file: 'phone-1.jpg', steps: [] },
  { file: 'phone-2.jpg', steps: [tab('messages')] },
  { file: 'phone-3.jpg', steps: [tab('messages'), { click: '[data-chat="teo"]' }] },
  { file: 'phone-4.jpg', steps: [tab('swipe')] },
  { file: 'phone-5.jpg', steps: [tab('likes')] },
  { file: 'phone-6.jpg', steps: [{ click: '.pin[data-id="teo"]' }, { wait: 600 }] },
];

async function openApp(browser, html, viewport, scale) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale, colorScheme: 'light' });
  await page.clock.install({ time: START_TIME });
  await page.addInitScript((profile) => {
    let seed = 42;
    Math.random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    localStorage.setItem('ururu.profile', JSON.stringify(profile));
  }, PROFILE);
  await page.goto(pathToFileURL(html).href);
  await page.clock.runFor(AFTER_SPLASH_MS);
  await page.addStyleTag({ content: HIDE_TOAST });
  return page;
}

async function shootScenes(browser, html, scenes, dir, viewport, scale, type) {
  const shots = [];
  for (const scene of scenes) {
    // 장면마다 새로 열어서 서로 영향이 없게 (순서대로 찍어야 해서 for)
    const page = await openApp(browser, html, viewport, scale);
    for (const step of scene.steps) {
      if (step.click) {
        await page.click(step.click);
      }
      await page.clock.runFor(step.wait || 500);
      await page.waitForTimeout(700); // 창이 밀려 들어오는 CSS 움직임은 실제 시간으로 끝나서 기다려요
    }
    const path = join(dir, scene.file);
    await page.screenshot({ path, type, ...(type === 'jpeg' ? { quality: 92 } : {}) });
    shots.push(path);
    await page.close();
  }
  return shots;
}

async function shootBrand(browser, kind, size, path, options = {}) {
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  await page.goto(`${pathToFileURL(BRAND_HTML).href}?kind=${kind}`);
  await page.waitForTimeout(800); // 글꼴
  await page.screenshot({ path, ...options });
  await page.close();
}

mkdirSync(PLAY_DIR, { recursive: true });
const browser = await chromium.launch();
await shootScenes(browser, WEB_HTML, PLAY_SCENES, PLAY_DIR, { width: 360, height: 640 }, 3, 'jpeg');
await shootBrand(browser, 'icon', { width: 512, height: 512 }, join(PLAY_DIR, 'icon-512.png'));
await shootBrand(
  browser,
  'feature',
  { width: 1024, height: 500 },
  join(PLAY_DIR, 'feature-graphic.jpg'),
  { type: 'jpeg', quality: 95 },
);
await browser.close();
console.log('UploadPlatform/google-play/images 에 이미지를 만들었어요');
