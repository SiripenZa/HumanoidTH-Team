import { NextResponse } from "next/server";
import { crisisReply, isCrisis } from "@/lib/wellness-bot";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `คุณคือ "Robot Guide" ผู้ช่วยสุขภาวะในแอป Thailand Humanoid Atlas ผู้ใช้ส่วนใหญ่เป็นเยาวชนอายุ 13-17 ปี

หลักการตอบ
1. ตอบเป็นภาษาไทย น้ำเสียงอบอุ่น เป็นกันเอง ไม่ตัดสิน ไม่สั่งสอน
2. ตอบให้ตรงประเด็นกับสิ่งที่ผู้ใช้เพิ่งพิมพ์ ใช้รายละเอียดที่เขาเล่า (วิชา เพื่อน เหตุการณ์) อย่าตอบกว้างๆ หรือท่องข้อความสำเร็จรูป
3. เริ่มด้วยการสะท้อนความรู้สึกสั้นๆ 1 ประโยค แล้วให้คำแนะนำที่ทำได้จริง 1-3 ข้อ
4. ถ้าข้อมูลยังไม่พอ ให้ถามคำถามต่อเพียง 1 ข้อ
5. ยาวไม่เกิน 6-8 บรรทัด ใช้ภาษาง่าย
6. เมื่อเหมาะสม แนะนำกิจกรรมเบาๆ เช่น หายใจ 4-6, เกม 5-4-3-2-1, เกมต่อคำกับเพื่อน ถ้าผู้ใช้อยากได้เกม ให้บอกว่ากดปุ่ม "แนะนำเกมคลายเครียด"
7. คุณไม่ใช่แพทย์หรือนักจิตวิทยา ห้ามวินิจฉัยโรค ห้ามแนะนำยา
8. ถ้ามีสัญญาณอันตราย เช่น ถูกทำร้าย ถูกรังแกรุนแรง หรืออยากทำร้ายตัวเอง ให้ชวนบอกผู้ใหญ่ที่ไว้ใจทันที และแนะนำสายด่วน 1323 (สุขภาพจิต 24 ชม.), 1387 (สายด่วนเด็ก), 1669 (ฉุกเฉิน)
9. ถ้าผู้ใช้ถามเรื่องนอกหัวข้อสุขภาวะ ให้ตอบสั้นๆ แล้วชวนกลับมาคุยเรื่องความรู้สึก`;

const LEVEL_TH = { low: "ต่ำ", moderate: "ปานกลาง", high: "สูง" };
const TOPIC_TH = {
  stress: "ความเครียดทั่วไป",
  bored: "ความเบื่อ",
  study: "เรื่องเรียน",
  friends: "เรื่องเพื่อน",
  family: "เรื่องที่บ้าน",
  sleep: "การนอน",
  sad: "ความเศร้า",
  vent: "ต้องการระบาย"
};

// Only whitelisted values from the client are placed in the prompt.
function assessmentContext(a) {
  if (!a || typeof a !== "object") return "";
  const parts = [];
  if (typeof a.level === "string" && LEVEL_TH[a.level]) {
    parts.push(`ระดับความเครียดจากแบบประเมิน: ${LEVEL_TH[a.level]}`);
  }
  if (Number.isFinite(a.score) && Number.isFinite(a.maxScore) && a.maxScore > 0) {
    parts.push(`คะแนน: ${a.score} จาก ${a.maxScore}`);
  }
  const concerns = Array.isArray(a.concerns)
    ? a.concerns.filter((c) => typeof c === "string" && TOPIC_TH[c]).map((c) => TOPIC_TH[c])
    : [];
  if (concerns.length) parts.push(`เรื่องที่ผู้ใช้กังวล: ${concerns.join(", ")}`);
  if (!parts.length) return "";
  return `\n\nข้อมูลจากแบบประเมินความเครียดที่ผู้ใช้ทำไว้ (ใช้เป็นบริบทเพื่อปรับน้ำเสียงและคำแนะนำให้ตรงกับเขา ห้ามวินิจฉัย และอย่าท่องตัวเลขให้ผู้ใช้ฟังซ้ำๆ):\n- ${parts.join("\n- ")}\nถ้าระดับสูง ให้นุ่มนวลเป็นพิเศษ ชวนบอกผู้ใหญ่ที่ไว้ใจ และเน้นวิธีผ่อนคลายง่ายๆ ที่ทำได้ทันที`;
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = (Array.isArray(body?.messages) ? body.messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

  // The conversation must start with and end on a user turn.
  while (messages.length && messages[0].role !== "user") messages.shift();
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") {
    return NextResponse.json({ error: "No user message" }, { status: 400 });
  }

  // Safety first: never leave a crisis message to the model alone.
  if (isCrisis(last.content)) {
    const r = crisisReply();
    return NextResponse.json({ text: r.text, crisis: true });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ fallback: true }, { status: 503 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.WELLNESS_MODEL || "claude-haiku-5-5",
        max_tokens: 500,
        system: SYSTEM_PROMPT + assessmentContext(body.assessment),
        messages
      })
    });

    if (!res.ok) {
      console.error("wellness chat upstream error", res.status);
      return NextResponse.json({ fallback: true }, { status: 502 });
    }

    const data = await res.json();
    const text = (data.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!text) return NextResponse.json({ fallback: true }, { status: 502 });
    return NextResponse.json({ text });
  } catch (error) {
    console.error("wellness chat failed", error);
    return NextResponse.json({ fallback: true }, { status: 502 });
  }
}