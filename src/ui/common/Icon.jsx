/* =========================================================
   [UI] Icon.jsx — <Icon name="heart" />
   ---------------------------------------------------------
   아이콘 그림과 크기는 core/icons.js 한 곳에만 있어요 (원본 그대로).
   그 HTML에서 <svg> 안쪽 선 그림만 꺼내 같은 모양의 <svg>로 그려요.
   ========================================================= */

import { icon } from "../../core/icons.js";

const cache = {};

function iconParts(name)
{
  if (!cache[name])
  {
    const html = icon(name);
    cache[name] =
    {
      size: Number(html.match(/width="(\d+)"/)[1]),
      inner: html.slice(html.indexOf(">") + 1, html.lastIndexOf("</svg>"))
    };
  }
  return cache[name];
}

export function Icon({ name })
{
  const { size, inner } = iconParts(name);
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: inner }} />
  );
}
