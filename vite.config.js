/* =========================================================
   vite.config.js — 묶기 도구(Vite) 설정
   ---------------------------------------------------------
   npm run dev          개발 서버 (http://localhost:5173)
   npm run build        dist/            폰 앱·웹 서버용
   npm run build:single dist/moyeo.html  더블클릭으로 여는 HTML 한 장 (원래 있던 그 파일을 덮어써요)
   npm run build:toss   dist-toss/       앱인토스용 (친구 채팅만, src/platform/features.js)
   npm run dev:admin    운영자 사이트 개발 서버 (http://localhost:5180/admin.html)
   npm run build:admin  dist-admin/      운영자 사이트 (앱과 주소를 나눔, 주소는 docs/guides/admin-guide.md 1번)
   어떤 빌드인지는 --mode 값으로 정해지고, 앱 안에서는 src/platform/target.js가 읽어요.
   ========================================================= */

import { rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

const OUT_DIRS = { toss: "dist-toss", admin: "dist-admin" };

// 빌드 결과 폴더마다 "이 폴더가 무엇인지" 적은 설명 파일 (빌드할 때마다 다시 써요)
const FOLDER_GUIDES = {
  "dist": {
    name: "_이_폴더는_웹·구글플레이용_빌드결과물.txt",
    text: [
      "dist/ — 웹(Firebase Hosting)·구글 플레이(안드로이드 앱)용 빌드 결과물",
      "",
      "만드는 명령",
      "  npm run build          → index.html + assets/ (웹·안드로이드 앱에 들어가는 파일)",
      "  npm run build:single   → moyeo.html (더블클릭으로 화면만 보는 한 장짜리 HTML)",
      "  npm run deploy:web     → 빌드 + https://ururu-6164b.web.app 에 올리기",
      "",
      "들어 있는 것",
      "  index.html, assets/    웹·안드로이드 앱 (전체 기능: 스와이프·지도·구글/페이스북 로그인)",
      "  moyeo.html             시연용 한 장짜리 (구글·페이스북 팝업은 여기서 안 됨)",
      "  forServer.html         예전에 만든 index.html 복사본 (지금은 안 씀)",
      "",
      "직접 고치지 마세요. src/·styles/를 고치고 다시 빌드하면 바뀌어요."
    ].join("\r\n")
  },
  "dist-toss": {
    name: "_이_폴더는_앱인토스용_빌드결과물.txt",
    text: [
      "dist-toss/ — 앱인토스(토스 미니앱)용 빌드 결과물",
      "",
      "만드는 명령",
      "  npm run build:toss   → 이 폴더 (빌드할 때마다 비우고 새로 만들어요)",
      "  npm run build:ait    → 이 폴더로 ururu.ait 만들기 (앱인토스 콘솔에 올리는 파일)",
      "",
      "dist/와 다른 점 (src/platform/features.js)",
      "  토스 로그인만, 스와이프·지도·익명 버튼 없음, 친구 채팅 위주, 밝은 화면만",
      "",
      "직접 고치지 마세요. src/·styles/를 고치고 다시 빌드하면 바뀌어요."
    ].join("\r\n")
  },
  "dist-admin": {
    name: "_이_폴더는_운영자사이트_빌드결과물.txt",
    text: [
      "dist-admin/ — 운영자 사이트 빌드 결과물 (앱과 다른 주소)",
      "",
      "만드는 명령",
      "  npm run build:admin    → 이 폴더 (빌드할 때마다 비우고 새로 만들어요)",
      "  npm run deploy:admin   → 빌드 + 운영자 사이트 주소에 올리기 (.firebaserc의 admin 사이트)",
      "",
      "들어 있는 것",
      "  admin.html, assets/    신고 확인·제재, 운영자 아이디 발급 (src/admin/)",
      "",
      "직접 고치지 마세요. src/admin/·styles/admin.css를 고치고 다시 빌드하면 바뀌어요."
    ].join("\r\n")
  }
};

function writeFolderGuide(outDir)
{
  return {
    name: "moyeo-folder-guide",
    apply: "build",
    async closeBundle()
    {
      const guide = FOLDER_GUIDES[outDir];
      if (guide)
      {
        await writeFile(resolve(outDir, guide.name), guide.text, "utf8");
      }
    }
  };
}
const TOSS_SDK = "@apps-in-toss/web-framework";   // 토스 앱 안에서만 쓰는 SDK (src/platform/tossSdk.js)
const SINGLE_FILE_NAME = "moyeo.html";

// 한 장짜리 HTML은 v13 때부터 쓰던 dist/moyeo.html 자리에 그대로 (새 파일·새 폴더를 만들지 않게)
function renameSingleHtml(outDir)
{
  return {
    name: "moyeo-rename-single-html",
    apply: "build",
    async closeBundle()
    {
      await rename(resolve(outDir, "index.html"), resolve(outDir, SINGLE_FILE_NAME));
    }
  };
}

export default defineConfig(({ mode }) =>
{
  const isSingle = mode === "single";
  const outDir = OUT_DIRS[mode] || "dist";
  // 운영자 사이트는 따로 빌드해서 따로 올려요 (앱 빌드에는 들어가지 않음)
  const pages = mode === "admin" ? { admin: resolve("admin.html") } : undefined;
  return {
    base: "./",   // 폰 앱(파일로 열림)과 더블클릭 HTML 모두 상대 경로여야 해서
    plugins: [react(), ...(isSingle ? [viteSingleFile(), renameSingleHtml(outDir)] : []), writeFolderGuide(outDir)],
    // dist/에는 build 결과와 moyeo.html이 같이 있어서, 한쪽을 만들 때 다른 쪽을 지우지 않게 해요
    // 토스 빌드가 아니면 토스 SDK를 묶지 않아요 (설치 전에도 web·single 빌드가 되게, 어차피 부르지 않음)
    build: { outDir, emptyOutDir: outDir !== "dist", rollupOptions: { input: pages, external: mode === "toss" ? [] : [TOSS_SDK] } },
    test:
    {
      environment: "jsdom",
      include: ["tests/**/*.test.js"]
    }
  };
});
