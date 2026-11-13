/* =========================================================
   [UI] CreditsSheet.jsx — 출처 창 (아래에서 올라오는 판, 나 탭 [출처])
   ---------------------------------------------------------
   목록은 core/credits.js 표 하나에서 그려요. 이름을 누르면 그 출처의 웹 페이지가 새 창으로 열려요.
   ========================================================= */

import { Icon } from '../common/Icon.jsx';
import { Scrim } from '../common/Modal.jsx';
import { creditsFor } from '../../core/credits.js';
import { t } from '../../core/i18n/index.js';

export function openCreditsSheet(ctx) {
  const credits = creditsFor(ctx.features);
  ctx.overlays.open({
    kind: 'scrim',
    render: (close) => (
      <Scrim close={close} closeOnBackdrop>
        <div className="sheet policysheet" role="dialog" aria-label={t('me.credits')}>
          <div className="sheettop">
            <button className="iconbtn" aria-label={t('common.close')} onClick={close}>
              <Icon name="x" />
            </button>
          </div>
          <h3>{t('me.credits')}</h3>
          <ul className="credits">
            {credits.map((credit) => (
              <li key={credit.id}>
                <a href={credit.url} target="_blank" rel="noopener noreferrer">
                  {credit.name}
                </a>
                <span>
                  {t(credit.role)} · {credit.by}
                </span>
                <span>{credit.license}</span>
              </li>
            ))}
          </ul>
        </div>
      </Scrim>
    ),
  });
}
