/* =========================================================
   [Admin] AdminApp.jsx — 운영자 사이트 화면
   ---------------------------------------------------------
   들어오기 전: [로그인 | 처음 등록] (아이디 12자리) — 총관리자 첫 설정은 구글로 딱 한 번
   들어오면: [신고 목록 | 회원 관리 | 운영자 관리(총관리자만)]
   - 회원 관리: 회원 목록·검색, 정보 보기, 회원 삭제(총관리자만, Firestore 데이터가 바로 지워짐) + 삭제 기록
   - 신고 목록: 새 신고가 맨 위. 날짜·시간, 사유, 첨부(메시지·자세한 내용·사진),
                신고한 사람·신고당한 사람의 모든 정보, 처리 완료·경고·7일 정지·영구정지·정지 풀기,
                누가 처리했는지 (성명 · 아이디 일부) + 처리 기록
   - 운영자 관리: 아이디 발급(운영자/총관리자) · 발급 취소 · 운영자 명단 · 권한 회수
   글자는 adminText.js, 모양은 styles/admin.css, 서버 일은 AdminService.js
   ========================================================= */

import { useEffect, useMemo, useState } from "react";
import { countryLabel } from "../core/countries.js";
import { ageOf } from "../core/time.js";
import { isAdminIdShape, ID_LENGTH } from "./AdminService.js";
import { TEXT } from "./adminText.js";

const FILTERS = [
  { id: "all", label: TEXT.filterAll },
  { id: "new", label: TEXT.filterNew },
  { id: "done", label: TEXT.filterDone }
];

const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;   // 운영자 연락용 이메일 (a@b.c)

// 1792500000000 → "2026. 10. 21. 오후 3:20"
function when(ms)
{
  return ms ? new Date(ms).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) : "-";
}

export function AdminApp({ service })
{
  const [state, setState] = useState({ kind: "loading" });   // loading | out | admin | bootstrap | unknown
  const [tab, setTab] = useState("reports");

  useEffect(() =>
  {
    let stop = () => {};
    service.onState(setState).then((unsubscribe) =>
    {
      stop = unsubscribe;
    });
    return () => stop();
  }, [service]);

  const signOut = () => service.signOut();

  if (state.kind === "loading")
  {
    return <Shell><p className="ad-muted">{TEXT.loading}</p></Shell>;
  }
  if (state.kind === "out")
  {
    return <Entrance service={service} />;
  }
  if (state.kind === "bootstrap")
  {
    return (
      <Shell badge={TEXT.owner} who={service.user ? service.user.email : ""} onSignOut={signOut}>
        <div className="ad-card"><h2>{TEXT.bootstrapTitle}</h2><p className="ad-note">{TEXT.bootstrapHint}</p></div>
        <IssuePanel service={service} />
      </Shell>
    );
  }
  if (state.kind === "unknown")
  {
    return (
      <Shell onSignOut={signOut}>
        <div className="ad-card"><p className="ad-msg">{TEXT.notAdmin}</p></div>
      </Shell>
    );
  }
  const me = state.me;
  const isOwner = me.role === "owner";
  return (
    <Shell badge={isOwner ? TEXT.owner : TEXT.admin} who={`${me.name} (${me.nickname}) · ${me.idMask}`} onSignOut={signOut}
      tabs={(
        <nav className="ad-tabs">
          <button className={tab === "reports" ? "on" : ""} onClick={() => setTab("reports")}>{TEXT.tabReports}</button>
          <button className={tab === "members" ? "on" : ""} onClick={() => setTab("members")}>{TEXT.tabMembers}</button>
          {isOwner ? <button className={tab === "admins" ? "on" : ""} onClick={() => setTab("admins")}>{TEXT.tabAdmins}</button> : null}
        </nav>
      )}>
      {tab === "reports" ? <Reports service={service} /> : null}
      {tab === "members" ? <Members service={service} isOwner={isOwner} /> : null}
      {isOwner && tab === "admins" ? <Admins service={service} /> : null}
    </Shell>
  );
}

/* ---------- 틀 ---------- */
function Shell({ badge = "", who = "", onSignOut = null, tabs = null, children })
{
  return (
    <div className="ad-page">
      <header className="ad-top">
        <div className="ad-brand"><b>{TEXT.siteTitle}</b><span>{TEXT.siteSub}</span></div>
        {onSignOut ? (
          <div className="ad-who">
            {badge ? <span className="ad-badge owner">{badge}</span> : null}
            {who ? <span className="ad-email">{who}</span> : null}
            <button className="ad-btn ghost" onClick={onSignOut}>{TEXT.signOut}</button>
          </div>
        ) : null}
      </header>
      {tabs}
      <main className="ad-main">{children}</main>
    </div>
  );
}

/* ---------- 들어오기 전: 로그인 / 처음 등록 ---------- */
function Entrance({ service })
{
  const [mode, setMode] = useState("login");
  return (
    <div className="ad-landing">
      <div className="ad-hero">
        <div className="ad-logo">우르르</div>
        <h1>{TEXT.siteTitle}</h1>
        <p>{TEXT.intro}</p>
        <div className="ad-card ad-entry">
          <div className="ad-filters">
            <button className={mode === "login" ? "on" : ""} onClick={() => setMode("login")}>{TEXT.tabLogin}</button>
            <button className={mode === "register" ? "on" : ""} onClick={() => setMode("register")}>{TEXT.tabRegister}</button>
          </div>
          {mode === "login" ? <LoginForm service={service} /> : <RegisterForm service={service} />}
        </div>
        {/* 첫 총관리자 아이디를 만들 때만 쓰는 구글 로그인. 통과하는 이메일은 firestore.rules의 isBootstrapOwner() */}
        <button className="ad-link" onClick={() => service.signInBootstrap().catch(() => {})}>{TEXT.bootstrapLink}</button>
      </div>
    </div>
  );
}

function IdInput({ value, onChange })
{
  const [isShown, setIsShown] = useState(false);
  return (
    <label className="ad-field">
      <span>{TEXT.idLabel}</span>
      <div className="ad-coderow">
        <input className="ad-input code" type={isShown ? "text" : "password"} maxLength={ID_LENGTH} value={value}
          placeholder={TEXT.idPlaceholder} autoComplete="off" spellCheck="false" autoCapitalize="none"
          onChange={(event) => onChange(event.target.value)} />
        <button type="button" className="ad-btn ghost" onClick={() => setIsShown(!isShown)}>{isShown ? TEXT.idHide : TEXT.idShow}</button>
      </div>
    </label>
  );
}

function LoginForm({ service })
{
  const [id, setId] = useState("");
  const [message, setMessage] = useState("");
  const submit = async (event) =>
  {
    event.preventDefault();
    if (!isAdminIdShape(id))
    {
      setMessage(TEXT.idWrongShape);
      return;
    }
    setMessage(TEXT.checking);
    const result = await service.signIn(id);
    setMessage(result.isOk ? "" : TEXT.loginFailed);
  };
  return (
    <form onSubmit={submit}>
      <IdInput value={id} onChange={setId} />
      <button type="submit" className="ad-btn primary wide">{TEXT.loginBtn}</button>
      <p className="ad-msg">{message}</p>
    </form>
  );
}

function RegisterForm({ service })
{
  const [form, setForm] = useState({ name: "", nickname: "", birthDate: "", email: "", id: "" });
  const [message, setMessage] = useState("");
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const submit = async (event) =>
  {
    event.preventDefault();
    const name = form.name.trim();
    const nickname = form.nickname.trim();
    const email = form.email.trim();
    if (!name || !nickname || !form.birthDate || !email || !form.id)
    {
      setMessage(TEXT.needAll);
      return;
    }
    if (!EMAIL_SHAPE.test(email))
    {
      setMessage(TEXT.emailWrong);
      return;
    }
    if (!isAdminIdShape(form.id))
    {
      setMessage(TEXT.idWrongShape);
      return;
    }
    setMessage(TEXT.checking);
    const result = await service.register({ name, nickname, birthDate: form.birthDate, email, id: form.id });
    if (!result.isOk)
    {
      setMessage(result.reason === "already" ? TEXT.registerAlready : result.reason === "notIssued" ? TEXT.registerNotIssued : TEXT.registerFailed);
    }
  };
  return (
    <form onSubmit={submit}>
      <label className="ad-field"><span>{TEXT.name}</span><input className="ad-input" maxLength={20} value={form.name} onChange={(e) => set("name")(e.target.value)} /></label>
      <label className="ad-field"><span>{TEXT.nickname}</span><input className="ad-input" maxLength={20} value={form.nickname} onChange={(e) => set("nickname")(e.target.value)} /></label>
      <label className="ad-field"><span>{TEXT.birthDate}</span><input className="ad-input" type="date" value={form.birthDate} onChange={(e) => set("birthDate")(e.target.value)} /></label>
      <label className="ad-field"><span>{TEXT.email}</span><input className="ad-input" type="email" maxLength={100} autoComplete="email" value={form.email} onChange={(e) => set("email")(e.target.value)} /></label>
      <IdInput value={form.id} onChange={set("id")} />
      <button type="submit" className="ad-btn primary wide">{TEXT.registerBtn}</button>
      <p className="ad-msg">{message}</p>
    </form>
  );
}

/* ---------- 신고 목록 ---------- */
function Reports({ service })
{
  const [reports, setReports] = useState(null);
  const [filter, setFilter] = useState("new");

  useEffect(() =>
  {
    let stop = () => {};
    service.watchReports(setReports, () => setReports([])).then((unsubscribe) =>
    {
      stop = unsubscribe;
    });
    return () => stop();
  }, [service]);

  // 신고당한 사람마다 몇 번 신고됐는지 (한 번만 계산)
  const counts = useMemo(() =>
  {
    const map = new Map();
    (reports || []).forEach((r) => map.set(r.target, (map.get(r.target) || 0) + 1));
    return map;
  }, [reports]);

  if (!reports)
  {
    return <p className="ad-muted">{TEXT.loading}</p>;
  }
  const matches = (f, r) => f === "all" || (f === "done") === (r.status === "done");
  const shown = reports.filter((r) => matches(filter, r));
  return (
    <>
      <div className="ad-filters">
        {FILTERS.map((f) => (
          <button key={f.id} className={filter === f.id ? "on" : ""} onClick={() => setFilter(f.id)}>
            {f.label}<span>{reports.filter((r) => matches(f.id, r)).length}</span>
          </button>
        ))}
      </div>
      {shown.length ? shown.map((report) => (
        <ReportCard key={report.id} service={service} report={report} count={counts.get(report.target) || 1} />
      )) : <p className="ad-muted">{TEXT.noReports}</p>}
    </>
  );
}

function ReportCard({ service, report, count })
{
  const isDone = report.status === "done";
  const history = [...(report.history || [])].sort((a, b) => b.at - a.at);
  return (
    <article className={isDone ? "ad-card ad-report done" : "ad-card ad-report"}>
      <div className="ad-rhead">
        <span className={isDone ? "ad-badge done" : "ad-badge new"}>{isDone ? TEXT.statusDone : TEXT.statusNew}</span>
        <span className="ad-time">{`${TEXT.reportedAt} ${when(report.at)}`}</span>
        <span className="ad-badge reason">{report.reason}</span>
        <span className="ad-badge count">{TEXT.reportCount(count)}</span>
      </div>
      {isDone ? (
        <p className="ad-handled">{`${TEXT.handled}: ${report.action || ""} · ${TEXT.who(report.handledBy)} · ${when(report.handledAt)}`}</p>
      ) : null}
      <Evidence report={report} />
      <div className="ad-people">
        <Person service={service} uid={report.from} title={TEXT.reporter} />
        <Person service={service} uid={report.target} title={TEXT.target} report={report} canAct />
      </div>
      {history.length ? (
        <div className="ad-history">
          <b>{TEXT.history}</b>
          <ul>
            {history.map((h, i) => <li key={i}>{`${when(h.at)} · ${h.action} · ${TEXT.who(h.by)}`}</li>)}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

// 신고한 사람이 붙인 것: 길게 눌러 신고한 메시지, 자세한 내용, 사진
function Evidence({ report })
{
  if (!report.message && !report.note && !report.photo)
  {
    return null;
  }
  return (
    <div className="ad-evidence">
      {report.message ? (
        <div><b>{TEXT.attachedMessage}</b><blockquote>{report.message.text}<small>{when(report.message.at)}</small></blockquote></div>
      ) : null}
      {report.note ? <div><b>{TEXT.attachedNote}</b><blockquote>{report.note}</blockquote></div> : null}
      {report.photo ? (
        <div><b>{TEXT.attachedPhoto}</b><a href={report.photo} target="_blank" rel="noreferrer"><img className="ad-evphoto" src={report.photo} alt={TEXT.attachedPhoto} /></a></div>
      ) : null}
    </div>
  );
}

/* ---------- 사람 정보 + 제재 버튼 ---------- */
function Person({ service, uid, title, report = null, canAct = false })
{
  const [info, setInfo] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() =>
  {
    service.userInfo(uid).then(setInfo);
  }, [service, uid]);

  if (!info)
  {
    return <section className="ad-person"><h3>{title}</h3><p className="ad-muted">{TEXT.loading}</p></section>;
  }
  const { profile, secret, moderation } = info;
  const name = profile ? profile.name : uid;

  // 버튼 하나 = 제재(경고·정지 등) 먼저 → 그다음 이 신고를 "처리 완료"로. 순서가 바뀌면 제재 없이 완료만 될 수 있어요
  const act = async (kind, confirmText, label) =>
  {
    if (confirmText && !window.confirm(confirmText))
    {
      return;
    }
    try
    {
      if (kind !== "done")
      {
        setInfo(await service.sanction(uid, kind));
      }
      await service.markDone(report.id, label);
      setMessage(TEXT.actionDone);
    }
    catch (error)
    {
      setMessage(TEXT.actionFailed);
    }
  };

  return (
    <section className="ad-person">
      <h3>{title}</h3>
      {profile ? (
        <>
          <Photos photos={profile.photos || []} name={name} />
          <dl className="ad-facts">
            <Fact label={TEXT.nicknameOf} value={profile.name} />
            <Fact label={TEXT.handle} value={`@${profile.handle}`} />
            <Fact label={TEXT.email} value={secret.email || "-"} />
            <Fact label={TEXT.birth} value={secret.birthDate ? `${secret.birthDate} (${ageOf(secret.birthDate)})` : `- (${profile.age || "-"})`} />
            <Fact label={TEXT.country} value={profile.country ? `${countryLabel(profile.country)} (${profile.country})` : "-"} />
            <Fact label={TEXT.region} value={profile.region || "-"} />
            <Fact label={TEXT.sharing} value={profile.isSharing ? TEXT.on : TEXT.off} />
            <Fact label={TEXT.tags} value={(profile.tags || []).join(", ") || "-"} />
            <Fact label={TEXT.joined} value={`${when(profile.createdAt)}${profile.isTest ? ` · ${TEXT.testAccount}` : ""}`} />
            <Fact label={TEXT.sanction} value={sanctionText(moderation)} isAlert={isSanctioned(moderation)} />
            <Fact label="UID" value={uid} isSmall />
          </dl>
        </>
      ) : <p className="ad-muted">{TEXT.withdrawn}<br /><small>{uid}</small></p>}
      {canAct ? (
        <div className="ad-actions">
          <button className="ad-btn" onClick={() => act("done", "", TEXT.doneBtn)}>{TEXT.doneBtn}</button>
          <button className="ad-btn warn" onClick={() => act("warn", TEXT.confirmWarn(name), TEXT.warnBtn)}>{TEXT.warnBtn}</button>
          <button className="ad-btn alert" onClick={() => act("suspend", TEXT.confirmSuspend(name), TEXT.suspendBtn)}>{TEXT.suspendBtn}</button>
          <button className="ad-btn alert strong" onClick={() => act("permanent", TEXT.confirmPermanent(name), TEXT.permanentBtn)}>{TEXT.permanentBtn}</button>
          <button className="ad-btn ghost" onClick={() => act("lift", TEXT.confirmLift(name), TEXT.liftBtn)}>{TEXT.liftBtn}</button>
          <span className="ad-msg">{message}</span>
        </div>
      ) : null}
    </section>
  );
}

function Photos({ photos, name })
{
  if (!photos.length)
  {
    return <p className="ad-muted small">{TEXT.noPhotos}</p>;
  }
  return (
    <div className="ad-photos">
      {photos.map((src, i) => (
        <a key={i} href={src} target="_blank" rel="noreferrer"><img src={src} alt={`${name} ${TEXT.photos} ${i + 1}`} /></a>
      ))}
    </div>
  );
}

function Fact({ label, value, isAlert = false, isSmall = false })
{
  return (
    <>
      <dt>{label}</dt>
      <dd className={[isAlert ? "alert" : "", isSmall ? "small" : ""].join(" ").trim()}>{value}</dd>
    </>
  );
}

function isSanctioned(m)
{
  return !!m.isPermanent || (m.bannedUntil || 0) > Date.now();
}

function sanctionText(m)
{
  const parts = [];
  if (m.warnings)
  {
    parts.push(TEXT.sanctionWarnings(m.warnings));
  }
  if (m.isPermanent)
  {
    parts.push(TEXT.sanctionPermanent);
  }
  else if ((m.bannedUntil || 0) > Date.now())
  {
    parts.push(TEXT.sanctionUntil(when(m.bannedUntil)));
  }
  if (!parts.length)
  {
    return TEXT.sanctionNone;
  }
  return m.by && typeof m.by === "object" ? `${parts.join(" · ")} ${TEXT.sanctionBy(TEXT.who(m.by), when(m.at))}` : parts.join(" · ");
}

/* ---------- 운영자 관리 (총관리자) ---------- */
function IssuePanel({ service, onIssued = () => {} })
{
  const [note, setNote] = useState("");
  const [role, setRole] = useState("admin");
  const [fresh, setFresh] = useState("");   // 방금 발급한 아이디 (지금 한 번만)
  const [message, setMessage] = useState("");

  const issue = async () =>
  {
    try
    {
      setFresh(await service.issueId(role, note.trim()));
      setNote("");
      setMessage("");
      onIssued();
    }
    catch (error)
    {
      setMessage(TEXT.actionFailed);
    }
  };
  const copy = async () =>
  {
    await navigator.clipboard.writeText(fresh).catch(() => {});
    setMessage(TEXT.copied);
  };

  return (
    <section className="ad-card">
      <h2>{TEXT.issueTitle}</h2>
      <p className="ad-muted">{TEXT.issueHint}</p>
      <div className="ad-coderow">
        <select className="ad-input narrow" value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="admin">{TEXT.roleAdmin}</option>
          <option value="owner">{TEXT.roleOwner}</option>
        </select>
        <input className="ad-input" value={note} maxLength={40} placeholder={TEXT.issueNote} onChange={(event) => setNote(event.target.value)} />
        <button className="ad-btn primary" onClick={issue}>{TEXT.issueBtn}</button>
      </div>
      {fresh ? (
        <>
          <div className="ad-fresh"><code>{fresh}</code><button className="ad-btn" onClick={copy}>{TEXT.copy}</button></div>
          <p className="ad-note">{TEXT.issuedOnce}</p>
        </>
      ) : null}
      <p className="ad-msg">{message}</p>
    </section>
  );
}

function Admins({ service })
{
  const [ids, setIds] = useState(null);
  const [admins, setAdmins] = useState(null);

  const reload = async () =>
  {
    setIds(await service.listIds().catch(() => []));
    setAdmins(await service.listAdmins().catch(() => []));
  };
  useEffect(() =>
  {
    reload();
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  const cancelId = async (idHash) =>
  {
    await service.deleteId(idHash).catch(() => {});
    reload();
  };
  const revoke = async (admin) =>
  {
    if (!window.confirm(TEXT.confirmRevoke(admin.name)))
    {
      return;
    }
    const result = await service.revokeAdmin(admin.uid).catch(() => ({ isOk: false }));
    if (result.reason === "lastOwner")
    {
      window.alert(TEXT.lastOwner);
    }
    reload();
  };
  const roleText = (role) => (role === "owner" ? TEXT.roleOwner : TEXT.roleAdmin);

  return (
    <>
      <IssuePanel service={service} onIssued={reload} />
      <section className="ad-card">
        <h2>{TEXT.adminsTitle}</h2>
        {admins === null ? <p className="ad-muted">{TEXT.loading}</p> : admins.length ? (
          <table className="ad-table">
            <thead><tr><th>{TEXT.colName}</th><th>{TEXT.colBirth}</th><th>{TEXT.email}</th><th>{TEXT.colId}</th><th>{TEXT.colRole}</th><th>{TEXT.colJoined}</th><th></th></tr></thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.uid}>
                  <td>{`${a.name} (${a.nickname})`}</td>
                  <td>{a.birthDate}</td>
                  <td>{a.email || "-"}</td>
                  <td><code>{a.idMask}</code></td>
                  <td>{roleText(a.role)}</td>
                  <td>{when(a.createdAt)}</td>
                  {/* 내 권한은 내가 회수하지 못하게 (실수로 아무도 못 들어오게 되는 것 방지) */}
                  <td>{service.me && service.me.uid === a.uid ? null : <button className="ad-btn alert" onClick={() => revoke(a)}>{TEXT.revoke}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="ad-muted">{TEXT.noAdmins}</p>}
      </section>
      <section className="ad-card">
        <h2>{TEXT.issued}</h2>
        {ids === null ? <p className="ad-muted">{TEXT.loading}</p> : ids.length ? (
          <table className="ad-table">
            <thead><tr><th>{TEXT.colId}</th><th>{TEXT.colRole}</th><th>{TEXT.colNote}</th><th>{TEXT.colIssued}</th><th>{TEXT.colState}</th><th></th></tr></thead>
            <tbody>
              {ids.map((d) => (
                <tr key={d.idHash}>
                  <td><code>{d.idMask}</code></td>
                  <td>{roleText(d.role)}</td>
                  <td>{d.note || "-"}</td>
                  <td>{`${when(d.createdAt)}${d.createdBy ? ` · ${d.createdBy}` : ""}`}</td>
                  <td>{d.usedBy ? `${TEXT.idUsed(d.usedName || "")} · ${when(d.usedAt)}` : TEXT.idUnused}</td>
                  <td>{d.usedBy ? null : <button className="ad-btn ghost" onClick={() => cancelId(d.idHash)}>{TEXT.deleteId}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="ad-muted">{TEXT.noIds}</p>}
      </section>
    </>
  );
}

/* ---------- 회원 관리 ---------- */
function Members({ service, isOwner })
{
  const [members, setMembers] = useState(null);
  const [last, setLast] = useState(null);       // 더 보기 기준 (null이면 끝)
  const [word, setWord] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [openUid, setOpenUid] = useState("");
  const [deletions, setDeletions] = useState(null);

  const loadFirst = async () =>
  {
    const page = await service.listMembers().catch(() => ({ members: [], last: null }));
    setMembers(page.members);
    setLast(page.last);
    setIsSearch(false);
  };
  const loadMore = async () =>
  {
    const page = await service.listMembers(last).catch(() => ({ members: [], last: null }));
    setMembers((list) => [...list, ...page.members]);
    setLast(page.last);
  };
  const loadDeletions = async () => setDeletions(await service.listDeletions().catch(() => []));
  useEffect(() =>
  {
    loadFirst();
    loadDeletions();
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  const search = async (event) =>
  {
    event.preventDefault();
    if (!word.trim())
    {
      loadFirst();
      return;
    }
    setMembers(null);
    setMembers(await service.searchMembers(word));
    setLast(null);
    setIsSearch(true);
  };
  const onDeleted = (uid) =>
  {
    setMembers((list) => list.filter((m) => m.uid !== uid));
    setOpenUid("");
    loadDeletions();
  };

  return (
    <>
      <section className="ad-card">
        <form className="ad-coderow" onSubmit={search}>
          <input className="ad-input" value={word} placeholder={TEXT.memberSearch} onChange={(event) => setWord(event.target.value)} />
          <button type="submit" className="ad-btn primary">{TEXT.searchBtn}</button>
          {isSearch ? <button type="button" className="ad-btn ghost" onClick={() => { setWord(""); loadFirst(); }}>{TEXT.showAll}</button> : null}
        </form>
      </section>
      {members === null ? <p className="ad-muted">{TEXT.loading}</p> : members.length ? (
        <section className="ad-card">
          {members.map((m) => (
            <div key={m.uid} className="ad-member">
              <button className={openUid === m.uid ? "ad-mrow on" : "ad-mrow"} onClick={() => setOpenUid(openUid === m.uid ? "" : m.uid)}>
                {m.photos && m.photos[0] ? <img src={m.photos[0]} alt="" /> : <span className="ad-mnophoto" />}
                <b>{m.name}</b>
                <span>{`@${m.handle}`}</span>
                <span>{m.country ? countryLabel(m.country) : "-"}</span>
                <span className="ad-mjoined">{when(m.createdAt)}</span>
              </button>
              {openUid === m.uid ? (
                <div className="ad-mdetail">
                  <Person service={service} uid={m.uid} title={TEXT.colMember} />
                  {/* 화면에서 숨기는 건 편의일 뿐, 실제로 막는 건 firestore.rules의 canPurge() */}
                  {isOwner ? <DeleteMember service={service} member={m} onDeleted={onDeleted} /> : <p className="ad-muted small">{TEXT.ownerOnly}</p>}
                </div>
              ) : null}
            </div>
          ))}
          {last && !isSearch ? <button className="ad-btn ghost wide" onClick={loadMore}>{TEXT.moreBtn}</button> : null}
        </section>
      ) : <p className="ad-muted">{TEXT.noMembers}</p>}
      <section className="ad-card">
        <h2>{TEXT.deletionsTitle}</h2>
        {deletions === null ? <p className="ad-muted">{TEXT.loading}</p> : deletions.length ? (
          <table className="ad-table">
            <thead><tr><th>{TEXT.colMember}</th><th>{TEXT.email}</th><th>{TEXT.colDeletedAt}</th><th>{TEXT.colDeletedBy}</th></tr></thead>
            <tbody>
              {deletions.map((d) => (
                <tr key={d.uid}>
                  <td>{`${d.name || "-"} (@${d.handle || "-"})`}<br /><small className="ad-muted">{d.uid}</small></td>
                  <td>{d.email || "-"}</td>
                  <td>{when(d.at)}</td>
                  <td>{TEXT.who(d.by)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="ad-muted">{TEXT.noDeletions}</p>}
      </section>
    </>
  );
}

// 아이디를 똑같이 입력해야 삭제 버튼이 눌려요 (실수로 지우지 않게)
function DeleteMember({ service, member, onDeleted })
{
  const [typed, setTyped] = useState("");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const isMatch = typed.trim().replace(/^@/, "") === member.handle;

  const remove = async () =>
  {
    setIsBusy(true);
    setMessage(TEXT.checking);
    const result = await service.deleteMember(member.uid);
    setIsBusy(false);
    if (result.isOk)
    {
      setMessage(TEXT.deleted);
      onDeleted(member.uid);
      return;
    }
    setMessage(TEXT.deleteFailed);
  };

  return (
    <div className="ad-delete">
      <b>{TEXT.deleteMember}</b>
      <p className="ad-muted small">{TEXT.deleteHint(`@${member.handle}`)}</p>
      <div className="ad-coderow">
        <input className="ad-input" value={typed} placeholder={`@${member.handle}`} onChange={(event) => setTyped(event.target.value)} />
        <button className="ad-btn alert strong" disabled={!isMatch || isBusy} onClick={remove}>{TEXT.deleteConfirmBtn}</button>
      </div>
      <p className="ad-msg">{message}</p>
    </div>
  );
}
