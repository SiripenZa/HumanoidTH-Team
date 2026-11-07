"use client";

// components/OwlWithMessage.jsx
//
// หมอฮูก 3 มิติ + บับเบิลข้อความให้กำลังใจ "ด้านซ้าย" ของหมอฮูก
// ข้อความเปลี่ยนตามระดับคะแนน ST-5 และสลับประโยคทุก ~10 วินาที
// ไฟล์นี้ไม่ต้องพึ่ง OwlBubble / owlExpressions (มีข้อความอยู่ในไฟล์เอง)
//
// Props
//   score    number|null  คะแนน ST-5 (0-15)
//   state    สถานะหมอฮูก ("idle" | "thinking" | "speaking" | "caring" ...)
//   size     ขนาดหมอฮูก px (ค่าเริ่มต้น 190)
//   lang     "th" | "en"
//   message  กำหนดข้อความเอง (ทับข้อความตามระดับ)
//   rotate   สลับประโยคเป็นระยะ (ค่าเริ่มต้น true)

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const DoctorOwl3D = dynamic(() => import("./DoctorOwl3D"), {
  ssr: false,
  loading: () => null,
});

// โทนอบอุ่น ไม่วินิจฉัย ไม่ตีตรา
const MESSAGES = {
  // ยังไม่ได้ทำแบบประเมิน
  neutral: {
    th: [
      "ลองทำแบบประเมินสั้น ๆ กับหมอฮูกไหม? ใช้เวลาไม่นานเลย 🦉",
      "วันนี้เธอรู้สึกยังไงบ้าง? เล่าให้หมอฮูกฟังได้เสมอนะ",
    ],
    en: [
      "Want to try a quick check-in with Doctor Owl? It only takes a minute 🦉",
      "How are you feeling today? You can always tell me.",
    ],
  },
  // 0–4 เครียดน้อย
  low: {
    th: [
      "เยี่ยมไปเลย! วันนี้ใจเธอดูโปร่งสบาย เก็บความรู้สึกดี ๆ นี้ไว้นะ 🌷",
      "ขอบคุณที่ดูแลใจตัวเองมาตลอดนะ เธอทำได้ดีมาก ✨",
      "ลองกิจกรรมเบา ๆ เพิ่มความสดใสให้วันนี้ไหม?",
    ],
    en: [
      "Wonderful! You seem light-hearted today. Hold on to that feeling 🌷",
      "Thank you for taking care of yourself. You're doing great ✨",
      "Want to try a gentle activity to keep the good mood going?",
    ],
  },
  // 5–7 เครียดปานกลาง
  mid: {
    th: [
      "มีเรื่องให้คิดบ้างก็ไม่เป็นไรนะ ค่อย ๆ ไปทีละก้าวก็พอ 🌿",
      "หายใจเข้าลึก ๆ แล้วพักสักนิดนะ เธอทำเต็มที่แล้ว",
      "อยากเล่าอะไรให้หมอฮูกฟัง ไม่ต้องรีบเลยนะ",
    ],
    en: [
      "It's okay to have things on your mind. One small step at a time 🌿",
      "Take a slow, deep breath and rest a little. You're doing your best.",
      "If you'd like to share anything, there's no rush.",
    ],
  },
  // 8–9 เครียดมาก
  high: {
    th: [
      "ช่วงนี้อาจหนักใจใช่ไหม ไม่เป็นไรนะ เธอไม่ต้องเข้มแข็งตลอดเวลา 💙",
      "ขอบคุณที่กล้ายอมรับความรู้สึกของตัวเอง นั่นเป็นก้าวที่กล้าหาญมาก",
      "ลองคุยกับคนที่ไว้ใจสักคนดูนะ หมอฮูกอยู่ตรงนี้ด้วย",
    ],
    en: [
      "Things may feel heavy lately, and that's okay. You don't have to be strong all the time 💙",
      "Thank you for being honest about how you feel. That takes courage.",
      "Try talking with someone you trust. I'm right here too.",
    ],
  },
  // 10–15 เครียดมากที่สุด
  veryHigh: {
    th: [
      "เธอไม่ได้อยู่คนเดียวนะ หมอฮูกอยู่ตรงนี้ด้วย 💙",
      "ขอบคุณที่ใจกล้าบอกความรู้สึก ลองคุยกับผู้ใหญ่ที่ไว้ใจดูนะ",
      "ถ้าอยากคุยกับคนจริง ๆ โทร 1323 ได้ตลอด 24 ชั่วโมง ฟรี",
      "ค่อย ๆ หายใจช้า ๆ ไปด้วยกันนะ เธอสำคัญมาก 🤍",
    ],
    en: [
      "You're not alone. Doctor Owl is right here with you 💙",
      "Thank you for being brave enough to share. Try talking with a trusted adult.",
      "If you'd like to talk to a real person, call 1323 any time, 24 hours, free.",
      "Let's take slow, gentle breaths together. You matter so much 🤍",
    ],
  },
};

function bandOf(score) {
  if (typeof score !== "number" || Number.isNaN(score)) return "neutral";
  if (score <= 4) return "low";
  if (score <= 7) return "mid";
  if (score <= 9) return "high";
  return "veryHigh";
}

const CSS = `
.owlmsg{
  display:flex;
  align-items:flex-start;
  justify-content:flex-end;
  gap:4px;
  max-width:100%;
}
.owlmsg-owl{ flex:none; position:relative; }
.owlmsg-bubble{
  position:relative;
  box-sizing:border-box;
  width:min(280px, calc(100vw - 48px));
  margin:10px 0 0 0;
  padding:12px 18px;
  background:linear-gradient(180deg,#ffffff 0%,#fbfbfb 100%);
  border:2.5px solid #8e8e8e;
  border-radius:26px;
  box-shadow:
    inset 0 0 0 2px rgba(255,255,255,.95),
    0 5px 6px rgba(0,0,0,.22),
    0 1px 0 rgba(0,0,0,.18);
  color:#2f3b3a;
  font-size:14px;
  line-height:1.6;
  font-weight:500;
  text-align:left;
  overflow-wrap:anywhere;
  transform-origin:100% 100%;
  animation:owlmsgPop .45s cubic-bezier(.2,.9,.3,1.2) both;
}
.owlmsg-tail{
  position:absolute;
  right:14px;
  bottom:-19px;
  overflow:visible;
  filter:drop-shadow(0 3px 2px rgba(0,0,0,.2));
}
@keyframes owlmsgPop{
  0%{ opacity:0; transform:translateY(8px) scale(.92); }
  60%{ opacity:1; transform:translateY(-2px) scale(1.02); }
  100%{ opacity:1; transform:translateY(0) scale(1); }
}
/* จอแคบ: ย้ายบับเบิลไปอยู่เหนือหมอฮูก */
@media (max-width:560px){
  .owlmsg{ flex-direction:column; align-items:flex-end; }
  .owlmsg-bubble{ margin:0 12px 22px 0; }
}
@media (prefers-reduced-motion:reduce){
  .owlmsg-bubble{ animation:none; }
}
`;

export default function OwlWithMessage({
  score = null,
  state = "idle",
  size = 190,
  lang = "th",
  message = null,
  rotate = true,
  className,
  style,
}) {
  const L = lang === "en" ? "en" : "th";
  const lines = MESSAGES[bandOf(score)][L];

  const [idx, setIdx] = useState(0);
  const [talk, setTalk] = useState(false);

  // เปลี่ยนระดับคะแนน/ภาษา → เริ่มประโยคแรกใหม่
  useEffect(() => {
    setIdx(0);
  }, [score, lang]);

  // สลับประโยคทุก 10 วินาที
  useEffect(() => {
    if (!rotate || message || lines.length < 2) return undefined;
    const id = setInterval(() => setIdx((i) => (i + 1) % lines.length), 10000);
    return () => clearInterval(id);
  }, [rotate, message, lines]);

  const text = message || lines[idx % lines.length];

  // ข้อความเปลี่ยน → หมอฮูกทำท่าพูดสั้น ๆ
  useEffect(() => {
    setTalk(true);
    const id = setTimeout(() => setTalk(false), 1800);
    return () => clearTimeout(id);
  }, [text]);

  const owlState = state === "idle" && talk ? "speaking" : state;

  return (
    <div className={`owlmsg ${className || ""}`} style={style}>
      <style>{CSS}</style>

      <div key={text} className="owlmsg-bubble" role="status" aria-live="polite">
        {text}
        <svg
          className="owlmsg-tail"
          aria-hidden="true"
          width="34"
          height="22"
          viewBox="0 0 34 22"
        >
          <path
            d="M2 0 C3 9 10 16 31 18 C21 19.5 9 18 1 11 Z"
            fill="#fdfdfd"
            stroke="#8e8e8e"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <rect x="0.5" y="-3" width="16" height="5" fill="#fdfdfd" />
        </svg>
      </div>

      <div className="owlmsg-owl" style={{ width: size, height: size }}>
        <DoctorOwl3D
          score={score}
          state={owlState}
          size={size}
          lang={L}
          showMessage={false}
        />
      </div>
    </div>
  );
}