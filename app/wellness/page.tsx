
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain,
  MessageCircle,
  HeartHandshake,
  CalendarClock,
  LockKeyhole,
  ArrowRight,
  HeartPulse,
  Sparkles,
  Bot,
  ClipboardCheck,
} from "lucide-react";

const ASSESSMENT_KEY = "wellness_assessment_completed";

const services = [
  {
    id: "assessment",
    number: "01",
    title: "Stress Assessment",
    thaiTitle: "ประเมินความเครียด",
    description: "สำรวจระดับความเครียดและทำความเข้าใจความรู้สึกของตัวเอง",
    href: "/wellness/assessment",
    icon: Brain,
    color: "pink",
    available: true,
  },
  {
    id: "chatbot",
    number: "02",
    title: "Wellness Chatbot",
    thaiTitle: "พูดคุยกับผู้ช่วยสุขภาวะ",
    description: "พูดคุย ระบายความรู้สึก และรับคำแนะนำจาก Robot Guide",
    href: "/wellness/chatbot",
    icon: MessageCircle,
    color: "purple",
    available: false,
  },
  {
    id: "activities",
    number: "03",
    title: "All Activities",
    thaiTitle: "กิจกรรมคลายเครียด",
    description: "ค้นหากิจกรรมที่ช่วยผ่อนคลายทั้งร่างกายและจิตใจ",
    href: "/wellness/activities",
    icon: HeartHandshake,
    color: "blue",
    available: true,
  },
  {
    id: "planner",
    number: "04",
    title: "Personal Break Planner",
    thaiTitle: "วางแผนเวลาพักผ่อน",
    description: "จัดตารางเวลาพักและเลือกกิจกรรมให้เหมาะกับตัวเอง",
    href: "/wellness/planner",
    icon: CalendarClock,
    color: "orange",
    available: true,
  },
];

const colorStyles: Record<string, string> = {
  pink: "bg-pink-50 text-pink-500 border-pink-100",
  purple: "bg-purple-50 text-purple-500 border-purple-100",
  blue: "bg-blue-50 text-blue-500 border-blue-100",
  orange: "bg-orange-50 text-orange-500 border-orange-100",
};

export default function WellnessPage() {
  const [assessmentDone, setAssessmentDone] = useState(false);

  useEffect(() => {
    const completed =
      localStorage.getItem(ASSESSMENT_KEY) === "true";

    setAssessmentDone(completed);
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF8FB] px-4 py-6 md:px-8 md:py-10">

      {/* HEADER */}
      <div className="mx-auto max-w-6xl space-y-2 mb-8">
        <div className="flex items-center gap-2 text-pink-500">
          <HeartPulse size={22} />
          <span className="text-sm font-semibold tracking-wider">
            WELLNESS CENTER
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Wellness & Mental Health
        </h1>

        <p className="text-gray-500">
          พื้นที่ดูแลสุขภาวะและความรู้สึกของคุณ
        </p>
      </div>

      <div className="mx-auto max-w-6xl space-y-8">

        {/* ROBOT WELCOME */}
        <section className="relative overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-r from-pink-100 via-pink-50 to-purple-50 p-6 md:p-10">
          <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row">

            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg">
              <Bot size={72} className="text-pink-400" />
            </div>

            <div className="text-center md:text-left">
              <div className="mb-2 flex items-center justify-center gap-2 text-pink-500 md:justify-start">
                <Sparkles size={18} />
                <span className="text-sm font-semibold">
                  YOUR WELLNESS COMPANION
                </span>
              </div>

              <h2 className="mb-3 text-2xl font-bold text-gray-800">
                Hello! ยินดีต้อนรับสู่ Wellness
              </h2>

              <p className="max-w-xl leading-7 text-gray-600">
                วันนี้คุณรู้สึกอย่างไรบ้าง?
                มาดูแลสุขภาพใจและให้เวลากับตัวเองกันนะ
                ฉันพร้อมเป็นเพื่อนและช่วยแนะนำกิจกรรมให้คุณ
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-pink-200/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-purple-200/30 blur-2xl" />
        </section>

        {/* STATUS */}
        <section className="flex flex-col gap-3 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-pink-50 p-3 text-pink-500">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">
                สถานะการประเมินความเครียด
              </h3>
              <p className="text-sm text-gray-500">
                {assessmentDone
                  ? "คุณทำแบบประเมินเรียบร้อยแล้ว"
                  : "กรุณาทำแบบประเมินก่อนเข้าใช้งาน Chatbot"}
              </p>
            </div>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-xs font-semibold ${
              assessmentDone
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {assessmentDone ? "Assessment Completed" : "Not Completed"}
          </span>
        </section>

        {/* SERVICES */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-800">
              Explore Wellness
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              เลือกฟังก์ชันที่คุณต้องการใช้งาน
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {services.map((service) => {
              const Icon = service.icon;

              const locked =
                service.id === "chatbot" && !assessmentDone;

              return (
                <div
                  key={service.id}
                  className={`group relative rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 ${
                    locked
                      ? "border-gray-200 opacity-75"
                      : "border-pink-100 hover:-translate-y-1 hover:border-pink-300 hover:shadow-lg"
                  }`}
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div
                      className={`rounded-2xl border p-4 ${
                        colorStyles[service.color]
                      }`}
                    >
                      <Icon size={30} />
                    </div>

                    <span className="text-2xl font-bold text-gray-200">
                      {service.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800">
                    {service.title}
                  </h3>

                  <p className="mt-1 font-semibold text-pink-500">
                    {service.thaiTitle}
                  </p>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-gray-500">
                    {service.description}
                  </p>

                  <div className="mt-6">
                    {locked ? (
                      <div className="flex items-center justify-between rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                          <LockKeyhole size={17} />
                          กรุณาประเมินก่อน
                        </span>
                        <span className="text-xs">
                          Locked
                        </span>
                      </div>
                    ) : (
                      <Link
                        href={service.href}
                        className="flex items-center justify-between rounded-xl bg-pink-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-600"
                      >
                        <span>เริ่มใช้งาน</span>
                        <ArrowRight size={18} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </section>

        {/* FOOTER */}
        <footer className="pb-6 pt-4 text-center">
          <p className="text-sm text-gray-400">
            Take a break. Take care of yourself. ♡
          </p>
        </footer>

      </div>
    </main>
  );
}
