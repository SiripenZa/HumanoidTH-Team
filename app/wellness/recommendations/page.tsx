"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Language } from "@/lib/translations";
import {
  WELLNESS_ACTIVITIES,
  WELLNESS_GAMES,
} from "@/lib/wellnessRecommendations";

const activityInstructions = [
  {
    id: "breathing",
    icon: "🌬️",
    title: { th: "ฝึกหายใจ", en: "Breathing exercise" },
    minMinutes: 3,
    maxMinutes: 5,
    focus: { th: "ความตื่นตัวและความกังวล", en: "Alertness and anxiety" },
    instructions: {
      th: "นั่งในท่าที่สบาย หายใจเข้าช้า ๆ และผ่อนลมหายใจออกให้นานขึ้นเล็กน้อย ทำอย่างเป็นธรรมชาติ ไม่ต้องฝืน หากรู้สึกเวียนหัวให้หยุดและกลับมาหายใจตามปกติ",
      en: "Sit comfortably. Breathe in slowly, then let your exhale last a little longer. Keep it natural and do not force your breath. Stop and breathe normally if you feel dizzy.",
    },
  },
  {
    id: "muscle-relaxation",
    icon: "🫶",
    title: { th: "ผ่อนคลายกล้ามเนื้อ", en: "Muscle relaxation" },
    minMinutes: 5,
    maxMinutes: 10,
    focus: { th: "ความตึงเครียดทางร่างกาย", en: "Physical tension" },
    instructions: {
      th: "ค่อย ๆ เกร็งกล้ามเนื้อบริเวณมือหรือไหล่เบา ๆ สักครู่ แล้วคลายออก สังเกตความรู้สึกที่ต่างกัน ทำทีละส่วนและไม่เกร็งจนเจ็บ",
      en: "Gently tense your hands or shoulders for a moment, then release. Notice the difference and move through one area at a time. Never tense to the point of pain.",
    },
  },
  {
    id: "meditation",
    icon: "🧘",
    title: { th: "ทำสมาธิ", en: "Meditation" },
    minMinutes: 5,
    maxMinutes: 10,
    focus: { th: "การรับรู้อารมณ์", en: "Emotional awareness" },
    instructions: {
      th: "เลือกนั่งหรือนอนในท่าที่สบาย ลองสังเกตลมหายใจและความรู้สึกที่เกิดขึ้น หากใจเผลอคิดเรื่องอื่น ให้รับรู้แล้วค่อยกลับมาสังเกตลมหายใจ",
      en: "Sit or lie down comfortably. Notice your breath and what you are feeling. When your mind wanders, acknowledge it and gently return to your breath.",
    },
  },
  {
    id: "stretching",
    icon: "🙆",
    title: { th: "ยืดเหยียด", en: "Stretching" },
    minMinutes: 5,
    maxMinutes: 10,
    focus: { th: "ความตึงของร่างกาย", en: "Body stiffness" },
    instructions: {
      th: "ขยับและยืดเหยียดอย่างช้า ๆ ในช่วงการเคลื่อนไหวที่สบาย ไม่เด้งหรือฝืน หากมีอาการเจ็บหรือมีข้อจำกัดทางร่างกาย ให้หยุดหรือเลือกท่าอื่น",
      en: "Move and stretch slowly within a comfortable range. Do not bounce or force a stretch. Stop or choose another movement if you feel pain or have physical limitations.",
    },
  },
  {
    id: "journaling",
    icon: "📝",
    title: { th: "เขียนระบายความรู้สึก", en: "Write your feelings" },
    minMinutes: 5,
    maxMinutes: 15,
    focus: { th: "การจัดระเบียบความคิด", en: "Organizing your thoughts" },
    instructions: {
      th: "เขียนสิ่งที่กำลังคิดหรือรู้สึกออกมาโดยไม่ต้องกังวลเรื่องความสวยงามหรือถูกผิด จะเขียนถึงสิ่งที่เกิดขึ้น สิ่งที่กังวล หรือสิ่งที่อยากทำต่อก็ได้",
      en: "Write down what you are thinking or feeling without worrying about spelling or getting it right. You can describe what happened, what concerns you, or what you might do next.",
    },
  },
  {
    id: "drawing",
    icon: "🎨",
    title: { th: "วาดภาพและระบายสี", en: "Draw and color" },
    minMinutes: 10,
    maxMinutes: 15,
    focus: { th: "การแสดงออกทางอารมณ์", en: "Emotional expression" },
    instructions: {
      th: "หยิบกระดาษหรืออุปกรณ์วาดภาพ แล้วลองวาดหรือเลือกสีที่เข้ากับความรู้สึกตอนนี้ ไม่จำเป็นต้องวาดให้เหมือนจริงหรือสวยงาม",
      en: "Take some paper or a drawing tool and sketch or choose colors that match how you feel. There is no need to make it realistic or polished.",
    },
  },
  {
    id: "music",
    icon: "🎵",
    title: { th: "ฟังเพลง", en: "Listen to music" },
    minMinutes: 5,
    maxMinutes: 15,
    focus: { th: "การปรับอารมณ์", en: "Mood regulation" },
    instructions: {
      th: "เลือกเพลงที่คุณรู้สึกสบายใจ แล้วลองตั้งใจฟังเสียงดนตรี จังหวะ หรือเนื้อเพลงในมุมที่ชอบ",
      en: "Choose music that feels comfortable to you. Spend a few minutes noticing the sounds, rhythm, or lyrics you enjoy.",
    },
  },
  {
    id: "walking",
    icon: "🚶",
    title: { th: "เดินเล่น", en: "Take a walk" },
    minMinutes: 10,
    maxMinutes: 20,
    focus: { th: "การพักจากสิ่งแวดล้อมเดิม", en: "A change of environment" },
    instructions: {
      th: "เลือกเส้นทางที่ปลอดภัยและเดินในจังหวะสบาย ๆ ลองสังเกตสิ่งรอบตัว หากออกไปข้างนอกไม่สะดวก อาจเดินเบา ๆ ในพื้นที่ปลอดภัยใกล้ตัว",
      en: "Choose a safe route and walk at a comfortable pace, noticing what is around you. If going outside is not convenient, take a gentle walk in a safe nearby space.",
    },
  },
  {
    id: "dancing",
    icon: "💃",
    title: { th: "เต้นตามเพลง", en: "Dance to music" },
    minMinutes: 5,
    maxMinutes: 15,
    focus: { th: "การเคลื่อนไหวและอารมณ์", en: "Movement and mood" },
    instructions: {
      th: "เปิดเพลงที่ชอบแล้วขยับร่างกายตามจังหวะในแบบที่สบาย จัดพื้นที่ให้ปลอดภัยและเลือกท่าที่เหมาะกับร่างกายของคุณ",
      en: "Play a song you like and move in a way that feels comfortable. Make sure you have a safe space and choose movements that work for your body.",
    },
  },
  {
    id: "pets",
    icon: "🐾",
    title: { th: "เล่นกับสัตว์เลี้ยง", en: "Spend time with a pet" },
    minMinutes: 5,
    maxMinutes: 15,
    focus: { th: "ความผูกพันและความรู้สึกโดดเดี่ยว", en: "Connection and loneliness" },
    instructions: {
      th: "ใช้เวลากับสัตว์เลี้ยงอย่างอ่อนโยน เช่น เล่นหรือนั่งอยู่ด้วยกัน โดยคำนึงถึงความสบายใจและความปลอดภัยของทั้งคุณและสัตว์เลี้ยง",
      en: "Spend gentle time with a pet, such as playing or sitting together, while keeping both you and the animal comfortable and safe.",
    },
  },
  {
    id: "gratitude",
    icon: "🌱",
    title: { th: "เขียนบันทึกความสุข", en: "Write a gratitude note" },
    minMinutes: 3,
    maxMinutes: 5,
    focus: { th: "การมองเห็นประสบการณ์เชิงบวก", en: "Noticing positive experiences" },
    instructions: {
      th: "จดสิ่งเล็ก ๆ หนึ่งถึงสามอย่างที่ทำให้รู้สึกดีหรือรู้สึกขอบคุณในวันนี้ ไม่จำเป็นต้องเป็นเรื่องใหญ่",
      en: "Write down one to three small things that felt good or that you appreciated today. They do not have to be big things.",
    },
  },
  {
    id: "trusted-person",
    icon: "💬",
    title: { th: "พูดคุยกับคนที่ไว้ใจ", en: "Talk with someone you trust" },
    minMinutes: 5,
    maxMinutes: 15,
    focus: { th: "การได้รับแรงสนับสนุน", en: "Receiving support" },
    instructions: {
      th: "ลองส่งข้อความหรือพูดคุยกับคนที่คุณไว้ใจ เล่าเท่าที่รู้สึกสบายใจ และบอกได้ว่าตอนนี้อยากให้เขารับฟังหรือช่วยคิด",
      en: "Reach out to someone you trust and share only what feels comfortable. You can let them know whether you would like them to listen or help you think things through.",
    },
  },
  {
    id: "small-tasks",
    icon: "🧩",
    title: { th: "แบ่งงานเป็นชิ้นเล็ก ๆ", en: "Break a task into small steps" },
    minMinutes: 5,
    maxMinutes: 10,
    focus: { th: "ความเครียดจากภาระงาน", en: "Stress from workload" },
    instructions: {
      th: "เขียนงานที่ค้างอยู่ แล้วเลือกหนึ่งงานมาแบ่งเป็นขั้นตอนเล็ก ๆ ระบุสิ่งที่ทำได้ในตอนนี้เพียงหนึ่งข้อ โดยไม่จำเป็นต้องทำทุกอย่างให้เสร็จทันที",
      en: "List what is on your mind, choose one task, and break it into smaller steps. Identify just one step you could take now; you do not have to finish everything at once.",
    },
  },
  {
    id: "grounding",
    instructions: {
      th: "ลองสังเกตสิ่งรอบตัวอย่างช้า ๆ เช่น สิ่งที่มองเห็น 5 อย่าง สัมผัสได้ 4 อย่าง ได้ยิน 3 อย่าง ได้กลิ่น 2 อย่าง และรับรส 1 อย่าง หากข้อไหนไม่สะดวกให้ข้ามได้",
      en: "Slowly notice things around you: 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell, and 1 you can taste. Skip any step that does not feel comfortable.",
    },
  },
];

const activityInstructionsById = new Map(
  activityInstructions.map((activity) => [activity.id, activity.instructions])
);

const activities = WELLNESS_ACTIVITIES.map((activity) => {
  const instructions = activityInstructionsById.get(activity.id);
  if (!instructions) {
    throw new Error(`Missing instructions for wellness activity: ${activity.id}`);
  }

  return { ...activity, instructions };
});

type Activity = (typeof activities)[number];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("en");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(3);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const isThai = language === "th";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("search") || "";
    const type = params.get("type");

    setSearchInput(query);
    setSearchQuery(query);
    setSearchType(type === "games" || type === "activities" ? type : "all");
  }, []);

  useEffect(() => {
    const updateLanguage = () => {
      const match = document.cookie.match(/(?:^|;\s*)lang=(en|th)/);
      setLanguage((match?.[1] || "en") as Language);
    };

    updateLanguage();
    window.addEventListener("focus", updateLanguage);
    window.addEventListener("pageshow", updateLanguage);

    return () => {
      window.removeEventListener("focus", updateLanguage);
      window.removeEventListener("pageshow", updateLanguage);
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    if (remainingSeconds === 0) {
      setIsRunning(false);
      setIsComplete(true);
      return;
    }

    const timer = window.setTimeout(
      () => setRemainingSeconds((seconds) => Math.max(0, seconds - 1)),
      1000
    );

    return () => window.clearTimeout(timer);
  }, [isRunning, remainingSeconds]);

  useEffect(() => {
    if (!activeActivity) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveActivity(null);
        setIsRunning(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeActivity]);

  const openActivity = (activity: Activity) => {
    setActiveActivity(activity);
    setDurationMinutes(activity.minMinutes);
    setRemainingSeconds(0);
    setIsRunning(false);
    setIsComplete(false);
  };

  const startOrResumeActivity = () => {
    if (isComplete) {
      setRemainingSeconds(durationMinutes * 60);
      setIsComplete(false);
    } else if (remainingSeconds === 0) {
      setRemainingSeconds(durationMinutes * 60);
    }

    setIsRunning(true);
  };

  const closeActivity = () => {
    setActiveActivity(null);
    setIsRunning(false);
    setIsComplete(false);
    setRemainingSeconds(0);
  };

  const filteredActivities = activities.filter((activity) =>
    [activity.title[language], activity.focus[language]]
      .join(" ")
      .toLocaleLowerCase()
      .includes(searchQuery.trim().toLocaleLowerCase())
  );
  const filteredGames = WELLNESS_GAMES.filter((game) =>
    [game.title[language], game.description[language]]
      .join(" ")
      .toLocaleLowerCase()
      .includes(searchQuery.trim().toLocaleLowerCase())
  );

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchInput.trim();
    setSearchQuery(query);

    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (searchType !== "all") params.set("type", searchType);

    const queryString = params.toString();
    router.replace(
      queryString ? `/wellness/recommendations?${queryString}` : "/wellness/recommendations",
      { scroll: false }
    );
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ marginBottom: "18px" }}>
        <Link
          href="/wellness"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            border: "1px solid var(--accent)",
            borderRadius: "8px",
            color: "var(--accent)",
            background: "var(--surface)",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {isThai ? "← กลับหน้า Wellness" : "← Back to Wellness"}
        </Link>
      </div>

      <header className="topline">
        <div>
          <p className="muted" style={{ fontSize: "12px", marginBottom: "6px" }}>
            WELLNESS CENTER / STEP 03
          </p>
          <h1>{isThai ? "กิจกรรมแนะนำเพิ่มเติม" : "More Activities to Explore"}</h1>
          <p className="muted" style={{ marginTop: "6px" }}>
            {isThai
              ? "เลือกกิจกรรมที่เหมาะกับเวลาและความรู้สึกของคุณในวันนี้"
              : "Choose an activity that feels right for you today."}
          </p>
        </div>
      </header>

      <section
        className="panel"
        style={{ marginBottom: "18px", borderLeft: "4px solid var(--accent)" }}
      >
        <h2>{isThai ? "ลองดูแลตัวเองในแบบที่ชอบ" : "Take a moment for yourself"}</h2>
        <p className="muted" style={{ margin: 0, lineHeight: 1.8 }}>
          {isThai
            ? "เลือกเริ่มจากกิจกรรมเล็ก ๆ ที่รู้สึกสบายใจ ปรับเวลาได้ตามความเหมาะสม และหยุดพักได้ทุกเมื่อ"
            : "Start with a small activity that feels comfortable. Choose a duration that works for you, and pause or stop whenever you need."}
        </p>
      </section>

      <form
        onSubmit={submitSearch}
        className="panel"
        role="search"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "end",
          marginBottom: "18px",
        }}
      >
        <label style={{ flex: "1 1 260px" }}>
          <span style={{ display: "block", fontWeight: 600, marginBottom: "5px" }}>
            {isThai ? "ค้นหากิจกรรมหรือเกม" : "Search activities or games"}
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={isThai ? "พิมพ์ชื่อกิจกรรมหรือเกม" : "Enter an activity or game"}
            style={{
              width: "100%",
              minHeight: "42px",
              padding: "9px 12px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              background: "var(--surface)",
              color: "var(--text-primary)",
            }}
          />
        </label>
        <label>
          <span style={{ display: "block", fontWeight: 600, marginBottom: "5px" }}>
            {isThai ? "ประเภท" : "Type"}
          </span>
          <select
            value={searchType}
            onChange={(event) => setSearchType(event.target.value)}
            style={{
              minHeight: "42px",
              padding: "8px 12px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              background: "var(--surface)",
              color: "var(--text-primary)",
            }}
          >
            <option value="all">{isThai ? "ทั้งหมด" : "All"}</option>
            <option value="activities">{isThai ? "กิจกรรม" : "Activities"}</option>
            <option value="games">{isThai ? "เกม" : "Games"}</option>
          </select>
        </label>
        <button
          type="submit"
          style={{
            minHeight: "42px",
            padding: "9px 18px",
            border: 0,
            borderRadius: "8px",
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {isThai ? "ค้นหา" : "Search"}
        </button>
      </form>

      {searchType !== "games" && (
      <div
        className="panel"
        style={{ overflowX: "auto", padding: 0 }}
      >
        <table
          style={{
            width: "100%",
            minWidth: "680px",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr style={{ background: "var(--surface-muted)" }}>
              {[
                isThai ? "กิจกรรม" : "Activity",
                isThai ? "เวลาที่ใช้" : "Duration",
                isThai ? "สิ่งที่มุ่งช่วย" : "Focus",
                isThai ? "เริ่มกิจกรรม" : "Action",
              ].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  style={{
                    padding: "13px 16px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    fontWeight: 700,
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredActivities.map((activity, index) => (
              <tr
                key={activity.id}
                id={`activity-${activity.id}`}
                style={{
                  borderTop: "1px solid var(--border)",
                  background: index % 2 === 0 ? "var(--surface)" : "transparent",
                }}
              >
                <th
                  scope="row"
                  style={{ padding: "13px 16px", fontWeight: 600 }}
                >
                  <span aria-hidden="true" style={{ marginRight: "9px" }}>
                    {activity.icon}
                  </span>
                  {activity.title[language]}
                </th>
                <td
                  style={{
                    padding: "13px 16px",
                    whiteSpace: "nowrap",
                    color: "var(--text-secondary)",
                  }}
                >
                  {activity.minMinutes}–{activity.maxMinutes} {isThai ? "นาที" : "min"}
                </td>
                <td
                  style={{
                    padding: "13px 16px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {activity.focus[language]}
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  <button
                    type="button"
                    onClick={() => openActivity(activity)}
                    style={{
                      padding: "8px 12px",
                      border: 0,
                      borderRadius: "8px",
                      background: "var(--accent)",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isThai ? "เริ่มทำกิจกรรม" : "Start activity"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredActivities.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="muted"
                  style={{ padding: "18px", textAlign: "center" }}
                >
                  {isThai ? "ไม่พบกิจกรรมที่ค้นหา" : "No matching activities found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {searchType !== "activities" && (
      <section aria-labelledby="wellness-games-heading" style={{ marginTop: "28px" }}>
        <div className="topline">
          <div>
            <h2 id="wellness-games-heading" style={{ fontSize: "22px" }}>
              {isThai ? "เกม Wellness" : "Wellness Games"}
            </h2>
            <p className="muted" style={{ marginTop: "6px" }}>
              {isThai
                ? "เลือกเล่น 1 ใน 3 เกมเพื่อพักผ่อนและขยับร่างกาย"
                : "Choose one of these three games to relax or get moving."}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
            gap: "16px",
          }}
        >
          {filteredGames.map((game) => (
            <article
              className="panel"
              key={game.id}
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "220px",
                borderTop: "3px solid var(--accent)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: "50px",
                  height: "50px",
                  marginBottom: "14px",
                  borderRadius: "14px",
                  background: "var(--surface-muted)",
                  fontSize: "26px",
                }}
              >
                {game.icon}
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: "17px" }}>
                {game.title[language]}
              </h3>
              <p className="muted" style={{ flex: 1, lineHeight: 1.8 }}>
                {game.description[language]}
              </p>
              <Link
                href={game.href}
                style={{
                  display: "block",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "var(--accent)",
                  color: "#fff",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {game.button[language]} →
              </Link>
            </article>
          ))}
            {filteredGames.length === 0 && (
              <p className="muted" style={{ gridColumn: "1 / -1" }}>
                {isThai ? "ไม่พบเกมที่ค้นหา" : "No matching games found."}
              </p>
            )}
        </div>
      </section>
      )}

      <p className="muted" style={{ fontSize: "12px", marginTop: "18px" }}>
        {isThai
          ? "กิจกรรมเหล่านี้มีไว้เพื่อส่งเสริมการผ่อนคลาย ไม่ใช่การวินิจฉัยหรือการรักษาทางการแพทย์ เลือกทำเท่าที่สบายใจ"
          : "These activities support relaxation and are not a substitute for professional medical advice or treatment. Only do what feels comfortable."}
      </p>

      {activeActivity && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeActivity();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: "20px",
            background: "rgba(10, 25, 19, 0.62)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-dialog-title"
            className="panel"
            style={{
              width: "min(100%, 560px)",
              maxHeight: "min(90vh, 760px)",
              overflowY: "auto",
              borderTop: "4px solid var(--accent)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <p className="muted" style={{ fontSize: "12px", margin: "0 0 4px" }}>
                  {isThai ? "กิจกรรมดูแลใจ" : "WELLNESS ACTIVITY"}
                </p>
                <h2 id="activity-dialog-title" style={{ fontSize: "22px" }}>
                  <span aria-hidden="true" style={{ marginRight: "8px" }}>
                    {activeActivity.icon}
                  </span>
                  {activeActivity.title[language]}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeActivity}
                aria-label={isThai ? "ปิดกิจกรรม" : "Close activity"}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "5px 10px",
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <p className="muted" style={{ lineHeight: 1.8 }}>
              {activeActivity.instructions[language]}
            </p>

            <label
              htmlFor="activity-duration"
              style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}
            >
              {isThai ? "เลือกระยะเวลา" : "Choose a duration"}
            </label>
            <select
              id="activity-duration"
              value={durationMinutes}
              disabled={isRunning || (remainingSeconds > 0 && !isComplete)}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                background: "var(--surface)",
                color: "var(--text-primary)",
              }}
            >
              {Array.from(
                {
                  length: activeActivity.maxMinutes - activeActivity.minMinutes + 1,
                },
                (_, index) => activeActivity.minMinutes + index
              ).map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} {isThai ? "นาที" : minutes === 1 ? "minute" : "minutes"}
                </option>
              ))}
            </select>

            <div
              aria-live="polite"
              style={{
                margin: "18px 0",
                padding: "18px",
                borderRadius: "12px",
                background: "var(--surface-muted)",
                textAlign: "center",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "var(--accent)",
                  fontSize: "clamp(36px, 12vw, 52px)",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1.2,
                }}
              >
                {formatTime(remainingSeconds || durationMinutes * 60)}
              </strong>
              <span className="muted" style={{ fontSize: "13px" }}>
                {isComplete
                  ? isThai
                    ? "ทำกิจกรรมครบแล้ว ขอบคุณที่ให้เวลากับตัวเอง"
                    : "Activity complete. Thank you for taking this time for yourself."
                  : isRunning
                    ? isThai
                      ? "กำลังทำกิจกรรม"
                      : "Activity in progress"
                    : isThai
                      ? "หยุดพักได้ทุกเมื่อ ไม่จำเป็นต้องทำให้ครบเวลา"
                      : "Pause or stop whenever you need; finishing the timer is optional."}
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setIsRunning((running) => !running)}
                disabled={isComplete}
                style={{
                  flex: "1 1 180px",
                  padding: "11px 14px",
                  border: 0,
                  borderRadius: "8px",
                  background: "var(--accent)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: isComplete ? "not-allowed" : "pointer",
                  opacity: isComplete ? 0.55 : 1,
                }}
              >
                {isRunning
                  ? isThai
                    ? "หยุดชั่วคราว"
                    : "Pause"
                  : remainingSeconds > 0
                    ? isThai
                      ? "ทำต่อ"
                      : "Resume"
                    : isComplete
                      ? isThai
                        ? "เสร็จสิ้น"
                        : "Completed"
                      : isThai
                        ? "เริ่มจับเวลา"
                        : "Start timer"}
              </button>
              {isComplete && (
                <button
                  type="button"
                  onClick={startOrResumeActivity}
                  style={{
                    flex: "1 1 180px",
                    padding: "11px 14px",
                    border: "1px solid var(--accent)",
                    borderRadius: "8px",
                    background: "var(--surface)",
                    color: "var(--accent)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {isThai ? "เริ่มอีกครั้ง" : "Start again"}
                </button>
              )}
            </div>

          </section>
        </div>
      )}
    </div>
  );
}
