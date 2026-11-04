/* =========================================================
   [Data] login/LoginProvider.js — "로그인 방법" 약속 (부모 클래스)
   ---------------------------------------------------------
   로그인 방법은 GoogleLogin 하나예요 (안드로이드 · 웹: 구글 계정, [구글로 계속하기] 버튼).
   결과: Firebase에 로그인된 상태 + 내 uid.
   RealServer는 이 약속만 알아서, 로그인 방법을 바꿔도 서버 코드는 안 바뀌어요. (DIP)

   signIn(firebase, options) → Promise<Result<uid>>
     options.interactive = 사용자가 로그인 버튼을 눌러서 부른 것 (GoogleLogin만 씀)
     firebase = { auth, functions } (firebase/firebaseApp.js가 만든 것)
     실패(인터넷 끊김, 팝업 닫음 등)는 흔한 일이라 Result로 이유를 돌려줘요.
   ========================================================= */

import { t } from '../../core/i18n/index.js';

export class LoginProvider {
  signIn(firebase, options) {
    throw new Error('LoginProvider.signIn()을 자식 클래스에서 만들어야 해요');
  }
}

export const LOGIN_FAILED = t('server.loginFailed');
