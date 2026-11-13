/* =========================================================
   [UI] ThemeButton.jsx — 화면 위 밝기 버튼 (해 / 달 아이콘만)
   ---------------------------------------------------------
   밝을 때는 달(누르면 어둡게), 어두울 때는 해(누르면 밝게)를 보여요.
   앱 위 줄과 가입 화면에서 써요. lightThemeOnly 빌드는 늘 밝아서 그리지 않아요.
   ========================================================= */

import { useState } from 'react';
import { t } from '../../core/i18n/index.js';
import { useCtx } from '../app/AppContext.jsx';
import { Icon } from './Icon.jsx';

export function ThemeButton() {
  const { theme, meActions, features } = useCtx();
  const [isDark, setIsDark] = useState(theme.isDark);
  if (features.lightThemeOnly) {
    return null;
  }
  return (
    <button
      className="themebtn"
      id="themeBtn"
      aria-label={t('app.theme')}
      aria-pressed={isDark}
      onClick={() => setIsDark(meActions.toggleTheme())}
    >
      <Icon name={isDark ? 'sun' : 'moon'} />
    </button>
  );
}
