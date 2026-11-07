"use client";

// components/OwlBubble.jsx
//
// บับเบิลข้อความให้กำลังใจที่ลอยอยู่เหนือหัวหมอฮูก (DoctorOwl3D เรียกใช้อัตโนมัติ)
// ดีไซน์อ้างอิงรูปบับเบิลที่ให้มา: พื้นขาว ขอบเทา เงาใต้กล่อง หางโค้งมุมขวาล่างชี้ลงหาหัวหมอฮูก
//
// Props
//   text     ข้อความที่แสดง
//   size     ขนาดของหมอฮูก (px) ใช้คำนวณความกว้างและตำแหน่งบับเบิล
//   lang     "th" | "en"
//   onClick  คลิกที่บับเบิล (ไม่บังคับ)
//   placement "side" (ค่าเริ่มต้น: อยู่ด้านซ้ายของหัว ปลอดภัยเมื่อหมอฮูกชิดขอบบนหน้าจอ) หรือ "top"
//   onClose  ถ้าส่งมา จะมีปุ่ม × เล็ก ๆ ให้ปิดบับเบิล (ไม่บังคับ)

const KEYFRAMES = `
@keyframes owlBubblePop {
  0%   { opacity: 0; transform: translateY(8px) scale(.92); }
  60%  { opacity: 1; transform: translateY(-2px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes owlBubbleFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}
@media (prefers-reduced-motion: reduce) {
  .owl3d-bubble, .owl3d-bubble-inner { animation: none !important; }
}
`;

export default function OwlBubble({
  text,
  size = 220,
  lang = "th",
  onClick,
  onClose,
  placement = "side", // "side" = ข้างหัว (ไม่โดนตัดขอบบน) | "top" = เหนือหัว
}) {
  if (!text) return null;

  const interactive = typeof onClick === "function";
  const width = Math.round(Math.min(Math.max(size * 1.45, 200), 300));
  const fontSize = Math.max(12, Math.min(15, Math.round(size * 0.075)));

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* ตัวยึดตำแหน่ง: ขอบขวาชิดกึ่งกลางหัวหมอฮูก ก้นบับเบิลอยู่เหนือหัวเล็กน้อย */}
      <div
        className="owl3d-bubble"
        role="status"
        aria-live="polite"
        style={{
          position: "absolute",
          ...(placement === "top"
            ? { right: "42%", bottom: "88%" }
            : { right: "58%", top: "2%" }),
          width,
          zIndex: 5,
          transformOrigin: "100% 100%",
          animation: "owlBubblePop .45s cubic-bezier(.2,.9,.3,1.2) both",
          pointerEvents: "none",
        }}
      >
        <div
          className="owl3d-bubble-inner"
          onClick={onClick}
          onKeyDown={
            interactive
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick(e);
                  }
                }
              : undefined
          }
          tabIndex={interactive ? 0 : undefined}
          role={interactive ? "button" : undefined}
          style={{
            position: "relative",
            pointerEvents: "auto",
            cursor: interactive ? "pointer" : "default",
            boxSizing: "border-box",
            padding: onClose ? "12px 30px 12px 16px" : "12px 16px",
            background: "linear-gradient(180deg,#ffffff 0%,#fbfbfb 100%)",
            border: "2.5px solid #8e8e8e",
            borderRadius: 26,
            boxShadow:
              "inset 0 0 0 2px rgba(255,255,255,.95), 0 5px 6px rgba(0,0,0,.22), 0 1px 0 rgba(0,0,0,.18)",
            color: "#2f3b3a",
            fontSize,
            lineHeight: 1.55,
            fontWeight: 500,
            textAlign: "left",
            wordBreak: lang === "th" ? "normal" : "break-word",
            overflowWrap: "anywhere",
            animation: "owlBubbleFloat 4s ease-in-out .5s infinite",
          }}
        >
          {text}

          {onClose && (
            <button
              type="button"
              aria-label={lang === "en" ? "Close" : "ปิด"}
              onClick={(e) => {
                e.stopPropagation();
                onClose(e);
              }}
              style={{
                position: "absolute",
                top: 6,
                right: 8,
                width: 20,
                height: 20,
                lineHeight: "18px",
                padding: 0,
                border: "none",
                borderRadius: "50%",
                background: "transparent",
                color: "#8e8e8e",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          )}

          {/* หางบับเบิลมุมขวาล่าง (โค้งออกด้านขวาเหมือนในรูปอ้างอิง) */}
          <svg
            aria-hidden="true"
            width="34"
            height="22"
            viewBox="0 0 34 22"
            style={{
              position: "absolute",
              right: 14,
              bottom: -19,
              overflow: "visible",
              filter: "drop-shadow(0 3px 2px rgba(0,0,0,.2))",
            }}
          >
            <path
              d="M2 0 C3 9 10 16 31 18 C21 19.5 9 18 1 11 Z"
              fill="#fdfdfd"
              stroke="#8e8e8e"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* ปิดรอยต่อระหว่างหางกับขอบกล่อง */}
            <rect x="0.5" y="-3" width="16" height="5" fill="#fdfdfd" />
          </svg>
        </div>
      </div>
    </>
  );
}