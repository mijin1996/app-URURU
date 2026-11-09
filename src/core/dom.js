/* =========================================================
   [Core] dom.js — 화면 요소를 다룰 때 자주 쓰는 작은 도구
   ========================================================= */

// 화면에서 요소 하나 찾기 (document.querySelector를 짧게)
export const $ = (selector, root = document) => root.querySelector(selector);

// 메시지 등에 붙일 짧은 고유 번호
export const uid = () => Math.random().toString(36).slice(2, 10);
