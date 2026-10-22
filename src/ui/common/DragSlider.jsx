/* =========================================================
   [UI] DragSlider.jsx — 좌우로 끌어서 값을 바꾸는 막대 (스토리 크기 조절)
   ---------------------------------------------------------
   <DragSlider id="sizeSlider" label="폰트 크기" min={16} max={48} value={28} onChange={(v) => ...} />
   손가락 위치로 값을 정하고, 키보드 ←/→ 로도 1씩 바꿀 수 있어요.
   ========================================================= */

import { useRef } from "react";
import { useDrag } from "../hooks/useDrag.js";

const KEY_STEP = 1;   // 키보드 화살표 한 번에 바뀌는 값
const PERCENT = 100;

export function DragSlider({ id, label, min, max, value, onChange })
{
  const element = useRef(null);
  // 손가락이 빨리 움직이면 다시 그리기 전에 다음 움직임이 와서, 마지막 값을 ref에도 적어둬요
  const latestValue = useRef(value);
  latestValue.current = value;

  const set = (newValue) =>
  {
    const next = Math.min(max, Math.max(min, newValue));
    if (next === latestValue.current)
    {
      return;
    }
    latestValue.current = next;
    onChange(next);
  };

  // 손가락 위치(x) → 값
  const setFromX = (clientX) =>
  {
    const rect = element.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    set(Math.round(min + ratio * (max - min)));
  };

  const drag = useDrag({
    onStart: (event) => setFromX(event.clientX),
    onMove: (event) => setFromX(event.clientX)
  });

  const onKeyDown = (event) =>
  {
    if (event.key === "ArrowRight")
    {
      set(latestValue.current + KEY_STEP);
    }
    if (event.key === "ArrowLeft")
    {
      set(latestValue.current - KEY_STEP);
    }
  };

  const percent = ((value - min) / (max - min)) * PERCENT;
  return (
    <div className="slider" id={id} ref={element} role="slider" tabIndex={0} aria-label={label}
      aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} onKeyDown={onKeyDown} {...drag}>
      <div className="track"><div className="fill" style={{ width: `${percent}%` }}></div></div>
      <div className="thumb2" style={{ left: `${percent}%` }}></div>
    </div>
  );
}
