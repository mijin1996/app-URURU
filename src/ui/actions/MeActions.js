/* =========================================================
   [UI·Controller] MeActions.js — "나" 탭 행동 (프로필 사진 / 설정 토글 / 내 스토리)
   ---------------------------------------------------------
   화면은 입력만 넘기고, 여기서 Store를 바꾸고 서버에 알려요. (MVC의 Controller)
   결과 글(배너)이 화면마다 달라서, 실패는 Result로 돌려주고 화면이 배너를 띄워요.
   ========================================================= */

import { DEFAULT_COUNTRY, defaultCountry } from "../../core/countries.js";
import { findArea } from "../../platform/region.js";
import { t } from "../../core/i18n/index.js";

export class MeActions
{
  constructor(ctx)
  {
    this.ctx = ctx;
  }

  removePhoto(index)
  {
    const { users, server, nav } = this.ctx;
    users.removeMyPhoto(index);
    server.updatePhotos(users.me.photos);
    nav.refresh();
  }

  // images: 읽은 사진 주소 목록 → Result<{ skipped }> (10장이 넘으면 넘친 수)
  addPhotos(images)
  {
    const { users, server, nav } = this.ctx;
    const added = users.addMyPhotos(images);
    if (added.isOk)
    {
      server.updatePhotos(users.me.photos);   // 진짜 서버: 줄여서 올림 / 가짜 서버: 아무 일 없음
      nav.refresh();
    }
    return added;
  }

  toggleSharing()
  {
    const { users, server } = this.ctx;
    const isOn = users.toggleSharing();
    server.setSharing(isOn);
    this.afterToggle(isOn);
  }

  // 프로필 "➤ 나라 지역": 앱을 켤 때 지금 위치로 대략적인 지역(시·도 시·군·구 동)을 찾아요
  // 지역이 바뀌었을 때만 서버에 써요. 위치를 끈 빌드(토스)·한국 밖은 나라만 보여요
  async refreshRegion()
  {
    const { users, server, features } = this.ctx;
    const needsCountry = !users.me.country;   // 나라 칸이 생기기 전에 가입한 사람
    if (needsCountry)
    {
      users.setCountry(defaultCountry());
    }
    if (!features.canShareLocation || users.me.country !== DEFAULT_COUNTRY)
    {
      if (needsCountry)
      {
        server.setRegion(users.me.region || "", users.me.country);
      }
      return;
    }
    const area = await findArea();
    if ((area && users.setRegion(area)) || needsCountry)
    {
      server.setRegion(users.me.region || "", needsCountry ? users.me.country : "");
    }
  }

  toggleSound()
  {
    this.afterToggle(this.ctx.sounds.notification.toggle());
  }

  // 토글을 누를 때마다 "톡" (켤 때 위로, 끌 때 아래로)
  afterToggle(isOn)
  {
    const { sounds, nav } = this.ctx;
    sounds.toggle.play(isOn);
    nav.refresh();
  }

  publishStory(storyData)
  {
    const { stories, server, toast } = this.ctx;
    const storyAt = stories.publishMine(storyData);
    server.publishStory(storyAt);
    toast.show(t("story.storyPosted"));
  }

  deleteStory()
  {
    const { stories, server } = this.ctx;
    stories.deleteMine();
    server.deleteStory();
  }
}
