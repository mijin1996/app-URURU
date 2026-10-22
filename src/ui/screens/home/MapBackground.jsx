/* =========================================================
   [UI] MapBackground.jsx — 직접 그린 지도 그림
   ---------------------------------------------------------
   카카오 지도 키가 없거나 지도를 못 불러올 때 보여주는 대신 그림이에요 (KakaoMap.jsx).
   한 번 그리면 바뀔 일이 없어서 memo로 다시 그리지 않아요.
   ========================================================= */

import { memo } from "react";
import { t } from "../../../core/i18n/index.js";

export const MapBackground = memo(function MapBackground()
{
  return (
    <svg className="bg" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect className="land" width="400" height="700" />
      <path className="park" d="M40 120q60-40 120 0t40 90q-50 40-120 10T40 120z" />
      <path className="park" d="M250 420q70-30 120 20t-20 100q-70 20-110-30t10-90z" />
      <path className="park" d="M300 90q50 0 60 40t-40 50q-40-10-40-50z" />
      <path className="water" d="M-10 520Q80 470 130 520T250 560T420 520" />
      <path className="water" d="M60 -10Q90 150 70 300T110 520" />
      <path className="major" d="M-10 250L420 330" /><path className="major" d="M230 -10L270 710" />
      <path className="road" d="M-10 400L420 420M120 -10L160 710M330 -10L300 710M-10 150L420 190M-10 620L420 600" />
      <circle className="radius" cx="200" cy="350" r="170" />
      <text className="lbl" x="250" y="95">{t("map.osan")}</text><text className="lbl" x="300" y="680">{t("map.pyeongtaek")}</text>
    </svg>
  );
});
