/* =========================================================
   [UI] MeScreen.jsx — 나 탭
   ---------------------------------------------------------
   "나" 탭은 할 일이 많아서 네 부품으로 나눴어요. (SRP, Composition)
     1. ProfileHeader  — 닉네임 / 나이 / 닉네임 바꾸기
     2. PhotoManager   — 프로필 사진 최대 10장 (올릴 때 사진에 글 쓰기)
     3. InterestEditor — 관심사 키워드 최대 5개 (프로필·스와이프 카드의 칩)
     4. SettingsPanel  — 설정 / 신고 목록 / 회원탈퇴
   새 부품을 추가하고 싶으면 PARTS에 하나 더 넣으면 돼요. (OCP)
   ========================================================= */

import { InterestEditor } from './InterestEditor.jsx';
import { PhotoManager } from './PhotoManager.jsx';
import { ProfileHeader } from './ProfileHeader.jsx';
import { SettingsPanel } from './SettingsPanel.jsx';
import { TOPIC } from '../../../core/topics.js';
import { useChanges } from '../../hooks/useChanges.js';

const PARTS = [ProfileHeader, PhotoManager, InterestEditor, SettingsPanel];

export function MeScreen() {
  useChanges(TOPIC.me, TOPIC.users); // 내 정보·차단 목록
  return PARTS.map((Part, i) => <Part key={i} />);
}
