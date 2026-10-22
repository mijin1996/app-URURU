/* =========================================================
   [UI] PhotoManager.jsx — "나" 탭: 내 프로필 사진 (최대 10장)
   ---------------------------------------------------------
   여러 장 한 번에 고르기, 한 장씩 지우기. 첫 장이 대표 사진. 칸은 상자 안을 꽉 채우게 크게 (한 줄 3칸).
   친구들은 내 프로필에서 이 사진들을 좌우로 넘겨 봐요.
   ========================================================= */

import { MAX_PHOTOS } from "../../../core/config.js";
import { readImages } from "../../../data/imageReader.js";
import { useCtx } from "../../app/AppContext.jsx";
import { Icon } from "../../common/Icon.jsx";
import { Photo } from "../../common/views.jsx";
import { t } from "../../../core/i18n/index.js";

export function PhotoManager()
{
  const { users, picker, toast, meActions } = useCtx();
  const { me } = users;
  const canAddMore = me.photos.length < MAX_PHOTOS;


  const addPhotos = async () =>
  {
    const files = await picker.pick({ isMultiple: true });
    if (!files.length)
    {
      return;   // 고르다 취소한 경우
    }
    const read = await readImages(files);
    if (!read.isOk)
    {
      toast.show(read.reason);
      return;
    }
    const added = meActions.addPhotos(read.value);
    if (!added.isOk)
    {
      toast.show(added.reason);
      return;
    }
    const { skipped } = added.value;
    toast.show(skipped ? t("me.photosSkipped", { MAX_PHOTOS, skipped }) : t("me.photosUploaded"));
  };

  return (
    <div className="box">
      <h4>{t("me.photosCount", { n: me.photos.length, MAX_PHOTOS })}</h4>
      <div className="photogrid">
        {me.photos.map((photo, i) => (
          <div className="cell" key={i}>
            <Photo user={me} photo={photo} />
            <button className="del" data-del={i} aria-label={t("me.deletePhotoN", { n: i + 1 })} onClick={() => meActions.removePhoto(i)}><Icon name="x" /></button>
          </div>
        ))}
        {canAddMore && <button className="add" id="addPhoto" aria-label={t("me.addPhoto")} onClick={addPhotos}>+</button>}
      </div>
    </div>
  );
}
