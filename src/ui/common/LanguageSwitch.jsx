/* =========================================================
   [UI] LanguageSwitch.jsx — 언어 바 [KR | EN] (가입 화면 오른쪽 위 · 나 탭 설정)
   ---------------------------------------------------------
   누르면 그 언어로 저장하고 화면을 새로 불러와요 (core/i18n/index.js setLanguage)
   모양은 styles/base.css의 .langswitch 한 곳
   ========================================================= */

import { getLanguage, LANGUAGES, setLanguage } from "../../core/i18n/index.js";

export function LanguageSwitch({ id })
{
  const current = getLanguage();
  return (
    <div className="langswitch" id={id} role="group" aria-label="Language">
      {LANGUAGES.map((language) => (
        <button key={language.code} type="button" className={language.code === current ? "on" : ""}
          aria-pressed={language.code === current} onClick={() => setLanguage(language.code)}>{language.label}</button>
      ))}
    </div>
  );
}
