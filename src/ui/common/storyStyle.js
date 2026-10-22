/* =========================================================
   [UI] storyStyle.js — 글 스토리 모양 계산 (폰트 배경 / 폰트 색·크기 / 폰트 테두리)
   ---------------------------------------------------------
   원본 storyStyle.js와 같은 계산이에요. 원본은 HTML 글자를 돌려줬고,
   React 버전은 style 객체를 돌려줘요 (그리는 건 StoryText.jsx).
   scale: 작은 미리보기에서는 크기를 줄여서 그려요 (1 = 실제 크기)

   story 모양:
   { text, img,
     bg, bgSize,              // 폰트 배경 상자 색("" = 없음)과 크기
     textColor, textSize,     // 폰트 색과 크기
     stroke, strokeWidth }    // 폰트 테두리 색("" = 없음)과 두께
   ========================================================= */

import { STORY_TEXT } from "../../core/config.js";

const OUTLINE_DIRECTIONS = 16;   // 그림자를 16방향으로 둘러서 두꺼워져도 매끈한 테두리
const DEFAULT_TEXT_COLOR = "#fff";
const BOX_WIDTH_RATIO = 1.4;     // 배경 상자는 위아래보다 양옆을 조금 더 넓게
const BOX_RADIUS_RATIO = 0.8;    // 배경 상자 모서리 둥글기
const BOX_RADIUS_EXTRA = 4;      // 상자가 작아도 모서리가 조금은 둥글게

// 폰트 테두리: CSS 폰트 테두리 기능은 브라우저마다 달라서, 그림자를 둘러서 그려요
export function outlineShadow(color, width)
{
  if (!color || width <= 0)
  {
    return "none";
  }
  return Array.from({ length: OUTLINE_DIRECTIONS }, (_, i) =>
  {
    const angle = (i / OUTLINE_DIRECTIONS) * Math.PI * 2;
    const x = (Math.cos(angle) * width).toFixed(1);
    const y = (Math.sin(angle) * width).toFixed(1);
    return `${x}px ${y}px 0 ${color}`;
  }).join(",");
}

// 스토리 바탕: 사진 스토리면 사진, 글 스토리면 CSS의 기본 검은 바탕
export function storyCanvasStyle(story)
{
  return story.img ? { backgroundImage: `url(${story.img})` } : undefined;
}

// 글자 한 덩어리의 style (배경 상자 + 글자 + 테두리)
export function storyTextStyle(story, scale = 1)
{
  const size = (story.textSize || STORY_TEXT.defaultSize) * scale;
  const style =
  {
    color: story.textColor || DEFAULT_TEXT_COLOR,
    fontSize: `${size.toFixed(1)}px`,
    textShadow: outlineShadow(story.stroke, (story.strokeWidth || 0) * scale)
  };
  if (story.bg)
  {
    const pad = (story.bgSize || 0) * scale;
    style.background = story.bg;
    style.padding = `${pad.toFixed(1)}px ${(pad * BOX_WIDTH_RATIO).toFixed(1)}px`;
    style.borderRadius = `${(pad * BOX_RADIUS_RATIO + BOX_RADIUS_EXTRA * scale).toFixed(1)}px`;
  }
  return style;
}
