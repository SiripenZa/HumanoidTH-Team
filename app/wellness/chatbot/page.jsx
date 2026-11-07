import Link from "next/link";
import { cookies } from "next/headers";
import WellnessChatbot from "@/components/WellnessChatbot";

export const metadata = {
  title: "Wellness Chatbot",
  description: "Talk with the wellness companion, vent your feelings and get advice from Robot Guide.",
  alternates: { canonical: "/wellness/chatbot" }
};

const COPY = {
  th: {
    back: "กลับไปหน้า Wellness",
    desc: "พูดคุยกับผู้ช่วยสุขภาวะ ระบายความรู้สึก และรับคำแนะนำจาก Robot Guide",
    note: "Robot Guide เป็นผู้ช่วยเบื้องต้น ไม่ใช่การรักษาทางการแพทย์ หากรู้สึกไม่ปลอดภัย โทร 1323 (สุขภาพจิต 24 ชม.) หรือ 1669 (ฉุกเฉิน)"
  },
  en: {
    back: "Back to Wellness",
    desc: "Talk with the wellness companion, vent your feelings and get advice from Robot Guide.",
    note: "Robot Guide is a first-step helper, not medical care. If you feel unsafe, call 1323 (Mental Health Hotline, 24 hrs) or 1669 (emergency)."
  }
};

export default async function WellnessChatbotPage() {
  // Same language cookie the LanguageSelector sets through the setLanguage server action.
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value === "th" ? "th" : "en";
  const copy = COPY[lang];

  return (
    <>
      <Link
        href="/wellness"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "14px",
          padding: "8px 14px",
          borderRadius: "10px",
          border: "1px solid var(--surface-muted)",
          background: "var(--surface)",
          color: "var(--accent)",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none"
        }}
      >
        <span aria-hidden>←</span> {copy.back}
      </Link>
      <div className="topline">
        <div>
          <h1>Wellness Chatbot</h1>
          <p className="muted">{copy.desc}</p>
        </div>
      </div>
      {/* key remounts the chat when the language changes so the conversation restarts in the new language */}
      <WellnessChatbot key={lang} lang={lang} />
      <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
        {copy.note}
      </p>
    </>
  );
}