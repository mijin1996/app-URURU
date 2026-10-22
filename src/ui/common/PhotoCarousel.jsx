/* =========================================================
   [UI] PhotoCarousel.jsx — 프로필 사진 좌우로 넘기기
   ---------------------------------------------------------
   - 손가락으로 밀기 (50px 넘게 밀면 다음 사진)
   - 또는 사진 왼쪽 / 오른쪽 35% 터치
   끄는 동안의 위치는 React 상태가 아니라 요소의 style을 직접 바꿔요.
   (매 움직임마다 다시 그리지 않게 — 원본과 같은 방법)

   <PhotoCarousel user={user} photos={photos}>{사진 아래 정보}</PhotoCarousel>
   ========================================================= */

import { useLayoutEffect, useRef, useState } from "react";
import { PHOTO_DRAG_PX, TAP_EDGE_RATIO, TAP_MOVE_PX } from "../../core/config.js";
import { useDrag } from "../hooks/useDrag.js";
import { Photo } from "./views.jsx";

export function PhotoCarousel({ user, photos, children })
{
  const [index, setIndex] = useState(0);
  const root = useRef(null);
  const track = useRef(null);
  const currentIndex = useRef(0);
  currentIndex.current = index;

  // dragPx: 손가락으로 끌고 있는 만큼 사진을 같이 움직여 보여줌
  const place = (dragPx = 0) =>
  {
    track.current.style.transform = `translateX(calc(${-currentIndex.current * 100}% + ${dragPx}px))`;
  };
  useLayoutEffect(() => place(), [index]);

  const go = (nextIndex) =>
  {
    const next = Math.min(photos.length - 1, Math.max(0, nextIndex));
    if (next === currentIndex.current)
    {
      place();   // 끝에서 더 밀었으면 제자리로
      return;
    }
    setIndex(next);
  };

  const onTap = (clientX) =>
  {
    const rect = root.current.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    if (ratio < TAP_EDGE_RATIO)
    {
      go(currentIndex.current - 1);
    }
    else if (ratio > 1 - TAP_EDGE_RATIO)
    {
      go(currentIndex.current + 1);
    }
    else
    {
      place();
    }
  };

  // 많이 밀었으면 넘기고, 거의 안 움직였으면 "터치"로 봄
  const drag = useDrag({
    onStart: () => track.current.classList.add("dragging"),   // 끄는 동안은 부드러운 이동 효과를 끔
    onMove: (event, dx) => place(dx),
    onEnd: (event, dx) =>
    {
      track.current.classList.remove("dragging");
      if (Math.abs(dx) > PHOTO_DRAG_PX)
      {
        go(currentIndex.current - Math.sign(dx));
      }
      else if (Math.abs(dx) < TAP_MOVE_PX)
      {
        onTap(event.clientX);
      }
      else
      {
        place();
      }
    }
  });

  return (
    <div className="pvcard" id="pvCard" ref={root} {...drag}>
      <div className="bars">{photos.map((_, i) => <i key={i} className={i === index ? "on" : undefined}></i>)}</div>
      <div className="ptrack" ref={track}>
        {photos.map((photo, i) => (
          <div className="pslide" key={i}>
            <Photo user={user} photo={photo}><span className="cap">{`${i + 1} / ${photos.length}`}</span></Photo>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
