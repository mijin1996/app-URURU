/* =========================================================
   [UI] storyParts.js — 스토리 꾸미기 세 칸 표 (Table-driven)
   ---------------------------------------------------------
   색 칸과 크기 막대가 한 쌍씩이라 표로 정리했어요 (원본 STYLE_PARTS 그대로, DRY)
   colorKey: 색 / sizeKey: 크기 / canBeEmpty: 팔레트에 "없음"을 넣을지
   ========================================================= */

import { STORY_TEXT } from "../../../core/config.js";
import { t } from "../../../core/i18n/index.js";

export const STYLE_PARTS = [
  { label: t("me.background"), title: t("me.textBackground"), colorKey: "bg", sizeKey: "bgSize", min: 0, max: STORY_TEXT.maxBgSize, sizeLabel: t("me.backgroundSize"), canBeEmpty: true },
  { label: t("me.font"), title: t("me.font"), colorKey: "textColor", sizeKey: "textSize", min: STORY_TEXT.minSize, max: STORY_TEXT.maxSize, sizeLabel: t("me.fontSize"), canBeEmpty: false },
  { label: t("me.outline"), title: t("me.textOutline"), colorKey: "stroke", sizeKey: "strokeWidth", min: 0, max: STORY_TEXT.maxStroke, sizeLabel: t("me.outlineWidth"), canBeEmpty: true }
];

export const FIRST_PART_KEY = "textColor";   // 처음엔 "폰트" 칸이 골라져 있어요

export const DEFAULT_DRAFT =
{
  text: "", img: "",                       // img: [사진 추가]로 넣은 바탕 사진 (없으면 "")
  bg: "#7a5cff", bgSize: STORY_TEXT.defaultBgSize,
  textColor: "#ffffff", textSize: STORY_TEXT.defaultSize,
  stroke: "#131218", strokeWidth: STORY_TEXT.defaultStroke
};

export const findPart = (colorKey) => STYLE_PARTS.find((part) => part.colorKey === colorKey);

// 색이 "없음"이면 크기도 의미가 없어서 막대를 흐리게
export const isSizeOff = (part, draft) => part.canBeEmpty && !draft[part.colorKey];
