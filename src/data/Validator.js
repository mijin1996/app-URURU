/* =========================================================
   [Data] Validator.js — 사용자가 입력한 값 검사
   ---------------------------------------------------------
   잘못된 입력은 흔한 일이라 예외 대신 Result로 "이유"를 돌려줘요.
   ========================================================= */

import { MAX_HANDLE_LENGTH, MAX_NAME_LENGTH, MAX_TAG_LENGTH, MIN_AGE, MIN_HANDLE_LENGTH } from "../core/config.js";
import { Result } from "../core/result.js";
import { ageOf } from "../core/time.js";
import { isCountryCode } from "../core/countries.js";
import { t } from "../core/i18n/index.js";

const OLDEST_YEAR = 1900;
const HANDLE_PATTERN = /^[a-zA-Z0-9]+$/;   // 영어 대소문자 a~z·A~Z 와 숫자 0~9 만 (정규식). 아이디·닉네임 같이 씀

export const Validator =
{
  // 아이디 모양 검사 (중복 검사는 서버가 해서 AccountService에서 따로 해요)
  // 대소문자를 구분해요: "Teo24"와 "teo24"는 다른 아이디
  handle(raw)
  {
    const handle = raw.trim();
    if (!handle)
    {
      return Result.fail(t("check.enterHandle"));
    }
    if (!HANDLE_PATTERN.test(handle))
    {
      return Result.fail(t("check.invalidHandle"));
    }
    const isRightLength = handle.length >= MIN_HANDLE_LENGTH && handle.length <= MAX_HANDLE_LENGTH;
    if (!isRightLength)
    {
      return Result.fail(t("check.handleLength", { MIN_HANDLE_LENGTH, MAX_HANDLE_LENGTH }));
    }
    return Result.ok(handle);
  },

  name(raw)
  {
    const name = raw.trim();
    if (!name)
    {
      return Result.fail(t("check.invalidName"));
    }
    if (!HANDLE_PATTERN.test(name))
    {
      return Result.fail(t("check.invalidName"));
    }
    if (name.length > MAX_NAME_LENGTH)
    {
      return Result.fail(t("check.nameLength", { MAX_NAME_LENGTH }));
    }
    return Result.ok(name);
  },

  // 생년월일 "YYYY-MM-DD" (달력에서 고르니까 모양은 맞지만, 나이 제한은 여기서 확인)
  birthDate(raw)
  {
    const isFormatOk = /^\d{4}-\d{2}-\d{2}$/.test(raw || "");
    if (!isFormatOk)
    {
      return Result.fail(t("check.chooseBirthday"));
    }
    const year = Number(raw.slice(0, 4));
    if (year < OLDEST_YEAR || new Date(raw) > new Date())
    {
      return Result.fail(t("check.checkBirthday"));
    }
    if (ageOf(raw) < MIN_AGE)
    {
      return Result.fail(t("check.minAge", { MIN_AGE }));
    }
    return Result.ok(raw);
  },

  // 국가: 목록에 있는 두 글자 코드만 (예: "KR")
  country(raw)
  {
    return isCountryCode(raw) ? Result.ok(raw) : Result.fail(t("check.chooseCountry"));
  },

  // 관심사 키워드: 앞의 #은 떼고, 빈칸·너무 긴 것·이미 있는 것은 안 돼요
  tag(raw, existingTags = [])
  {
    const tag = raw.trim().replace(/^#+/, "").trim();
    if (!tag)
    {
      return Result.fail(t("check.enterTag"));
    }
    if (tag.length > MAX_TAG_LENGTH)
    {
      return Result.fail(t("check.tagLength", { MAX_TAG_LENGTH }));
    }
    if (existingTags.includes(tag))
    {
      return Result.fail(t("check.tagExists"));
    }
    return Result.ok(tag);
  },

  storyText(raw)
  {
    const text = raw.trim();
    return text ? Result.ok(text) : Result.fail(t("check.storyEmpty"));
  }
};
