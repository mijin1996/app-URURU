/* =========================================================
   [UI] StoryEditor.jsx — "나" 탭: 내 스토리 만들기
   ---------------------------------------------------------
   - 편집 줄: 왼쪽 미리보기, 오른쪽 글 입력 + [사진 그림 = 사진 추가](왼쪽) [올리기 그림 = 스토리 올리기](오른쪽)
       · [사진 추가]는 미리보기 바탕에 사진을 넣기만 해요. 올리는 건 [스토리 올리기]로만
       · 글만, 사진만, 사진 위에 글 모두 올릴 수 있어요
   - 그 아래 크기 막대, 그 아래 색 칸 3개 (배경 / 폰트 / 테두리)
       · 색: 칸을 누르면 팔레트가 열림 (배경과 테두리는 "없음" 선택 가능)
       · 크기: 막대는 하나. 고른 칸에 따라 그 크기를 조절하도록 바뀜
   - 지금 올린 스토리 보기 / 삭제
   쓰던 글·색·크기·고른 칸은 탭을 옮겨도 남아요 (useKept, STO-32).
   ========================================================= */

import { MAX_STORY_TEXT } from "../../../core/config.js";
import { Validator } from "../../../data/Validator.js";
import { useCtx } from "../../app/AppContext.jsx";
import { DragSlider } from "../../common/DragSlider.jsx";
import { Icon } from "../../common/Icon.jsx";
import { storyCanvasStyle } from "../../common/storyStyle.js";
import { StoryText } from "../../common/StoryText.jsx";
import { useKept } from "../../hooks/useKept.js";
import { DEFAULT_DRAFT, findPart, FIRST_PART_KEY, isSizeOff, STYLE_PARTS } from "./storyParts.js";
import { t } from "../../../core/i18n/index.js";

const PREVIEW_PLACEHOLDER = t("me.preview");
const PREVIEW_SCALE = 0.4;        // 편집 미리보기 (가로 96px)는 실제의 40% 크기로
const CURRENT_THUMB_SCALE = 0.25; // 올린 스토리 작은 그림 (가로 60px)

export function StoryEditor()
{
  const { meActions, toast, picker, palette } = useCtx();
  const [draft, setDraft] = useKept("story.draft", () => ({ ...DEFAULT_DRAFT }));
  const [partKey, setPartKey] = useKept("story.part", FIRST_PART_KEY);
  const selectedPart = findPart(partKey);
  const update = (changes) => setDraft((previous) => ({ ...previous, ...changes }));

  // 사진이 있으면 글은 없어도 돼요. 둘 다 없으면 "스토리에 쓸 글을 입력하세요"
  const publishDraft = () =>
  {
    const text = Validator.storyText(draft.text);
    if (!text.isOk && !draft.img)
    {
      toast.show(text.reason);
      return;
    }
    meActions.publishStory({ ...draft, text: text.isOk ? text.value : "" });
    update({ text: "", img: "" });   // 글과 사진만 비우고 색·크기는 그대로
  };

  // 사진 추가: 미리보기 바탕에 넣기만 (올리지 않음)
  const addPhoto = async () =>
  {
    const image = await picker.pickImage();
    if (!image)
    {
      return;   // 고르다 취소한 경우
    }
    if (!image.isOk)
    {
      toast.show(image.reason);
      return;
    }
    update({ img: image.value });
  };

  // 칸을 고르면 그 칸이 표시되고, 크기 막대가 그 칸의 크기로 바뀌고, 팔레트가 열려요
  const pickPart = (part) =>
  {
    setPartKey(part.colorKey);
    palette.open({
      title: part.title,
      current: draft[part.colorKey],
      canBeEmpty: part.canBeEmpty,
      onPick: (color) => update({ [part.colorKey]: color })
    });
  };

  // 사진만 넣고 글이 없으면 "미리보기" 글자 없이 사진만 보여요
  const preview = { ...draft, text: draft.text || (draft.img ? "" : PREVIEW_PLACEHOLDER) };
  return (
    <div className="box">
      <h4>{t("story.myStory")}</h4><CurrentStory />
      <div className="editor">
        <div className="thumb" id="draftPrev" style={storyCanvasStyle(preview)}><StoryText story={preview} scale={PREVIEW_SCALE} /></div>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <input className="field" id="storyText" placeholder={t("me.storyPlaceholder")} maxLength={MAX_STORY_TEXT} value={draft.text}
            onChange={(event) => update({ text: event.target.value })} />
          <div className="btnline">
            <button className="smallbtn ghost" id="storyPhoto" aria-label={t("me.addPhoto")} onClick={addPhoto}><Icon name="image" /></button>
            <button className="smallbtn" id="storyPost" aria-label={t("me.postStory")} onClick={publishDraft}><Icon name="upload" /></button>
          </div>
        </div>
      </div>
      <div id="sizeRow">
        <div className={`sliderrow ${isSizeOff(selectedPart, draft) ? "off" : ""}`}>
          <div className="lbl"><span>{selectedPart.sizeLabel}</span><b id="sizeVal">{`${draft[selectedPart.sizeKey]}px`}</b></div>
          {/* key: 칸마다 범위가 달라서 칸을 바꾸면 막대를 새로 만들어요 */}
          <DragSlider key={selectedPart.colorKey} id="sizeSlider" label={selectedPart.sizeLabel} min={selectedPart.min} max={selectedPart.max}
            value={draft[selectedPart.sizeKey]} onChange={(size) => update({ [selectedPart.sizeKey]: size })} />
        </div>
      </div>
      <div className="pickers">
        {STYLE_PARTS.map((part) => (
          <ColorTile key={part.colorKey} part={part} color={draft[part.colorKey]} isSelected={part === selectedPart} onPick={() => pickPart(part)} />
        ))}
      </div>
    </div>
  );
}

// 색 칸: 작은 동그라미 + 이름
function ColorTile({ part, color, isSelected, onPick })
{
  return (
    <button className={`colorpick ${isSelected ? "on" : ""}`} data-part={part.colorKey} aria-pressed={isSelected} onClick={onPick}>
      <span className={`swatch ${color ? "" : "none"}`} style={color ? { background: color } : undefined}></span>{part.label}
    </button>
  );
}

// 지금 올려둔 스토리가 있으면 작게 보여주고 보기/삭제 버튼
function CurrentStory()
{
  const { users, stories, meActions, nav } = useCtx();
  if (!stories.hasActive(users.me))
  {
    return null;
  }
  const story = users.me.story;
  return (
    <div className="storyprev">
      <div className="thumb" style={storyCanvasStyle(story)}><StoryText story={story} scale={CURRENT_THUMB_SCALE} /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button className="smallbtn ghost" id="myView" onClick={() => nav.openStory("me")}>{t("me.viewMyStory")}</button>
        <button className="smallbtn ghost" id="myDel" style={{ color: "var(--alert)" }} onClick={() => meActions.deleteStory()}>{t("common.delete")}</button>
      </div>
    </div>
  );
}
