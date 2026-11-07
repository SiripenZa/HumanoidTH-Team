"use client";

/**
 * ใจเบา (Jaibao) — เกมผ่อนคลายสำหรับวัยรุ่น 13-17 (เวอร์ชัน 3)
 * วางที่ app/wellness/games/page.jsx (เปลี่ยนชื่อเป็น page.jsx)
 * เกม: 🎧 Beat Breath (จังหวะ) | 💭 Pop the Noise (ปัดความคิดลบ) | 🎯 Hold the Line (คุมสมาธิ)
 * ไม่ใช้กล้อง/ไมค์ ข้อมูลเก็บใน localStorage เท่านั้น
 */

import { useState, useEffect, useRef } from "react";

const KEY = "jaibao_teen_v1";
const day = (off = 0) => new Date(Date.now() - off * 864e5).toISOString().slice(0, 10);

function useStore() {
  const [s, setS] = useState({ xp: 0, streak: 0, last: "", best: {} });
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      if (v) setS(v);
    } catch {}
  }, []);
  const save = (f) =>
    setS((p) => {
      const n = f(p);
      try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {}
      return n;
    });
  return [s, save];
}

function useRaf(on, cb) {
  const r = useRef(cb);
  r.current = cb;
  useEffect(() => {
    if (!on) return;
    let id, last = performance.now();
    const f = (t) => { r.current(t - last, t); last = t; id = requestAnimationFrame(f); };
    id = requestAnimationFrame(f);
    return () => cancelAnimationFrame(id);
  }, [on]);
}

const GAMES = [
  { id: "beat", icon: "🎧", name: "Beat Breath", hint: "แตะตามจังหวะ" },
  { id: "pop", icon: "💭", name: "Pop the Noise", hint: "ปัดความคิดลบ" },
  { id: "focus", icon: "🎯", name: "Hold the Line", hint: "คุมสมาธิ" },
];
const FEELS = [
  { id: "stress", label: "😤 เครียด", game: "pop" },
  { id: "tired", label: "😮‍💨 เหนื่อย", game: "beat" },
  { id: "restless", label: "🌀 ใจลอย", game: "focus" },
  { id: "lonely", label: "🌙 เหงา", game: "beat" },
];

function Result({ score, xp, best, onAgain, extra }) {
  return (
    <div className="r">
      <div className="big">{score}</div>
      {extra && <p className="mute">{extra}</p>}
      <p className="xp">+{xp} XP {score >= best && score > 0 ? "· 🏆 สถิติใหม่!" : ""}</p>
      <button className="btn" onClick={onAgain}>เล่นอีกรอบ</button>
    </div>
  );
}

/* ---------- 1) Beat Breath ---------- */
const FALL = 1600, BEAT = 700, DUR = 28000, WIN = 170;

function Beat({ done, best }) {
  const [ph, setPh] = useState("idle");
  const [, tick] = useState(0);
  const [res, setRes] = useState(null);
  const g = useRef(null);

  const start = () => {
    g.current = { t0: performance.now(), n: [], i: 0, hit: 0, tot: 0, combo: 0, max: 0, fb: "", score: 0, now: 0 };
    setPh("play");
  };

  useRaf(ph === "play", (dt, t) => {
    const s = g.current, now = t - s.t0;
    s.now = now;
    while (s.i * BEAT + 500 <= now && s.i * BEAT + 500 + FALL < DUR) {
      s.n.push({ id: s.i, l: Math.floor(Math.random() * 4), t: s.i * BEAT + 500 + FALL });
      s.tot++; s.i++;
    }
    s.n.forEach((n) => { if (!n.d && now > n.t + WIN) { n.d = 1; s.combo = 0; s.fb = "พลาด"; } });
    s.n = s.n.filter((n) => now < n.t + 500);
    if (now > DUR) {
      const acc = s.tot ? s.hit / s.tot : 0;
      const xp = Math.round(5 + acc * 25), score = Math.round(s.score);
      setRes({ score, xp, acc: Math.round(acc * 100), max: s.max });
      done("beat", score, xp);
      setPh("done");
      return;
    }
    tick((x) => x + 1);
  });

  const press = (l) => {
    const s = g.current;
    if (!s || ph !== "play") return;
    const now = performance.now() - s.t0;
    const n = s.n.filter((x) => !x.d && x.l === l).sort((a, b) => Math.abs(a.t - now) - Math.abs(b.t - now))[0];
    if (!n || Math.abs(n.t - now) > WIN) return;
    n.d = 1;
    const p = Math.abs(n.t - now) < 70;
    s.hit++; s.combo++; s.max = Math.max(s.max, s.combo);
    s.score += (p ? 100 : 60) * (1 + Math.min(s.combo, 20) / 10);
    s.fb = p ? "สมบูรณ์แบบ ✨" : "ดี";
  };

  useEffect(() => {
    const k = (e) => { const l = "dfjk".indexOf(e.key.toLowerCase()); if (l >= 0) press(l); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const s = g.current;
  return (
    <div className="game">
      {ph === "idle" && (
        <>
          <p className="mute">โน้ตจะตกลงมา แตะเลนให้ตรงเส้นล่าง ยิ่งต่อเนื่องคอมโบยิ่งสูง ลองหายใจเข้าออกตามจังหวะไปด้วย (คีย์บอร์ด: D F J K)</p>
          <button className="btn" onClick={start}>เริ่มเลย</button>
        </>
      )}
      {ph === "play" && s && (
        <>
          <div className="hud"><span>{Math.round(s.score)}</span><b>{s.combo > 1 ? `${s.combo}x คอมโบ` : ""}</b><span>{s.fb}</span></div>
          <div className="lanes">
            {[0, 1, 2, 3].map((l) => (
              <button key={l} className="lane" onPointerDown={() => press(l)} aria-label={`เลน ${l + 1}`}>
                {s.n.filter((n) => n.l === l && !n.d).map((n) => (
                  <i key={n.id} className="note" style={{ top: `${((s.now - (n.t - FALL)) / FALL) * 86}%` }} />
                ))}
              </button>
            ))}
            <div className="line" />
          </div>
        </>
      )}
      {ph === "done" && res && (
        <Result score={res.score} xp={res.xp} best={best} extra={`แม่น ${res.acc}% · คอมโบสูงสุด ${res.max}`} onAgain={() => setPh("idle")} />
      )}
    </div>
  );
}

/* ---------- 2) Pop the Noise ---------- */
const NEG = ["เราไม่เก่งพอ", "ทุกคนมองเราแปลก", "พลาดอีกแล้ว", "ไม่มีใครเข้าใจ", "เราทำไม่ได้หรอก", "เหนื่อยเกินไปแล้ว"];
const POS = ["เรากำลังพยายามอยู่", "พักได้ ไม่ผิดเลย", "ผิดพลาดได้ เรียนรู้ได้", "เราไม่ได้อยู่คนเดียว", "ลองอีกนิดก็พอ", "เก่งแล้วที่มาถึงตรงนี้"];

function Pop({ done, best }) {
  const [ph, setPh] = useState("idle");
  const [, tick] = useState(0);
  const [res, setRes] = useState(null);
  const g = useRef(null);

  const start = () => { g.current = { b: [], id: 0, sp: 0, pops: 0, lives: 3, el: 0 }; setPh("play"); };

  useRaf(ph === "play", (dt) => {
    const s = g.current;
    s.el += dt; s.sp += dt;
    if (s.sp > Math.max(550, 1100 - s.el / 60)) {
      s.sp = 0;
      s.b.push({ id: s.id++, x: 6 + Math.random() * 56, y: 100, v: 13 + Math.random() * 9 + s.el / 4000, i: Math.floor(Math.random() * NEG.length) });
    }
    s.b.forEach((b) => {
      if (b.p) { b.pt += dt; return; }
      b.y -= (b.v * dt) / 1000;
      if (b.y < -4) { b.gone = 1; s.lives--; }
    });
    s.b = s.b.filter((b) => !b.gone && !(b.p && b.pt > 800));
    if (s.lives <= 0 || s.el > 40000) {
      const xp = Math.min(30, 5 + s.pops);
      setRes({ score: s.pops * 10, xp, pops: s.pops });
      done("pop", s.pops * 10, xp);
      setPh("done");
      return;
    }
    tick((x) => x + 1);
  });

  const hit = (b) => { if (!b.p) { b.p = 1; b.pt = 0; g.current.pops++; } };
  const s = g.current;
  return (
    <div className="game">
      {ph === "idle" && (
        <>
          <p className="mute">ความคิดลบลอยขึ้นมา แตะเพื่อเปลี่ยนมันเป็นประโยคที่ใจดีกับตัวเอง ถ้าปล่อยให้ลอยหลุดจอ ใจจะหมดแรง (มี 3 ดวง)</p>
          <button className="btn" onClick={start}>เริ่มเลย</button>
        </>
      )}
      {ph === "play" && s && (
        <>
          <div className="hud"><span>{s.pops * 10}</span><b>{"💜".repeat(Math.max(0, s.lives))}</b><span>{Math.max(0, Math.ceil((40000 - s.el) / 1000))} วิ</span></div>
          <div className="sky">
            {s.b.map((b) => (
              <button key={b.id} className={`bub ${b.p ? "good" : ""}`} style={{ left: `${b.x}%`, top: `${b.y}%` }} onPointerDown={() => hit(b)}>
                {b.p ? POS[b.i] : NEG[b.i]}
              </button>
            ))}
          </div>
        </>
      )}
      {ph === "done" && res && (
        <Result score={res.score} xp={res.xp} best={best} extra={`เปลี่ยนความคิดได้ ${res.pops} ครั้ง`} onAgain={() => setPh("idle")} />
      )}
    </div>
  );
}

/* ---------- 3) Hold the Line ---------- */
function Focus({ done, best }) {
  const [ph, setPh] = useState("idle");
  const [, tick] = useState(0);
  const [res, setRes] = useState(null);
  const g = useRef(null);
  const hold = useRef(false);

  const start = () => { g.current = { y: 10, el: 0, ok: 0, zone: 50 }; setPh("play"); };

  useRaf(ph === "play", (dt) => {
    const s = g.current;
    s.el += dt;
    s.y = Math.max(0, Math.min(100, s.y + ((hold.current ? 38 : -28) * dt) / 1000));
    s.zone = 50 + 28 * Math.sin(s.el / 1800);
    if (Math.abs(s.y - s.zone) < 13) s.ok += dt;
    if (s.el > 30000) {
      const pct = Math.round((s.ok / 30000) * 100), xp = Math.round(5 + pct * 0.25);
      setRes({ score: pct, xp });
      done("focus", pct, xp);
      setPh("done");
      return;
    }
    tick((x) => x + 1);
  });

  useEffect(() => {
    const d = (e) => { if (e.code === "Space") { e.preventDefault(); hold.current = true; } };
    const u = (e) => { if (e.code === "Space") hold.current = false; };
    window.addEventListener("keydown", d);
    window.addEventListener("keyup", u);
    return () => { window.removeEventListener("keydown", d); window.removeEventListener("keyup", u); };
  }, []);

  const s = g.current;
  const inside = s && Math.abs(s.y - s.zone) < 13;
  return (
    <div className="game">
      {ph === "idle" && (
        <>
          <p className="mute">กดค้างเพื่อให้ลูกบอลลอยขึ้น ปล่อยเพื่อให้ลดลง รักษาไว้ในแถบสีเขียวที่เคลื่อนช้า ๆ ให้นานที่สุด 30 วินาที (คีย์บอร์ด: Space)</p>
          <button className="btn" onClick={start}>เริ่มเลย</button>
        </>
      )}
      {ph === "play" && s && (
        <>
          <div className="hud"><span>โฟกัส {Math.round((s.ok / Math.max(1, s.el)) * 100)}%</span><span>{Math.max(0, Math.ceil((30000 - s.el) / 1000))} วิ</span></div>
          <div className="track">
            <div className="zone" style={{ bottom: `${s.zone - 13}%` }} />
            <div className={`ball ${inside ? "in" : ""}`} style={{ bottom: `calc(${s.y}% - 14px)` }} />
          </div>
          <button
            className="btn hold"
            onPointerDown={() => (hold.current = true)}
            onPointerUp={() => (hold.current = false)}
            onPointerLeave={() => (hold.current = false)}
            onPointerCancel={() => (hold.current = false)}
          >
            กดค้างไว้
          </button>
        </>
      )}
      {ph === "done" && res && (
        <Result score={res.score} xp={res.xp} best={best} extra="เปอร์เซ็นต์เวลาที่อยู่ในโซน" onAgain={() => setPh("idle")} />
      )}
    </div>
  );
}

/* ---------- หน้าหลัก ---------- */
export default function JaibaoGamesPage() {
  const [s, save] = useStore();
  const [active, setActive] = useState("beat");
  const [feel, setFeel] = useState(null);

  useEffect(() => {
    try {
      const a = JSON.parse(localStorage.getItem("jaibao_assessment") || "null");
      const f = FEELS.find((x) => x.id === a?.state);
      if (f) { setFeel(f.id); setActive(f.game); }
    } catch {}
  }, []);

  const done = (game, score, xp) =>
    save((p) => {
      const t = day();
      const streak = p.last === t ? p.streak : p.last === day(1) ? p.streak + 1 : 1;
      return { ...p, xp: p.xp + xp, streak, last: t, best: { ...p.best, [game]: Math.max(p.best?.[game] || 0, score) } };
    });

  const pick = (f) => {
    setFeel(f.id);
    setActive(f.game);
    try { localStorage.setItem("jaibao_assessment", JSON.stringify({ state: f.id })); } catch {}
  };

  const lv = Math.floor(s.xp / 100) + 1;
  const rec = FEELS.find((f) => f.id === feel)?.game;
  const P = { done, best: s.best?.[active] || 0 };

  return (
    <main className="jb">
      <style>{CSS}</style>
      <header className="top">
        <div className="lv">LV {lv}</div>
        <div className="xpbar"><i style={{ width: `${s.xp % 100}%` }} /></div>
        <div className="st">🔥 {s.streak} วัน</div>
      </header>
      <h1>ใจเบา</h1>
      <p className="mute">เล่นสั้น ๆ 30 วินาที เก็บ XP ปลดล็อกเลเวล แล้วใจจะเบาลงโดยไม่รู้ตัว</p>

      <div className="chips">
        <span className="mute">วันนี้รู้สึก</span>
        {FEELS.map((f) => (
          <button key={f.id} className={`chip ${feel === f.id ? "on" : ""}`} onClick={() => pick(f)}>{f.label}</button>
        ))}
      </div>

      <nav className="tabs">
        {GAMES.map((x) => (
          <button key={x.id} className={`tab ${active === x.id ? "on" : ""}`} onClick={() => setActive(x.id)}>
            {rec === x.id && <em>แนะนำ</em>}
            <span>{x.icon}</span><strong>{x.name}</strong><small>{x.hint}</small>
            <small>สถิติ {s.best?.[x.id] || 0}</small>
          </button>
        ))}
      </nav>

      <section className="panel">
        {active === "beat" && <Beat key="beat" {...P} />}
        {active === "pop" && <Pop key="pop" {...P} />}
        {active === "focus" && <Focus key="focus" {...P} />}
      </section>
    </main>
  );
}

const CSS = `
.jb{--bg:#0f0f1a;--card:#1a1a2e;--line:#2c2c48;--ink:#ecebff;--mute:#9a98bd;--a:#8b5cf6;--b:#22d3ee;
  max-width:640px;margin:0 auto;min-height:100vh;padding:16px 16px 60px;background:var(--bg);color:var(--ink);
  font-family:"Noto Sans Thai","Sarabun",system-ui,sans-serif;box-sizing:border-box;line-height:1.6}
.jb *{box-sizing:border-box}
.jb h1{margin:14px 0 0;font-size:30px;background:linear-gradient(90deg,var(--a),var(--b));-webkit-background-clip:text;background-clip:text;color:transparent}
.mute{color:var(--mute);font-size:14px;margin:4px 0}
.top{display:flex;align-items:center;gap:12px}
.lv{font-weight:800;background:var(--card);border:1px solid var(--line);padding:4px 12px;border-radius:999px}
.xpbar{flex:1;height:10px;background:var(--card);border-radius:999px;overflow:hidden;border:1px solid var(--line)}
.xpbar i{display:block;height:100%;background:linear-gradient(90deg,var(--a),var(--b));transition:width .4s}
.st{font-weight:700}
.chips{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:14px 0}
.chip{border:1px solid var(--line);background:var(--card);color:var(--ink);padding:6px 14px;border-radius:999px;font:inherit;font-size:14px;cursor:pointer}
.chip.on{border-color:var(--a);box-shadow:0 0 12px #8b5cf688}
.tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
.tab{position:relative;text-align:left;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px;color:var(--ink);font:inherit;cursor:pointer;display:flex;flex-direction:column}
.tab span{font-size:24px}.tab small{color:var(--mute);font-size:12px}
.tab.on{border-color:var(--b);box-shadow:0 0 16px #22d3ee55}
.tab em{position:absolute;top:-9px;right:8px;background:var(--a);font-style:normal;font-size:11px;padding:1px 8px;border-radius:999px}
.panel{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:16px}
.game{display:flex;flex-direction:column;gap:12px;align-items:stretch}
.btn{border:0;border-radius:14px;padding:12px 22px;font:inherit;font-weight:700;color:#fff;cursor:pointer;background:linear-gradient(90deg,var(--a),#6366f1)}
.btn.hold{padding:26px;font-size:18px;touch-action:none;user-select:none;-webkit-user-select:none}
.hud{display:flex;justify-content:space-between;font-weight:700}.hud b{color:var(--b)}
.lanes{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;height:380px;touch-action:none}
.lane{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#14142a;cursor:pointer;padding:0}
.note{position:absolute;left:12%;width:76%;height:26px;border-radius:10px;background:linear-gradient(var(--b),var(--a));box-shadow:0 0 10px var(--b)}
.line{position:absolute;left:0;right:0;top:86%;height:3px;background:#fff6;pointer-events:none}
.sky{position:relative;height:400px;overflow:hidden;border-radius:14px;background:linear-gradient(#14142a,#1d1740);touch-action:none}
.bub{position:absolute;max-width:46%;border:1px solid #f472b6;background:#3b1736;color:#fff;border-radius:16px;padding:8px 12px;font:inherit;font-size:14px;cursor:pointer}
.bub.good{border-color:#34d399;background:#12372c;transform:scale(1.08)}
.track{position:relative;height:320px;width:90px;margin:0 auto;border-radius:999px;background:#14142a;border:1px solid var(--line);overflow:hidden}
.zone{position:absolute;left:0;right:0;height:26%;background:#34d39955;border-top:2px solid #34d399;border-bottom:2px solid #34d399}
.ball{position:absolute;left:50%;width:28px;height:28px;margin-left:-14px;border-radius:50%;background:#f472b6}
.ball.in{background:#34d399;box-shadow:0 0 14px #34d399}
.r{text-align:center;display:flex;flex-direction:column;gap:6px;align-items:center}
.big{font-size:56px;font-weight:800;background:linear-gradient(90deg,var(--a),var(--b));-webkit-background-clip:text;background-clip:text;color:transparent}
.xp{margin:0;font-weight:700;color:var(--b)}
@media(prefers-reduced-motion:reduce){.jb *{transition:none!important}}
`;