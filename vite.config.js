/* =========================================================
   vite.config.js — 묶기 도구(Vite) 설정
   ---------------------------------------------------------
   npm run dev          개발 서버 (http://localhost:5173)
   npm run build        dist/            폰 앱·웹 서버용
   npm run build:single dist/ururu.html  더블클릭으로 여는 HTML 한 장 (원래 있던 그 파일을 덮어써요)
   npm run dev:admin    운영자 사이트 개발 서버 (http://localhost:5180/admin.html)
   npm run build:admin  dist-admin/      운영자 사이트 (앱과 주소를 나눔, 주소는 docs/how-to/operate-admin-site.md 1번)
   어떤 빌드인지는 --mode 값으로 정해지고, 앱 안에서는 src/platform/target.js가 읽어요.
   ========================================================= */

import { rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const DEV_PORT = 5173; // npm run dev 주소 (dev:admin은 package.json에서 5180)

const OUT_DIRS = { admin: 'dist-admin' };

// 빌드 결과 폴더마다 "이 폴더가 무엇인지" 적은 설명 파일 (빌드할 때마다 다시 써요)
const FOLDER_GUIDES = {
  dist: {
    name: '_이_폴더는_웹·구글플레이용_빌드결과물.txt',
    text: [
      'dist/ — 웹(Firebase Hosting)·구글 플레이(안드로이드 앱)용 빌드 결과물',
      '',
      '만드는 명령',
      '  npm run build          → index.html + assets/ (웹·안드로이드 앱에 들어가는 파일)',
      '  npm run build:single   → ururu.html (더블클릭으로 화면만 보는 한 장짜리 HTML)',
      '  npm run deploy:web     → 빌드 + https://ururu-6164b.web.app 에 올리기',
      '',
      '들어 있는 것',
      '  index.html, assets/    웹·안드로이드 앱 (전체 기능: 스와이프·지도·구글 로그인)',
      '  ururu.html             시연용 한 장짜리 (구글 로그인 팝업은 여기서 안 됨)',
      '',
      '직접 고치지 마세요. src/·styles/를 고치고 다시 빌드하면 바뀌어요.',
    ].join('\r\n'),
  },
  'dist-admin': {
    name: '_이_폴더는_운영자사이트_빌드결과물.txt',
    text: [
      'dist-admin/ — 운영자 사이트 빌드 결과물 (앱과 다른 주소)',
      '',
      '만드는 명령',
      '  npm run build:admin    → 이 폴더 (빌드할 때마다 비우고 새로 만들어요)',
      '  npm run deploy:admin   → 빌드 + https://ururu-6164b-admin.web.app 에 올리기',
      '',
      '들어 있는 것',
      '  admin.html, assets/    신고 확인·제재, 운영자 아이디 발급 (src/admin/)',
      '',
      '직접 고치지 마세요. src/admin/·styles/admin.css를 고치고 다시 빌드하면 바뀌어요.',
    ].join('\r\n'),
  },
};

function writeFolderGuide(outDir) {
  return {
    name: 'ururu-folder-guide',
    apply: 'build',
    async closeBundle() {
      const guide = FOLDER_GUIDES[outDir];
      if (guide) {
        await writeFile(resolve(outDir, guide.name), guide.text, 'utf8');
      }
    },
  };
}
const SINGLE_FILE_NAME = 'ururu.html';

// 한 장짜리 HTML은 dist/ururu.html 한 자리에 덮어써요 (새 파일·새 폴더를 만들지 않게. 2026-11-04 전 이름 moyeo.html)
function renameSingleHtml(outDir) {
  return {
    name: 'ururu-rename-single-html',
    apply: 'build',
    async closeBundle() {
      await rename(resolve(outDir, 'index.html'), resolve(outDir, SINGLE_FILE_NAME));
    },
  };
}

export default defineConfig(({ mode }) => {
  const isSingle = mode === 'single';
  const outDir = OUT_DIRS[mode] || 'dist';
  // 운영자 사이트는 따로 빌드해서 따로 올려요 (앱 빌드에는 들어가지 않음)
  const pages = mode === 'admin' ? { admin: resolve('admin.html') } : undefined;
  return {
    base: './', // 폰 앱(파일로 열림)과 더블클릭 HTML 모두 상대 경로여야 해서
    // 더블클릭 HTML은 언제나 가짜 서버(시연)로: .env가 있어도 VITE_ 값을 읽지 않아요
    // (파일로 연 화면에서는 구글 로그인 창이 안 열려서 진짜 서버로는 들어갈 수 없어요)
    envPrefix: isSingle ? 'SINGLE_HTML_NO_ENV_' : 'VITE_',
    plugins: [
      react(),
      ...(isSingle ? [viteSingleFile(), renameSingleHtml(outDir)] : []),
      writeFolderGuide(outDir),
    ],
    // dist/에는 build 결과와 ururu.html이 같이 있어서, 한쪽을 만들 때 다른 쪽을 지우지 않게 해요
    build: {
      outDir,
      emptyOutDir: outDir !== 'dist',
      rollupOptions: { input: pages },
    },
    // 개발 주소를 http://localhost:5173 하나로 고정 (카카오 SDK 도메인 · Firebase 승인 도메인에 이 주소만 등록).
    // 5173을 다른 프로그램이 쓰고 있으면 5174·5175로 몰래 넘어가지 않고 오류로 멈춰요 → 그 프로그램을 끄고 다시 실행
    server: {
      port: DEV_PORT,
      strictPort: true,
      // 파일이 바뀐 걸 0.3초마다 직접 확인해요 (polling).
      // Windows에서 다른 프로그램(Claude · 동기화 도구)이 파일을 덮어쓰면 기본 감시가 알아채지 못해서
      // 저장해도 개발 화면이 그대로인 일이 있었어요 (2026-11-03)
      watch: { usePolling: true, interval: 300 },
    },
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.test.js'],
    },
  };
});
