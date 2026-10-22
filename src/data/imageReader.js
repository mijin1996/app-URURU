/* =========================================================
   [Data] imageReader.js — 사진 파일을 읽어서 화면에 쓸 수 있는 주소로 바꾸기
   ---------------------------------------------------------
   사진이 아니거나 못 읽는 건 흔한 일이라 Result로 이유를 돌려줘요.
   ========================================================= */

import { Result } from "../core/result.js";
import { t } from "../core/i18n/index.js";

export function readImage(file)
{
  return new Promise((resolve) =>
  {
    if (!file.type.startsWith("image/"))
    {
      resolve(Result.fail(t("me.imagesOnly")));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(Result.ok(reader.result));
    reader.onerror = () => resolve(Result.fail(t("me.photoReadFailed")));
    reader.readAsDataURL(file);
  });
}

// 여러 장 한 번에 읽기. 성공한 것만 모아서 돌려줌
export async function readImages(files)
{
  const results = await Promise.all(files.map(readImage));
  const sources = results.filter((r) => r.isOk).map((r) => r.value);
  if (!sources.length)
  {
    return results[0];   // 하나도 못 읽었으면 첫 번째 실패 이유를 그대로
  }
  return Result.ok(sources);
}
