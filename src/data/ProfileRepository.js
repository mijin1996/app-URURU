/* =========================================================
   [Data] ProfileRepository.js — 가입 정보 저장 / 불러오기 / 지우기
   ---------------------------------------------------------
   지금은 브라우저 저장소(localStorage)에 저장해요.
   진짜 앱에서는 이 클래스만 서버 계정 코드로 바꾸면 되고,
   이걸 쓰는 다른 코드는 고칠 필요가 없어요.
   ========================================================= */

import { Result } from '../core/result.js';
import { t } from '../core/i18n/index.js';

export class ProfileRepository {
  // oldKey: 이름을 ururu로 바꾸기 전(moyeo.*)에 저장된 값이 있으면 새 칸으로 한 번 옮겨요
  //         (안 옮기면 이미 가입한 사람이 가입 화면부터 다시 보게 돼요)
  constructor(storageKey, oldKey = '') {
    this.storageKey = storageKey;
    // 브라우저 저장소를 못 쓰는 환경(비밀 창 등)을 위한 예비 보관함
    this.memoryCopy = null;
    if (oldKey) {
      this.moveFrom(oldKey);
    }
  }

  moveFrom(oldKey) {
    try {
      const old = localStorage.getItem(oldKey);
      if (old !== null && localStorage.getItem(this.storageKey) === null) {
        localStorage.setItem(this.storageKey, old);
      }
      localStorage.removeItem(oldKey);
    } catch (error) {
      // 저장소를 못 쓰면 옮길 것도 없어요
    }
  }

  // 저장 파일이 없는 건 흔한 일(처음 쓰는 사람)이라 Result로 알려줘요
  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        return Result.ok(JSON.parse(raw));
      }
    } catch (error) {
      // 저장소를 못 읽으면 아래 예비 보관함을 확인
    }
    return this.memoryCopy ? Result.ok(this.memoryCopy) : Result.fail(t('check.noAccount'));
  }

  save(profile) {
    this.memoryCopy = profile;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(profile));
    } catch (error) {
      // 저장소에 못 써도 이번 실행 동안은 예비 보관함으로 동작
    }
  }

  clear() {
    this.memoryCopy = null;
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      // 지울 게 없거나 못 지워도 앱은 계속 동작
    }
  }
}
