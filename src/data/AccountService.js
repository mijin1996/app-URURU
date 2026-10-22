/* =========================================================
   [Data] AccountService.js — 내 계정 (가입, 아이디 중복 확인, 닉네임 바꾸기, 저장)
   ---------------------------------------------------------
   아이디와 닉네임은 달라요.
   - 아이디(handle): 영어 알파벳 + 숫자만, 사람마다 하나뿐(중복 불가), 가입 후 못 바꿈
                     → 친구를 정확히 찾으려면 겹치면 안 되니까
   - 닉네임(name):  화면에 보이는 이름, 다른 사람과 같아도 되고 언제든 바꿀 수 있음
   "바꾸기 → 저장소에 저장"이 여러 화면에서 반복돼서 한곳에 모았어요. (DRY)
   ========================================================= */

import { MAX_TAGS } from "../core/config.js";
import { Result } from "../core/result.js";
import { Validator } from "./Validator.js";
import { t } from "../core/i18n/index.js";

export class AccountService
{
  constructor(users, profiles, server)
  {
    this.users = users;
    this.profiles = profiles;
    this.server = server;   // 아이디 중복 확인은 전체 사용자를 아는 서버에 물어봐야 해서
  }

  /* ---------- 가입 ---------- */
  // 아이디 확인: 모양 검사 → 중복 검사. 이미 있으면 다른 아이디를 쓰라고 알려줌
  checkHandle(rawHandle)
  {
    const handle = Validator.handle(rawHandle);
    if (!handle.isOk)
    {
      return handle;
    }
    if (this.server.isHandleTaken(handle.value))
    {
      return Result.fail(t("check.handleTaken", { handle: handle.value }));
    }
    return handle;
  }

  // 가입: 네 칸(아이디·닉네임·생년월일·국가)을 차례로 검사하고, 처음 걸린 문제를 돌려줌 → 서버에서 아이디를 차지한 뒤 저장
  // 아이디가 겹치는지는 서버만 정확히 알아서, 마지막 확인은 서버가 해요 (ACC-S3) → Promise
  async register({ handle, name, birthDate, country })
  {
    const checks = [this.checkHandle(handle), Validator.name(name), Validator.birthDate(birthDate), Validator.country(country)];
    const failed = checks.find((check) => !check.isOk);
    if (failed)
    {
      return failed;
    }
    const [checkedHandle, checkedName, checkedDate, checkedCountry] = checks.map((check) => check.value);
    const profile = { handle: checkedHandle, name: checkedName, birthDate: checkedDate, country: checkedCountry, pingPermission: "unknown", tags: [] };
    const saved = await this.server.register(profile);
    if (!saved.isOk)
    {
      return saved;
    }
    this.profiles.save(profile);
    return Result.ok(profile);
  }

  // 가입 정보 불러오기 (로그인 먼저)
  // - 가짜 서버: 이 기기에 저장된 가입 정보. 예전 버전처럼 아이디가 없으면 다시 가입하게 함
  // - 진짜 서버: 서버 계정의 가입 정보 (다른 기기에서 가입했어도 같은 정보, ACC-S2)
  // 로그인 자체가 안 되면 isLoginError를 붙여서, 가입 화면 대신 다시 시도하게 해요
  // options.interactive: [구글로 계속하기]를 눌러서 부른 것
  async loadSaved(options = {})
  {
    const signedIn = await this.server.signIn(options);
    if (!signedIn.isOk)
    {
      return { ...signedIn, isLoginError: true };
    }
    const { isLocal, profile } = signedIn.value;
    if (!isLocal)
    {
      if (!profile)
      {
        return Result.fail(t("check.noAccount"));
      }
      this.profiles.save(profile);
      return Result.ok(profile);
    }
    const saved = this.profiles.load();
    if (saved.isOk && !saved.value.handle)
    {
      return Result.fail(t("check.oldAccount"));
    }
    return saved;
  }

  /* ---------- 내 정보 바꾸기 ---------- */
  // 닉네임만 바꿀 수 있어요 (아이디는 못 바꿈)
  rename(rawName)
  {
    const name = Validator.name(rawName);
    if (!name.isOk)
    {
      return name;
    }
    this.users.rename(name.value);
    this.save();
    return name;
  }

  // 관심사 키워드 넣기: 최대 5개, 모양 검사 뒤 저장
  addTag(rawTag)
  {
    const tags = this.users.me.tags;
    if (tags.length >= MAX_TAGS)
    {
      return Result.fail(t("check.tagLimit", { MAX_TAGS }));
    }
    const tag = Validator.tag(rawTag, tags);
    if (!tag.isOk)
    {
      return tag;
    }
    this.users.addMyTag(tag.value);
    this.save();
    return tag;
  }

  removeTag(index)
  {
    this.users.removeMyTag(index);
    this.save();
  }

  setPingPermission(permission)
  {
    this.users.setPingPermission(permission);
    this.save();
  }

  get isPingAllowed()
  {
    return this.users.me.pingPermission === "granted";
  }

  get needsPingQuestion()
  {
    return this.users.me.pingPermission === "unknown";
  }

  // 회원탈퇴: 이 기기의 저장 정보와 서버의 계정을 모두 지워요 (되돌릴 수 없음)
  // 탈퇴하기 전까지는 앱을 껐다 켜도 가입 화면이 다시 나오지 않아요
  // 서버에서 못 지웠으면(인터넷 끊김 등) 이 기기 정보도 남겨둬요 — 다시 시도할 수 있게
  async withdraw()
  {
    const deleted = await this.server.deleteAccount(this.users.me.handle);
    if (deleted.isOk)
    {
      this.profiles.clear();
    }
    return deleted;
  }

  // 이 기기에 저장 + 서버에 알리기 (닉네임, 관심사, 소리 받기 권한)
  save()
  {
    const profile = this.users.profileSnapshot();
    this.profiles.save(profile);
    this.server.updateProfile(profile);
  }
}
