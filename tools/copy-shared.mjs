/* =========================================================
   tools/copy-shared.mjs — 앱과 서버 함수가 같이 쓰는 파일을 functions/shared/로 복사
   ---------------------------------------------------------
   서버 함수(functions/)는 올릴 때 functions 폴더만 올라가서 src/를 import할 수 없어요.
   그래서 원본은 src/data/에 하나만 두고, 에뮬레이터를 켜거나 서버에 올리기 직전에 복사해요.
   - npm run emulators / npm run deploy:server 가 먼저 이 파일을 불러요
   - firebase.json의 functions predeploy도 이 파일을 불러요 (firebase deploy를 바로 써도 복사돼요)
   functions/shared/는 복사본이라 고치지 않아요 (.gitignore에 있어요). 고칠 때는 src/data/ 원본을.
   ========================================================= */

import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED_FILES = ["MessageFilter.js", "sanctionRules.js"];   // src/data/ 안의 파일 이름

const target = join(ROOT, "functions", "shared");
mkdirSync(target, { recursive: true });
SHARED_FILES.forEach((name) => copyFileSync(join(ROOT, "src", "data", name), join(target, name)));
console.log(`functions/shared/에 복사했어요: ${SHARED_FILES.join(", ")}`);
