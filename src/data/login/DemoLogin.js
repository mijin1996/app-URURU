/* =========================================================
   [Data] login/DemoLogin.js — 웹에서 서버를 시험할 때: Firebase 익명 로그인
   ---------------------------------------------------------
   화면 없이 바로 로그인돼요. 같은 브라우저는 계속 같은 계정이고,
   다른 브라우저(또는 비밀 창)는 다른 사람이 돼요 → 브라우저 두 개로 A, B 시험 (add-real-server 4번).
   진짜 출시용 로그인이 아니라서, 출시 빌드(토스·안드로이드)는 다른 방법을 써요.
   ========================================================= */

import { Result } from "../../core/result.js";
import { LOGIN_FAILED, LoginProvider } from "./LoginProvider.js";

export class DemoLogin extends LoginProvider
{
  async signIn({ auth })
  {
    try
    {
      const { signInAnonymously } = await import("firebase/auth");
      await auth.authStateReady();
      if (!auth.currentUser)
      {
        await signInAnonymously(auth);
      }
      return Result.ok(auth.currentUser.uid);
    }
    catch (error)
    {
      return Result.fail(LOGIN_FAILED);
    }
  }
}
