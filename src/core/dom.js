/* =========================================================
   [Core] dom.js — 화면 요소를 다룰 때 자주 쓰는 작은 도구
   ========================================================= */

// 화면에서 요소 하나 찾기 (document.querySelector를 짧게)
export const $ = (selector, root = document) => root.querySelector(selector);

// 화면에서 요소 여러 개 찾기
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// 사용자가 쓴 글을 화면에 넣기 전에 특수문자를 바꿔요.
// 왜? 누가 이름에 <script> 같은 걸 넣으면 그게 코드로 실행될 수 있어서 (보안)
export const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[c]);

// 메시지 등에 붙일 짧은 고유 번호
export const uid = () => Math.random().toString(36).slice(2, 10);
