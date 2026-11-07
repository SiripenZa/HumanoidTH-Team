
"use client";

import { useEffect, useState } from "react";
import { getTranslation, type Language } from "@/lib/translations";

const wellnessSteps = [
  {
    number: "01",
    icon: "💗",
    href: "/wellness/check-in",
  },
  {
    number: "02",
    icon: "🤖",
    href: "/wellness/chatbot",
  },
  {
    number: "03",
    icon: "🌿",
    href: "/wellness/recommendations",
  },
];

export default function WellnessPage() {
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [activityCompleted, setActivityCompleted] = useState(false);
  const [lang, setLang] = useState<Language>("en");

  // ตรวจสอบภาษาและสถานะของแต่ละขั้นตอน
  useEffect(() => {
    const updatePageData = () => {
      const match = document.cookie.match(/(?:^|;\s*)lang=(en|th)/);
      const currentLang = (match?.[1] || "en") as Language;

      setLang(currentLang);

      // ตรวจสอบขั้นตอนที่ 1
      const assessmentDone = localStorage.getItem(
        "wellness_assessment_completed"
      );

      setAssessmentCompleted(assessmentDone === "true");

      // ตรวจสอบขั้นตอนที่ 2
      const activityDone = localStorage.getItem(
        "wellness_step2_completed"
      );

      setActivityCompleted(activityDone === "true");
    };

    updatePageData();

    // ตรวจสอบอีกครั้งเมื่อกลับมาที่หน้านี้
    window.addEventListener("focus", updatePageData);
    window.addEventListener("pageshow", updatePageData);

    // ตรวจสอบเมื่อ localStorage เปลี่ยนจากแท็บอื่น
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
    const confirmed = window.confirm(
      lang === "en"
        ? "Are you sure you want to reset your assessment? Your previous result will be deleted."
        : "ต้องการรีเซ็ตแบบประเมินใช่หรือไม่? ผลการประเมินเดิมจะถูกลบ"
    );

    if (!confirmed) return;

    localStorage.removeItem("wellness_assessment_completed");
    sessionStorage.removeItem("wellnessAssessment");

    // รีเซ็ตสถานะของขั้นตอนที่ 2 ด้วย
    localStorage.removeItem("wellness_step2_completed");

    setAssessmentCompleted(false);
    setActivityCompleted(false);
  };

  // จำนวนขั้นตอนที่ทำเสร็จแล้ว
  const completedSteps =
    (assessmentCompleted ? 1 : 0) +
    (activityCompleted ? 1 : 0);

  const progress = (completedSteps / 2) * 100;

  // ข้อมูลแต่ละขั้นตอนตามภาษาที่เลือก
  const updatedSteps = wellnessSteps.map((step) => {
    // STEP 01: แบบประเมิน
    if (step.number === "01") {
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

    // STEP 02: กิจกรรม Wellness / Chatbot / Dream Runner
    if (step.number === "02") {
      return {
        ...step,
        title: t.wellnessStep2Title,
        subtitle: t.wellnessStep2Subtitle,
        description: t.wellnessStep2Desc,

        status: !assessmentCompleted
          ? "locked"
          : activityCompleted
            ? "completed"
            : "available",

        statusText: !assessmentCompleted
          ? t.wellnessLocked
          : activityCompleted
            ? t.wellnessCompleted
            : t.wellnessAvailable,

        buttonText: !assessmentCompleted
          ? t.wellnessCompleteStep1
          : activityCompleted
            ? t.wellnessCompleted
            : t.wellnessStartChatbot,
      };
    }

    // STEP 03: ปลดล็อกเมื่อทำ STEP 02 สำเร็จ
    return {
      ...step,
      title: t.wellnessStep3Title,
      subtitle: t.wellnessStep3Subtitle,
      description: t.wellnessStep3Desc,

      status: activityCompleted ? "available" : "locked",

      statusText: activityCompleted
        ? t.wellnessAvailable
        : t.wellnessLocked,

      buttonText: activityCompleted
        ? lang === "en"
          ? "Start Step 3"
          : "เริ่มขั้นตอนที่ 3"
        : t.wellnessCompleteStep2,
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
      <section className="panel" style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "17px" }}>
              {t.wellnessProgress}
            </h2>

            <p className="muted" style={{ fontSize: "12px" }}>
              {t.wellnessProgressDesc}
            </p>
          </div>

          <strong style={{ color: "var(--accent)", fontSize: "14px" }}>
            {completedSteps} / 2 {lang === "en" ? "Steps" : "ขั้นตอน"}
          </strong>
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
      </section>

      {/* STEP HEADER AND DISCLAIMER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <div style={{ flex: "1 1 250px" }}>
          <h2>{t.wellnessStepsTitle}</h2>

          <p className="muted" style={{ marginTop: "5px" }}>
            {t.wellnessStepsDesc}
          </p>
        </div>

        <div
          className="notice"
          style={{
            flex: "1 1 350px",
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
          gap: "16px",
        }}
      >
        {updatedSteps.map((step) => {
          const isLocked = step.status === "locked";
          const isCompleted = step.status === "completed";

          return (
            <section
              className="panel"
              key={step.number}
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "290px",
                opacity: isLocked ? 0.65 : 1,
                borderTop: isLocked
                  ? "3px solid var(--border)"
                  : "3px solid var(--accent)",
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
                    width: "54px",
                    height: "54px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "12px",
                    background: "var(--surface-muted)",
                    fontSize: "28px",
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
                  marginBottom: "5px",
                }}
              >
                {lang === "en" ? "STEP" : "ขั้นตอนที่"} {step.number}
              </p>

              {/* TITLE */}
              <h2 style={{ fontSize: "18px", marginBottom: "5px" }}>
                {step.title}
              </h2>

              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "10px",
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
                  style={{
                    width: "100%",
                    padding: "11px 15px",
                    background: "var(--surface-muted)",
                    color: "var(--muted)",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "not-allowed",
                  }}
                >
                  {step.buttonText}
                </button>
              ) : (
                <a
                  href={step.href}
                  style={{
                    display: "block",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 15px",
                    backgroundColor: isCompleted
                      ? "var(--surface-muted)"
                      : "var(--accent)",
                    color: isCompleted
                      ? "var(--accent)"
                      : "#FFFFFF",
                    borderRadius: "8px",
                    textAlign: "center",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {step.buttonText}
                </a>
              )}

              {/* RESET ASSESSMENT BUTTON */}
              {step.number === "01" && isCompleted && (
                <button
                  type="button"
                  onClick={handleResetAssessment}
                  style={{
                    width: "100%",
                    padding: "10px 15px",
                    marginTop: "10px",
                    background: "transparent",
                    color: "var(--accent)",
                    border: "1px solid var(--accent)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {lang === "en"
                    ? "↻ Reset Assessment"
                    : "↻ รีเซ็ตแบบประเมิน"}
                </button>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
