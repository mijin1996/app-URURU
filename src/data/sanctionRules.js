/* =========================================================
   [Data] sanctionRules.js — 계정 제재 기준 (앱과 서버 함수가 같이 쓰는 한 곳)
   ---------------------------------------------------------
   기준 (docs/policy/chat-rules.md 5장, terms.md):
   - 위반 1회        → 경고
   - 위반 2회        → 7일 이용정지
   - 위반 3회 이상   → 영구정지
   - 위반 횟수는 정지가 끝나도 0으로 돌아가지 않고 계속 쌓여요
   - 중대한 위반(불법촬영물·성착취물·사기·협박 등)은 운영자가 바로 영구정지 (isPermanent: true)

   제재 기록 모양 (서버 moderation/{uid}, 시연 모드는 이 기기 저장소):
   { warnings: 지금까지 위반 횟수, bannedUntil: 정지가 끝나는 시각(ms, 0 = 없음), isPermanent: 영구정지 여부 }

   이 파일은 서버 함수도 써요. `npm run emulators`·`npm run deploy:server`가
   tools/copy-shared.mjs로 functions/shared/에 복사해요 (원본은 여기 하나, 복사본은 고치지 않기).
   그래서 이 파일은 다른 파일을 import하지 않아요.
   ========================================================= */

const DAY_MS = 24 * 60 * 60 * 1000;

export const STRIKES_TO_SUSPEND = 2;    // 이 횟수면 일시 이용정지
export const STRIKES_TO_PERMANENT = 3;  // 이 횟수부터 영구정지
export const SUSPEND_MS = 7 * DAY_MS;   // 일시 이용정지 기간 (7일)

// 지금 정지 중인지 (영구정지 포함)
export function isSuspended(record, now)
{
  return Boolean(record.isPermanent) || (record.bannedUntil || 0) > now;
}

// 위반 1회를 더한 새 기록. level: "warning" | "suspended" | "permanent"
export function addStrike(record, now)
{
  const warnings = (record.warnings || 0) + 1;
  if (warnings >= STRIKES_TO_PERMANENT)
  {
    return { warnings, bannedUntil: record.bannedUntil || 0, isPermanent: true, level: "permanent" };
  }
  if (warnings >= STRIKES_TO_SUSPEND)
  {
    return { warnings, bannedUntil: now + SUSPEND_MS, isPermanent: false, level: "suspended" };
  }
  return { warnings, bannedUntil: record.bannedUntil || 0, isPermanent: false, level: "warning" };
}
