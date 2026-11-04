/* =========================================================
   [UI·Controller] MeActions.js — "나" 탭 행동 (프로필 사진 / 설정 토글 / 내 스토리)
   ---------------------------------------------------------
   화면은 입력만 넘기고, 여기서 Store를 바꾸고 서버에 알려요. (MVC의 Controller)
   결과 글(배너)이 화면마다 달라서, 실패는 Result로 돌려주고 화면이 배너를 띄워요.
   ========================================================= */

import { DEFAULT_COUNTRY, defaultCountry } from '../../core/countries.js';
import { findArea } from '../../platform/region.js';
import { t } from '../../core/i18n/index.js';

// 앱이 화면에서 내려갔는지 (시험 환경처럼 document가 없으면 화면에 있는 것으로)
const isHidden = () => typeof document !== 'undefined' && document.hidden;

export class MeActions {
  constructor(ctx) {
    this.ctx = ctx;
  }

  removePhoto(index) {
    const { users, server, nav } = this.ctx;
    users.removeMyPhoto(index);
    server.updatePhotos(users.me.photos);
    nav.refresh();
  }

  // images: 읽은 사진 주소 목록 → Result<{ skipped }> (10장이 넘으면 넘친 수)
  addPhotos(images) {
    const { users, server, nav } = this.ctx;
    const added = users.addMyPhotos(images);
    if (added.isOk) {
      server.updatePhotos(users.me.photos); // 진짜 서버: 줄여서 올림 / 가짜 서버: 아무 일 없음
      nav.refresh();
    }
    return added;
  }

  toggleSharing() {
    const { users, server } = this.ctx;
    const isOn = users.toggleSharing();
    server.setSharing(isOn);
    this.refreshRegion(); // 켜면 지금 지역을 올리고, 끄면 바로 지워요
    this.afterToggle(isOn);
  }

  // 위치 (2026-11-03 미미): 위치 공유를 켠 사람만, 앱을 쓰는 동안만
  //   지금 지역을 찾아 → 내 프로필 글자(이 기기에서만) + 서버 locations(친구에게 시·도, 결제한 친구에게 동)
  //   위치를 끈 빌드·공유를 끈 사람·한국 밖·앱이 화면에 없을 때는 서버에서 지워요
  // serverEvents가 앱을 켤 때 · 화면으로 돌아올 때 · 5분마다 불러요
  async refreshRegion() {
    const { users, server, features } = this.ctx;
    if (!users.me.country) {
      users.setCountry(defaultCountry()); // 나라 칸이 생기기 전에 가입한 사람
      server.setRegion('', users.me.country);
    }
    const canPublish = () =>
      features.canShareLocation &&
      users.me.isSharing &&
      users.me.country === DEFAULT_COUNTRY &&
      !isHidden();
    if (!canPublish()) {
      users.setRegion('');
      server.clearLocation();
      return;
    }
    const area = await findArea();
    if (!area.province || !canPublish()) {
      return; // 찾는 동안 공유를 끄거나 화면을 내렸으면 쓰지 않아요
    }
    users.setRegion(area.detail);
    server.publishLocation(area);
  }

  toggleSound() {
    this.afterToggle(this.ctx.sounds.notification.toggle());
  }

  // 토글을 누를 때마다 "톡" (켤 때 위로, 끌 때 아래로)
  afterToggle(isOn) {
    const { sounds, nav } = this.ctx;
    sounds.toggle.play(isOn);
    nav.refresh();
  }

  publishStory(storyData) {
    const { stories, server, toast } = this.ctx;
    const storyAt = stories.publishMine(storyData);
    server.publishStory(storyAt);
    toast.show(t('story.storyPosted'));
  }

  deleteStory() {
    const { stories, server } = this.ctx;
    stories.deleteMine();
    server.deleteStory();
  }
}
