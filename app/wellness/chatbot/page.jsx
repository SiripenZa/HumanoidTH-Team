
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  assessRisk,
  HOTLINES,
  localReply,
} from "@/lib/wellnessSafety";
import {
  getEnglishFallbackReply,
  getStressRecommendations,
  WELLNESS_ACTIVITIES,
  WELLNESS_GAMES,
} from "@/lib/wellnessRecommendations";

// --------------------
// ข้อความสองภาษา
// --------------------

const TEXT = {
  th: {
    back: "กลับหน้าหลัก Wellness",
    title: "Wellness Chatbot",
    description:
      "พูดคุยกับผู้ช่วยอัจฉริยะ เพื่อรับคำแนะนำเกี่ยวกับสุขภาพและความเป็นอยู่",
    assistant: "ผู้ช่วย AI ไม่ใช่คนจริง",
    call: "ต้องการคุยกับคนจริง โทร 1323",
    reset: "เริ่มใหม่",
    hotlineTitle: "📞 ขอความช่วยเหลือได้ตอนนี้ (ฟรี)",
    placeholder: "พิมพ์ข้อความที่อยากเล่า… (Enter เพื่อส่ง)",
    inputLabel: "พิมพ์ข้อความ",
    send: "ส่ง",
    typing: "กำลังพิมพ์",
    noteTitle: "หมายเหตุ:",
    note:
      "ใจเบาเป็น AI ให้คำแนะนำเบื้องต้นเพื่อส่งเสริมสุขภาพใจเท่านั้น ไม่ใช่การวินิจฉัยหรือทดแทนแพทย์/นักจิตวิทยา หากรู้สึกไม่ปลอดภัยหรืออยากทำร้ายตัวเอง โปรดบอกผู้ใหญ่ที่ไว้ใจ หรือโทร",
    privacy:
      "แอปไม่เก็บประวัติแชท และไม่ควรพิมพ์ชื่อจริง ที่อยู่ หรือเบอร์โทรของตัวเองหรือผู้อื่นลงในแชท",
    rate:
      "พิมพ์เร็วมากเลย ขอพักหายใจสักครู่แล้วลองใหม่อีกครั้งนะ 🌿",
    error: "ขออภัย ตอนนี้ระบบยังไม่พร้อมใช้งาน ลองใหม่อีกครั้งนะ 🌿",
    greeting:
      "สวัสดี เราคือ “ใจเบา” ผู้ช่วย AI ที่พร้อมฟังเธอเสมอ 🌷 วันนี้รู้สึกยังไงบ้าง? เลือกหัวข้อด้านล่าง หรือพิมพ์เล่าได้เลย",
    fallback:
      "ขอบคุณที่เล่าให้ฟังนะ ลองค่อย ๆ หายใจและให้เวลากับตัวเองสักนิดก็ได้นะ อยากเล่าเพิ่มเติมไหมว่าอะไรทำให้รู้สึกแบบนี้?",
    gameTitle: "🎮 เกมกิจกรรมผ่อนคลาย",
    gameDescription:
      "เลือกเกมที่สนใจ แล้วกดเพื่อเริ่มกิจกรรมได้เลย",
    gameToggle: "เกมผ่อนคลาย",
    hideGames: "ซ่อนเกม",
    generalActivities: "กิจกรรมทั่วไป",
    genAlphaGames: "เกมเจน Alpha",
    activityIntro: "นี่คือกิจกรรมที่เราคัดเลือกจากความเครียดของคุณครับ",
    gamesIntro: "นี่คือเกมที่เราเตรียมไว้ให้คุณเลือกเล่นครับ",
    play: "เล่นเกม",
    comingSoon: "เร็ว ๆ นี้",
    meditation: "เกมทำสมาธิ 3 นาที",
    meditationDesc:
      "หลับตา ทำสมาธิ และพักใจไปกับ Dream Runner",
    exercise: "เกมออกกำลังกาย",
    exerciseDesc:
      "ขยับร่างกายและทำกิจกรรมเพื่อเพิ่มความสดชื่น",
    singing: "เกมร้องเพลง",
    singingDesc:
      "ร้องเพลงเพื่อความสนุกและผ่อนคลายอารมณ์",
  },

  en: {
    back: "Back to Wellness",
    title: "Wellness Chatbot",
    description:
      "Talk with an AI assistant for guidance on your mental health and well-being.",
    assistant: "AI assistant · Not a real person",
    call: "Need to talk to someone? Call 1323",
    reset: "Start over",
    hotlineTitle: "📞 Get help now (Free)",
    placeholder: "Type what you'd like to share… (Enter to send)",
    inputLabel: "Type your message",
    send: "Send",
    typing: "Typing",
    noteTitle: "Note:",
    note:
      "Jai Bao is an AI that provides general well-being support. It does not diagnose conditions or replace a doctor or psychologist. If you feel unsafe or want to hurt yourself, please tell a trusted adult or call",
    privacy:
      "This app does not save chat history. Please do not share your real name, address, or phone number, or anyone else's personal information.",
    rate:
      "You're sending messages very quickly. Please take a short break and try again. 🌿",
    error:
      "Sorry, the service is temporarily unavailable. Please try again. 🌿",
    greeting:
      "Hello! We're “Jai Bao,” an AI assistant here to listen. 🌷 How are you feeling today? Choose a topic below or type anything you'd like to share.",
    fallback:
      "I'm listening. What has been on your mind lately? You can share as much or as little as you like.",
    gameTitle: "🎮 Relaxation Games",
    gameDescription:
      "Choose a game and start your relaxation activity.",
    gameToggle: "Relaxation Games",
    hideGames: "Hide Games",
    generalActivities: "General activities",
    genAlphaGames: "Gen Alpha games",
    activityIntro: "Here are activities selected based on your stress level.",
    gamesIntro: "Here are some games for you to choose from.",
    play: "Play",
    comingSoon: "Coming soon",
    meditation: "3-Minute Meditation",
    meditationDesc:
      "Close your eyes, meditate, and relax with Dream Runner.",
    exercise: "Exercise Game",
    exerciseDesc:
      "Move your body and enjoy a refreshing activity.",
    singing: "Singing Game",
    singingDesc:
      "Sing along for fun and emotional relaxation.",
  },
};

const GREETING_TH = TEXT.th.greeting;
const GREETING_EN = TEXT.en.greeting;

function getAssessmentGreeting(assessment, lang) {
  const band = getStressRecommendations(assessment.score);
  const level =
    band?.level[lang] || (lang === "en" ? "stress" : "ความเครียด");

  return lang === "en"
    ? `Today, your assessment suggests ${level}, based on your score of ${assessment.score}/15. I can suggest some activities that may suit you. What would you like to explore?`
    : `วันนี้คุณดูเหมือนอยู่ในระดับ${level} จากคะแนนประเมิน ${assessment.score}/15 เรามาเลือกกิจกรรมที่เหมาะกับคุณกันนะ อยากเริ่มจากหัวข้อไหน?`;
}

// --------------------
// Hotline ภาษาอังกฤษ
// --------------------

const EN_HOTLINES = {
  "1323": {
    name: "Mental Health Hotline",
    note: "24 hours · Free",
  },
  "1387": {
    name: "Childline Thailand",
    note: "For children and young people",
  },
  "1300": {
    name: "Social Assistance Center",
    note: "Help with abuse or violence",
  },
  "1669": {
    name: "Emergency Medical Services",
    note: "Medical emergency",
  },
};

// --------------------
// ตรวจว่าผู้ใช้ต้องการเล่นเกมหรือไม่
// --------------------

function isGameRequest(message) {
  const value = String(message || "").toLowerCase();

  const negative =
    /ไม่อยากเล่นเกม|ไม่ต้องการเล่นเกม|ไม่เล่นเกม|ไม่เอาเกม|ไม่เอาเล่นเกม|don't want to play|do not want to play/i;

  if (negative.test(value)) {
    return false;
  }

  return /เล่นเกม|อยากเล่นเกม|ขอเล่นเกม|เอาเกม|เลือกเกม|เกมหน่อย|เล่นเกมส์|อยากเล่นเกมส์|^เกม$|game|play a game|play games/i.test(
    value
  );
}

// --------------------
// การ์ดเกม
// --------------------


function GameCards({ lang }) {
  const t = TEXT[lang];

  return (
    <div className="wc-game-area">
      <div className="wc-game-heading">
        <strong>{t.gameTitle}</strong>
        <span>{t.gameDescription}</span>
      </div>

      <div className="wc-game-grid">
        {WELLNESS_GAMES.map((game) => (
          <div className="wc-game-card" key={game.id}>
            <div className="wc-game-icon">
              {game.icon}
            </div>

            <div className="wc-game-info">
              <strong>{game.title[lang]}</strong>
              <p>{game.description[lang]}</p>
            </div>

            <Link
              href={`/wellness/recommendations?type=games&search=${encodeURIComponent(game.title[lang])}`}
              className="wc-game-button"
            >
              {t.play} →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function StressRecommendations({ lang, score }) {
  const band = getStressRecommendations(score);
  if (!band) return null;

  const activities = band.activityIds
    .map((id) => WELLNESS_ACTIVITIES.find((activity) => activity.id === id))
    .filter(Boolean);

  return (
    <section className="wc-recommendations">
      <div className="wc-recommendations-heading">
        <div>
          <strong>
            {lang === "en"
              ? "Activities you could try"
              : "กิจกรรมที่อาจเหมาะกับคุณ"}
          </strong>
          <p>
            {lang === "en"
              ? `Based on your ST-5 result (${score}/15 · ${band.level.en})`
              : `อ้างอิงจากผล ST-5 ของคุณ (${score}/15 · ${band.level.th})`}
          </p>
        </div>
        <Link href="/wellness/recommendations">
          {lang === "en" ? "View all activities" : "ดูกิจกรรมทั้งหมด"} →
        </Link>
      </div>

      <div className="wc-recommendation-list">
        {activities.map((activity) => (
          <Link
            href={`/wellness/recommendations?type=activities&search=${encodeURIComponent(activity.title[lang])}`}
            className="wc-recommendation-item"
            key={activity.id}
          >
            <span aria-hidden="true">{activity.icon}</span>
            <span>{activity.title[lang]}</span>
            <small>
              {activity.minMinutes}–{activity.maxMinutes}{" "}
              {lang === "en" ? "min" : "นาที"}
            </small>
          </Link>
        ))}
      </div>

      {band.professionalSupport && (
        <div className="wc-support-note">
          {lang === "en" ? (
            <p>
              Your score is a screening result, not a diagnosis. If you can,
              consider talking with a trusted adult or a mental-health
              professional. In Thailand, you can call the 1323 Mental Health
              Hotline for support.
            </p>
          ) : (
            <p>
              คะแนนนี้เป็นเพียงผลคัดกรอง ไม่ใช่การวินิจฉัย หากสะดวก ลองพูดคุยกับผู้ใหญ่ที่ไว้ใจหรือผู้เชี่ยวชาญด้านสุขภาพใจได้ และในประเทศไทยสามารถโทรสายด่วนสุขภาพจิต 1323 เพื่อขอคำปรึกษาได้
            </p>
          )}
          <a href="tel:1323">
            {lang === "en" ? "Call 1323" : "โทร 1323"}
          </a>
        </div>
      )}

    </section>
  );
}


// --------------------
// Hotline Card
// --------------------

function HotlineCard({ lang }) {
  const t = TEXT[lang];

  return (
    <div
      style={{
        marginTop: "10px",
        padding: "12px",
        borderRadius: "10px",
        background: "var(--surface-muted)",
        border: "1px solid var(--accent)",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        {t.hotlineTitle}
      </p>

      <div style={{ display: "grid", gap: "6px" }}>
        {HOTLINES.map((h) => {
          const translated = EN_HOTLINES[h.number];

          return (
            <a
              key={h.number}
              href={`tel:${h.number}`}
              className="wc-hotline"
            >
              <span>
                <strong>
                  {lang === "en" && translated
                    ? translated.name
                    : h.name}
                </strong>
                <small>
                  {lang === "en" && translated
                    ? translated.note
                    : h.note}
                </small>
              </span>

              <b>{h.number}</b>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// --------------------
// Main Chatbot
// --------------------

export default function WellnessChatbotPage() {
  const [lang, setLang] = useState("th");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: GREETING_TH,
      local: true,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("chat");
  // เก็บผลประเมินความเครียด
  const [assessment, setAssessment] = useState(null);
  const [assessmentLoaded, setAssessmentLoaded] = useState(false);
  const assessmentGreetingStarted = useRef("");
  const chatStarted = useRef(false);

  const endRef = useRef(null);
  const taRef = useRef(null);

  const t = TEXT[lang];

  const started = messages.some(
    (m) => m.role === "user"
  );

  // --------------------
  // อ่านภาษาจาก Cookie
  // --------------------

  useEffect(() => {
    function readLanguage() {
      const match = document.cookie.match(
        /(?:^|;\s*)lang=([^;]*)/
      );

      const savedLang = match
        ? decodeURIComponent(match[1])
        : "th";

      const currentLang =
        savedLang === "en" ? "en" : "th";

      setLang(currentLang);

      setMessages((current) => {
        const hasUserMessage = current.some(
          (m) => m.role === "user"
        );

        if (!hasUserMessage && current.length === 1) {
          return [
            {
              role: "assistant",
              content:
                currentLang === "en"
                  ? GREETING_EN
                  : GREETING_TH,
              local: true,
            },
          ];
        }

        return current;
      });
    }

    readLanguage();
  }, []);

  // --------------------
  // อ่านผลประเมินจาก Check-in
  // --------------------

  useEffect(() => {
  try {
    const savedAssessment =
      sessionStorage.getItem("wellnessAssessment");

    if (savedAssessment) {
      const parsed = JSON.parse(savedAssessment);

      if (
        parsed &&
        typeof parsed.score === "number" &&
        Number.isInteger(parsed.score) &&
        parsed.score >= 0 &&
        parsed.score <= 15 &&
        parsed.maxScore === 15
      ) {
        setAssessment(parsed);
      }
    }
  } catch (error) {
    console.error(
      "Cannot read wellness assessment:",
      error
    );
  } finally {
    setAssessmentLoaded(true);
  }
}, []);

  // --------------------
  // ให้ AI เริ่มบทสนทนาจากผลประเมิน
  // --------------------

  useEffect(() => {
    if (!assessmentLoaded) return;
    if (!assessment) return;
    if (chatStarted.current) return;

    const greetingKey = `${assessment.score}:${lang}`;
    if (assessmentGreetingStarted.current === greetingKey) return;
    assessmentGreetingStarted.current = greetingKey;

    setMessages([
      {
        role: "assistant",
        content: getAssessmentGreeting(assessment, lang),
      },
    ]);
  }, [assessmentLoaded, assessment, lang]);


  // --------------------
  // เลื่อนลงข้อความล่าสุด
  // --------------------

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);
  // --------------------
  // บันทึกว่า Step 2 เสร็จแล้ว
  // เมื่อผู้ใช้ส่งข้อความและได้รับคำตอบ
  // --------------------

  function completeStep2() {
    if (!assessment) return;

    try {
      localStorage.setItem(
        "wellness_step2_completed",
        "true"
      );
    } catch (error) {
      console.error("Cannot save Step 2 status:", error);
    }
  }
  // --------------------
  // ส่งข้อความ
  // --------------------

  async function send(text, topicId) {
    const content = String(text || "").trim();

if (!content || loading || !assessmentLoaded) return;
chatStarted.current = true;

    const next = [
      ...messages.map((m) => ({
        ...m,
        suggestions: undefined,
        ...(topicId === "activities" ? { showGames: false } : {}),
      })),
      {
        role: "user",
        content,
      },
    ];

    setMessages(next);
    setInput("");
    setLoading(true);

    if (topicId) {
      setTopic(topicId);
    }

    const currentTopic = topicId || topic;

    const history = next
      .filter((m) => !m.local)
      .map(({ role, content }) => ({
        role,
        content,
      }));

    const wantsGenAlphaGames =
      /เกมเจน\s*alpha|เกมเจน|gen\s*alpha\s*games|alpha games/i.test(content);
    const wantsGame = isGameRequest(content) || wantsGenAlphaGames;
    const activityMode =
      topicId === "activities" ||
      (!topicId && topic === "activities" && !wantsGame);
    const explicitlyRequestsActivity =
      /กิจกรรมทั่วไป|general activities|แนะนำกิจกรรม|อยาก.*(กิจกรรม|ผ่อนคลาย|หายใจ|สมาธิ|เดิน|เพลง|วาด|ระบาย)|อยากลอง|ขอ.*คำแนะนำ|recommend.*(activity|game)|want to (try|do|relax)|looking for an activity|need (an activity|a way to relax)/i.test(content);
    const declinesActivity =
      /ไม่อยาก.*(กิจกรรม|ทำอะไร|เล่นเกม)|ไม่ต้องการ.*(กิจกรรม|ทำอะไร|เล่นเกม)|ขอคุยเฉยๆ|แค่อยากคุย|ยังไม่พร้อม|don't want (an activity|to do|to play)|just want to talk|not ready/i.test(content);
    const alreadyRecommended = messages.some(
      (message) => message.showRecommendations
    );
    const recommendationsReady =
      Boolean(assessment) &&
      !wantsGenAlphaGames &&
      explicitlyRequestsActivity;
    const safeToRecommend = !["crisis", "safety"].includes(
      assessRisk(content)
    );
    const showRecommendations =
      recommendationsReady &&
      safeToRecommend &&
      (!alreadyRecommended || explicitlyRequestsActivity) &&
      !declinesActivity;

    try {
      const res = await fetch("/api/wellness/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: currentTopic,
          messages: history,
          lang: lang,
          assessment: assessment,
          recommendationsReady: recommendationsReady,
          recommendationType: wantsGenAlphaGames
            ? "games"
            : recommendationsReady
              ? "activities"
              : "chat",
          assessmentGreeting: false,
        }),
      });

      if (res.status === 429) {
        throw new Error("rate");
      }

      if (!res.ok) {
        throw new Error("fail");
      }

      const data = await res.json();

      const risk = data.risk || "none";

      const safeToShowGames =
        risk !== "crisis" && risk !== "safety";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: wantsGenAlphaGames && safeToShowGames
            ? t.gamesIntro
            : recommendationsReady
              ? t.activityIntro
              : data.reply || t.fallback,
          suggestions: data.suggestions || [],
          risk,
          showRecommendations:
            showRecommendations && safeToShowGames,
          showGames:
            wantsGame &&
            safeToShowGames &&
            !showRecommendations &&
            !activityMode,
        },
      ]);

      // ผู้ใช้ได้รับคำตอบจาก AI แล้ว ถือว่าทำ Step 2 สำเร็จ
      completeStep2();
    } catch (error) {
      if (error.message === "rate") {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: t.rate,
          },
        ]);
      } else {
        console.error("Wellness chatbot error:", error);

        const result =
          lang === "en"
            ? getEnglishFallbackReply({
                messages: history,
                topic: currentTopic,
                assessment,
                recommendationsReady: recommendationsReady && safeToRecommend,
                risk: assessRisk(content),
              })
            : localReply(history, currentTopic);
        const risk = result.risk || "none";
        const safeToShowActivities =
          risk !== "crisis" && risk !== "safety";

        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: wantsGenAlphaGames && safeToShowActivities
              ? t.gamesIntro
              : recommendationsReady
                ? t.activityIntro
                : result.reply || t.fallback,
            suggestions: result.suggestions || [],
            risk,
            showGames:
              wantsGame &&
              safeToShowActivities &&
              !showRecommendations &&
              !activityMode,
            showRecommendations:
              showRecommendations && safeToShowActivities,
          },
        ]);
        completeStep2();
      }
    } finally {
      setLoading(false);
      taRef.current?.focus();
    }
  }

  // --------------------
  // เริ่มบทสนทนาใหม่
  // --------------------

  function reset() {
    chatStarted.current = false;
    setMessages([
      {
        role: "assistant",
        content:
          assessment
            ? getAssessmentGreeting(assessment, lang)
            : lang === "en"
              ? GREETING_EN
              : GREETING_TH,
      },
    ]);

    setTopic("chat");
    setInput("");
  }

  // --------------------
  // Enter เพื่อส่งข้อความ
  // --------------------

  function onKeyDown(e) {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing
    ) {
      e.preventDefault();
      send(input);
    }
  }

  const lastIdx = messages.length - 1;

  return (
    <>
      <style>{`
        .wc-wrap{
          display:flex;
          flex-direction:column;
          height:min(72vh,680px);
          min-height:460px;
          padding:0;
          overflow:hidden
        }

        .wc-bar{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          padding:12px 16px;
          border-bottom:1px solid var(--surface-muted)
        }

        .wc-list{
          flex:1;
          overflow-y:auto;
          padding:16px;
          display:flex;
          flex-direction:column;
          gap:12px
        }

        .wc-row{
          display:flex;
          gap:8px;
          max-width:100%
        }

        .wc-row.user{
          justify-content:flex-end
        }

        .wc-ava{
          flex:none;
          width:32px;
          height:32px;
          border-radius:50%;
          background:var(--surface-muted);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:17px
        }

        .wc-bub{
          max-width:min(82%,560px);
          padding:10px 14px;
          border-radius:14px;
          font-size:14px;
          line-height:1.75;
          white-space:pre-wrap;
          word-break:break-word
        }

        .wc-bub.bot{
          background:var(--surface-muted);
          border-top-left-radius:4px
        }

        .wc-bub.user{
          background:var(--accent);
          color:#fff;
          border-top-right-radius:4px
        }

        .wc-chips{
          display:flex;
          flex-wrap:wrap;
          gap:8px
        }

        .wc-chip{
          border:1px solid var(--accent);
          background:transparent;
          color:var(--accent);
          border-radius:999px;
          padding:7px 13px;
          font-size:13px;
          cursor:pointer;
          font-family:inherit
        }

        .wc-chip:hover:not(:disabled){
          background:var(--accent);
          color:#fff
        }

        .wc-chip:disabled{
          opacity:.5;
          cursor:default
        }

        /* ปุ่มเกมในกลุ่มหัวข้อ */

        .wc-game-chip{
          background:transparent;
          color:var(--accent);
          font-weight:400;
          border:1px solid var(--accent);
        }

        .wc-game-chip:hover:not(:disabled){
          background:var(--accent);
          color:#fff;
        }

        .wc-input{
          display:flex;
          flex-direction:column;
          gap:9px;
          padding:12px 16px;
          border-top:1px solid var(--surface-muted)
        }

        .wc-input-row{
          display:flex;
          gap:8px;
          align-items:flex-end;
          width:100%
        }

        .wc-input textarea{
          flex:1;
          min-width:0;
          resize:none;
          border:1px solid var(--surface-muted);
          border-radius:12px;
          padding:10px 12px;
          font:inherit;
          font-size:14px;
          line-height:1.5;
          max-height:120px;
          background:transparent;
          color:inherit
        }

        .wc-input textarea:focus{
          outline:2px solid var(--accent);
          outline-offset:0
        }

        .wc-send{
          border:0;
          background:var(--accent);
          color:#fff;
          border-radius:10px;
          padding:11px 18px;
          font-weight:600;
          font-size:13px;
          cursor:pointer;
          font-family:inherit
        }

        .wc-send:disabled{
          opacity:.45;
          cursor:default
        }

        .wc-hotline{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
          padding:8px 10px;
          border-radius:8px;
          background:rgba(255,255,255,.6);
          color:inherit;
          text-decoration:none;
          font-size:13px
        }

        .wc-hotline small{
          display:block;
          opacity:.7;
          font-size:11px
        }

        .wc-hotline b{
          font-size:18px;
          color:var(--accent)
        }

        .wc-dots{
          display:inline-flex;
          gap:4px;
          padding:4px 0
        }

        .wc-dots i{
          width:7px;
          height:7px;
          border-radius:50%;
          background:var(--accent);
          opacity:.4;
          animation:wcb 1s infinite
        }

        .wc-dots i:nth-child(2){
          animation-delay:.15s
        }

        .wc-dots i:nth-child(3){
          animation-delay:.3s
        }

        @keyframes wcb{
          0%,80%,100%{
            transform:translateY(0);
            opacity:.35
          }
          40%{
            transform:translateY(-4px);
            opacity:1
          }
        }

        /* Game Cards */

        .wc-game-area{
          margin:12px 0 0 40px;
          max-width:560px;
          width:calc(100% - 40px);
          border:1px solid var(--surface-muted);
          border-radius:16px;
          padding:14px;
          background:var(--surface);
        }

        .wc-game-heading{
          display:flex;
          flex-direction:column;
          gap:4px;
          margin-bottom:12px;
        }

        .wc-game-heading strong{
          font-size:14px;
        }

        .wc-game-heading span{
          font-size:12px;
          opacity:.7;
        }

        .wc-game-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:10px;
        }

        .wc-game-card{
          display:flex;
          align-items:center;
          gap:12px;
          padding:12px;
          border:1px solid var(--surface-muted);
          border-radius:12px;
          background:var(--surface-muted);
          min-width:0;
        }

        .wc-game-icon{
          width:48px;
          height:48px;
          flex:none;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:27px;
          border-radius:12px;
          background:var(--surface);
        }

        .wc-game-info{
          flex:1;
          min-width:0;
        }

        .wc-game-info strong{
          display:block;
          font-size:13px;
          margin-bottom:3px;
        }

        .wc-game-info p{
          margin:0;
          font-size:11px;
          line-height:1.5;
          opacity:.7;
        }

        .wc-game-button{
          flex:none;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding:8px 12px;
          border:0;
          border-radius:9px;
          background:var(--accent);
          color:#fff;
          font-size:12px;
          font-weight:700;
          text-decoration:none;
          cursor:pointer;
          font-family:inherit;
        }

        .wc-game-button:hover{
          opacity:.85;
        }

        .wc-recommendations{
          margin:12px 0 0 40px;
          width:calc(100% - 40px);
          border:1px solid var(--border);
          border-radius:16px;
          padding:14px;
          background:var(--surface);
        }

        .wc-recommendations-heading{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
          margin-bottom:12px;
        }

        .wc-recommendations-heading strong{
          font-size:14px;
        }

        .wc-recommendations-heading p{
          margin:3px 0 0;
          font-size:12px;
          color:var(--text-secondary);
        }

        .wc-recommendations-heading a{
          flex:none;
          font-size:12px;
          font-weight:700;
        }

        .wc-recommendation-list{
          display:grid;
          gap:8px;
        }

        .wc-recommendation-item{
          display:flex;
          align-items:center;
          gap:10px;
          padding:10px 12px;
          border:1px solid var(--border);
          border-radius:10px;
          color:var(--text-primary);
          background:var(--surface-muted);
        }

        .wc-recommendation-item span:first-child{
          font-size:20px;
        }

        .wc-recommendation-item span:nth-child(2){
          flex:1;
          font-size:13px;
          font-weight:600;
        }

        .wc-recommendation-item small{
          color:var(--text-secondary);
          white-space:nowrap;
        }

        .wc-support-note{
          margin-top:12px;
          padding:12px;
          border:1px solid var(--accent);
          border-radius:10px;
          background:var(--surface-muted);
          font-size:12px;
        }

        .wc-support-note p{
          margin:0 0 8px;
          line-height:1.7;
        }

        .wc-support-note a{
          font-weight:700;
          text-decoration:underline;
        }

        .wc-game-button.disabled{
          background:var(--surface);
          color:var(--muted);
          border:1px solid var(--surface-muted);
          cursor:not-allowed;
        }

        @media(max-width:480px){
          .wc-game-area{
            margin-left:0;
            width:100%;
          }

          .wc-game-card{
            gap:8px;
            padding:9px;
          }

          .wc-recommendations{
            margin-left:0;
            width:100%;
            padding:10px;
          }

          .wc-recommendations-heading{
            flex-direction:column;
          }

          .wc-recommendation-item{
            gap:7px;
            padding:9px;
          }

          .wc-recommendation-item span:nth-child(2){
            font-size:12px;
          }

          .wc-game-icon{
            width:40px;
            height:40px;
            font-size:23px;
          }

          .wc-game-button{
            padding:7px 9px;
            font-size:11px;
          }
        }

        @media(prefers-reduced-motion:reduce){
          .wc-dots i{
            animation:none
          }
        }
      `}</style>

      <div className="topline">
        <div>
          <Link
            href="/wellness"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px 20px",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: "12px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 700,
              marginBottom: "16px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
              transition: "0.2s",
            }}
          >
            <span style={{ fontSize: "18px" }}>←</span>
            {t.back}
          </Link>

          <h1>{t.title}</h1>
          <p className="muted">{t.description}</p>
        </div>
      </div>

      <section
        className="panel wc-wrap"
        aria-label={
          lang === "en"
            ? "Chat with Jai Bao"
            : "แชทกับผู้ช่วยใจเบา"
        }
      >
        <div className="wc-bar">
          <span style={{ fontSize: "13px" }}>
            🤖 <strong>ใจเบา</strong>{" "}
            <span className="muted">
              · {t.assistant}
            </span>
          </span>

          <span
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <a
              href="tel:1323"
              style={{
                fontSize: "12px",
                color: "var(--accent)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {t.call}
            </a>

            {started && (
              <button
                type="button"
                onClick={reset}
                className="wc-chip"
                style={{
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              >
                {t.reset}
              </button>
            )}
          </span>
        </div>

        <div className="wc-list" role="log" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i}>
              <div
                className={`wc-row ${
                  m.role === "user" ? "user" : ""
                }`}
              >
                {m.role === "assistant" && (
                  <div className="wc-ava">🌿</div>
                )}

                <div
                  className={`wc-bub ${
                    m.role === "user" ? "user" : "bot"
                  }`}
                >
                  {m.content}

                  {(m.risk === "crisis" ||
                    m.risk === "safety") && (
                    <HotlineCard lang={lang} />
                  )}
                </div>
              </div>

              {/* หัวข้อเริ่มต้นและปุ่มเกม */}
              {i === 0 && !started && (
                <div
                  className="wc-chips"
                  style={{ margin: "12px 0 0 40px" }}
                  aria-label={lang === "en" ? "Choose a recommendation type" : "เลือกประเภทคำแนะนำ"}
                >
                  <button
                    type="button"
                    className="wc-chip"
                    disabled={loading}
                    onClick={() =>
                      send(
                        lang === "en"
                          ? "I want general activities"
                          : "อยากดูกิจกรรมทั่วไป",
                        "activities"
                      )
                    }
                  >
                    🌿 {t.generalActivities}
                  </button>
                  <button
                    type="button"
                    className="wc-chip wc-game-chip"
                    disabled={loading}
                    onClick={() =>
                      send(
                        lang === "en"
                          ? "I want to see Gen Alpha games"
                          : "อยากดูเกมเจน Alpha",
                        "games"
                      )
                    }
                  >
                    🎮 {t.genAlphaGames}
                  </button>
                </div>
              )}

              {/* การ์ดเกมจากการร้องขอของผู้ใช้ */}
              {m.showGames && (
                <GameCards lang={lang} />
              )}

              {m.showRecommendations && assessment && (
                <StressRecommendations
                  lang={lang}
                  score={assessment.score}
                />
              )}

              {/* คำแนะนำจาก AI */}
              {i === lastIdx &&
                m.suggestions?.length > 0 &&
                !m.showRecommendations &&
                !m.showGames &&
                !loading && (
                  <div
                    className="wc-chips"
                    style={{ margin: "10px 0 0 40px" }}
                  >
                    {m.suggestions.map((s, index) => (
                      <button
                        key={`${s}-${index}`}
                        type="button"
                        className="wc-chip"
                        onClick={() => send(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}

          {loading && (
            <div className="wc-row">
              <div className="wc-ava">🌿</div>
              <div
                className="wc-bub bot"
                aria-label={t.typing}
              >
                <span className="wc-dots">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="wc-input">
          <div className="wc-input-row">
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              maxLength={600}
              placeholder={t.placeholder}
              aria-label={t.inputLabel}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={onKeyDown}
            />

            <button
              type="button"
              className="wc-send"
              disabled={loading || !assessmentLoaded || !input.trim()}
              onClick={() => send(input)}
            >
              {t.send}
            </button>
          </div>
        </div>
      </section>

      <div
        className="notice"
        style={{
          marginTop: "16px",
          marginBottom: "16px",
        }}
      >
        <strong>{t.noteTitle}</strong> {t.note}{" "}
        <strong>1323</strong> (
        {lang === "en" ? "Mental Health" : "สุขภาพจิต"}) /{" "}
        <strong>1387</strong> (
        {lang === "en" ? "Childline" : "เด็กและเยาวชน"}) /{" "}
        <strong>1669</strong> (
        {lang === "en" ? "Emergency" : "ฉุกเฉิน"})
        <br />
        {t.privacy}
      </div>
    </>
  );
}
