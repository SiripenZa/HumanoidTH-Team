import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslation } from "@/lib/translations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Robotics Ecosystem Dashboard",
  description: "Aggregate dashboard for Thailand humanoid robotics records, robot types, sources, contributions, perspective themes, and confidence levels.",
  alternates: { canonical: "/dashboard" }
};

type Lang = "en" | "th";
type Row = { label: string; count: number };

const LABELS = {
  en: {
    locations: "Robot Origin Locations",
    robotTypes: "Robot Categories",
    sourceTypes: "Source Record Types",
    embodiment: "Robot Embodiment Levels",
    contributions: "Contribution Types",
    themes: "Perspective Themes",
    confidenceTitle: "Extracted Confidence Distribution",
    annotations: "Perspective Annotations",
    sources: "Source Relevance Confidence",
    high: "High (Confidence ≥ 0.8)",
    moderate: "Moderate (0.5 ≤ Confidence < 0.8)",
    low: "Low (Confidence < 0.5)",
    unknown: "Unknown",
    empty: "No statistics available.",
    items: "items",
    total: "total",
    offline: "Database Offline:",
    offlineMsg: "Live PostgreSQL is unavailable. This dashboard is not substituting example records."
  },
  th: {
    locations: "ประเทศต้นกำเนิดของหุ่นยนต์",
    robotTypes: "หมวดหมู่หุ่นยนต์",
    sourceTypes: "ประเภทแหล่งข้อมูล",
    embodiment: "ระดับ Embodiment ของหุ่นยนต์",
    contributions: "ประเภทการมีส่วนร่วม",
    themes: "ธีมมุมมอง",
    confidenceTitle: "การกระจายระดับความเชื่อมั่นที่สกัดได้",
    annotations: "Perspective Annotations",
    sources: "ความเชื่อมั่นด้านความเกี่ยวข้องของแหล่งข้อมูล",
    high: "สูง (Confidence ≥ 0.8)",
    moderate: "ปานกลาง (0.5 ≤ Confidence < 0.8)",
    low: "ต่ำ (Confidence < 0.5)",
    unknown: "ไม่ระบุ",
    empty: "ยังไม่มีข้อมูลสถิติ",
    items: "รายการ",
    total: "ทั้งหมด",
    offline: "ฐานข้อมูลออฟไลน์:",
    offlineMsg: "ไม่สามารถเชื่อมต่อ PostgreSQL ได้ แดชบอร์ดนี้จะไม่แทนที่ด้วยข้อมูลตัวอย่าง"
  }
} as const;

// Turn a Prisma groupBy result into rows sorted from highest to lowest count.
function toRows(arr: any[], key: string, unknownLabel: string): Row[] {
  return arr
    .map((item) => ({
      label: String(item[key] ?? unknownLabel).replace(/_/g, " "),
      count: item._count._all as number
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  margin: 0
};

function CardHeader({ title, badge }: { title: string; badge: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        paddingBottom: "12px",
        marginBottom: "14px",
        borderBottom: "1px solid var(--surface-muted)"
      }}
    >
      <h2 style={{ margin: 0, fontSize: "17px" }}>{title}</h2>
      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: "999px",
          background: "var(--surface-muted)",
          whiteSpace: "nowrap"
        }}
      >
        {badge}
      </span>
    </div>
  );
}

function DistributionCard({
  title,
  rows,
  t
}: {
  title: string;
  rows: Row[];
  t: (typeof LABELS)[Lang];
}) {
  const total = rows.reduce((acc, r) => acc + r.count, 0);

  return (
    <section className="panel" style={cardStyle}>
      <CardHeader title={title} badge={`${total.toLocaleString()} ${t.total}`} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          maxHeight: "380px",
          overflowY: "auto",
          paddingRight: "6px"
        }}
      >
        {rows.map((row, index) => {
          const pct = total > 0 ? (row.count / total) * 100 : 0;
          return (
            <div key={row.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                  marginBottom: "5px"
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: index === 0 ? "var(--accent)" : "var(--surface-muted)",
                      color: index === 0 ? "#fff" : "inherit"
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {row.label}
                  </span>
                </span>
                <strong style={{ whiteSpace: "nowrap" }}>
                  {row.count.toLocaleString()} ({pct.toFixed(1)}%)
                </strong>
              </div>
              <div style={{ height: "8px", background: "var(--surface-muted)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)" }} />
              </div>
            </div>
          );
        })}
        {!rows.length && <div className="empty">{t.empty}</div>}
      </div>
    </section>
  );
}

function ConfidenceCard({
  title,
  total,
  buckets,
  t
}: {
  title: string;
  total: number;
  buckets: { label: string; count: number; color: string }[];
  t: (typeof LABELS)[Lang];
}) {
  return (
    <section className="panel" style={cardStyle}>
      <CardHeader title={title} badge={`${total.toLocaleString()} ${t.total}`} />
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {buckets.map((bucket) => {
          const pct = total > 0 ? (bucket.count / total) * 100 : 0;
          return (
            <div key={bucket.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  fontSize: "13px",
                  marginBottom: "5px"
                }}
              >
                <span>{bucket.label}</span>
                <strong style={{ whiteSpace: "nowrap" }}>
                  {bucket.count.toLocaleString()} ({pct.toFixed(1)}%)
                </strong>
              </div>
              <div style={{ height: "8px", background: "var(--surface-muted)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: bucket.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "en") as Lang;
  const tr = getTranslation(lang);
  const t = LABELS[lang] ?? LABELS.en;

  let data = {
    locations: [] as any[],
    robotTypes: [] as any[],
    sourceTypes: [] as any[],
    embodimentLevels: [] as any[],
    contributionTypes: [] as any[],
    themes: [] as any[],
    highConfidenceAnn: 0,
    medConfidenceAnn: 0,
    lowConfidenceAnn: 0,
    highConfidenceSrc: 0,
    medConfidenceSrc: 0,
    lowConfidenceSrc: 0,
    dbOffline: false
  };

  try {
    const [
      locations,
      robotTypes,
      sourceTypes,
      embodimentLevels,
      contributionTypes,
      themes,
      highConfidenceAnn,
      medConfidenceAnn,
      lowConfidenceAnn,
      highConfidenceSrc,
      medConfidenceSrc,
      lowConfidenceSrc
    ] = await Promise.all([
      prisma.robotModel.groupBy({ by: ["countryOfOrigin"], _count: { _all: true } }),
      prisma.robotModel.groupBy({ by: ["robotType"], _count: { _all: true } }),
      prisma.sourceRecord.groupBy({ by: ["sourceType"], _count: { _all: true } }),
      prisma.robotModel.groupBy({ by: ["embodimentLevel"], _count: { _all: true } }),
      prisma.contribution.groupBy({ by: ["contributionType"], _count: { _all: true } }),
      prisma.perspectiveAnnotation.groupBy({ by: ["perspectiveTheme"], _count: { _all: true } }),
      // Confidence buckets
      prisma.perspectiveAnnotation.count({ where: { confidence: { gte: 0.8 } } }),
      prisma.perspectiveAnnotation.count({ where: { confidence: { gte: 0.5, lt: 0.8 } } }),
      prisma.perspectiveAnnotation.count({ where: { confidence: { lt: 0.5 } } }),
      prisma.sourceRecord.count({ where: { relevanceConfidence: { gte: 0.8 } } }),
      prisma.sourceRecord.count({ where: { relevanceConfidence: { gte: 0.5, lt: 0.8 } } }),
      prisma.sourceRecord.count({ where: { relevanceConfidence: { lt: 0.5 } } })
    ]);

    data = {
      locations,
      robotTypes,
      sourceTypes,
      embodimentLevels,
      contributionTypes,
      themes,
      highConfidenceAnn,
      medConfidenceAnn,
      lowConfidenceAnn,
      highConfidenceSrc,
      medConfidenceSrc,
      lowConfidenceSrc,
      dbOffline: false
    };
  } catch (error) {
    console.error("Database connection failed in dashboard:", error);
    data = { ...data, dbOffline: true };
  }

  const totalAnnotations = data.highConfidenceAnn + data.medConfidenceAnn + data.lowConfidenceAnn;
  const totalSources = data.highConfidenceSrc + data.medConfidenceSrc + data.lowConfidenceSrc;

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "16px",
    marginTop: "12px",
    alignItems: "stretch"
  };

  return (
    <>
      <div className="topline">
        <div>
          <h1>{tr.dashboardTitle}</h1>
          <p className="muted">{tr.dashboardDesc}</p>
        </div>
      </div>

      {data.dbOffline && (
        <div className="notice" style={{ backgroundColor: "#fffbeb", borderLeftColor: "var(--warning)", marginBottom: "16px" }}>
          <strong>{t.offline}</strong> {t.offlineMsg}
        </div>
      )}

      <div style={gridStyle}>
        <DistributionCard title={t.locations} rows={toRows(data.locations, "countryOfOrigin", t.unknown)} t={t} />
        <DistributionCard title={t.robotTypes} rows={toRows(data.robotTypes, "robotType", t.unknown)} t={t} />
        <DistributionCard title={t.sourceTypes} rows={toRows(data.sourceTypes, "sourceType", t.unknown)} t={t} />
        <DistributionCard title={t.embodiment} rows={toRows(data.embodimentLevels, "embodimentLevel", t.unknown)} t={t} />
        <DistributionCard title={t.contributions} rows={toRows(data.contributionTypes, "contributionType", t.unknown)} t={t} />
        <DistributionCard title={t.themes} rows={toRows(data.themes, "perspectiveTheme", t.unknown)} t={t} />
      </div>

      <h2 style={{ marginTop: "28px" }}>{t.confidenceTitle}</h2>
      <div style={gridStyle}>
        <ConfidenceCard
          title={t.annotations}
          total={totalAnnotations}
          t={t}
          buckets={[
            { label: t.high, count: data.highConfidenceAnn, color: "var(--success)" },
            { label: t.moderate, count: data.medConfidenceAnn, color: "var(--warning)" },
            { label: t.low, count: data.lowConfidenceAnn, color: "var(--low-confidence)" }
          ]}
        />
        <ConfidenceCard
          title={t.sources}
          total={totalSources}
          t={t}
          buckets={[
            { label: t.high, count: data.highConfidenceSrc, color: "var(--success)" },
            { label: t.moderate, count: data.medConfidenceSrc, color: "var(--warning)" },
            { label: t.low, count: data.lowConfidenceSrc, color: "var(--low-confidence)" }
          ]}
        />
      </div>
    </>
  );
}