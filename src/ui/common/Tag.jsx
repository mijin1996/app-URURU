/* =========================================================
   [UI] Tag.jsx — 관심사 태그 하나 (스와이프 카드 · 프로필 · 나 탭 관심사가 같이 써요)
   ---------------------------------------------------------
   알록달록한 네모 태그: 모양은 styles/base.css의 .tag 한 곳
   색은 태그 글자로 정해서, 같은 태그("러닝")는 누구 프로필에서든 언제나 같은 색이에요
   children: 나 탭에서 태그 옆에 붙는 지우기(X) 버튼
   ========================================================= */

// 태그 바탕색 (글자는 모두 진한 색 --on-yellow라 어떤 색에서도 잘 보여요)
const TAG_COLORS = ["#ffd23f", "#3ee08f", "#ff9f43", "#b49bff", "#5ec8ff", "#ff7eb6"];

// 글자 → 색 번호 (매번 같은 답)
function colorOf(text)
{
  let sum = 0;
  for (const ch of String(text))
  {
    sum = (sum * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return TAG_COLORS[sum % TAG_COLORS.length];
}

export function Tag({ text, children })
{
  return <span className="tag" style={{ "--tag-bg": colorOf(text) }}>{text}{children}</span>;
}
