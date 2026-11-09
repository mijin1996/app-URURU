/* =========================================================
   [UI] photoTextParts.js — 사진 글 꾸미기 세 칸 표 (Table-driven)
   ---------------------------------------------------------
   색 칸과 크기 막대가 한 쌍씩이라 표로 정리했어요 (DRY)
   colorKey: 색 / sizeKey: 크기 / canBeEmpty: 팔레트에 "없음"을 넣을지
   ========================================================= */

import { PHOTO_TEXT } from '../../../core/config.js';
import { t } from '../../../core/i18n/index.js';

export const STYLE_PARTS = [
  {
    label: t('me.background'),
    title: t('me.textBackground'),
    colorKey: 'bg',
    sizeKey: 'bgSize',
    min: 0,
    max: PHOTO_TEXT.maxBgSize,
    sizeLabel: t('me.backgroundSize'),
    canBeEmpty: true,
  },
  {
    label: t('me.font'),
    title: t('me.font'),
    colorKey: 'textColor',
    sizeKey: 'textSize',
    min: PHOTO_TEXT.minSize,
    max: PHOTO_TEXT.maxSize,
    sizeLabel: t('me.fontSize'),
    canBeEmpty: false,
  },
  {
    label: t('me.outline'),
    title: t('me.textOutline'),
    colorKey: 'stroke',
    sizeKey: 'strokeWidth',
    min: 0,
    max: PHOTO_TEXT.maxStroke,
    sizeLabel: t('me.outlineWidth'),
    canBeEmpty: true,
  },
];

// 폰트 모양: 일반 / 기울임. 버튼에는 같은 글자를 그 모양으로 보여줘요 (설명 글 없이)
export const FONT_STYLES = [
  { key: 'normal', label: t('me.fontNormal') },
  { key: 'italic', label: t('me.fontItalic') },
];

export const FIRST_PART_KEY = 'textColor'; // 처음엔 "폰트" 칸이 골라져 있어요

export const DEFAULT_DRAFT = {
  text: '',
  bg: '#7a5cff',
  bgSize: PHOTO_TEXT.defaultBgSize,
  textColor: '#ffffff',
  textSize: PHOTO_TEXT.defaultSize,
  stroke: '#131218',
  strokeWidth: PHOTO_TEXT.defaultStroke,
  fontStyle: 'normal',
};

export const findPart = (colorKey) => STYLE_PARTS.find((part) => part.colorKey === colorKey);

// 색이 "없음"이면 크기도 의미가 없어서 막대를 흐리게
export const isSizeOff = (part, draft) => part.canBeEmpty && !draft[part.colorKey];
