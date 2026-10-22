/* =========================================================
   [Core] i18n/index.js — 화면 글자 언어 (한국어 KR / 영어 EN)
   ---------------------------------------------------------
   쓰는 법: t("signup.start") → 한국어면 ko.js의 "시작하기", 영어면 en.js의 "Start"
            t("safety.blockedToast", { name }) → "{name}" 자리에 값이 들어가요
   - 화면 글자는 언어마다 파일 하나: 한국어 ko.js / 영어 en.js (같은 이름표)
     새 문구: 두 파일에 같은 이름표로 한 줄씩 → 코드에서 t("이름표")
     영어표에 없으면 한국어로, 한국어표에도 없으면 이름표 그대로 보여요 (빠진 걸 찾기 쉽게)
   - 고른 언어는 이 기기에 저장해요. 언어를 바꾸면 화면 전체를 새로 불러와요
     (600개 가까운 문구를 하나하나 다시 그리는 것보다 단순하고 확실해서)
   - 처음 언어는 한국어 (EN을 고르면 그때부터 영어)
   ========================================================= */

import en from "./en.js";
import ko from "./ko.js";

const STORAGE_KEY = "ururu.lang";
export const LANGUAGES = [
  { code: "ko", label: "KR" },
  { code: "en", label: "EN" }
];
const TABLES = { ko, en };

function readLanguage()
{
  try
  {
    return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "ko";
  }
  catch (error)
  {
    return "ko";   // 저장소를 못 쓰는 곳(비밀 창, 시험)에서는 한국어
  }
}

let current = readLanguage();

export function getLanguage()
{
  return current;
}

// 언어 바꾸기: 저장하고 화면을 새로 불러와요 (같은 언어면 아무 일 없음)
export function setLanguage(code)
{
  if (code === current)
  {
    return;
  }
  try
  {
    localStorage.setItem(STORAGE_KEY, code);
  }
  catch (error)
  {
    // 저장을 못 해도 이번 화면은 바꿔요
  }
  current = code;
  window.location.reload();
}

const has = (table, key) => Object.prototype.hasOwnProperty.call(table, key);

export function t(key, vars = {})
{
  const table = TABLES[current];
  const template = has(table, key) ? table[key] : has(ko, key) ? ko[key] : key;
  return template.replace(/\{(\w+)\}/g, (whole, name) => (name in vars ? String(vars[name]) : whole));
}

// 브라우저 탭 제목·글자 언어 표시 (index.html은 한국어로 시작해서, 영어면 여기서 바꿔요)
if (typeof document !== "undefined")
{
  document.documentElement.lang = current;
  document.title = t("app.name");
}
