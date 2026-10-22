/* =========================================================
   [Data] login/LoginProvider.js — "로그인 방법" 약속 (부모 클래스)
   ---------------------------------------------------------
   빌드마다 사용자를 알아보는 방법이 달라요 (add-build-targets).
   - 토스(앱인토스): AnonKeyLogin — 토스가 알려주는 익명 사용자 키. 로그인 화면 없음
   - 웹(서버 시험용): DemoLogin — Firebase 익명 로그인. 로그인 화면 없음
   - 안드로이드·웹: GoogleLogin — 구글 계정. 처음 한 번 [구글로 계속하기] 버튼
   - DemoLogin — Firebase 익명 로그인 (지금은 안 씀, 남겨 둠)
   어떤 방법이든 결과는 같아요: Firebase에 로그인된 상태 + 내 uid.
   RealServer는 이 약속만 알아서, 로그인 방법을 바꿔도 서버 코드는 안 바뀌어요. (DIP)

   signIn(firebase, options) → Promise<Result<uid>>
     options.interactive = 사용자가 로그인 버튼을 눌러서 부른 것 (GoogleLogin만 씀)
     firebase = { auth, functions } (firebase/firebaseApp.js가 만든 것)
     실패(인터넷 끊김, 토스 앱이 오래됨 등)는 흔한 일이라 Result로 이유를 돌려줘요.
   ========================================================= */

import { t } from "../../core/i18n/index.js";

export class LoginProvider
{
  signIn(firebase, options)
  {
    throw new Error("LoginProvider.signIn()을 자식 클래스에서 만들어야 해요");
  }
}

export const LOGIN_FAILED = t("server.loginFailed");
