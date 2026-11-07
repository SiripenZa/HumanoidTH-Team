
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Language = "en" | "th";

const questions = [
  {
    id: 1,
    text: {
      th: "มีปัญหาการนอน นอนไม่หลับหรือนอนมาก",
      en: "Having trouble sleeping, sleeping too little or too much",
    },
  },
  {
    id: 2,
    text: { th: "มีสมาธิน้อยลง", en: "Having difficulty concentrating" },
  },
  {
    id: 3,
    text: {
      th: "หงุดหงิด กระวนกระวาย หรือว้าวุ่นใจ",
      en: "Feeling irritable, restless, or agitated",
    },
  },
  {
    id: 4,
    text: { th: "รู้สึกเบื่อ เซ็ง", en: "Feeling bored or fed up" },
  },
  {
    id: 5,
    text: { th: "ไม่อยากพบปะผู้คน", en: "Not wanting to meet or be around people" },
  },
];

const answerOptions = [
  { label: { th: "แทบไม่มี", en: "Rarely" }, score: 0 },
  { label: { th: "เป็นบางครั้ง", en: "Sometimes" }, score: 1 },
  { label: { th: "บ่อยครั้ง", en: "Often" }, score: 2 },
  { label: { th: "เป็นประจำ", en: "Almost always" }, score: 3 },
];

function getStressResult(score: number, lang: Language) {
  if (score >= 10) {
    return {
      level: lang === "en" ? "Highest stress" : "เครียดมากที่สุด",
      description: lang === "en"
        ? "Your screening result suggests you may be experiencing a very high level of stress. Try to make time to rest, talk with someone you trust, and consider consulting a professional."
        : "ผลการประเมินแสดงว่าคุณอาจกำลังเผชิญกับความเครียดในระดับสูงมาก ลองหาเวลาพักผ่อน พูดคุยกับคนที่ไว้ใจ และพิจารณาปรึกษาผู้เชี่ยวชาญ",
      color: "#dc5555",
      advice: lang === "en"
        ? "Prioritize your mental well-being and consider seeking support from a professional."
        : "ควรให้ความสำคัญกับการดูแลสุขภาพใจและขอคำปรึกษาจากผู้เชี่ยวชาญ",
    };
  }

  if (score >= 8) {
    return {
      level: lang === "en" ? "High stress" : "เครียดมาก",
      description: lang === "en"
        ? "You may be experiencing stress that is affecting your feelings and daily life. Try making time to rest and do activities that help you relax."
        : "คุณอาจกำลังมีความเครียดที่ส่งผลต่อความรู้สึกและชีวิตประจำวัน ลองแบ่งเวลาให้ตัวเองได้พักผ่อนและทำกิจกรรมที่ช่วยผ่อนคลาย",
      color: "#df923b",
      advice: lang === "en"
        ? "Try to rest and find activities that help reduce stress. If you continue to feel unwell, consider consulting a professional."
        : "ลองพักผ่อนและหากิจกรรมที่ช่วยลดความเครียด หากยังรู้สึกไม่ดีขึ้นควรปรึกษาผู้เชี่ยวชาญ",
    };
  }

  if (score >= 5) {
    return {
      level: lang === "en" ? "Moderate stress" : "เครียดปานกลาง",
      description: lang === "en"
        ? "You may be experiencing some stress. Notice how you are feeling and try to set aside more time to rest."
        : "คุณอาจมีความเครียดอยู่บ้าง ลองสังเกตความรู้สึกของตัวเอง และแบ่งเวลาให้กับการพักผ่อนมากขึ้น",
      color: "#b5a23d",
      advice: lang === "en"
        ? "Try a relaxing activity, such as listening to music, taking a walk, or practicing slow breathing."
        : "ลองทำกิจกรรมผ่อนคลาย เช่น ฟังเพลง เดินเล่น หรือฝึกหายใจช้า ๆ",
    };
  }

  return {
    level: lang === "en" ? "Low stress" : "เครียดน้อย",
    description: lang === "en"
      ? "Your screening result suggests a low level of stress. Remember to take care of yourself and maintain a balance between work and rest."
      : "ผลการประเมินแสดงว่าคุณมีความเครียดในระดับน้อย อย่าลืมดูแลตัวเองและรักษาสมดุลระหว่างการทำงานกับการพักผ่อน",
    color: "#429b78",
    advice: lang === "en"
      ? "Keep a healthy balance in your life and make time for activities you enjoy."
      : "รักษาสมดุลชีวิตและหาเวลาทำกิจกรรมที่คุณชื่นชอบต่อไป",
  };
}

export default function CheckInPage() {
  const [lang, setLang] = useState<Language>("en");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const updateLanguage = () => {
      const match = document.cookie.match(/(?:^|;\s*)lang=(en|th)/);
      setLang((match?.[1] || "en") as Language);
    };

    updateLanguage();
    window.addEventListener("pageshow", updateLanguage);
    window.addEventListener("focus", updateLanguage);
    return () => {
      window.removeEventListener("pageshow", updateLanguage);
      window.removeEventListener("focus", updateLanguage);
    };
  }, []);

  const answeredCount = Object.keys(answers).length;

  const totalScore = Object.values(answers).reduce(
    (total, score) => total + score,
    0
  );

  const progress = (answeredCount / questions.length) * 100;

  const handleAnswer = (questionId: number, score: number) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: score,
    }));
  };

  const handleSubmit = () => {
  if (answeredCount !== questions.length) return;

  // ดึงผลการประเมิน
  const assessmentResult = getStressResult(totalScore, lang);

  // เตรียมข้อมูลส่งต่อให้ Chatbot
  const assessmentData = {
    score: totalScore,
    maxScore: 15,
    level: assessmentResult.level,
    description: assessmentResult.description,
    advice: assessmentResult.advice,

    // เก็บคำตอบของแต่ละข้อด้วย
    answers: questions.map((question) => ({
      question: question.text[lang],
      score: answers[question.id],
      answer: answerOptions.find(
        (option) => option.score === answers[question.id]
      )?.label[lang],
    })),

    completedAt: new Date().toISOString(),
  };

  // บันทึกสถานะและผลประเมิน
  localStorage.setItem("wellness_assessment_completed", "true");

  sessionStorage.setItem(
    "wellnessAssessment",
    JSON.stringify(assessmentData)
  );
  window.dispatchEvent(new Event("wellness-assessment-updated"));

  setShowResult(true);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  const handleReset = () => {
    setAnswers({});
    setShowResult(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const result = getStressResult(totalScore, lang);
  const text = lang === "en"
    ? {
        back: "← Back to Wellness",
        subtitle: "Initial stress screening",
        introTitle: "Check in with yourself",
        intro: "This assessment has 5 questions to help you reflect on your feelings and initial stress level. Choose the answer that best describes how you have been feeling.",
        instruction: "Instructions:",
        instructionText: "Answer based on how you have felt during the time period covered by the ST-5 assessment. Choose the answer that best describes you.",
        progress: "Assessment Progress",
        questionsAnswered: "questions answered",
        completeToSee: "Answer all questions to see your results",
        answered: "You have answered",
        of: "of",
        questions: "questions",
        submit: "Submit assessment →",
        resultTitle: "Your Assessment Result",
        points: "points",
        advice: "Recommendations for you",
        disclaimer: "This result is an initial screening only, not a diagnosis. If stress is affecting your daily life, consider consulting a healthcare professional.",
        continue: "Continue to Chatbot →",
        retry: "Take the assessment again",
        backWellness: "Back to Wellness",
        footer: "This assessment is an initial screening only and cannot replace advice from a healthcare professional.",
      }
    : {
        back: "← กลับหน้า Wellness",
        subtitle: "แบบประเมินความเครียดเบื้องต้น",
        introTitle: "สำรวจความรู้สึกของคุณ",
        intro: "แบบประเมินนี้ประกอบด้วยคำถาม 5 ข้อ เพื่อสำรวจความรู้สึกและความเครียดเบื้องต้นของคุณ กรุณาเลือกคำตอบที่ตรงกับความรู้สึกของคุณมากที่สุด",
        instruction: "คำแนะนำ:",
        instructionText: "โปรดตอบตามความรู้สึกของคุณในช่วงเวลาที่แบบประเมิน ST-5 กำหนด โดยเลือกคำตอบที่ตรงกับตัวคุณมากที่สุด",
        progress: "Assessment Progress",
        questionsAnswered: "ข้อ",
        completeToSee: "ตอบคำถามให้ครบทุกข้อเพื่อดูผลการประเมิน",
        answered: "คุณตอบแล้ว",
        of: "จาก",
        questions: "ข้อ",
        submit: "ส่งแบบประเมิน →",
        resultTitle: "ผลการประเมินของคุณ",
        points: "คะแนน",
        advice: "คำแนะนำสำหรับคุณ",
        disclaimer: "ผลการประเมินนี้เป็นเพียงการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัยโรค หากมีความเครียดที่ส่งผลกระทบต่อชีวิตประจำวัน ควรปรึกษาบุคลากรทางการแพทย์",
        continue: "ไปต่อเพื่อคุยกับ Chatbot →",
        retry: "ทำแบบประเมินอีกครั้ง",
        backWellness: "กลับหน้า Wellness",
        footer: "แบบประเมินนี้เป็นเพียงการคัดกรองเบื้องต้น ไม่สามารถใช้แทนคำแนะนำจากบุคลากรทางการแพทย์ได้",
      };

  return (
    <main
      style={{
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        paddingBottom: "30px",
      }}
    >
      {/* BACK BUTTON */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          href="/wellness"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--muted)",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          {text.back}
        </Link>
      </div>

      {/* PAGE HEADER */}
      <div className="topline">
        <div>
          <p
            className="muted"
            style={{ fontSize: "12px", marginBottom: "6px" }}
          >
            WELLNESS CENTER / STEP 01
          </p>

          <h1>Stress Assessment</h1>

          <p className="muted" style={{ marginTop: "6px" }}>
            {text.subtitle}
          </p>
        </div>
      </div>

      {/* INTRODUCTION */}
      <section className="panel" style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "14px",
              background: "var(--surface-muted)",
              fontSize: "28px",
            }}
          >
            💗
          </div>

          <div>
            <h2 style={{ fontSize: "18px" }}>
              {text.introTitle}
            </h2>

            <p className="muted" style={{ fontSize: "13px" }}>
              Stress Screening (ST-5)
            </p>
          </div>
        </div>

        <p style={{ fontSize: "14px", lineHeight: "1.9" }}>
          {text.intro}
        </p>

        <div
          className="notice"
          style={{
            marginTop: "15px",
            fontSize: "13px",
            lineHeight: "1.8",
          }}
        >
          <strong>{text.instruction}</strong> {text.instructionText}
        </div>
      </section>

      {!showResult ? (
        <>
          {/* PROGRESS */}
          <section className="panel" style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <strong style={{ fontSize: "14px" }}>
                {text.progress}
              </strong>

              <span
                style={{
                  color: "var(--accent)",
                  fontWeight: "700",
                  fontSize: "13px",
                }}
              >
                {answeredCount} / 5 {text.questionsAnswered}
              </span>
            </div>

            <div
              style={{
                height: "9px",
                background: "var(--surface-muted)",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "var(--accent)",
                  borderRadius: "20px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            <p
              className="muted"
              style={{ fontSize: "12px", marginTop: "9px" }}
            >
              {text.completeToSee}
            </p>
          </section>

          {/* QUESTIONS */}
          <div style={{ display: "grid", gap: "16px" }}>
            {questions.map((question, index) => (
              <section
                className="panel"
                key={question.id}
                style={{
                  borderLeft:
                    answers[question.id] !== undefined
                      ? "4px solid var(--accent)"
                      : "4px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      minWidth: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: "var(--surface-muted)",
                      color: "var(--accent)",
                      fontWeight: "700",
                    }}
                  >
                    {index + 1}
                  </div>

                  <div>
                    <p
                      className="muted"
                      style={{ fontSize: "11px", marginBottom: "5px" }}
                    >
                      QUESTION {index + 1}
                    </p>

                    <h3
                      style={{
                        fontSize: "15px",
                        lineHeight: "1.8",
                      }}
                    >
                      {question.text[lang]}
                    </h3>
                  </div>
                </div>

                {/* ANSWER OPTIONS */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {answerOptions.map((option) => {
                    const isSelected =
                      answers[question.id] === option.score;

                    return (
                      <button
                        key={option.score}
                        type="button"
                        onClick={() =>
                          handleAnswer(question.id, option.score)
                        }
                        aria-pressed={isSelected}
                        style={{
                          padding: "13px 8px",
                          borderRadius: "9px",
                          border: isSelected
                            ? "2px solid var(--accent)"
                            : "1px solid var(--border)",
                          background: isSelected
                            ? "var(--surface-muted)"
                            : "transparent",
                          color: "inherit",
                          fontSize: "13px",
                          fontWeight: isSelected ? "700" : "400",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {isSelected ? "✓ " : ""}
                        {option.label[lang]}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* SUBMIT */}
          <section
            className="panel"
            style={{
              marginTop: "20px",
              textAlign: "center",
            }}
          >
            <p className="muted" style={{ fontSize: "13px" }}>
              {text.answered} {answeredCount} {text.of} 5 {text.questions}
            </p>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={answeredCount !== 5}
              style={{
                width: "100%",
                maxWidth: "350px",
                marginTop: "15px",
                padding: "13px 20px",
                border: "none",
                borderRadius: "9px",
                background:
                  answeredCount === 5
                    ? "var(--accent)"
                    : "var(--surface-muted)",
                color:
                  answeredCount === 5
                    ? "#FFFFFF"
                    : "var(--muted)",
                fontSize: "14px",
                fontWeight: "700",
                cursor:
                  answeredCount === 5
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              {text.submit}
            </button>
          </section>
        </>
      ) : (
        /* RESULT */
        <section className="panel" style={{ textAlign: "center" }}>

          <h2 style={{ fontSize: "22px", marginTop: "8px" }}>
            {text.resultTitle}
          </h2>

          {/* SCORE */}
          <div
            style={{
              margin: "25px auto",
              width: "135px",
              height: "135px",
              borderRadius: "50%",
              border: `7px solid ${result.color}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <strong
              style={{
                fontSize: "45px",
                color: result.color,
              }}
            >
              {totalScore}
            </strong>

            <span className="muted" style={{ fontSize: "12px" }}>
              {text.points}
            </span>
          </div>

          {/* RESULT LEVEL */}
          <h3
            style={{
              fontSize: "30px",
              color: result.color,
              marginBottom: "12px",
            }}
          >
            {result.level}
          </h3>

          <p
            style={{
              fontSize: "20px",
              lineHeight: "1.9",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            {result.description}
          </p>

          {/* ADVICE */}
          <div
            className="notice"
            style={{
              marginTop: "24px",
              textAlign: "left",
              fontSize: "13px",
              lineHeight: "1.9",
            }}
          >
            <strong>{text.advice}</strong>
            <p style={{ marginTop: "6px" }}>
              {result.advice}
            </p>
          </div>

          {/* DISCLAIMER */}
          <p
            className="muted"
            style={{
              fontSize: "12px",
              lineHeight: "1.8",
              marginTop: "20px",
            }}
          >
            {text.disclaimer}
          </p>

          {/* Continue to Chatbot */}
          <Link
            href="/wellness/chatbot"
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: "15px 20px",
              marginTop: "28px",
              borderRadius: "12px",
              background: "var(--accent)",
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {text.continue}
          </Link>

          {/* Other actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "inherit",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {text.retry}
            </button>

            <Link
              href="/wellness"
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              {text.backWellness}
            </Link>
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <p
        className="muted"
        style={{
          fontSize: "12px",
          lineHeight: 1.7,
          textAlign: "center",
          marginTop: "28px",
        }}
      >
        {text.footer}
      </p>
    </main>
  );
}
