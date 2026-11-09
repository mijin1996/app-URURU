/* =========================================================
   [UI] photoTextStyle.js — 사진 위 글자 모양 (폰트 배경 / 폰트 색·크기 / 폰트 테두리 / 기울임)
   ---------------------------------------------------------
   편집기 미리보기(CSS)와 사진에 그리기(drawPhotoText.js, 캔버스)가 같은 숫자를 써요.
   크기는 사진 폭이 PHOTO_TEXT.baseWidth일 때 기준 → scale = 실제 폭 / baseWidth

   글 모양:
   { text,
     bg, bgSize,              // 폰트 배경 상자 색("" = 없음)과 크기
     textColor, textSize,     // 폰트 색과 크기
     stroke, strokeWidth,     // 폰트 테두리 색("" = 없음)과 두께
     fontStyle }              // 'normal' | 'italic'
   ========================================================= */

import { PHOTO_TEXT } from '../../core/config.js';

const OUTLINE_DIRECTIONS = 16; // 그림자를 16방향으로 둘러서 두꺼워져도 매끈한 테두리
export const DEFAULT_TEXT_COLOR = '#fff';
export const BOX_WIDTH_RATIO = 1.4; // 배경 상자는 위아래보다 양옆을 조금 더 넓게
export const BOX_RADIUS_RATIO = 0.8; // 배경 상자 모서리 둥글기
export const BOX_RADIUS_EXTRA = 4; // 상자가 작아도 모서리가 조금은 둥글게
export const LINE_HEIGHT = 1.55;
export const TEXT_WIDTH_RATIO = 0.88; // 글이 들어가는 폭 (사진 폭의 88%, 넘치면 줄바꿈)

// 폰트 테두리: CSS 폰트 테두리 기능은 브라우저마다 달라서, 그림자를 둘러서 그려요
function outlineShadow(color, width) {
  if (!color || width <= 0) {
    return 'none';
  }
  return Array.from({ length: OUTLINE_DIRECTIONS }, (_, i) => {
    const angle = (i / OUTLINE_DIRECTIONS) * Math.PI * 2;
    const x = (Math.cos(angle) * width).toFixed(1);
    const y = (Math.sin(angle) * width).toFixed(1);
    return `${x}px ${y}px 0 ${color}`;
  }).join(',');
}

// 사진 폭(px) → 글자 크기 배율
export const scaleFor = (photoWidth) => photoWidth / PHOTO_TEXT.baseWidth;

// 글자 한 덩어리의 style (배경 상자 + 글자 + 테두리)
export function photoTextStyle(look, scale = 1) {
  const size = (look.textSize || PHOTO_TEXT.defaultSize) * scale;
  const style = {
    color: look.textColor || DEFAULT_TEXT_COLOR,
    fontSize: `${size.toFixed(1)}px`,
    textShadow: outlineShadow(look.stroke, (look.strokeWidth || 0) * scale),
    fontStyle: look.fontStyle === 'italic' ? 'italic' : 'normal',
  };
  if (look.bg) {
    const pad = (look.bgSize || 0) * scale;
    style.background = look.bg;
    style.padding = `${pad.toFixed(1)}px ${(pad * BOX_WIDTH_RATIO).toFixed(1)}px`;
    style.borderRadius = `${(pad * BOX_RADIUS_RATIO + BOX_RADIUS_EXTRA * scale).toFixed(1)}px`;
  }
  return style;
}
