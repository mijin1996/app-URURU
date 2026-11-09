/* =========================================================
   [UI] drawPhotoText.js — 사진에 글자를 그려서 새 사진으로 (캔버스)
   ---------------------------------------------------------
   편집기 미리보기(PhotoText, CSS)와 같은 모양이 되게 photoTextStyle.js의 숫자를 같이 써요.
   글이 없으면 원래 사진을 그대로 돌려줘요. 큰 사진은 긴 변 MAX_EDGE로 줄여요.
   ========================================================= */

import { PHOTO_TEXT } from '../../core/config.js';
import {
  BOX_RADIUS_EXTRA,
  BOX_RADIUS_RATIO,
  BOX_WIDTH_RATIO,
  DEFAULT_TEXT_COLOR,
  LINE_HEIGHT,
  scaleFor,
  TEXT_WIDTH_RATIO,
} from './photoTextStyle.js';

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.9;
const BOX_HEIGHT_RATIO = 1.2; // 배경 상자 안쪽 높이 = 글자 크기 × 1.2 (CSS 글자 칸과 비슷하게)

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (!src.startsWith('data:')) {
      image.crossOrigin = 'anonymous'; // 저장소 주소 사진도 캔버스에서 다시 읽을 수 있게 (저장소 CORS 설정 필요)
    }
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

// 폭을 넘으면 줄바꿈: 띄어쓰기에서 먼저 자르고, 한 단어가 너무 길면 글자 단위로
function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of text.split(/(\s+)/)) {
    const next = line + word;
    if (ctx.measureText(next).width <= maxWidth) {
      line = next;
      continue;
    }
    if (line.trim()) {
      lines.push(line.trim());
    }
    line = '';
    for (const ch of word.trimStart()) {
      if (ctx.measureText(line + ch).width > maxWidth && line) {
        lines.push(line);
        line = '';
      }
      line += ch;
    }
  }
  if (line.trim()) {
    lines.push(line.trim());
  }
  return lines;
}

// src: 사진 주소(data URL), look: photoTextStyle.js의 글 모양 → Promise<새 사진 주소>
export async function drawPhotoText(src, look) {
  const text = (look.text || '').trim();
  if (!text) {
    return src;
  }
  const image = await loadImage(src);
  const shrink = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.round(image.naturalWidth * shrink);
  const height = Math.round(image.naturalHeight * shrink);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);

  const scale = scaleFor(width);
  const size = (look.textSize || PHOTO_TEXT.defaultSize) * scale;
  const family = getComputedStyle(document.body).fontFamily;
  ctx.font = `${look.fontStyle === 'italic' ? 'italic ' : ''}900 ${size}px ${family}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = wrapLines(ctx, text, width * TEXT_WIDTH_RATIO);
  const lineHeight = size * LINE_HEIGHT;
  const top = height / 2 - (lines.length * lineHeight) / 2 + lineHeight / 2;
  const pad = (look.bgSize || 0) * scale;
  const stroke = (look.strokeWidth || 0) * scale;

  lines.forEach((line, i) => {
    const y = top + i * lineHeight;
    if (look.bg) {
      const boxW = ctx.measureText(line).width + pad * BOX_WIDTH_RATIO * 2;
      const boxH = size * BOX_HEIGHT_RATIO + pad * 2;
      ctx.fillStyle = look.bg;
      ctx.beginPath();
      ctx.roundRect(
        width / 2 - boxW / 2,
        y - boxH / 2,
        boxW,
        boxH,
        pad * BOX_RADIUS_RATIO + BOX_RADIUS_EXTRA * scale,
      );
      ctx.fill();
    }
    if (look.stroke && stroke > 0) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke * 2; // 선은 글자 안팎으로 반씩 그려져서 2배
      ctx.strokeStyle = look.stroke;
      ctx.strokeText(line, width / 2, y);
    }
    ctx.fillStyle = look.textColor || DEFAULT_TEXT_COLOR;
    ctx.fillText(line, width / 2, y);
  });
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}
