/* =========================================================
   [UI] Logo.jsx — "우르르" 로고 글자 (로고 화면 · 가입 화면 · 이용정지 화면이 같이 써요)
   ---------------------------------------------------------
   글자·모양은 여기와 styles/start.css의 .logo 한 곳에서만 바꿔요 (같은 글자는 같은 코드)
   화면마다 다른 것은 크기·색 변수(--logo-size, --logo-color)만
   isAnimated: 로고 화면처럼 글자마다 따로 튀어 들어오게 (글자를 span으로 나눠요)
   ========================================================= */

import { t } from "../../core/i18n/index.js";

const LOGO_TEXT = t("app.name");

export function Logo({ isAnimated = false })
{
  if (!isAnimated)
  {
    return <div className="logo">{LOGO_TEXT}</div>;
  }
  return (
    <div className="logo" aria-label={LOGO_TEXT}>
      {LOGO_TEXT.split("").map((letter, index) => <span key={index} style={{ "--i": index }} aria-hidden="true">{letter}</span>)}
    </div>
  );
}
