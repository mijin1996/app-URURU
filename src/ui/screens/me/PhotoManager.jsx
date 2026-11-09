/* =========================================================
   [UI] PhotoManager.jsx — "나" 탭: 내 프로필 사진 (최대 10장)
   ---------------------------------------------------------
   - [+] 여러 장 한 번에 고르기 → 사진 편집기(PhotoEditor)에서 사진마다 글 쓰기 → 올리기
   - 올린 사진을 누르면 다시 편집 (원본 + 그때 쓴 글 모양으로 열림), 빨간 X로 지우기
   - 제목 줄 오른쪽 확장 아이콘: 친구에게 보이는 내 전체 화면 프로필 미리보기
   첫 장이 대표 사진. 칸은 상자 안을 꽉 채우게 크게 (한 줄 3칸).
   ========================================================= */

import { MAX_PHOTOS } from '../../../core/config.js';
import { readImages } from '../../../data/imageReader.js';
import { useCtx } from '../../app/AppContext.jsx';
import { Icon } from '../../common/Icon.jsx';
import { openPhotoEditor } from '../../overlays/photoEdit/PhotoEditor.jsx';
import { Photo } from '../../common/views.jsx';
import { t } from '../../../core/i18n/index.js';

export function PhotoManager() {
  const ctx = useCtx();
  const { users, picker, toast, meActions, nav } = ctx;
  const { me } = users;
  const canAddMore = me.photos.length < MAX_PHOTOS;

  const addPhotos = async () => {
    const files = await picker.pick({ isMultiple: true });
    if (!files.length) {
      return; // 고르다 취소한 경우
    }
    const read = await readImages(files);
    if (!read.isOk) {
      toast.show(read.reason);
      return;
    }
    const room = MAX_PHOTOS - me.photos.length; // 넘치는 사진은 편집하지 않고 바로 건너뛰어요
    openPhotoEditor(ctx, read.value.slice(0, room), (edited) =>
      upload(edited, read.value.length - room),
    );
  };

  const upload = (edited, overflow) => {
    const added = meActions.addPhotos(edited);
    if (!added.isOk) {
      toast.show(added.reason);
      return;
    }
    const skipped = added.value.skipped + Math.max(0, overflow);
    toast.show(skipped ? t('me.photosSkipped', { MAX_PHOTOS, skipped }) : t('me.photosUploaded'));
  };

  // 다시 편집: 원본이 있으면 원본 위에 다시 그려요 (글이 겹치지 않게)
  const editPhoto = (index) => {
    const photo = me.photos[index];
    openPhotoEditor(
      ctx,
      [photo.original || photo.src],
      ([edited]) => meActions.editPhoto(index, edited),
      photo.look || null,
    );
  };

  return (
    <div className="box">
      <div className="boxhead">
        <h4>{t('me.photosCount', { n: me.photos.length, MAX_PHOTOS })}</h4>
        <button
          className="iconbtn"
          id="previewProfile"
          aria-label={t('me.previewProfile')}
          onClick={() => nav.openProfile('me')}
        >
          <Icon name="expand" />
        </button>
      </div>
      <div className="photogrid">
        {me.photos.map((photo, i) => (
          <div className="cell" key={i}>
            <button
              className="edit"
              data-edit={i}
              aria-label={t('me.editPhotoN', { n: i + 1 })}
              onClick={() => editPhoto(i)}
            >
              <Photo user={me} photo={photo} />
            </button>
            <button
              className="del"
              data-del={i}
              aria-label={t('me.deletePhotoN', { n: i + 1 })}
              onClick={() => meActions.removePhoto(i)}
            >
              <Icon name="x" />
            </button>
          </div>
        ))}
        {canAddMore && (
          <button className="add" id="addPhoto" aria-label={t('me.addPhoto')} onClick={addPhotos}>
            +
          </button>
        )}
      </div>
    </div>
  );
}
