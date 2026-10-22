/* =========================================================
   tools/compare/playwright.config.js — 화면 사진 비교 (모르고 화면을 바꾸지 않았는지)
   ---------------------------------------------------------
   npm run compare          지금 화면을 같은 순서로 눌러 찍고, 승인해 둔 "정답 사진"과 비교해요
   npm run compare:approve  지금 화면을 새 정답 사진으로 저장해요 (화면을 일부러 바꾼 뒤, 눈으로 확인하고)
   정답 사진은 tools/compare/__screens__/ 에 있어요.
   처음 한 번: npx playwright install chromium

   (기록) React로 옮길 때는 원본 legacy/moyeo-v13.html을 정답으로 46장 모두 같음을 확인했어요.
   그 뒤 refine-screens로 화면을 일부러 바꿔서, 이제 정답은 미미가 승인한 React 화면이에요.
   ========================================================= */

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "compare.spec.js",
  snapshotPathTemplate: "{testDir}/__screens__/{arg}{ext}",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never", outputFolder: "../../playwright-report" }]],
  outputDir: "../../test-results",
  expect:
  {
    // 글자 가장자리 몇 점 정도는 허용 (글꼴 그리는 순서 차이)
    toHaveScreenshot: { maxDiffPixels: 30, animations: "disabled", caret: "hide" }
  },
  use: { appFile: "dist/moyeo.html" }
});
