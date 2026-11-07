// lib/owlExpressions.js  (v2: ตามแผ่นคาแรกเตอร์ Owl Doctor)
//
// หมอฮูกในแผ่นคาแรกเตอร์ "ไม่มีปาก" อารมณ์ทั้งหมดแสดงผ่าน ตา คิ้ว แก้ม ปีก และเอฟเฟกต์
//   Normal / Happy / Wink / Surprised / Sad / Love
//
// พารามิเตอร์ทุกตัวถูก lerp นุ่ม ๆ ใน DoctorOwl3D.jsx
//   eyeOpen   ขนาดตาแนวตั้ง (1 ปกติ, >1 ตาโต)
//   browY     คิ้วยก (+) / กด (-)
//   browTilt  + = ปลายในยก (กังวล/เห็นใจ), - = ร่าเริง
//   blush     แก้มแดง 0..1
//   tilt      เอียงตัว (radian)
//   breath    ความเร็วหายใจ
//   bounce    ความกระฉับกระเฉง
//   pupil     ขนาดตาดำ/ม่านตาฟ้า (ใหญ่ = อ่อนโยน, เล็ก = ตกใจ)
//   wing      มุมกางปีก
//   hug       ปีกโอบมาข้างหน้า (0..1)
//   happy     ตาหยีโค้ง ^ ^ (0..1)
//   wink      ขยิบตาขวา < (0..1)
//   sad       ตาแฉะ ไฮไลต์ใหญ่ ตาตกเล็กน้อย (0..1)
//   tear      น้ำตาหยด (0..1)
//   heart     หัวใจชมพูที่กอดอยู่ (0..1)
//   talk      จะงอยปากขยับตอนพูด (0..1)
//   fxHearts  หัวใจลอย / fxExclaim  !!  / fxSpark  ประกาย
//   jump, waveAmt, browAsym  ค่าชั่วคราวของแต่ละสถานะ

const BASE = {
  eyeOpen: 1, browY: 0, browTilt: 0, blush: 0.1,
  tilt: 0, breath: 1, bounce: 0.6, pupil: 1, wing: 0.12, hug: 0,
  happy: 0, wink: 0, sad: 0, tear: 0, heart: 0, talk: 0,
  fxHearts: 0, fxExclaim: 0, fxSpark: 0,
  jump: 0, waveAmt: 0, browAsym: 0,
};

export const BANDS = ["low", "mid", "high", "veryHigh"];

export function bandFromScore(score) {
  if (typeof score !== "number" || Number.isNaN(score)) return "neutral";
  if (score <= 4) return "low";
  if (score <= 7) return "mid";
  if (score <= 9) return "high";
  return "veryHigh";
}

export const EXPRESSIONS = {
  // ยังไม่ได้ทำแบบประเมิน → Normal
  neutral: { ...BASE },

  // 0–4 เครียดน้อย → Happy (ตา ^ ^ เป็นช่วง ๆ, แก้มแดง, ปีกยก, ประกายชมพู)
  low: {
    ...BASE, eyeOpen: 1, browY: 0.05, browTilt: -0.08, blush: 0.7,
    breath: 1.25, bounce: 1.3, pupil: 1.1, wing: 0.6, fxSpark: 0.7,
  },

  // 5–7 เครียดปานกลาง → Normal แบบสงบ
  mid: {
    ...BASE, browY: 0.02, browTilt: 0.1, blush: 0.3,
    tilt: 0.03, bounce: 0.7, pupil: 1.05, wing: 0.15,
  },

  // 8–9 เครียดมาก → Sad แบบอ่อน ๆ (ตาแฉะ คิ้วกังวล ไม่มีน้ำตา)
  high: {
    ...BASE, eyeOpen: 1.04, browY: 0.05, browTilt: 0.5, blush: 0.15,
    tilt: 0.08, breath: 0.8, bounce: 0.35, pupil: 1.2, wing: 0.25, sad: 0.45,
  },

  // 10–15 เครียดมากที่สุด → ห่วงใย: ตาแฉะ คิ้วกังวล + กอดหัวใจชมพู (ส่งกำลังใจ)
  veryHigh: {
    ...BASE, eyeOpen: 1.06, browY: 0.07, browTilt: 0.68, blush: 0.25,
    tilt: 0.12, breath: 0.65, bounce: 0.25, pupil: 1.3, wing: 0.4,
    sad: 0.6, heart: 0.9, hug: 0.9,
  },
};

// ข้อความในบับเบิลของหมอฮูก (ไม่วินิจฉัย ไม่ตีตรา)
export const OWL_LINES = {
  neutral: {
    th: "สวัสดี ฉันคือหมอฮูก 🦉 ลองทำแบบประเมินความเครียดสั้น ๆ กับฉันไหม?",
    en: "Hi, I'm Doctor Owl 🦉 Want to try a quick stress check-in with me?",
  },
  low: {
    th: "ดีใจจังที่วันนี้เธอดูสบายใจ 🌷 อยากลองกิจกรรมเบา ๆ ต่อไหม?",
    en: "So glad you seem at ease today 🌷 Want to try a light activity?",
  },
  mid: {
    th: "ช่วงนี้อาจมีเรื่องให้คิดอยู่บ้างนะ ฉันอยู่ตรงนี้ คุยกันได้เสมอ 🌿",
    en: "Sounds like there's a bit on your mind. I'm here whenever you want to talk 🌿",
  },
  high: {
    th: "ฉันรับรู้ว่าช่วงนี้อาจหนักใจ ค่อย ๆ เล่าให้ฟังได้นะ ไม่ต้องรีบ 💙",
    en: "I can tell things may feel heavy lately. Share at your own pace, no rush 💙",
  },
  veryHigh: {
    th: "ขอบคุณที่ใจกล้าทำแบบประเมินนะ ตอนนี้เธอไม่ได้อยู่คนเดียว ลองคุยกับฉัน หรือผู้ใหญ่ที่ไว้ใจก็ได้ 💙 (สายด่วน 1323)",
    en: "Thank you for checking in. You're not alone. Talk with me or a trusted adult 💙 (Hotline 1323 in Thailand)",
  },
};