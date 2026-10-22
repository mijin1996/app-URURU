/* =========================================================
   apps-in-toss.config.ts — 앱인토스 설정 (SDK 3.x, add-build-targets D4)
   ---------------------------------------------------------
   npm run build:ait  →  vite build --mode toss (dist-toss/)  →  ait build  →  ururu.ait
   appName은 앱인토스 콘솔에 등록한 것과 똑같아야 하고, 한 번 정하면 못 바꿔요 (2026-10-13 미미: ururu).
   토스 첫 출시는 위치를 끈 빌드라서 권한(permissions)이 없어요 (src/platform/features.js).
   ========================================================= */

import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "ururu",
  brand: {
    primaryColor: "#7a5cff"   // styles/base.css의 --accent와 같은 색
  },
  permissions: [],
  webBundleDir: "dist-toss"
});
