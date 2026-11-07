// lib/dashboardStats.ts
// ตัวโหลดข้อมูลสถิติของแต่ละหัวข้อ ใช้ร่วมกันระหว่างหน้า /dashboard และ /dashboard/[category]
import { prisma } from "@/lib/prisma";

export type Row = { label: string; count: number; color?: string };

export type Category = {
  slug: string;
  title: string;
  desc: string;
  /** true = ลำดับคงที่ (เช่น High/Moderate/Low) ไม่เรียงตามจำนวน */
  ordered?: boolean;
  load: () => Promise<Row[]>;
};

const pretty = (v: unknown) =>
  v === null || v === undefined || v === "" ? "Unknown" : String(v).replace(/_/g, " ");

const fromGroup = (rows: any[], field: string): Row[] =>
  rows.map((r) => ({ label: pretty(r[field]), count: r._count._all }));

export const CATEGORIES: Category[] = [
  {
    slug: "origin-locations",
    title: "Robot Origin Locations",
    desc: "Share of robot models by country of origin.",
    load: async () =>
      fromGroup(await prisma.robotModel.groupBy({ by: ["countryOfOrigin"], _count: { _all: true } }), "countryOfOrigin"),
  },
  {
    slug: "robot-categories",
    title: "Robot Categories",
    desc: "Share of robot models by robot type.",
    load: async () =>
      fromGroup(await prisma.robotModel.groupBy({ by: ["robotType"], _count: { _all: true } }), "robotType"),
  },
  {
    slug: "source-types",
    title: "Source Record Types",
    desc: "Share of source records by source type.",
    load: async () =>
      fromGroup(await prisma.sourceRecord.groupBy({ by: ["sourceType"], _count: { _all: true } }), "sourceType"),
  },
  {
    slug: "embodiment-levels",
    title: "Robot Embodiment Levels",
    desc: "Share of robot models by embodiment level.",
    load: async () =>
      fromGroup(await prisma.robotModel.groupBy({ by: ["embodimentLevel"], _count: { _all: true } }), "embodimentLevel"),
  },
  {
    slug: "contribution-types",
    title: "Contribution Types",
    desc: "Share of contributions by contribution type.",
    load: async () =>
      fromGroup(await prisma.contribution.groupBy({ by: ["contributionType"], _count: { _all: true } }), "contributionType"),
  },
  {
    slug: "perspective-themes",
    title: "Perspective Themes",
    desc: "Share of perspective annotations by theme.",
    load: async () =>
      fromGroup(await prisma.perspectiveAnnotation.groupBy({ by: ["perspectiveTheme"], _count: { _all: true } }), "perspectiveTheme"),
  },
  {
    slug: "annotation-confidence",
    title: "Perspective Annotation Confidence",
    desc: "Distribution of extracted confidence scores for perspective annotations.",
    ordered: true,
    load: async () => {
      const [h, m, l] = await Promise.all([
        prisma.perspectiveAnnotation.count({ where: { confidence: { gte: 0.8 } } }),
        prisma.perspectiveAnnotation.count({ where: { confidence: { gte: 0.5, lt: 0.8 } } }),
        prisma.perspectiveAnnotation.count({ where: { confidence: { lt: 0.5 } } }),
      ]);
      return confidenceRows(h, m, l);
    },
  },
  {
    slug: "source-confidence",
    title: "Source Relevance Confidence",
    desc: "Distribution of relevance confidence scores for source records.",
    ordered: true,
    load: async () => {
      const [h, m, l] = await Promise.all([
        prisma.sourceRecord.count({ where: { relevanceConfidence: { gte: 0.8 } } }),
        prisma.sourceRecord.count({ where: { relevanceConfidence: { gte: 0.5, lt: 0.8 } } }),
        prisma.sourceRecord.count({ where: { relevanceConfidence: { lt: 0.5 } } }),
      ]);
      return confidenceRows(h, m, l);
    },
  },
];

function confidenceRows(h: number, m: number, l: number): Row[] {
  return [
    { label: "High (≥ 0.8)", count: h, color: "var(--success)" },
    { label: "Moderate (0.5–0.8)", count: m, color: "var(--warning)" },
    { label: "Low (< 0.5)", count: l, color: "var(--low-confidence)" },
  ];
}

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

export type RowWithPct = Row & { pct: number };

/** เติมเปอร์เซ็นต์ และเรียงจากมากไปน้อย (ยกเว้นหัวข้อที่ ordered) */
export function withPercent(rows: Row[], ordered = false): { rows: RowWithPct[]; total: number } {
  const total = rows.reduce((a, r) => a + r.count, 0);
  const list = rows.map((r) => ({ ...r, pct: total > 0 ? (r.count / total) * 100 : 0 }));
  if (!ordered) list.sort((a, b) => b.count - a.count);
  return { rows: list, total };
}

export const fmtPct = (n: number) => `${n.toFixed(1)}%`;