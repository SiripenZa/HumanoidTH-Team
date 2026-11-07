// Wellness Chatbot "Robot Guide" — English version of the local rule-based engine.
// Exports the same names as lib/wellness-bot.ts so the UI can switch language with one import.

import type { AssessmentSummary, BotReply, Game, GameMood, Topic } from "./wellness-bot";

const MORE = "Suggest relaxing games";
const VENT = "I want to vent";

export const QUICK_TOPICS = [
  "Stressed",
  "Bored",
  "School problems",
  "Friend issues",
  MORE,
  VENT
];

export const WELCOME_TEXT = `Hi, I'm Robot Guide, your wellness companion. I'm here to listen and help you feel a little lighter.
How are you feeling today? Pick a topic below, or just type what's on your mind.

(I'm a first-step helper, not medical care.)`;

/* ------------------------------------------------------------------ */
/* Games                                                               */
/* ------------------------------------------------------------------ */

const GAMES_QUICK: Game[] = [
  {
    title: "5-4-3-2-1 Look Around",
    kind: "play-now",
    time: "2 min",
    desc: "Bring your mind back to the present. Helps when you feel scattered or anxious.",
    how: "Find 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell and 1 you can taste."
  },
  {
    title: "Box Breathing",
    kind: "play-now",
    time: "3 min",
    desc: "A rhythm game for your breath that helps slow your heartbeat.",
    how: "Picture a square. Breathe in for 4 seconds, hold for 4, breathe out for 4, hold for 4. Repeat 5 rounds."
  },
  {
    title: "Three Good Things",
    kind: "play-now",
    time: "2 min",
    desc: "Collect small things that went well today. It helps the mind feel lighter.",
    how: "Write down 3 things that went okay today. Tiny counts: good food, a song you liked, a kind word."
  }
];

const GAMES_FRIENDS: Game[] = [
  {
    title: "Word Chain",
    kind: "friends",
    time: "10 min",
    desc: "Play anywhere with no equipment.",
    how: "Take turns saying a word that starts with the last letter of the previous word. Stuck? You can pass. Nobody loses."
  },
  {
    title: "Would You Rather",
    kind: "friends",
    time: "10 min",
    desc: "Silly questions that bring laughs and help you know each other better.",
    how: "Take turns asking two-choice questions like 'invisible or able to fly?' and explain your reasons."
  },
  {
    title: "Phone Camera Scavenger Hunt",
    kind: "friends",
    time: "20 min",
    desc: "Go for a walk with a game. You get movement and sunlight too.",
    how: "Make a list like something red, something round, a cool shadow, then race to photograph them all."
  }
];

const GAMES_CALM: Game[] = [
  {
    title: "Monument Valley",
    kind: "digital",
    time: "20-30 min",
    desc: "A puzzle game of impossible architecture with gentle music and no timer. Short, finishable levels."
  },
  {
    title: "Alto's Odyssey",
    kind: "digital",
    time: "10-20 min",
    desc: "Glide across sand dunes at a relaxed pace with beautiful visuals and calming music."
  },
  {
    title: "A Short Hike",
    kind: "digital",
    time: "30+ min",
    desc: "Wander a mountain park, chat with characters and enjoy a game with no pressure."
  },
  {
    title: "Stardew Valley",
    kind: "digital",
    time: "At your pace",
    desc: "A slow farming and life game that suits days when you want to rest your mind."
  }
];

function gamesFor(mood: GameMood): Game[] {
  switch (mood) {
    case "quick":
      return GAMES_QUICK;
    case "friends":
      return GAMES_FRIENDS;
    case "calm":
      return GAMES_CALM.slice(0, 3);
    default:
      return [GAMES_QUICK[0], GAMES_QUICK[1], GAMES_FRIENDS[0], GAMES_CALM[0]];
  }
}

/* ------------------------------------------------------------------ */
/* Topics                                                              */
/* ------------------------------------------------------------------ */

type Sub = { keys: string[]; text: string; chips?: string[]; gameMood?: GameMood };
type TopicDef = { id: Topic; keys: string[]; text: string; chips: string[]; subs: Sub[] };

const GAME_CHIPS = ["Quick games, no install", "Games to play with friends", "Chill phone or PC games", "Still stressed"];

// Order matters: when two topics tie, the earlier (more specific) one wins.
const TOPICS: TopicDef[] = [
  {
    id: "study",
    keys: ["school", "exam", "homework", "teacher", "study", "grade", "score", "assignment", "project", "tutor", "class"],
    text: "School pressure is really common. Which of these is closest to what you're facing?",
    chips: [
      "Exam coming up",
      "I keep procrastinating",
      "I can't focus",
      "My grades dropped",
      "Parents pressure me about grades"
    ],
    subs: [
      {
        keys: ["grade", "failed", "falling behind", "don't understand", "bad score", "low score", "dropped"],
        text: `It's okay to feel down when marks aren't what you hoped for, but one score isn't who you are. Try this:
1) Look at where you lost marks: content, understanding, or running out of time.
2) Ask a teacher or classmate about the one part you don't get. Start with a single question.
3) Set a small goal, like improving one step next time.

Which subject worries you most right now?`,
        chips: ["Parents pressure me about grades", "Help me plan studying", MORE]
      },
      {
        keys: ["plan", "schedule", "timetable"],
        text: `Here is a study schedule you can adjust to yourself:
• Block 1 (25 min): the hardest subject while your mind is fresh
• 5-minute break: stretch and drink water
• Block 2: the next subject
• Block 3: practice problems or review
• Finish with a 5-minute summary

Tell me the exam date and how many subjects, and I'll help break it into daily steps.`,
        chips: ["I can't focus", MORE]
      },
      {
        keys: ["exam", "test", "midterm", "finals"],
        text: `A racing heart before exams is normal. Try this plan:
1) Split the material into small topics and start with the weakest one.
2) Do past papers or practice questions with a timer. It works better than only re-reading.
3) Study in 25-minute rounds with 5-minute breaks.
4) The night before, sleep well rather than cramming late.

If you feel shaky or very anxious before the exam, breathe in for 4 and out for 6, five times. How many days until the exam, and which subject worries you most?`,
        chips: ["Help me plan studying", MORE]
      },
      {
        keys: ["procrastinat", "lazy", "can't start", "motivation", "homework pil", "putting off", "keep delaying"],
        text: `Procrastinating doesn't make you a bad person. It usually means the task feels too big or you're worn out. Try this:
1) The 2-minute rule: just open the book and do the first question.
2) Break the work into pieces you can finish in 15 minutes.
3) Put your phone in another room while you work.

Often the hardest part is starting, and the resistance fades after that. Want to try just 5 minutes now?`,
        chips: ["I can't focus", "Too much to do, can't keep up", MORE]
      },
      {
        keys: ["focus", "concentrat", "distract", "phone", "attention"],
        text: `Set up your space first:
1) Flip your phone over or turn on Do Not Disturb and keep it out of reach.
2) Use 25/5: work 25 minutes, rest 5.
3) Write one line for what this round should achieve.
4) If your mind wanders, jot the thought down and go back.

What usually pulls you away: sleepiness, or things on your mind?`,
        chips: ["Sleepy, not enough sleep", "A lot on my mind", MORE]
      },
      {
        keys: ["parent", "mom", "dad", "disappoint", "compare", "expect", "pressure"],
        text: `Feeling expected to do so much is tiring. Here is how you might talk with them:
1) Pick a calm moment, not right after the results come in.
2) Start with your feelings: "I'm really trying, but I feel a lot of pressure. Can we find a way together?"
3) Offer a realistic plan, like adjusting study time or asking for extra tutoring.

If talking to them directly is hard, a school counselor or a close relative can help in the middle.`,
        chips: [VENT, MORE]
      }
    ]
  },
  {
    id: "friends",
    keys: ["friend", "classmate", "clique"],
    text: "Friends matter a lot. Tell me a bit more about what happened. Which of these is closest?",
    chips: [
      "I had a fight with a friend",
      "I feel lonely, no close friends",
      "I'm being bullied or teased",
      "Friends push me to do things I don't want"
    ],
    subs: [
      {
        keys: ["tell a teacher", "tell my teacher", "how to tell", "how do i tell"],
        text: `You could start with something like:
"Teacher, something is bothering me and I'd like advice. Someone is making me feel unsafe. Could I talk to you for a moment?"

Prepare a short summary: who, what, when and where, and bring evidence if you have any. If talking to a teacher feels hard, tell a parent or call the Child Helpline at 1387.`,
        chips: [VENT, MORE]
      },
      {
        keys: ["bully", "bullied", "tease", "teased", "make fun", "mock", "harass", "threat", "hit me", "share photo", "spread"],
        text: `What's happening is not your fault, and you don't have to handle it alone. Try this:
1) Stay where other people are, and avoid reacting while you're upset.
2) Keep evidence: screenshots, plus the date, time and place.
3) Tell an adult you trust, such as your homeroom teacher, school counselor or a parent.
4) If you'd rather talk to someone outside school, the Child Helpline 1387 is there to listen.

If anyone hits you or makes threats, tell an adult right away. Is there an adult you trust that you could tell today?`,
        chips: ["How do I tell a teacher?", VENT]
      },
      {
        keys: ["peer pressure", "push me", "pressure me to", "want me to", "invite me to", "say no", "refuse", "skip class", "try smok"],
        text: `Being pushed to do something you're not comfortable with is hard. Saying no doesn't make you a bad person. Try lines like:
• "No thanks, I'm not up for it."
• "I'll pass. Let's do something else."
• Change the subject, or suggest another plan.

Good friends respect your decisions. If it involves something risky like drugs, tell an adult you trust.`,
        chips: ["I'm being bullied or teased", VENT]
      },
      {
        keys: ["lonely", "no friends", "no one to talk", "left out", "excluded", "no close friend", "not invited", "alone"],
        text: `Loneliness hurts, and many people feel it. It doesn't mean you're not good enough. Try small steps:
1) Pick one person you've chatted with before and send a light message, like about homework or a game.
2) Look for people who like what you like: clubs, activities or game communities.
3) Be kind to yourself. Good friendships take time.

Want help thinking about who to message first?`,
        chips: [VENT, MORE]
      },
      {
        keys: ["fight", "argue", "argument", "misunderstand", "not talking", "ignoring me", "fell out", "upset with"],
        text: `A fight with a friend is uncomfortable. Try this:
1) Cool down first and don't send messages while angry.
2) When you're calmer, use "I feel..." sentences: "I felt bad about our fight yesterday. Can we talk?"
3) Listen to their side too. Sometimes it's just a misunderstanding.
4) If you're not ready yet, a day or two of space is fine.

What was the fight about? You can tell me.`,
        chips: [VENT, MORE]
      }
    ]
  },
  {
    id: "family",
    keys: ["family", "at home", "siblings", "brother", "sister", "parents fight", "parents argue", "strict parents", "yelled at", "scolded"],
    text: "Things at home can affect us a lot. Which of these is closest?",
    chips: ["My parents fight", "Strict parents who don't get me", "I get yelled at"],
    subs: [
      {
        keys: ["fight", "argue", "yell", "scold", "shout"],
        text: `When there's tension at home it can wear you out, and it's not your fault. Try this:
1) Find a safe spot for yourself for a while, like your room with some music.
2) Breathe slowly and remind yourself that adults' problems aren't yours to fix.
3) If you want to talk, choose someone you trust: a relative, a teacher, or the Child Helpline 1387.

If anyone is being physically hurt, ask a trusted adult for help right away.`,
        chips: [VENT, MORE]
      },
      {
        keys: ["strict", "not allow", "control", "don't understand", "don't listen", "don't get me"],
        text: `Feeling not understood at home is frustrating. Try talking like this:
1) Pick a moment when they're in a good mood.
2) Start with feelings: "I know you worry about me, but I feel stuck when..."
3) Offer a deal, like getting home on time in exchange for more personal time.

Negotiating calmly usually works better than arguing.`,
        chips: [VENT, MORE]
      }
    ]
  },
  {
    id: "sleep",
    keys: ["sleep", "insomnia", "nightmare", "tired", "wake up at night", "sleepy"],
    text: `Sleep affects how we feel a lot. Try this before bed:
1) Turn off screens 30 minutes before bed.
2) Go to bed around the same time each day.
3) Write down what's circling in your head and leave it for tomorrow.
4) In bed, breathe in for 4 and out for 6, 5 to 10 times.

If you can't sleep for several weeks in a row, talk to a parent or a doctor. What time do you usually go to bed, and is something replaying in your mind?`,
    chips: ["Overthinking, worried about everything", MORE],
    subs: []
  },
  {
    id: "bored",
    keys: ["bored", "boring", "nothing to do"],
    text: "Boredom is a useful signal. Tell me what kind of bored you are so I can suggest something that fits.",
    chips: ["Nothing to do", "Bored of school", "Bored of everything, don't want to do anything", MORE],
    subs: [
      {
        keys: ["everything", "nothing feels fun", "don't enjoy", "no energy", "can't be bothered", "nothing interests"],
        text: `Thanks for telling me. Having no energy or feeling like nothing is fun happens to many people. Try small steps:
1) Go wash your face or walk around the house for 5 minutes.
2) Do one small thing you used to like, even if it's less fun than before.
3) Message one person you trust.

How long has it felt like this?`,
        chips: ["Just a few days", "More than 2 weeks"]
      },
      {
        keys: ["few days", "just started", "just lately", "recently"],
        text: "If it's only been a short while, it's often tiredness or a repetitive routine. Try changing scenery, getting 10 minutes of sunlight, and doing one small thing you usually enjoy, or try one of the light games below.",
        gameMood: "mix",
        chips: ["Quick games, no install", "Games to play with friends", "Chill phone or PC games"]
      },
      {
        keys: ["more than 2 weeks", "weeks", "months", "long time", "for a while"],
        text: `Thanks for telling me. If this feeling has lasted more than 2 weeks, or it's affecting eating, sleeping or school, it's a good idea to have someone help. That doesn't mean you're weak. Try telling a parent, a school counselor, or call the Mental Health Hotline 1323 (open 24 hours).

In the meantime, try to eat and sleep at regular times and take a short walk each day. Want help thinking about who to tell first?`,
        chips: [VENT, "Things at home"]
      },
      {
        keys: ["bored of school", "bored with school", "bored of studying", "boring class", "bored of homework"],
        text: `Boredom with school often comes from studying too long or not seeing the point. Try changing it up:
1) Set a 20-minute timer, then take 5 minutes off.
2) Change your method: watch a video, study with a friend, or draw a summary diagram.
3) Give yourself a small reward after each round.

Which subject bores you most?`,
        chips: ["I can't focus", "I keep procrastinating", MORE]
      },
      {
        keys: ["nothing to do", "free time", "stuck at home", "at home"],
        text: `If you're bored because you're free, pick one:
• Move: dance to a song or take a short walk
• Use your hands: draw, jot, build something, cook something easy
• Play lightly: the games below pass the time without pressure

What sounds good?`,
        gameMood: "mix",
        chips: ["Quick games, no install", "Games to play with friends", "Chill phone or PC games"]
      }
    ]
  },
  {
    id: "sad",
    keys: ["sad", "crying", "cry", "feeling down", "feel down", "hopeless", "discouraged", "unhappy", "heartbroken", "feel bad"],
    text: "I'm sorry you're feeling this way. Sadness isn't wrong, and I'm happy to listen. Would you like to vent first, or get some ways to feel lighter?",
    chips: [VENT, "Give me ways to feel lighter", "Feeling lonely"],
    subs: [
      {
        keys: ["cry"],
        text: "It's okay to cry. It lets out feelings that have been building up. If you want to say anything, type it here. When you're ready, try drinking some water, washing your face and breathing slowly 5 times.",
        chips: [VENT, "Give me ways to feel lighter"]
      },
      {
        keys: ["lonely"],
        text: `Loneliness often shows up when we want someone to understand. Try:
1) Message a friend or relative, even about something small.
2) Spend time somewhere with other people, like a library or park.
3) Do something you like, such as music or drawing.

If you want to talk right now, tell me what's going on.`,
        chips: [VENT, MORE]
      }
    ]
  },
  {
    id: "vent",
    keys: ["to vent", "just vent", "let it out", "tell you about", "need to talk", "want to talk", "keep talking", "keep venting"],
    text: "Go ahead, I'm listening. There's no rush and no need to make it neat. Just type what you feel.",
    chips: ["School stuff", "Friends", "Family", "I don't know where to start"],
    subs: [
      {
        keys: ["where to start", "not sure how to start"],
        text: "That's completely fine. Start small, like one sentence on how you feel right now, or what's been sitting on your mind most today. It doesn't need to be perfect. I'm right here.",
        chips: ["School stuff", "Friends", "Family"]
      }
    ]
  },
  {
    id: "stress",
    keys: ["stress", "pressure", "anxious", "anxiety", "worried", "worry", "overthink", "overwhelm", "nervous", "panic", "relax"],
    text: "I'm listening. However stressed you are is okay. Tell me what the stress mostly comes from so I can help in a way that fits.",
    chips: ["School stuff", "Friends", "Family", "Racing heart, can't breathe", "Too much to do, can't keep up", "I'm not sure why"],
    subs: [
      {
        keys: ["heart", "racing", "can't breathe", "short of breath", "headache", "stomachache", "shaking", "sweat", "chest"],
        text: `Your body is reacting to stress. Try this right now:
1) Sit down and put a hand on your belly.
2) Breathe in through your nose for 4 seconds and hold for 4.
3) Let it out slowly through your mouth for 6 seconds. Repeat 5 times.

If your chest feels tight, you can't breathe well for a while, or it isn't getting better, tell a trusted adult or see a doctor right away. How are you feeling now?`,
        chips: ["I feel better now", "Still stressed", MORE]
      },
      {
        keys: ["too much", "can't keep up", "overloaded", "behind on", "piled up", "too many tasks", "workload", "swamped"],
        text: `It sounds like many things have landed at once. Try sorting it out:
1) Write everything pending on paper.
2) Underline the one thing that must be done first today.
3) Work for just 15 minutes, then rest 5.

The mind lightens when tasks are a list instead of one big lump. What's most urgent right now?`,
        chips: ["Exam coming up", "Homework piling up", MORE]
      },
      {
        keys: ["overthink", "worry", "worried", "anxious", "afraid", "scared", "what if", "can't stop thinking", "racing thoughts", "on my mind"],
        text: `Worry tends to loop around "what if...". Try this:
1) Write down what you're worried about.
2) Split it into "I can control" and "I can't control".
3) Pick just one item you can control and act on it. Leave the rest for now.

Would you like to tell me what you're worried about?`,
        chips: ["School stuff", "Friends", VENT]
      },
      {
        keys: ["not sure", "don't know", "can't explain", "no idea"],
        text: `That's okay. Sometimes stress arrives before we can say why. Try a gentle check: have you been sleeping enough, eating on time, or carrying something on your mind? Or if you just want to vent, type away.`,
        chips: [VENT, "Give me ways to feel lighter", "Sleepy, not enough sleep"]
      },
      {
        keys: ["relax", "calm down", "feel lighter", "ways to feel better", "lighter", "unwind"],
        text: `Quick things you can do right now:
• Breathe in for 4, out for 6, five times
• 5-4-3-2-1: notice things around you
• Stand up, stretch and drink a glass of water

Want to try a light game? There are some below.`,
        gameMood: "quick",
        chips: ["Games to play with friends", "Chill phone or PC games", "Still stressed"]
      }
    ]
  }
];

/* ------------------------------------------------------------------ */
/* Safety                                                              */
/* ------------------------------------------------------------------ */

const CRISIS_KEYS = [
  "want to die",
  "kill myself",
  "suicide",
  "suicidal",
  "self harm",
  "self-harm",
  "hurt myself",
  "end my life",
  "don't want to live",
  "do not want to live",
  "better off dead",
  "cut myself",
  "disappear from the world"
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
const count = (t: string, keys: string[]) => keys.reduce((n, k) => n + (t.includes(k) ? 1 : 0), 0);

export function isCrisis(input: string): boolean {
  const t = norm(input);
  return CRISIS_KEYS.some((k) => t.includes(k));
}

export function crisisReply(): BotReply {
  return {
    crisis: true,
    text: `Thank you for telling me. What you shared is serious and important, and I want you to have someone beside you right now.

Please tell a trusted adult or someone close to you now, and try not to be alone. You can contact the hotlines below right away. If you feel you might hurt yourself or you're in danger, call 1669 now.`
  };
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

const POSITIVE = ["i feel better now", "feeling better now", "much better now", "getting better", "lighter now", "calmer now"];
const THANKS = ["thank", "thx"];

export function wantsGames(input: string): boolean {
  const t = norm(input);
  if (t.includes("game addiction") || t.includes("addicted to games")) return false;
  return ["game", "something to play", "play something"].some((k) => t.includes(k));
}

function gamesReply(t: string): BotReply {
  let mood: GameMood = "mix";
  let text =
    "Sure. Here are some light games that give your mind a rest. Try to play for about 20-30 minutes and stretch afterwards. Start with these, or pick a style below.";

  if (/friend|together|with others|with people/.test(t)) {
    mood = "friends";
    text = "Invite friends along. Laughing together is a great stress reliever. Try these:";
  } else if (/no install|right here|in chat|quick|short|no time/.test(t)) {
    mood = "quick";
    text = "Tiny games you can play right here with nothing to install:";
  } else if (/phone|pc|computer|chill|cozy|calm/.test(t)) {
    mood = "calm";
    text =
      "Chill games with no timer and no pressure (check the age rating and platform first, and ask a parent if you need to buy anything):";
  }

  return { text, games: gamesFor(mood), chips: GAME_CHIPS };
}

// Pick the best-matching topic. Sub-keywords count too, so "I had a fight with a friend" lands on friends.
export function detectTopic(input: string, lastTopic?: Topic): Topic | undefined {
  const t = norm(input);
  let best: Topic | undefined;
  let bestScore = 0;

  for (const def of TOPICS) {
    let score = count(t, def.keys) + def.subs.reduce((n, s) => n + count(t, s.keys), 0);
    if (score > 0 && def.id === lastTopic) score += 0.5;
    if (score > bestScore) {
      best = def.id;
      bestScore = score;
    }
  }

  if (!best && lastTopic && t.length <= 30) return lastTopic;
  return best;
}

export function followUpChips(topic?: Topic): string[] {
  const def = TOPICS.find((d) => d.id === topic);
  return def ? def.chips : QUICK_TOPICS;
}

export function getLocalReply(input: string, lastTopic?: Topic): BotReply {
  const t = norm(input);

  if (isCrisis(t)) return crisisReply();

  if (t.length <= 30 && POSITIVE.some((k) => t.includes(k))) {
    return {
      text: "I'm glad you're feeling better. You did well looking after yourself. If you'd like to keep talking or try something light, just say so.",
      chips: [MORE, VENT, "School stuff"]
    };
  }

  if (t.length <= 20 && /^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(t)) {
    return { text: "Hi! How's your day going? Pick a topic below or just type what's on your mind.", chips: QUICK_TOPICS };
  }

  if (t.length <= 30 && THANKS.some((k) => t.includes(k))) {
    return { text: "Anytime. Take care of yourself, and type whenever you want to talk.", chips: QUICK_TOPICS };
  }

  if (wantsGames(t)) return gamesReply(t);

  const topic = detectTopic(t, lastTopic);
  if (topic) {
    const def = TOPICS.find((d) => d.id === topic)!;
    let sub: Sub | undefined;
    let bestScore = 0;
    for (const s of def.subs) {
      const sc = count(t, s.keys);
      if (sc > bestScore) {
        sub = s;
        bestScore = sc;
      }
    }
    const src = sub ?? def;
    return {
      text: src.text,
      chips: sub?.chips ?? def.chips,
      games: sub?.gameMood ? gamesFor(sub.gameMood) : undefined,
      topic: def.id
    };
  }

  if (t.length > 30) {
    return {
      text: "Thank you for trusting me with this. It sounds like it's been heavy. How would you like me to help right now: keep listening, give you ways to feel lighter, or take a break with a light game?",
      chips: ["I want to keep talking", "Give me ways to feel lighter", MORE],
      topic: "vent"
    };
  }

  return {
    text: "I want to understand you as well as I can. Could you tell me a little more, or pick a topic below?",
    chips: QUICK_TOPICS
  };
}

/* ------------------------------------------------------------------ */
/* Personalized welcome from the stress assessment                     */
/* ------------------------------------------------------------------ */

const TOPIC_CHIP: Record<Topic, string> = {
  study: "School problems",
  friends: "Friend issues",
  family: "Things at home",
  sleep: "Trouble sleeping",
  stress: "Stressed",
  sad: "Feeling sad",
  bored: "Bored",
  vent: VENT
};

export function personalizedWelcome(summary: AssessmentSummary | null): BotReply {
  const level = summary?.level;
  let intro: string;
  if (level === "high") {
    intro =
      "From the assessment you completed, your stress looks fairly high lately. Thank you for checking in on yourself. I'm here to help you slowly feel lighter. If it ever feels too heavy, telling a trusted adult or calling the Mental Health Hotline 1323 (24 hours) is always a good step.";
  } else if (level === "moderate") {
    intro =
      "From the assessment you completed, your stress looks moderate lately. There are easy ways to feel lighter, and we can try them together.";
  } else if (level === "low") {
    intro =
      "From the assessment you completed, your stress looks low. Nice! If something's on your mind or you want a relaxing activity, I'm here.";
  } else {
    intro = "Thanks for completing the stress assessment. I'm ready to help with whatever you're feeling.";
  }

  const concernText = summary?.concerns.length
    ? `\n\nIt looks like what's weighing on you may be: ${summary.concerns.map((c) => TOPIC_CHIP[c]).join(", ")}. Which would you like to start with, or just type it out.`
    : "\n\nWhere would you like to start? Pick below, or just type what's on your mind.";

  const chips = [
    ...(summary?.concerns.map((c) => TOPIC_CHIP[c]) ?? []),
    ...(level === "high" ? ["Give me ways to feel lighter"] : []),
    VENT,
    MORE,
    ...QUICK_TOPICS
  ];

  return {
    text: `${intro}${concernText}\n\n(I'm a first-step helper, not medical care.)`,
    chips: Array.from(new Set(chips)).slice(0, 6),
    topic: summary?.concerns[0]
  };
}