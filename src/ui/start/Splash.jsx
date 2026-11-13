/* =========================================================
   [UI] Splash.jsx — 앱을 켜면 처음 보이는 "우르르" 로고 화면
   ---------------------------------------------------------
   앱 이름(로고)만 보여요. SPLASH_MS 동안 보여준 뒤 onDone()으로 다음 화면(로그인 · 가입)을 뒤에 그리고,
   0.4초 동안 서서히 사라져요. (SHELL-10, 11)
   ========================================================= */

import { useEffect, useState } from 'react';
import { FADE_OUT_MS, SPLASH_MS } from '../../core/config.js';
import { Logo } from '../common/Logo.jsx';

export function Splash({ close, onDone }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let fadeTimer = null;
    const showTimer = setTimeout(() => {
      setIsFadingOut(true); // 서서히 사라지는 효과
      fadeTimer = setTimeout(close, FADE_OUT_MS);
      onDone();
    }, SPLASH_MS);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
    };
  }, []);

  return (
    <div className={isFadingOut ? 'splash out' : 'splash'}>
      {/* 글자마다 따로 아래에서 튀어 올라와 "찰싹" 자리 잡아요 (styles/start.css tileIn, 가입 칸과 같은 움직임) */}
      <Logo isAnimated />
    </div>
  );
}
