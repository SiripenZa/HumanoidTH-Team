"use client";

// components/OwlCompanion.jsx
//
// หมอฮูกลอยมุมขวาล่างทุกหน้าของแอป
// - อ่านผลประเมินจาก sessionStorage("wellnessAssessment") (รูปแบบเดียวกับหน้า chatbot)
// - สีหน้าเปลี่ยนตามช่วงคะแนน ST-5
// - ซ่อนตัวเองในหน้า /wellness/chatbot (หน้านั้นมีหมอฮูกตัวใหญ่ของตัวเอง)
//
// วางใน app/layout.js ภายใน <body> หลัง {children}:
//   import OwlCompanion from "@/components/OwlCompanion";
//   <OwlCompanion />
//
// หน้าแบบประเมิน ST-5: หลังบันทึกผลลง sessionStorage ให้ยิง event นี้ เพื่อให้หมอฮูกตอบสนองทันที
//   window.dispatchEvent(new Event("wellness-assessment-updated"));

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { OWL_ENCOURAGEMENT, bandFromScore } from "@/lib/owlExpressions";
import { OWL_LINES, bandFromScore } from "@/lib/owlExpressions";

const DoctorOwl3D = dynamic(() => import("./DoctorOwl3D"), {
  ssr: false,
  loading: () => null,
});

function readScore() {
  try {
    const raw = sessionStorage.getItem("wellnessAssessment");
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (
      p &&
      Number.isInteger(p.score) &&
      p.score >= 0 &&
      p.score <= 15 &&
      p.maxScore === 15
    ) {
      return p.score;
    }
  } catch {}
  return null;
}

function readLang() {
  const m = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
  return m && decodeURIComponent(m[1]) === "en" ? "en" : "th";
}

export default function OwlCompanion() {
  const pathname = usePathname();
  const router = useRouter();

  const [score, setScore] = useState(null);
  const [lang, setLang] = useState("th");
  const [state, setState] = useState("wave"); // ทักทายตอนเปิดแอป
  const [bubble, setBubble] = useState(true);
  const [mobile, setMobile] = useState(false);
  const timers = useRef([]);

  const later = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  // อ่านค่าตอนเริ่ม + ฟังการเปลี่ยนแปลง
  useEffect(() => {
    setScore(readScore());
    setLang(readLang());

    const onUpdate = () => {
      const next = readScore();
      setScore(next);
      setLang(readLang());
      setBubble(true);
      // คะแนนต่ำ = ฉลอง, คะแนนสูง = ห่วงใย
      setState(next !== null && next <= 4 ? "celebrate" : "caring");
      later(() => setState("speaking"), 1800);
      later(() => setState("idle"), 5200);
    };

    window.addEventListener("wellness-assessment-updated", onUpdate);
    window.addEventListener("storage", onUpdate);

    const mq = window.matchMedia("(max-width: 480px)");
    const onMq = () => setMobile(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);

    // ทักทายตอนโหลด: โบกมือ → พูด → นิ่ง
    later(() => setState("speaking"), 1800);
    later(() => setState("idle"), 4200);
    later(() => setBubble(false), 9000);

    return () => {
      window.removeEventListener("wellness-assessment-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
      mq.removeEventListener("change", onMq);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [later]);

  if (pathname?.startsWith("/wellness/chatbot")) return null;

  const band = bandFromScore(score);
  const line = OWL_ENCOURAGEMENT[band][lang][0];
  const size = mobile ? 120 : 168;

  function toggleBubble() {
    setBubble((v) => {
      const next = !v;
      if (next) {
        setState("speaking");
        later(() => setState("idle"), 2600);
      }
      return next;
    });
  }

  return (
    <>
      <style>{`
        .owl-dock{
          position:fixed;
          right:max(12px, env(safe-area-inset-right));
          bottom:max(12px, env(safe-area-inset-bottom));
          z-index:50;
          display:flex;
          flex-direction:column;
          align-items:flex-end;
          pointer-events:none;
        }
        .owl-dock > *{ pointer-events:auto; }
        .owl-bubble{
          position:relative;
          max-width:min(260px, 72vw);
          margin:0 8px 2px 0;
          padding:10px 14px 12px;
          border-radius:16px 16px 4px 16px;
          background:var(--surface, #fff);
          color:var(--text-primary, inherit);
          border:1px solid var(--accent, #4d8ea3);
          box-shadow:0 6px 20px rgba(20,50,60,.14);
          font-size:13px;
          line-height:1.7;
        }
        .owl-bubble-actions{
          display:flex;
          gap:8px;
          margin-top:8px;
          align-items:center;
        }
        .owl-bubble button.owl-go{
          border:0;
          background:var(--accent, #4d8ea3);
          color:#fff;
          border-radius:999px;
          padding:6px 12px;
          font:inherit;
          font-size:12px;
          font-weight:700;
          cursor:pointer;
        }
        .owl-bubble button.owl-x{
          border:0;
          background:transparent;
          color:inherit;
          opacity:.6;
          font:inherit;
          font-size:12px;
          cursor:pointer;
          padding:6px 4px;
        }
        .owl-bubble button:focus-visible,
        .owl-hit:focus-visible{
          outline:2px solid var(--accent, #4d8ea3);
          outline-offset:2px;
        }
        .owl-hit{
          border:0;
          background:transparent;
          padding:0;
          cursor:pointer;
          border-radius:50%;
        }
      `}</style>

      <aside className="owl-dock" aria-label={lang === "en" ? "Doctor Owl" : "หมอฮูก"}>
        {bubble && (
          <div className="owl-bubble" role="status">
            {line}
            <div className="owl-bubble-actions">
              <button
                type="button"
                className="owl-go"
                onClick={() => router.push("/wellness/chatbot")}
              >
                {lang === "en" ? "Chat with me" : "คุยกับฉัน"}
              </button>
              <button type="button" className="owl-x" onClick={() => setBubble(false)}>
                {lang === "en" ? "Close" : "ปิด"}
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          className="owl-hit"
          onClick={toggleBubble}
          aria-label={
            lang === "en" ? "Show or hide Doctor Owl's message" : "แสดงหรือซ่อนข้อความจากหมอฮูก"
          }
        >
          <DoctorOwl3D score={score} state={state} size={size} lang={lang} showMessage={false} />
        </button>
      </aside>
    </>
  );
}