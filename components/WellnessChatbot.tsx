"use client";

import { useEffect, useRef, useState } from "react";
import * as TH from "@/lib/wellness-bot";
import * as EN from "@/lib/wellness-bot-en";
import type { AssessmentSummary, BotReply, Game, Topic } from "@/lib/wellness-bot";

type Lang = "en" | "th";

type Msg = {
  id: number;
  role: "user" | "bot";
  text: string;
  games?: Game[];
  crisis?: boolean;
};

const UI = {
  th: {
    subtitle: "ผู้ช่วยสุขภาวะ · รับฟัง ระบาย และแนะนำ",
    reset: "เริ่มใหม่",
    typing: "Robot Guide กำลังพิมพ์…",
    placeholder: "พิมพ์เล่าให้ Robot Guide ฟังได้เลย…",
    send: "ส่ง",
    contactNow: "ติดต่อได้ทันที",
    showHow: "ดูวิธีเล่น",
    hideHow: "ซ่อนวิธีเล่น",
    kindNow: "เล่นได้ทันที",
    kindFriends: "เล่นกับเพื่อน",
    kindChill: "เกมสายชิล",
    noAssessment: "ยังไม่พบผลแบบประเมินความเครียด ทำแบบประเมินก่อนเพื่อให้ Robot Guide แนะนำได้ตรงกับคุณมากขึ้น",
    goAssessment: "ไปทำแบบประเมิน",
    hotlines: [
      { num: "1323", label: "สายด่วนสุขภาพจิต (24 ชม.)" },
      { num: "1387", label: "สายด่วนเด็ก" },
      { num: "1669", label: "เหตุฉุกเฉิน" }
    ]
  },
  en: {
    subtitle: "Wellness companion · listen, vent and get advice",
    reset: "Start over",
    typing: "Robot Guide is typing…",
    placeholder: "Tell Robot Guide what's on your mind…",
    send: "Send",
    contactNow: "Contact right away",
    showHow: "How to play",
    hideHow: "Hide instructions",
    kindNow: "Play now",
    kindFriends: "With friends",
    kindChill: "Chill game",
    noAssessment: "No stress assessment result found. Take the assessment first so Robot Guide can give more fitting advice.",
    goAssessment: "Take the assessment",
    hotlines: [
      { num: "1323", label: "Mental Health Hotline (24 hrs)" },
      { num: "1387", label: "Child Helpline" },
      { num: "1669", label: "Emergency" }
    ]
  }
} as const;

let nextId = 1;

export default function WellnessChatbot({ lang = "en" }: { lang?: Lang }) {
  const ui = UI[lang];
  const bot = lang === "en" ? EN : TH;

  const [messages, setMessages] = useState<Msg[]>([{ id: nextId++, role: "bot", text: bot.WELCOME_TEXT }]);
  const [chips, setChips] = useState<string[]>(bot.QUICK_TOPICS);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [topic, setTopic] = useState<Topic | undefined>();
  const endRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const [assessment, setAssessment] = useState<AssessmentSummary | null>(null);
  const [completed, setCompleted] = useState(true); // assume done until we have checked storage

  // Read the stress assessment saved by /wellness/check-in and personalize the opening message.
  useEffect(() => {
    try {
      const flag = localStorage.getItem("wellness_assessment_completed") === "true";
      const raw = sessionStorage.getItem("wellnessAssessment") ?? localStorage.getItem("wellnessAssessment");
      const parsed = raw ? TH.parseAssessment(raw) : null;
      const done = flag || !!parsed;
      setCompleted(done);
      setAssessment(parsed);
      if (done && !touched.current) {
        const w = bot.personalizedWelcome(parsed);
        setMessages([{ id: nextId++, role: "bot", text: w.text }]);
        setChips(w.chips ?? bot.QUICK_TOPICS);
        if (w.topic) setTopic(w.topic);
      }
    } catch {
      setCompleted(false);
    }
    // The page remounts this component (key={lang}) when the language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  function pushBot(reply: BotReply, fallbackChips?: string[]) {
    setMessages((m) => [...m, { id: nextId++, role: "bot", text: reply.text, games: reply.games, crisis: reply.crisis }]);
    setChips(reply.chips ?? fallbackChips ?? bot.QUICK_TOPICS);
    if (reply.topic) setTopic(reply.topic);
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;
    touched.current = true;
    setInput("");

    const history = [...messages, { id: 0, role: "user" as const, text }];
    setMessages((m) => [...m, { id: nextId++, role: "user", text }]);
    setBusy(true);

    try {
      // Safety and game picks are always handled locally so they are instant and consistent.
      if (bot.isCrisis(text)) {
        pushBot(bot.crisisReply());
        return;
      }
      if (bot.wantsGames(text)) {
        pushBot(bot.getLocalReply(text, topic));
        return;
      }

      // Everything else: try the AI route for on-point replies, fall back to the local engine.
      try {
        const res = await fetch("/wellness/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lang,
            assessment: assessment
              ? { level: assessment.level, score: assessment.score, maxScore: assessment.maxScore, concerns: assessment.concerns }
              : undefined,
            messages: history.slice(-12).map((m) => ({
              role: m.role === "user" ? "user" : "assistant",
              content: m.text
            }))
          })
        });
        const data = await res.json();
        if (res.ok && typeof data.text === "string" && data.text.trim()) {
          const t = bot.detectTopic(text, topic);
          setTopic(t);
          pushBot({ text: data.text }, bot.followUpChips(t));
          return;
        }
      } catch {
        // fall through to local engine
      }
      pushBot(bot.getLocalReply(text, topic));
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    const w = completed ? bot.personalizedWelcome(assessment) : null;
    setMessages([{ id: nextId++, role: "bot", text: w ? w.text : bot.WELCOME_TEXT }]);
    setChips(w?.chips ?? bot.QUICK_TOPICS);
    setTopic(w?.topic);
    setInput("");
    touched.current = false;
  }

  return (
    <>
      {!completed && (
        <div className="notice" style={{ marginBottom: 16, fontSize: 13 }}>
          {ui.noAssessment}{" "}
          <a href="/wellness/check-in" style={{ fontWeight: 700 }}>
            {ui.goAssessment}
          </a>
        </div>
      )}
      <section
        className="panel"
        style={{ display: "flex", flexDirection: "column", height: "min(78vh, 720px)", padding: 0, overflow: "hidden" }}
        aria-label="Wellness Chatbot"
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "14px 18px",
            borderBottom: "1px solid var(--surface-muted)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--accent)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20
              }}
              aria-hidden
            >
              🤖
            </div>
            <div>
              <strong style={{ display: "block" }}>Robot Guide</strong>
              <span className="muted" style={{ fontSize: 12 }}>
                {ui.subtitle}
              </span>
            </div>
          </div>
          <button type="button" onClick={reset} style={{ fontSize: 12, cursor: "pointer" }}>
            {ui.reset}
          </button>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {messages.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "min(560px, 88%)" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: m.role === "user" ? "var(--accent)" : "var(--surface-muted)",
                    color: m.role === "user" ? "#fff" : "inherit",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                    fontSize: 14
                  }}
                >
                  {m.text}
                </div>

                {m.crisis && (
                  <div
                    className="notice"
                    style={{ marginTop: 8, backgroundColor: "#fef2f2", borderLeftColor: "#dc2626", fontSize: 13 }}
                  >
                    <strong>{ui.contactNow}</strong>
                    <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                      {ui.hotlines.map((h) => (
                        <li key={h.num}>
                          <a href={`tel:${h.num}`} style={{ fontWeight: 700 }}>
                            {h.num}
                          </a>{" "}
                          {h.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {m.games && (
                  <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                    {m.games.map((g) => (
                      <GameCard key={g.title} game={g} ui={ui} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {busy && (
            <div className="muted" style={{ fontSize: 13 }}>
              {ui.typing}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ padding: "10px 18px 0", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              disabled={busy}
              onClick={() => send(c)}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid var(--accent)",
                background: "transparent",
                color: "var(--accent)",
                fontSize: 13,
                cursor: busy ? "not-allowed" : "pointer"
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          style={{ display: "flex", gap: 8, padding: 18 }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={ui.placeholder}
            maxLength={800}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid var(--surface-muted)", fontSize: 14 }}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 600,
              cursor: busy || !input.trim() ? "not-allowed" : "pointer",
              opacity: busy || !input.trim() ? 0.6 : 1
            }}
          >
            {ui.send}
          </button>
        </form>
      </section>
    </>
  );
}

function GameCard({ game, ui }: { game: Game; ui: (typeof UI)[Lang] }) {
  const [open, setOpen] = useState(false);
  const kindLabel = game.kind === "play-now" ? ui.kindNow : game.kind === "friends" ? ui.kindFriends : ui.kindChill;
  return (
    <div style={{ border: "1px solid var(--surface-muted)", borderRadius: 12, padding: "10px 12px", background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
        <strong style={{ fontSize: 14 }}>{game.title}</strong>
        <span className="muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
          {kindLabel} · {game.time}
        </span>
      </div>
      <p style={{ margin: "4px 0 0", fontSize: 13 }}>{game.desc}</p>
      {game.how && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            style={{ marginTop: 6, fontSize: 12, color: "var(--accent)", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            {open ? ui.hideHow : ui.showHow}
          </button>
          {open && <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.6 }}>{game.how}</p>}
        </>
      )}
    </div>
  );
}