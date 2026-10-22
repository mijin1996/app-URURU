/* =========================================================
   [Core] time.js — 시간과 나이를 사람이 읽기 좋은 글자로 바꾸기
   ========================================================= */

import { MINUTE, MESSAGE_LIFETIME } from "./config.js";
import { t } from "./i18n/index.js";

// 7 → "07" (시계처럼 두 자리로 맞추기)
export const pad2 = (n) => String(n).padStart(2, "0");

// 생년월일("2001-03-15") → 만 나이 (올해 생일이 지났는지까지 따져요)
export function ageOf(birthDate)
{
  const [year, month, day] = birthDate.split("-").map(Number);
  const today = new Date();
  const thisMonth = today.getMonth() + 1;   // getMonth()는 0부터 시작해서 +1
  const hasHadBirthday = thisMonth > month || (thisMonth === month && today.getDate() >= day);
  return today.getFullYear() - year - (hasHadBirthday ? 0 : 1);
}

// 그 달이 며칠까지 있는지 (2월 29일 같은 윤년도 자동으로)
export const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

// 배열 정렬용: 최근 것이 앞으로
export const byNewest = (a, b) => b.at - a.at;

// 지난 시간: "방금", "5분", "3시간"
export function ago(time)
{
  const min = Math.floor((Date.now() - time) / MINUTE);
  if (min < 1)
  {
    return t("story.justNow");
  }
  if (min < 60)
  {
    return t("story.minutes", { min });
  }
  return t("story.hours", { n: Math.floor(min / 60) });
}

// 메시지가 사라지기까지 남은 시간: "23시간 남음", "15분 남음"
export function messageLeftText(sentAt)
{
  const leftMs = MESSAGE_LIFETIME - (Date.now() - sentAt);
  const min = Math.max(0, Math.floor(leftMs / MINUTE));
  return min >= 60 ? t("story.hoursLeft", { n: Math.floor(min / 60) }) : t("story.minutesLeft", { min });
}
