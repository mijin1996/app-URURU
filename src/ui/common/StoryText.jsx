/* =========================================================
   [UI] StoryText.jsx — 글 스토리 글자 한 덩어리
   ---------------------------------------------------------
   "나" 탭 미리보기, 내 스토리 작은 그림, 스토리 보기 화면이 같은 모양이라 함께 써요. (DRY)
   ========================================================= */

import { storyTextStyle } from "./storyStyle.js";

export function StoryText({ story, scale = 1 })
{
  if (!story.text)
  {
    return null;
  }
  return <span className="stext" style={storyTextStyle(story, scale)}>{story.text}</span>;
}
