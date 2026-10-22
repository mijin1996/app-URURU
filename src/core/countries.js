/* =========================================================
   [Core] countries.js — 가입 화면 "국가" 칸과 프로필 "➤ 나라 지역" 글자
   ---------------------------------------------------------
   나라는 ISO 두 글자 코드(KR, US …)로 저장하고, 화면에는 한국어 이름(대한민국, 미국 …)으로 보여줘요.
   이름은 브라우저가 알고 있는 것(Intl.DisplayNames)을 써서 따로 번역표가 없어요. 화면 언어(KR/EN)를 따라가요.
   ========================================================= */

import { getLanguage } from "./i18n/index.js";

export const DEFAULT_COUNTRY = "KR";

// ISO 3166-1 두 글자 코드
const COUNTRY_CODES = (
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ " +
  "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR " +
  "GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP " +
  "KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT " +
  "MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW " +
  "SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG " +
  "UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW"
).split(" ");

let names = null;   // 이름표는 처음 쓸 때 한 번만 만들어요

function displayNames()
{
  if (!names)
  {
    try
    {
      names = new Intl.DisplayNames([getLanguage()], { type: "region" });   // 한국어면 "대한민국", 영어면 "South Korea"
    }
    catch (error)
    {
      names = { of: (code) => code };   // 아주 오래된 브라우저: 코드 그대로
    }
  }
  return names;
}

export function isCountryCode(code)
{
  return COUNTRY_CODES.includes(code);
}

// "KR" → "대한민국" (모르면 "")
export function countryLabel(code)
{
  return isCountryCode(code) ? displayNames().of(code) || code : "";
}

// 가입 화면 목록: 전부 이름순 (한국어 화면은 가나다순, 영어 화면은 ABC순)
export function countryOptions()
{
  return COUNTRY_CODES
    .map((code) => ({ code, label: countryLabel(code) }))
    .sort((a, b) => a.label.localeCompare(b.label, getLanguage()));
}

// 가입 화면에서 처음 골라 둘 나라: 폰 언어 설정(ko-KR → KR), 모르면 대한민국
export function defaultCountry()
{
  try
  {
    const code = new Intl.Locale(navigator.language || "ko-KR").maximize().region;
    return isCountryCode(code) ? code : DEFAULT_COUNTRY;
  }
  catch (error)
  {
    return DEFAULT_COUNTRY;
  }
}

// 프로필 "➤" 글자: "대한민국 경기도 평택시 서정동" (나라나 지역이 없으면 있는 것만)
export function homeLabel(code, area)
{
  return [countryLabel(code), area || ""].filter(Boolean).join(" ");
}
