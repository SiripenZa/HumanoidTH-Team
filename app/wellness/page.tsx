
"use client";

import { useEffect, useState } from "react";
import { getTranslation, type Language } from "@/lib/translations";

type StepType = "assessment" | "chatbot" | "activities" | "planner";
type StepStatus = "available" | "completed" | "locked";

type WellnessStep = {
  number: string;
  icon: string;
  href: string;
  type: StepType;
};

type UpdatedStep = WellnessStep & {
  title: string;
  subtitle: string;
  description: string;
  status: StepStatus;
  statusText: string;
  buttonText: string;
};

const wellnessSteps: WellnessStep[] = [
  {
    number: "01",
    icon: "💗",
    href: "/wellness/check-in",
    type: "assessment",
  },
  {
    number: "02",
    icon: "🤖",
    href: "/wellness/chatbot",
    type: "chatbot",
  },
  {
    number: "03",
    icon: "🌿",
    href: "/wellness/recommendations",
    type: "activities",
  },
  {
    number: "04",
    icon: "⏰",
    href: "/wellness/break-planner",
    type: "planner",
  },
];

export default function WellnessPage() {
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [isReady, setIsReady] = useState(false);

  // ตรวจสอบภาษาและสถานะการประเมิน
  useEffect(() => {
    const updatePageData = () => {
      const match = document.cookie.match(/(?:^|;\s*)lang=(en|th)/);
      const currentLang = (match?.[1] || "en") as Language;

      setLang(currentLang);

      const completed =
        localStorage.getItem("wellness_assessment_completed") === "true";

      setAssessmentCompleted(completed);
      setIsReady(true);
    };

    updatePageData();

    window.addEventListener("focus", updatePageData);
    window.addEventListener("pageshow", updatePageData);
    window.addEventListener("storage", updatePageData);

    return () => {
      window.removeEventListener("focus", updatePageData);
      window.removeEventListener("pageshow", updatePageData);
      window.removeEventListener("storage", updatePageData);
    };
  }, []);

  const t = getTranslation(lang);

  // รีเซ็ตผลการประเมิน
  const handleResetAssessment = () => {
    localStorage.removeItem("wellness_assessment_completed");
    sessionStorage.removeItem("wellnessAssessment");

    setAssessmentCompleted(false);
  };

  // Progress ของขั้นตอนหลัก 2 ขั้นตอน
  const completedSteps = assessmentCompleted ? 1 : 0;
  const progress = (completedSteps / 2) * 100;

  // ข้อมูลการ์ดตามภาษา
  const updatedSteps: UpdatedStep[] = wellnessSteps.map((step) => {
    // STEP 01: Stress Assessment
    if (step.type === "assessment") {
      return {
        ...step,
        title: t.wellnessStep1Title,
        subtitle: t.wellnessStep1Subtitle,
        description: t.wellnessStep1Desc,
        status: assessmentCompleted ? "completed" : "available",
        statusText: assessmentCompleted
          ? t.wellnessCompleted
          : t.wellnessAvailable,
        buttonText: assessmentCompleted
          ? t.wellnessViewAssessment
          : t.wellnessStartAssessment,
      };
    }

    // STEP 02: Chatbot
    if (step.type === "chatbot") {
      return {
        ...step,
        title: t.wellnessStep2Title,
        subtitle: t.wellnessStep2Subtitle,
        description: t.wellnessStep2Desc,
        status: assessmentCompleted ? "available" : "locked",
        statusText: assessmentCompleted
          ? t.wellnessAvailable
          : t.wellnessLocked,
        buttonText: assessmentCompleted
          ? t.wellnessStartChatbot
          : t.wellnessCompleteStep1,
      };
    }

    // STEP 03: Recommended Activities
    if (step.type === "activities") {
      return {
        ...step,
        title:
          lang === "en"
            ? "Recommended Activities"
            : "กิจกรรมแนะนำ",
        subtitle:
          lang === "en"
            ? "Relax and recharge yourself"
            : "ผ่อนคลายและเติมพลังให้ตัวเอง",
        description:
          lang === "en"
            ? "Explore various activities that can help you relax, reduce stress, and improve your well-being."
            : "ค้นหากิจกรรมหลากหลายรูปแบบที่ช่วยให้คุณผ่อนคลาย ลดความเครียด และดูแลสุขภาพใจ",
        status: "available",
        statusText: lang === "en" ? "Available" : "พร้อมใช้งาน",
        buttonText:
          lang === "en" ? "Explore Activities" : "ดูกิจกรรมแนะนำ",
      };
    }

    // STEP 04: Break Planner
    return {
      ...step,
      title:
        lang === "en"
          ? "Break Planner"
          : "วางแผนเวลาพัก (Break Planner)",
      subtitle:
        lang === "en"
          ? "Plan your personal break time"
          : "วางแผนเวลาพักในแบบของคุณ",
      description:
        lang === "en"
          ? "Create your own break plan and organize relaxing activities that fit your daily routine."
          : "จัดตารางเวลาพักส่วนตัวและเลือกกิจกรรมผ่อนคลายให้เหมาะกับกิจวัตรประจำวันของคุณ",
      status: "available",
      statusText: lang === "en" ? "Available" : "พร้อมใช้งาน",
      buttonText:
        lang === "en" ? "Open Break Planner" : "เปิด Break Planner",
    };
  });

  return (
    <>
      {/* PAGE HEADER */}
      <div className="topline">
        <div>
          <h1>{t.wellnessTitle}</h1>
          <p className="muted">{t.wellnessDesc}</p>
        </div>
      </div>

      {/* PROGRESS */}
      <section
        className="panel"
        style={{
          marginBottom: "24px",
          padding: "22px",
          borderRadius: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px" }}>
              {t.wellnessProgress}
            </h2>

            <p className="muted" style={{ fontSize: "13px" }}>
              {t.wellnessProgressDesc}
            </p>
          </div>

          <strong
            style={{
              color: "var(--accent)",
              fontSize: "15px",
              whiteSpace: "nowrap",
            }}
          >
            {completedSteps} / 2{" "}
            {lang === "en" ? "Steps" : "ขั้นตอน"}
          </strong>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: "10px",
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
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {/* Current Status */}
        <p
          style={{
            fontSize: "13px",
            marginTop: "12px",
            color: "var(--muted)",
          }}
        >
          {assessmentCompleted
            ? lang === "en"
              ? "✓ Assessment completed! You can continue to the chatbot."
              : "✓ ทำแบบประเมินเรียบร้อยแล้ว สามารถไปยัง Chatbot ได้เลย"
            : lang === "en"
              ? "Current step: Stress Assessment"
              : "ขั้นตอนปัจจุบัน: การประเมินความเครียด"}
        </p>
      </section>

      {/* STEP HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        <div style={{ flex: "1 1 250px" }}>
          <h2>{t.wellnessStepsTitle}</h2>

          <p className="muted" style={{ marginTop: "5px" }}>
            {t.wellnessStepsDesc}
          </p>
        </div>

        {/* DISCLAIMER */}
        <div
          className="notice"
          style={{
            flex: "1 1 300px",
            maxWidth: "520px",
            boxSizing: "border-box",
            fontSize: "12px",
            lineHeight: "1.7",
            margin: 0,
          }}
        >
          <strong>
            {lang === "en" ? "Note: " : "หมายเหตุ: "}
          </strong>
          {t.wellnessDisclaimer}
        </div>
      </div>

      {/* STEP CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {updatedSteps.map((step) => {
          // ล็อกเฉพาะ Chatbot เมื่อยังไม่ได้ประเมิน
          const isLocked =
            step.type === "chatbot" && !assessmentCompleted;

          const isCompleted = step.status === "completed";

          return (
            <section
              className="panel"
              key={step.number}
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "300px",
                padding: "22px",
                borderRadius: "16px",
                opacity: isLocked ? 0.65 : 1,
                borderTop: isLocked
                  ? "3px solid var(--border)"
                  : "3px solid var(--accent)",
                transition: "all 0.3s ease",
              }}
            >
              {/* ICON AND STATUS */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "15px",
                    background: "var(--surface-muted)",
                    fontSize: "30px",
                  }}
                >
                  {step.icon}
                </div>

                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: isLocked
                      ? "var(--muted)"
                      : "var(--accent)",
                  }}
                >
                  {isLocked
                    ? "🔒 "
                    : isCompleted
                      ? "✓ "
                      : "● "}
                  {step.statusText}
                </span>
              </div>

              {/* STEP NUMBER */}
              <p
                className="muted"
                style={{
                  fontSize: "12px",
                  marginBottom: "6px",
                }}
              >
                {lang === "en" ? "STEP" : "ขั้นตอนที่"}{" "}
                {step.number}
              </p>

              {/* TITLE */}
              <h2
                style={{
                  fontSize: "19px",
                  marginBottom: "6px",
                }}
              >
                {step.title}
              </h2>

              {/* SUBTITLE */}
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "12px",
                }}
              >
                {step.subtitle}
              </p>

              {/* DESCRIPTION */}
              <p
                className="muted"
                style={{
                  fontSize: "13px",
                  lineHeight: "1.8",
                  flex: 1,
                  marginBottom: "20px",
                }}
              >
                {step.description}
              </p>

              {/* BUTTON */}
              {isLocked ? (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--surface-muted)",
                    color: "var(--muted)",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "not-allowed",
                  }}
                >
                  🔒 {step.buttonText}
                </button>
              ) : (
                <a
                  href={step.href}
                  style={{
                    display: "block",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 15px",
                    backgroundColor: isCompleted
                      ? "var(--surface-muted)"
                      : "var(--accent)",
                    color: isCompleted
                      ? "var(--accent)"
                      : "#FFFFFF",
                    borderRadius: "10px",
                    textAlign: "center",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {step.buttonText}
                </a>
              )}
              {step.type === "assessment" && assessmentCompleted && (
                <button
                  type="button"
                  onClick={handleResetAssessment}
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--muted)",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  ↻ {lang === "en" ? "Reset Assessment" : "รีเซ็ตแบบประเมิน"}
                </button>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
