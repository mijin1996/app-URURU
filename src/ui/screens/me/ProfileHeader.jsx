/* =========================================================
   [UI] ProfileHeader.jsx — "나" 탭 맨 위: 닉네임, @아이디, 나이, 동네 + 닉네임 바꾸기
   ---------------------------------------------------------
   아이디·닉네임·나이는 가입할 때 입력한 것. 닉네임만 연필 버튼으로 바꿀 수 있어요. (PRO-20~24)
   내 프로필 동그라미를 누르면 다른 사람에게 보이는 내 프로필(사진·관심사)을 미리 볼 수 있어요.
   ========================================================= */

import { useEffect, useRef } from "react";
import { MAX_NAME_LENGTH } from "../../../core/config.js";
import { ageOf } from "../../../core/time.js";
import { useCtx } from "../../app/AppContext.jsx";
import { Icon } from "../../common/Icon.jsx";
import { Avatar, joinDots } from "../../common/views.jsx";
import { useKept } from "../../hooks/useKept.js";
import { t } from "../../../core/i18n/index.js";

const AVATAR_SIZE = 72;

export function ProfileHeader()
{
  const { users, account, toast, nav } = useCtx();
  const { me } = users;
  const [isEditingName, setIsEditingName] = useKept("me.isEditingName", false);
  const input = useRef(null);
  const shouldFocus = useRef(false);   // 연필을 누른 그때만 커서를 넣어요

  useEffect(() =>
  {
    if (isEditingName && shouldFocus.current)
    {
      shouldFocus.current = false;
      input.current.focus();
    }
  }, [isEditingName]);

  const startEditing = () =>
  {
    shouldFocus.current = true;
    setIsEditingName(true);
  };

  const save = () =>
  {
    const result = account.rename(input.current.value);
    if (!result.isOk)
    {
      toast.show(result.reason);
      return;
    }
    setIsEditingName(false);
  };

  const onKeyDown = (event) =>
  {
    if (event.key === "Enter" && !event.nativeEvent.isComposing)
    {
      save();
    }
  };

  return (
    <div className="mehead">
      <button className="avbtn" id="myProfile" aria-label={t("me.viewMyProfile")} onClick={() => nav.openProfile("me")}>
        <Avatar user={me} size={AVATAR_SIZE} />
      </button>
      <div className="info">
        {isEditingName ? (
          <div className="nameedit">
            <input className="field" id="nameInput" ref={input} defaultValue={me.name} maxLength={MAX_NAME_LENGTH}
              placeholder={t("signup.handleExample")} aria-label={t("me.myNickname")} onKeyDown={onKeyDown} />
            <button className="smallbtn" id="nameSave" onClick={save}>{t("common.save")}</button>
          </div>
        ) : (
          <><h2>{me.name}</h2><p>{joinDots(`@${me.handle}`, t("me.age", { birthDate: ageOf(me.birthDate) }), me.home)}</p></>
        )}
      </div>
      {isEditingName ? null : (
        <button className="iconbtn" id="nameEdit" aria-label={t("me.changeNickname")} onClick={startEditing}><Icon name="pen" /></button>
      )}
    </div>
  );
}
