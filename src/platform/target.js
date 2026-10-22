/* =========================================================
   [Platform] target.js — 지금 빌드가 "어디용 앱"인지
   ---------------------------------------------------------
   npm run build:toss    → "toss"     (앱인토스 미니앱)
   npm run build:android → "android"  (구글 플레이, Phase 5에서 명령 추가)
   그 밖(dev, build, build:single) → "web" (시연용, 기능 전부)
   Vite가 --mode 값을 import.meta.env.MODE에 넣어줘요.
   ========================================================= */

const MODE_TO_TARGET =
{
  toss: "toss",
  android: "android"
};

export const TARGET = MODE_TO_TARGET[import.meta.env.MODE] || "web";
