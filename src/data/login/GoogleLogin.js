/* =========================================================
   [Data] login/GoogleLogin.js — 구글 플레이(안드로이드)·웹: 구글 계정으로 로그인
   ---------------------------------------------------------
   구글 로그인 창은 사용자가 버튼을 눌렀을 때만 열 수 있어요 (브라우저가 저절로 뜨는 창을 막아요).
   그래서 두 단계로 나눠요.
     1. 앱을 켤 때 signIn(fb)            → 이미 로그인돼 있으면 바로 성공, 아니면 needsLogin 실패
     2. [구글로 계속하기] signIn(fb, { interactive: true }) → 구글 로그인 창을 열어요

   어디서 여나:
     - 안드로이드 앱(Capacitor): 웹뷰 안에서는 구글이 로그인 창을 막아서, 휴대폰의 구글 계정 선택 창을 써요.
       플러그인 @capacitor-firebase/authentication이 window.Capacitor.Plugins에 넣어 줘요 (add-mobile-apps).
       받은 idToken으로 Firebase에 로그인해요.
     - 웹(npm run dev): Firebase 팝업 창
   페이스북도 같은 방법이에요 ({ interactive: true, method: "facebook" }).
     안드로이드는 플러그인의 signInWithFacebook → accessToken, 웹은 Firebase 팝업.

   시험용 익명 로그인 ({ interactive: true, method: "anonymous" }, features.canTryAnonymous):
     익명 계정은 만든 지 하루(ANON_LIFETIME_MS)까지만 써요. 지나면 로그아웃하고 다시 인증하게 해요.
     서버도 같은 규칙으로 막아요 (firestore.rules·storage.rules의 anonExpired).
   ========================================================= */

import { Result } from "../../core/result.js";
import { LOGIN_FAILED, LoginProvider } from "./LoginProvider.js";
import { t } from "../../core/i18n/index.js";

export const LOGIN_NEEDED = "";   // 화면에 글을 띄우지 않고 로그인 버튼만 보여줘요
export const ANON_EXPIRED = t("server.anonExpired");
export const ANON_LIFETIME_MS = 24 * 60 * 60 * 1000;

function isAnonExpired(user)
{
  const createdAt = Date.parse(user.metadata.creationTime);
  return !createdAt || Date.now() - createdAt > ANON_LIFETIME_MS;
}

const CANCELED_CODES = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];
// 같은 이메일로 다른 방법(구글 ↔ 페이스북)으로 이미 가입한 경우
const OTHER_METHOD = t("server.otherMethod");

// 버튼 종류 → Firebase 로그인 방법 (네이티브 플러그인 함수, 받은 토큰으로 자격 만들기)
const PROVIDERS =
{
  google:
  {
    create: (fa) =>
    {
      const provider = new fa.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      return provider;
    },
    native: (plugin) => plugin.signInWithGoogle({ skipNativeAuth: true }),
    credential: (fa, res) => fa.GoogleAuthProvider.credential(res.credential.idToken)
  },
  facebook:
  {
    create: (fa) =>
    {
      const provider = new fa.FacebookAuthProvider();
      provider.addScope("email");
      return provider;
    },
    native: (plugin) => plugin.signInWithFacebook({ skipNativeAuth: true }),
    credential: (fa, res) => fa.FacebookAuthProvider.credential(res.credential.accessToken)
  }
};

function nativeGooglePlugin()
{
  const cap = globalThis.Capacitor;
  if (cap && cap.isNativePlatform && cap.isNativePlatform())
  {
    return cap.Plugins.FirebaseAuthentication || null;
  }
  return null;
}

export class GoogleLogin extends LoginProvider
{
  async signIn({ auth }, { interactive = false, method = "google" } = {})
  {
    try
    {
      const firebaseAuth = await import("firebase/auth");
      await auth.authStateReady();
      const user = auth.currentUser;
      if (user && user.isAnonymous && isAnonExpired(user))
      {
        await firebaseAuth.signOut(auth);
        return { ...Result.fail(ANON_EXPIRED), needsLogin: true };
      }
      // 이미 로그인됨: 앱을 켤 때는 그대로, 버튼을 눌렀을 때는 익명 → 구글·페이스북으로 바꾸는 경우만 새로 로그인
      if (user && (!interactive || !user.isAnonymous || method === "anonymous"))
      {
        return Result.ok(user.uid);
      }
      if (!interactive)
      {
        return { ...Result.fail(LOGIN_NEEDED), needsLogin: true };
      }
      if (method === "anonymous")
      {
        await firebaseAuth.signInAnonymously(auth);
        return Result.ok(auth.currentUser.uid);
      }
      const way = PROVIDERS[method] || PROVIDERS.google;
      const plugin = nativeGooglePlugin();
      if (plugin)
      {
        const res = await way.native(plugin);
        await firebaseAuth.signInWithCredential(auth, way.credential(firebaseAuth, res));
      }
      else
      {
        await firebaseAuth.signInWithPopup(auth, way.create(firebaseAuth));
      }
      return Result.ok(auth.currentUser.uid);
    }
    catch (error)
    {
      if (CANCELED_CODES.includes(error && error.code))
      {
        return { ...Result.fail(LOGIN_NEEDED), needsLogin: true };
      }
      if (error && error.code === "auth/account-exists-with-different-credential")
      {
        return { ...Result.fail(OTHER_METHOD), needsLogin: true };
      }
      return { ...Result.fail(LOGIN_FAILED), needsLogin: true };
    }
  }
}
