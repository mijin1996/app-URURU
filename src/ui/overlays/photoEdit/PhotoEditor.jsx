/* =========================================================
   [UI] PhotoEditor.jsx — 프로필 사진 올리기 전 글 쓰기 (나 탭 My photos)
   ---------------------------------------------------------
   - 고른 사진을 한 장씩: 미리보기 + 글 입력 + 폰트 모양 [가 | 가(기울임)] + 크기 막대 + 색 칸 3개(배경 / 폰트 / 테두리)
   - [올리기]를 누르면 글을 사진에 그려서(drawPhotoText) 다음 사진으로, 마지막 사진이면 모두 돌려줘요
   - 글을 안 쓰면 원래 사진 그대로 올라가요
   - 올린 사진을 다시 누르면: 원본 사진 + 그때 쓴 글 모양으로 다시 열려요 (initialLook)
   새 사진: 색·크기·모양은 다음 사진과 다음 편집에도 남아요 (useKept). 글만 사진마다 비워요.
   ========================================================= */

import { useEffect, useRef, useState } from 'react';
import { MAX_PHOTO_TEXT } from '../../../core/config.js';
import { t } from '../../../core/i18n/index.js';
import { useCtx } from '../../app/AppContext.jsx';
import { DragSlider } from '../../common/DragSlider.jsx';
import { drawPhotoText } from '../../common/drawPhotoText.js';
import { Icon } from '../../common/Icon.jsx';
import { Scrim } from '../../common/Modal.jsx';
import { PhotoText } from '../../common/PhotoText.jsx';
import { scaleFor } from '../../common/photoTextStyle.js';
import { useKept } from '../../hooks/useKept.js';
import {
  DEFAULT_DRAFT,
  findPart,
  FIRST_PART_KEY,
  FONT_STYLES,
  isSizeOff,
  STYLE_PARTS,
} from './photoTextParts.js';

// images: 원본 사진 주소 목록, onDone([{ src, original, look }])
// initialLook: 다시 고칠 때 그때 쓴 글 모양 (새 사진이면 없음)
export function openPhotoEditor(ctx, images, onDone, initialLook = null) {
  ctx.overlays.open({
    kind: 'scrim',
    render: (close) => (
      <PhotoEditor images={images} onDone={onDone} initialLook={initialLook} close={close} />
    ),
  });
}

function PhotoEditor({ images, onDone, initialLook, close }) {
  const { palette } = useCtx();
  const [look, setLook] = useKept('photoText.look', () => ({ ...DEFAULT_DRAFT }));
  const [partKey, setPartKey] = useKept('photoText.part', FIRST_PART_KEY);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const selectedPart = findPart(partKey);
  const update = (changes) => setLook((previous) => ({ ...previous, ...changes }));

  // 새 사진은 지난번에 쓰다 만 글을 비우고, 다시 고칠 때는 그때 모양 그대로 시작
  useEffect(() => update(initialLook ? { ...initialLook } : { text: '' }), []);

  const confirm = async () => {
    if (isBusy) {
      return;
    }
    setIsBusy(true);
    const original = images[index];
    const drawn = await drawPhotoText(original, look).catch(() => original);
    // 글이 있으면 원본과 글 모양을 같이 남겨서 나중에 다시 고칠 수 있게
    const hasText = !!look.text.trim();
    const photo = hasText ? { src: drawn, original, look: { ...look } } : { src: original };
    const next = [...done, photo];
    setIsBusy(false);
    update({ text: '' });
    if (index + 1 < images.length) {
      setDone(next);
      setIndex(index + 1);
      return;
    }
    close();
    onDone(next);
  };

  // 칸을 고르면 그 칸이 표시되고, 크기 막대가 그 칸의 크기로 바뀌고, 팔레트가 열려요
  const pickPart = (part) => {
    setPartKey(part.colorKey);
    palette.open({
      title: part.title,
      current: look[part.colorKey],
      canBeEmpty: part.canBeEmpty,
      onPick: (color) => update({ [part.colorKey]: color }),
    });
  };

  return (
    <Scrim close={close}>
      <div className="sheet photoedit" role="dialog" aria-label={t('me.editPhoto')}>
        <div className="sheettop">
          <button className="iconbtn" aria-label={t('common.close')} onClick={close}>
            <Icon name="x" />
          </button>
          <button
            className="smallbtn"
            id="photoPost"
            aria-label={t('me.uploadPhoto')}
            disabled={isBusy}
            onClick={confirm}
          >
            <Icon name="upload" />
          </button>
        </div>
        <Preview src={images[index]} look={look} />
        <input
          className="field"
          id="photoText"
          placeholder={t('me.photoTextPlaceholder')}
          maxLength={MAX_PHOTO_TEXT}
          value={look.text}
          style={{ fontStyle: look.fontStyle }}
          onChange={(event) => update({ text: event.target.value })}
        />
        <FontStyleSwitch current={look.fontStyle} onPick={(key) => update({ fontStyle: key })} />
        <div className={`sliderrow ${isSizeOff(selectedPart, look) ? 'off' : ''}`}>
          <div className="lbl">
            <span>{selectedPart.sizeLabel}</span>
            <b id="sizeVal">{`${look[selectedPart.sizeKey]}px`}</b>
          </div>
          {/* key: 칸마다 범위가 달라서 칸을 바꾸면 막대를 새로 만들어요 */}
          <DragSlider
            key={selectedPart.colorKey}
            id="sizeSlider"
            label={selectedPart.sizeLabel}
            min={selectedPart.min}
            max={selectedPart.max}
            value={look[selectedPart.sizeKey]}
            onChange={(size) => update({ [selectedPart.sizeKey]: size })}
          />
        </div>
        <div className="pickers">
          {STYLE_PARTS.map((part) => (
            <ColorTile
              key={part.colorKey}
              part={part}
              color={look[part.colorKey]}
              isSelected={part === selectedPart}
              onPick={() => pickPart(part)}
            />
          ))}
        </div>
      </div>
    </Scrim>
  );
}

// 미리보기: 보이는 사진 폭에 맞춰 글자 배율을 정해서, 사진에 그린 결과와 같은 비율로 보여요
function Preview({ src, look }) {
  const imageRef = useRef(null);
  const [width, setWidth] = useState(0);
  const measure = () => setWidth(imageRef.current ? imageRef.current.clientWidth : 0);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  return (
    <div className="pe-preview">
      <div className="pe-frame">
        <img ref={imageRef} src={src} alt="" onLoad={measure} />
        <div className="pe-text">
          {width ? <PhotoText look={look} scale={scaleFor(width)} /> : null}
        </div>
      </div>
    </div>
  );
}

// 폰트 모양 고르기: 모양은 언어 바와 같은 .langswitch
function FontStyleSwitch({ current, onPick }) {
  return (
    <div className="langswitch fontswitch" id="fontStyle" role="group" aria-label={t('me.font')}>
      {FONT_STYLES.map((style) => (
        <button
          key={style.key}
          type="button"
          className={style.key === current ? 'on' : ''}
          data-font-style={style.key}
          aria-pressed={style.key === current}
          aria-label={style.label}
          style={{ fontStyle: style.key }}
          onClick={() => onPick(style.key)}
        >
          {t('me.fontSample')}
        </button>
      ))}
    </div>
  );
}

// 색 칸: 작은 동그라미 + 이름
function ColorTile({ part, color, isSelected, onPick }) {
  return (
    <button
      className={`colorpick ${isSelected ? 'on' : ''}`}
      data-part={part.colorKey}
      aria-pressed={isSelected}
      onClick={onPick}
    >
      <span
        className={`swatch ${color ? '' : 'none'}`}
        style={color ? { background: color } : undefined}
      ></span>
      {part.label}
    </button>
  );
}
