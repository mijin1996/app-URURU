/* =========================================================
   [Model] ThemeStore.js — 밝은 화면 / 어두운 화면 (이 기기에 기억)
   ---------------------------------------------------------
   처음에는 폰 설정(다크 모드)을 따르고, 한 번 바꾸면 그 값을 저장소에 남겨요.
   화면(document)은 모르고, 칠하는 일은 main.jsx와 MeActions가 해요.
   ========================================================= */

export const THEME = Object.freeze({ light: 'light', dark: 'dark' });

const isTheme = (value) => value === THEME.light || value === THEME.dark;

export class ThemeStore {
  // repository: load() → Result, save(value) (ProfileRepository와 같은 모양)
  // prefersDark: 폰이 다크 모드인지 (저장된 값이 없을 때만 봐요)
  constructor(repository, prefersDark = () => false) {
    this.repository = repository;
    const saved = repository.load();
    if (saved.isOk && isTheme(saved.value)) {
      this.current = saved.value;
    } else {
      this.current = prefersDark() ? THEME.dark : THEME.light;
    }
  }

  get isDark() {
    return this.current === THEME.dark;
  }

  // 밝게 ↔ 어둡게 → 바뀐 값
  toggle() {
    this.current = this.isDark ? THEME.light : THEME.dark;
    this.repository.save(this.current);
    return this.current;
  }
}
