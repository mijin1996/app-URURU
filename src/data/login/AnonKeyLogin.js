/* =========================================================
   [Data] login/AnonKeyLogin.js — 토스(앱인토스): 익명 사용자 키로 로그인
   ---------------------------------------------------------
   사용자는 이미 토스에 로그인돼 있어서 로그인 화면이 없어요.
   미니앱은 토스에게 "이 사람이 누구인지" 일회용 코드를 받아 서버에서 확인해요.

     1. 토스 SDK  User.createAnonymousKeyAuthCode() → { code } (5분, 한 번만 쓸 수 있음)
     2. 서버 함수 tossLogin({ code })
          → 토스 파트너 API(mTLS)로 code를 anonKey로 바꿈
          → anonKey로 Firebase uid를 정하고 맞춤 토큰을 만들어 돌려줌
     3. signInWithCustomToken(토큰) → Firebase 로그인 완료

   anonKey는 앱(클라이언트)이 보낸 값을 믿지 않고, 서버가 토스에게 직접 받은 값만 믿어요.
   (토스 문서: guide/authentication/anonymous-key-auth-code.md)

   토스 SDK는 밖에서 넣어줘요(loadTossUser). 그래서 토스 빌드가 아닐 때는 SDK가 없어도 되고,
   시험에서는 가짜 SDK를 넣어 볼 수 있어요. (DI)
   ========================================================= */

import { Result } from "../../core/result.js";
import { LOGIN_FAILED, LoginProvider } from "./LoginProvider.js";
import { t } from "../../core/i18n/index.js";

export const TOSS_TOO_OLD = t("server.tossTooOld");

export class AnonKeyLogin extends LoginProvider
{
  // loadTossUser: () => Promise<User>  (@apps-in-toss/web-framework의 User)
  // callTossLogin: (functions, code) => Promise<token> — 시험에서 바꿔 끼우려고 따로 받아요
  constructor(loadTossUser, callTossLogin = callTossLoginFunction, signInWithToken = signInWithFirebaseToken)
  {
    super();
    this.loadTossUser = loadTossUser;
    this.callTossLogin = callTossLogin;
    this.signInWithToken = signInWithToken;
  }

  async signIn({ auth, functions })
  {
    let code;
    try
    {
      const User = await this.loadTossUser();
      ({ code } = await User.createAnonymousKeyAuthCode());
    }
    catch (error)
    {
      return Result.fail(TOSS_TOO_OLD);   // SDK가 없는 오래된 토스 앱 (5.232.0 미만)
    }
    try
    {
      const token = await this.callTossLogin(functions, code);
      const uid = await this.signInWithToken(auth, token);
      return Result.ok(uid);
    }
    catch (error)
    {
      return Result.fail(LOGIN_FAILED);
    }
  }
}

async function callTossLoginFunction(functions, code)
{
  const { httpsCallable } = await import("firebase/functions");
  const response = await httpsCallable(functions, "tossLogin")({ code });
  return response.data.token;
}

async function signInWithFirebaseToken(auth, token)
{
  const { signInWithCustomToken } = await import("firebase/auth");
  const credential = await signInWithCustomToken(auth, token);
  return credential.user.uid;
}
