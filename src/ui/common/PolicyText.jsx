/* =========================================================
   [UI] PolicyText.jsx — 정책 문서(docs/policy/*.md)를 앱 화면에 그리기
   ---------------------------------------------------------
   글의 원본은 docs/policy/ 한 곳이에요. 앱은 그 .md를 그대로 읽어서 보여줘요 (?raw).
   영어 화면은 같은 이름의 .en.md (terms.en.md, chat-rules.en.md)를 보여줘요. 한국어판을 고치면 영어판도 같이 고쳐요.
   그래서 이용약관·채팅 이용 수칙을 고칠 때는 .md만 고치고 다시 빌드하면 앱 화면도 같이 바뀌어요.

   POLICY_DOCS      문서 목록 (나 탭 "정책" 상자 순서)
   <PolicyText>     .md 글 → 화면 (제목, 목록, 표, 굵게, 다른 정책 문서 링크만 알아들어요)
   [이용약관](terms.md)처럼 다른 정책 문서로 가는 링크는 누르면 그 문서가 열려요 (onOpenDoc)
   ========================================================= */

import chatRules from "../../../docs/policy/chat-rules.md?raw";
import chatRulesEn from "../../../docs/policy/chat-rules.en.md?raw";
import terms from "../../../docs/policy/terms.md?raw";
import termsEn from "../../../docs/policy/terms.en.md?raw";
import { getLanguage, t } from "../../core/i18n/index.js";

// 영어 화면이면 .en.md (영어판), 아니면 원래 .md (다국어). 링크 이름(file)은 언어와 상관없이 같아요
const isEnglish = getLanguage() === "en";

export const POLICY_DOCS = [
  { file: "chat-rules.md", title: t("chat.chatRules"), text: isEnglish ? chatRulesEn : chatRules },
  { file: "terms.md", title: t("me.terms"), text: isEnglish ? termsEn : terms }
];

export function policyDoc(file)
{
  return POLICY_DOCS.find((doc) => doc.file === file) || null;
}

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;

// 한 줄 안: **굵게**, [이름](파일.md)
function Inline({ text, onOpenDoc })
{
  return text.split(INLINE).filter(Boolean).map((part, i) =>
  {
    if (part.startsWith("**") && part.endsWith("**"))
    {
      return <b key={i}>{part.slice(2, -2)}</b>;
    }
    const link = part.match(LINK);
    if (link)
    {
      const doc = policyDoc(link[2]);
      return doc && onOpenDoc
        ? <button key={i} className="doclink" onClick={() => onOpenDoc(doc.file)}>{link[1]}</button>
        : <span key={i}>{link[1]}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

// .md 글을 덩어리(제목 / 목록 / 표 / 인용 / 문단)로 나눠요
function toBlocks(markdown)
{
  const blocks = [];
  const last = () => blocks[blocks.length - 1];
  markdown.split(/\r?\n/).forEach((raw) =>
  {
    const line = raw.trim();
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (!line)
    {
      blocks.push({ kind: "gap" });
    }
    else if (heading)
    {
      blocks.push({ kind: `h${heading[1].length}`, text: heading[2] });
    }
    else if (line.startsWith("|"))
    {
      const cells = line.slice(1, -1).split("|").map((cell) => cell.trim());
      if (cells.every((cell) => /^:?-+:?$/.test(cell)))
      {
        return;   // 표 머리 아래 구분 줄
      }
      if (last() && last().kind === "table")
      {
        last().rows.push(cells);
      }
      else
      {
        blocks.push({ kind: "table", rows: [cells] });
      }
    }
    else if (/^[-·]\s+/.test(line))
    {
      const item = line.replace(/^[-·]\s+/, "");
      if (last() && last().kind === "list")
      {
        last().items.push(item);
      }
      else
      {
        blocks.push({ kind: "list", items: [item] });
      }
    }
    else if (line.startsWith(">"))
    {
      blocks.push({ kind: "quote", text: line.replace(/^>\s*/, "") });
    }
    else if (/^\d+\.\s+/.test(line))
    {
      blocks.push({ kind: "para", lines: [line] });   // "1. ~" 처럼 번호로 시작하면 한 줄씩
    }
    else if (last() && last().kind === "para")
    {
      last().lines.push(line);
    }
    else
    {
      blocks.push({ kind: "para", lines: [line] });
    }
  });
  return blocks.filter((block) => block.kind !== "gap");
}

export function PolicyText({ markdown, onOpenDoc })
{
  return (
    <div className="policytext">
      {toBlocks(markdown).map((block, i) => {
        if (block.kind === "h1")
        {
          return <h3 key={i}>{block.text}</h3>;
        }
        if (block.kind === "h2" || block.kind === "h3")
        {
          return <h4 key={i}>{block.text}</h4>;
        }
        if (block.kind === "list")
        {
          return <ul key={i}>{block.items.map((item, j) => <li key={j}><Inline text={item} onOpenDoc={onOpenDoc} /></li>)}</ul>;
        }
        if (block.kind === "table")
        {
          const [head, ...rows] = block.rows;
          return (
            <div key={i} className="tablewrap">
              <table>
                <thead><tr>{head.map((cell, j) => <th key={j}><Inline text={cell} /></th>)}</tr></thead>
                <tbody>{rows.map((row, r) => <tr key={r}>{row.map((cell, j) => <td key={j}><Inline text={cell} /></td>)}</tr>)}</tbody>
              </table>
            </div>
          );
        }
        if (block.kind === "quote")
        {
          return <blockquote key={i}><Inline text={block.text} onOpenDoc={onOpenDoc} /></blockquote>;
        }
        // 문단 안의 줄바꿈은 띄어쓰기로 이어서, 폰 폭에 맞게 자연스럽게 줄이 바뀌어요
        return <p key={i}><Inline text={block.lines.join(" ")} onOpenDoc={onOpenDoc} /></p>;
      })}
    </div>
  );
}
