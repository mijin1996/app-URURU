/* =========================================================
   [UI] Modal.jsx — 어두운 바깥(scrim) + 가운데 팝업 / 아래 시트 틀
   ---------------------------------------------------------
   신고, 회원탈퇴, 소리 받기 묻기·안내, 팔레트, 달력이 같이 써요. (DRY)
   closeOnBackdrop: 바깥 어두운 부분을 누르면 닫히는지 (SHELL-41, 42)
   ========================================================= */

// 어두운 바깥. className: "scrim" (아래 시트) 또는 "scrim center" (가운데 팝업)
export function Scrim({ className = "scrim", close, closeOnBackdrop = false, children })
{
  const onClick = closeOnBackdrop
    ? (event) =>
    {
      if (event.target === event.currentTarget)
      {
        close();
      }
    }
    : undefined;
  return <div className={className} onClick={onClick}>{children}</div>;
}

// 가운데 팝업: <div class="scrim center"><div class="modal" role="dialog">…
export function Modal({ label, close, closeOnBackdrop = false, children })
{
  return (
    <Scrim className="scrim center" close={close} closeOnBackdrop={closeOnBackdrop}>
      <div className="modal" role="dialog" aria-label={label}>{children}</div>
    </Scrim>
  );
}
