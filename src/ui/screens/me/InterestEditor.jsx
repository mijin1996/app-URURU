/* =========================================================
   [UI] InterestEditor.jsx — "나" 탭: 내 관심사 키워드 (최대 5개)
   ---------------------------------------------------------
   여기서 넣은 키워드가 내 프로필과 상대의 스와이프 카드에 칩(예: "러닝", "카페")으로 보여요.
   다른 사용자도 각자 자기 "나" 탭에서 똑같이 넣어요 (진짜 서버가 생기면 서로에게 전달돼요).
   - 칸에 쓰고 [+] 또는 Enter → 칩 하나 생김
   - 칩의 X → 지우기
   - 5개가 차면 입력 칸이 사라져요
   ========================================================= */

import { useRef } from "react";
import { MAX_TAG_LENGTH, MAX_TAGS } from "../../../core/config.js";
import { useCtx } from "../../app/AppContext.jsx";
import { Icon } from "../../common/Icon.jsx";
import { Tag } from "../../common/Tag.jsx";
import { t } from "../../../core/i18n/index.js";

export function InterestEditor()
{
  const { users, account, toast, nav } = useCtx();
  const tags = users.me.tags;
  const input = useRef(null);
  const canAddMore = tags.length < MAX_TAGS;

  const addTag = () =>
  {
    const result = account.addTag(input.current.value);
    if (!result.isOk)
    {
      toast.show(result.reason);
      return;
    }
    input.current.value = "";
    nav.refresh();
  };

  const removeTag = (index) =>
  {
    account.removeTag(index);
    nav.refresh();
  };

  const onKeyDown = (event) =>
  {
    if (event.key === "Enter" && !event.nativeEvent.isComposing)
    {
      addTag();
    }
  };

  return (
    <div className="box">
      <h4>{t("me.interestsCount", { n: tags.length, MAX_TAGS })}</h4>
      {tags.length ? (
        <div className="tagedit">
          {tags.map((tag, i) => (
            <Tag key={tag} text={tag}><button data-untag={i} aria-label={t("me.removeTag", { tag })} onClick={() => removeTag(i)}><Icon name="x" /></button></Tag>
          ))}
        </div>
      ) : null}
      {canAddMore && (
        <div className="nameedit tagadd">
          <input className="field" id="tagInput" ref={input} placeholder={t("me.keyword")} maxLength={MAX_TAG_LENGTH}
            aria-label={t("me.interests")} onKeyDown={onKeyDown} />
          <button className="smallbtn" id="tagAdd" aria-label={t("me.addInterest")} onClick={addTag}>+</button>
        </div>
      )}
    </div>
  );
}
