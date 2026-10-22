/* =========================================================
   [UI] PhotoPicker.js — 사진 고르기 창 열기
   ---------------------------------------------------------
   채팅 사진, 스토리 사진, 프로필 사진이 모두 같은 "파일 고르기"를 써요.
   고른 파일을 Promise로 돌려줘서, 부르는 쪽이 받은 다음 할 일만 정하면 돼요.
   사진 한 장을 골라 바로 읽는 일(채팅 사진, 스토리 사진)은 pickImage() 한 곳에서 해요.
   ========================================================= */

import { readImage } from "../../data/imageReader.js";

export class PhotoPicker
{
  constructor(input)
  {
    this.input = input;   // <input type="file" accept="image/*">
  }

  // const files = await picker.pick({ isMultiple: true });
  pick({ isMultiple = false } = {})
  {
    return new Promise((resolve) =>
    {
      this.input.multiple = isMultiple;
      this.input.onchange = () =>
      {
        const files = [...this.input.files];
        this.input.value = "";   // 같은 사진을 또 골라도 change가 일어나게 비워둠
        resolve(files);
      };
      this.input.click();
    });
  }

  // 사진 한 장 고르고 읽기: 취소하면 null, 아니면 readImage 결과(Result)
  async pickImage()
  {
    const [file] = await this.pick();
    if (!file)
    {
      return null;
    }
    return readImage(file);
  }
}
