"use client";

// components/OwlAvatar.jsx
//
// โปรไฟล์หมอฮูกข้างข้อความแชท
//  - animated = true  → หมอฮูก 3 มิติตัวจริง ขยับได้ (กะพริบตา หายใจ มองตามเมาส์ ทำท่าตาม state)
//  - animated = false → รูปหมอฮูกนิ่ง /owl-avatar.png
//
// หมายเหตุ: WebGL มีจำกัดจำนวนต่อหน้า จึงควรให้ animated เฉพาะข้อความล่าสุดเพียงอันเดียว
//
// Props
//   animated  boolean
//   state     "idle" | "thinking" | "speaking" | "caring" ...
//   score     number|null
//   lang      "th" | "en"
//   size      เส้นผ่านศูนย์กลางโปรไฟล์ px (ค่าเริ่มต้น 44)
//   zoom      ซูมหมอฮูกในวงกลม (ค่ามาก = ใกล้ขึ้น) ค่าเริ่มต้น 2.3
//   faceY     ตำแหน่งแนวตั้งของใบหน้าในกรอบหมอฮูก 0..1 (ปรับถ้าหน้าเลื่อนขึ้น/ลง)

import dynamic from "next/dynamic";

const DoctorOwl3D = dynamic(() => import("./DoctorOwl3D"), {
  ssr: false,
  loading: () => null,
});

export default function OwlAvatar({
  animated = false,
  state = "idle",
  score = null,
  lang = "th",
  size = 40,
  zoom = 2.3,
  faceY = 0.47,
}) {
  const inner = Math.round(size * zoom);
  const left = -Math.round((inner - size) / 2);
  const top = -Math.round(inner * faceY - size / 2);

  return (
    <div
      className="wc-ava owlava"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        position: "relative",
        flex: "none",
        borderRadius: "50%",
        overflow: "hidden",
        background: "#f3f6f6",
        boxShadow: "0 0 0 1.5px rgba(142,142,142,.55), 0 2px 4px rgba(0,0,0,.12)",
      }}
    >
      {animated ? (
        <div
          style={{
            position: "absolute",
            left,
            top,
            width: inner,
            height: inner,
            pointerEvents: "none",
          }}
        >
          <DoctorOwl3D
            score={score}
            state={state}
            size={inner}
            lang={lang}
            showMessage={false}
          />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/owl-avatar.png"
          alt=""
          width={size}
          height={size}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
    </div>
  );
}