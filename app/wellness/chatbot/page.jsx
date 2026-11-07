import WellnessChatbot from "@/components/WellnessChatbot";

export const metadata = {
  title: "Wellness Chatbot",
  description: "พูดคุยกับผู้ช่วยสุขภาวะ ระบายความรู้สึก และรับคำแนะนำจาก Robot Guide",
  alternates: { canonical: "/wellness/chatbot" }
};

export default function WellnessChatbotPage() {
  return (
    <>
      <div className="topline">
        <div>
          <h1>Wellness Chatbot</h1>
          <p className="muted">พูดคุยกับผู้ช่วยสุขภาวะ ระบายความรู้สึก และรับคำแนะนำจาก Robot Guide</p>
        </div>
      </div>
      <WellnessChatbot />
      <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
        Robot Guide เป็นผู้ช่วยเบื้องต้น ไม่ใช่การรักษาทางการแพทย์ หากรู้สึกไม่ปลอดภัย โทร 1323 (สุขภาพจิต 24 ชม.) หรือ 1669 (ฉุกเฉิน)
      </p>
    </>
  );
}