/* =========================================================
   [UI] PhotoText.jsx — 사진 편집기 미리보기의 글자 한 덩어리
   ========================================================= */

import { photoTextStyle } from './photoTextStyle.js';

export function PhotoText({ look, scale = 1 }) {
  if (!look.text) {
    return null;
  }
  return (
    <span className="ptext" style={photoTextStyle(look, scale)}>
      {look.text}
    </span>
  );
}
