type Language = "th" | "en";
type LocalizedText = Record<Language, string>;

interface WellnessActivity {
  id: string;
  icon: string;
  title: LocalizedText;
  minMinutes: number;
  maxMinutes: number;
  focus: LocalizedText;
}

interface WellnessGame {
  id: string;
  icon: string;
  title: LocalizedText;
  description: LocalizedText;
  href: string;
  button: LocalizedText;
}

interface StressRecommendationBand {
  minScore: number;
  maxScore: number;
  level: LocalizedText;
  activityIds: string[];
  professionalSupport?: boolean;
}

export const WELLNESS_ACTIVITIES: WellnessActivity[] = [
  {
    id: "breathing",
    icon: "🌬️",
    title: { th: "ฝึกหายใจ", en: "Breathing exercise" },
    minMinutes: 3,
    maxMinutes: 5,
    focus: { th: "ความตื่นตัวและความกังวล", en: "Alertness and anxiety" },
  },
  {
    id: "muscle-relaxation",
    icon: "🫶",
    title: { th: "ผ่อนคลายกล้ามเนื้อ", en: "Muscle relaxation" },
    minMinutes: 5,
    maxMinutes: 10,
    focus: { th: "ความตึงเครียดทางร่างกาย", en: "Physical tension" },
  },
  {
    id: "meditation",
    icon: "🧘",
    title: { th: "ทำสมาธิ", en: "Meditation" },
    minMinutes: 5,
    maxMinutes: 10,
    focus: { th: "การรับรู้อารมณ์", en: "Emotional awareness" },
  },
  {
    id: "stretching",
    icon: "🙆",
    title: { th: "ยืดเหยียด", en: "Stretching" },
    minMinutes: 5,
    maxMinutes: 10,
    focus: { th: "ความตึงของร่างกาย", en: "Body stiffness" },
  },
  {
    id: "journaling",
    icon: "📝",
    title: { th: "เขียนระบายความรู้สึก", en: "Write your feelings" },
    minMinutes: 5,
    maxMinutes: 15,
    focus: { th: "การจัดระเบียบความคิด", en: "Organizing your thoughts" },
  },
  {
    id: "drawing",
    icon: "🎨",
    title: { th: "วาดภาพและระบายสี", en: "Draw and color" },
    minMinutes: 10,
    maxMinutes: 15,
    focus: { th: "การแสดงออกทางอารมณ์", en: "Emotional expression" },
  },
  {
    id: "music",
    icon: "🎵",
    title: { th: "ฟังเพลง", en: "Listen to music" },
    minMinutes: 5,
    maxMinutes: 15,
    focus: { th: "การปรับอารมณ์", en: "Mood regulation" },
  },
  {
    id: "walking",
    icon: "🚶",
    title: { th: "เดินเล่น", en: "Take a walk" },
    minMinutes: 10,
    maxMinutes: 20,
    focus: { th: "การพักจากสิ่งแวดล้อมเดิม", en: "A change of environment" },
  },
  {
    id: "dancing",
    icon: "💃",
    title: { th: "เต้นตามเพลง", en: "Dance to music" },
    minMinutes: 5,
    maxMinutes: 15,
    focus: { th: "การเคลื่อนไหวและอารมณ์", en: "Movement and mood" },
  },
  {
    id: "pets",
    icon: "🐾",
    title: { th: "เล่นกับสัตว์เลี้ยง", en: "Spend time with a pet" },
    minMinutes: 5,
    maxMinutes: 15,
    focus: { th: "ความผูกพันและความรู้สึกโดดเดี่ยว", en: "Connection and loneliness" },
  },
  {
    id: "gratitude",
    icon: "🌱",
    title: { th: "เขียนบันทึกความสุข", en: "Write a gratitude note" },
    minMinutes: 3,
    maxMinutes: 5,
    focus: { th: "การมองเห็นประสบการณ์เชิงบวก", en: "Noticing positive experiences" },
  },
  {
    id: "trusted-person",
    icon: "💬",
    title: { th: "พูดคุยกับคนที่ไว้ใจ", en: "Talk with someone you trust" },
    minMinutes: 5,
    maxMinutes: 15,
    focus: { th: "การได้รับแรงสนับสนุน", en: "Receiving support" },
  },
  {
    id: "small-tasks",
    icon: "🧩",
    title: { th: "แบ่งงานเป็นชิ้นเล็ก ๆ", en: "Break a task into small steps" },
    minMinutes: 5,
    maxMinutes: 10,
    focus: { th: "ความเครียดจากภาระงาน", en: "Stress from workload" },
  },
  {
    id: "grounding",
    icon: "🌿",
    title: { th: "กิจกรรม Grounding", en: "Grounding exercise" },
    minMinutes: 3,
    maxMinutes: 5,
    focus: { th: "การกลับมาอยู่กับปัจจุบัน", en: "Returning attention to the present" },
  },
];

export const WELLNESS_GAMES: WellnessGame[] = [
  {
    id: "meditation",
    icon: "🧘",
    title: { th: "เกมทำสมาธิ 3 นาที", en: "3-Minute Meditation" },
    description: {
      th: "พักใจไปกับ Dream Runner",
      en: "Take a mindful break with Dream Runner.",
    },
    href: "/games/dream_runner/index.html",
    button: { th: "เริ่มเกมฝึกสมาธิ", en: "Start mindfulness game" },
  },
  {
    id: "exercise",
    icon: "🐰",
    title: { th: "เกมขยับร่างกายกับโมจิ", en: "Move with Mochi" },
    description: {
      th: "ขยับร่างกายและทำกิจกรรมเพื่อเพิ่มความสดชื่น",
      en: "Move your body and enjoy a refreshing activity.",
    },
    href: "/games/dream_runner/Exercise/mochi_move_club_updated.html",
    button: { th: "เริ่มเกมขยับร่างกาย", en: "Start movement game" },
  },
  {
    id: "singing",
    icon: "🎤",
    title: { th: "เกมร้องเพลง", en: "Singing Game" },
    description: {
      th: "ร้องเพลงเพื่อความสนุกและผ่อนคลายอารมณ์",
      en: "Sing along for fun and emotional relaxation.",
    },
    href: "/wellness/games/karaoke",
    button: { th: "เริ่มร้องเพลง", en: "Start singing" },
  },
];

export const STRESS_RECOMMENDATION_BANDS: StressRecommendationBand[] = [
  {
    minScore: 0,
    maxScore: 4,
    level: { th: "เครียดน้อย", en: "Low stress" },
    activityIds: ["music", "walking", "gratitude", "drawing"],
  },
  {
    minScore: 5,
    maxScore: 7,
    level: { th: "เครียดปานกลาง", en: "Moderate stress" },
    activityIds: ["breathing", "stretching", "music", "journaling", "meditation"],
  },
  {
    minScore: 8,
    maxScore: 9,
    level: { th: "เครียดมาก", en: "High stress" },
    activityIds: ["breathing", "muscle-relaxation", "meditation", "trusted-person"],
  },
  {
    minScore: 10,
    maxScore: 15,
    level: { th: "เครียดมากที่สุด", en: "Very high stress" },
    activityIds: ["breathing", "grounding", "trusted-person"],
    professionalSupport: true,
  },
];

export function getStressRecommendations(score: number) {
  if (!Number.isInteger(score) || score < 0 || score > 15) return null;

  return (
    STRESS_RECOMMENDATION_BANDS.find(
      (band) => score >= band.minScore && score <= band.maxScore
    ) || null
  );
}

interface EnglishFallbackOptions {
  messages: Array<{ role: string; content: string }>;
  topic?: string;
  assessment?: { score: number } | null;
  recommendationsReady?: boolean;
  assessmentGreeting?: boolean;
  risk?: string;
}

export function getEnglishFallbackReply({
  messages,
  topic = "chat",
  assessment,
  recommendationsReady = false,
  assessmentGreeting = false,
  risk = "none",
}: EnglishFallbackOptions) {
  const users = messages.filter((message) => message.role === "user");
  const latest = users.at(-1)?.content.toLowerCase() || "";

  if (risk === "crisis") {
    return {
      reply:
        "I'm really glad you told me. Your safety matters. Are you in immediate danger right now? Please tell a trusted adult now and stay with someone you trust. If you are in immediate danger, call 1669; you can also call Thailand's Mental Health Hotline at 1323.",
      suggestions: ["I'm safe right now", "I need someone with me", "I'm in danger"],
      risk,
    };
  }

  if (risk === "safety") {
    return {
      reply:
        "I'm sorry this is happening to you. You don't deserve to be treated this way. Are you somewhere safe right now? Please tell a trusted adult you trust. In Thailand, you can also call 1300 or Childline at 1387.",
      suggestions: ["I'm somewhere safe", "I want to tell someone", "I need help"],
      risk,
    };
  }

  if (assessmentGreeting && assessment) {
    const band = getStressRecommendations(assessment.score);
    const level = band?.level.en || "stress";

    return {
      reply: `Your ST-5 screening score is ${assessment.score}/15 (${level}). This is only a screening result, not a diagnosis or a definition of who you are. How have you been feeling lately?`,
      suggestions: [
        "I've been feeling stressed",
        "I'm not sure how I feel",
        "I'd like to talk",
      ],
      risk: "none",
    };
  }

  if (recommendationsReady && assessment) {
    const band = getStressRecommendations(assessment.score);
    const activities =
      band?.activityIds
        .map((id) => WELLNESS_ACTIVITIES.find((activity) => activity.id === id))
        .filter((activity): activity is WellnessActivity => Boolean(activity))
        .map((activity) => activity.title.en) || [];
    const supportNote = band?.professionalSupport
      ? " Your score is not a diagnosis; consider talking with a trusted adult or a mental-health professional. In Thailand, you can also call 1323."
      : "";

    return {
      reply: `Based on your ST-5 screening, you could try ${activities.join(", ")}. These are optional—choose what feels manageable, or we can keep talking instead.${supportNote} Which option feels like the best fit right now?`,
      suggestions: activities.slice(0, 3),
      risk: "none",
    };
  }

  if (/\b(game|games|play)\b|เกม|เล่นเกม/.test(latest)) {
    return {
      reply:
        "Sure, you can choose a mindfulness game, a movement game, or karaoke. There’s no pressure to play—would any of those feel enjoyable right now?",
      suggestions: ["Mindfulness game", "Movement game", "Karaoke"],
      risk: "none",
    };
  }

  if (/\b(thank you|thanks|thx)\b/.test(latest)) {
    return {
      reply:
        "You’re welcome. Would you like to keep talking about what’s on your mind, or explore an activity that might feel helpful?",
      suggestions: ["Keep talking", "Explore activities", "I'm not sure"],
      risk: "none",
    };
  }

  const replies: Record<string, { reply: string; suggestions: string[] }> = {
    sleep: {
      reply:
        "Having trouble with sleep can make everything feel harder. Has something in particular been keeping you awake, or has it been difficult to settle down in general?",
      suggestions: ["My mind keeps racing", "I wake up during the night", "I'm not sure"],
    },
    school: {
      reply:
        "School can feel like a lot to manage. What part has been weighing on you most—your workload, a class, or something happening at school?",
      suggestions: ["Too much work", "A difficult class", "Something at school"],
    },
    friends: {
      reply:
        "Things with friends can bring up a lot of feelings. What happened that you feel comfortable sharing?",
      suggestions: ["We had an argument", "I feel left out", "It's hard to explain"],
    },
    lonely: {
      reply:
        "Feeling alone can be really difficult, and I'm glad you reached out. Is there someone you trust whom you might feel comfortable talking with?",
      suggestions: ["There is someone", "I'm not sure", "I'd like to talk here first"],
    },
    anxious: {
      reply:
        "It sounds like things feel unsettled right now. What has been making you feel most anxious?",
      suggestions: ["School", "Friends or family", "I can't pinpoint it"],
    },
    stress: {
      reply:
        "It sounds like you have a lot on your mind. What feels like the biggest source of stress right now?",
      suggestions: ["School or work", "Friends or family", "Something else"],
    },
    bored: {
      reply:
        "It can be hard when nothing feels interesting. Would you rather talk for a bit, try something creative, or do something that gets you moving?",
      suggestions: ["Talk for a bit", "Try something creative", "Get moving"],
    },
    chat: {
      reply:
        "I'm here to listen. What has been on your mind lately? You can share as much or as little as you like.",
      suggestions: ["I've been feeling stressed", "I want to talk", "I'm not sure"],
    },
  };
  const topicPatterns: Array<[RegExp, string]> = [
    [/\b(sleep|insomnia|awake|tired)\b|นอน|หลับ/, "sleep"],
    [/\b(school|class|study|studying|homework|exam)\b|เรียน|การบ้าน|สอบ/, "school"],
    [/\b(friend|friends|classmate|relationship)\b|เพื่อน/, "friends"],
    [/\b(lonely|alone|isolated)\b|เหงา|โดดเดี่ยว/, "lonely"],
    [/\b(anxious|anxiety|worry|worried|nervous|panic)\b|กังวล|วิตก/, "anxious"],
    [/\b(stress|stressed|pressure|overwhelmed)\b|เครียด|กดดัน/, "stress"],
    [/\b(bored|boring)\b|เบื่อ/, "bored"],
  ];
  const detectedTopic =
    topicPatterns.find(([pattern]) => pattern.test(latest))?.[1] || topic;
  const response = replies[detectedTopic] || replies.chat;

  return { ...response, risk: "none" };
}
