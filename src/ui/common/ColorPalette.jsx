/* =========================================================
   [UI] ColorPalette.jsx — 색 고르기 팔레트 창
   ---------------------------------------------------------
   폰에 원래 있는 색 고르기 창에는 "없음"을 넣을 수 없어서, 팔레트를 직접 만들었어요.
   - 맨 앞: "없음" (빨간 사선 동그라미) — 고를 수 있는 칸에서만
   - 가운데: 자주 쓰는 색
   - 맨 뒤: 무지개 동그라미 = 폰의 색 고르기 창으로 직접 고르기

   부르는 방법은 원본과 같아요:
   palette.open({ title: "폰트 배경", current: "#7a5cff", canBeEmpty: true, onPick: (color) => ... })
   "없음"을 고르면 onPick("")
   ========================================================= */

import { useEffect, useRef } from "react";
import { PALETTE_COLORS } from "../../core/config.js";
import { Scrim } from "./Modal.jsx";
import { t } from "../../core/i18n/index.js";

const DEFAULT_CUSTOM_COLOR = "#ffffff";

export function createPalette(overlays)
{
  return {
    open(options)
    {
      overlays.open({
        kind: "scrim",
        render: (close) => (
          <Scrim close={close} closeOnBackdrop>
            <PaletteSheet {...options} close={close} />
          </Scrim>
        )
      });
    }
  };
}

function PaletteSheet({ title, current, canBeEmpty, onPick, close })
{
  const customInput = useRef(null);
  const pick = (color) =>
  {
    close();
    onPick(color);
  };

  // 직접 고르기: 고르는 동안(input) 미리보기가 바로 바뀌고, 다 고르면(change) 팔레트를 닫아요
  // React의 onChange는 input마다 불려서, 진짜 "change"는 직접 연결해요
  useEffect(() =>
  {
    const input = customInput.current;
    const onDone = () => pick(input.value);
    input.addEventListener("change", onDone);
    return () => input.removeEventListener("change", onDone);
  }, []);

  return (
    <div className="sheet palette" role="dialog" aria-label={t("me.colorOf", { title })}>
      <h3>{title}</h3>
      <div className="pgrid">
        {canBeEmpty && (
          <button className={`pswatch none ${current ? "" : "on"}`} data-color="" aria-label={t("me.none")} onClick={() => pick("")}></button>
        )}
        {PALETTE_COLORS.map((color) => (
          <button key={color} className={`pswatch ${color === current ? "on" : ""}`} data-color={color}
            style={{ background: color }} aria-label={color} onClick={() => pick(color)}></button>
        ))}
        <label className="pswatch custom" aria-label={t("me.custom")}>
          <input ref={customInput} type="color" defaultValue={current || DEFAULT_CUSTOM_COLOR}
            onInput={(event) => onPick(event.currentTarget.value)} />
        </label>
      </div>
    </div>
  );
}
