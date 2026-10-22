/* =========================================================
   [Data] firebase/shrinkImage.js — 올리기 전에 사진 크기 줄이기
   ---------------------------------------------------------
   폰 사진은 한 장에 몇 MB라서 그대로 올리면 느리고 저장 요금이 커요 (design Risks).
   긴 변을 1280px로 줄이고 JPEG로 바꿔요. 못 줄이면 원래 사진 그대로.
   ========================================================= */

const MAX_SIDE_PX = 1280;
const JPEG_QUALITY = 0.8;

// maxSide·quality: 무료 모드(서버 함수 없음)에서는 문서에 넣으려고 더 작게 (RealServer.upload)
export function shrinkImage(dataUrl, maxSide = MAX_SIDE_PX, quality = JPEG_QUALITY)
{
  return new Promise((resolve) =>
  {
    const image = new Image();
    image.onload = () =>
    {
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}
