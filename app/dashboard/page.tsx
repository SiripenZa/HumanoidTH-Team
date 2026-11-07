import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTranslation } from "@/lib/translations";
import { CATEGORIES, fmtPct, withPercent, type RowWithPct } from "@/lib/dashboardStats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Robotics Ecosystem Dashboard",
  description:
    "Aggregate dashboard for Thailand humanoid robotics records, robot types, sources, contributions, perspective themes, and confidence levels.",
  alternates: { canonical: "/dashboard" },
};

const TOP_N = 5;

type Loaded = { slug: string; rows: RowWithPct[]; total: number };

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "en") as "en" | "th";
  const t = getTranslation(lang);

  let loaded: Loaded[] = [];
  let dbOffline = false;

  try {
    const results = await Promise.all(CATEGORIES.map((c) => c.load()));
    loaded = CATEGORIES.map((c, i) => ({ slug: c.slug, ...withPercent(results[i], c.ordered) }));
  } catch (error) {
    console.error("Database connection failed in dashboard:", error);
    dbOffline = true;
    loaded = CATEGORIES.map((c) => ({ slug: c.slug, rows: [], total: 0 }));
  }

  const by = (slug: string) => loaded.find((l) => l.slug === slug)!;
  const barColor = (r: RowWithPct) => r.color || "var(--accent)";

  // ----- ภาพรวม (Summary) -----
  const kpis = [
    { label: "Robot Models", value: by("robot-categories").total, href: "/dashboard/robot-categories" },
    { label: "Source Records", value: by("source-types").total, href: "/dashboard/source-types" },
    { label: "Contributions", value: by("contribution-types").total, href: "/dashboard/contribution-types" },
    { label: "Perspective Annotations", value: by("perspective-themes").total, href: "/dashboard/perspective-themes" },
  ];

  const highAnn = by("annotation-confidence").rows[0];
  const highSrc = by("source-confidence").rows[0];
  const topOrigin = by("origin-locations").rows[0];
  const topType = by("robot-categories").rows[0];
  const topTheme = by("perspective-themes").rows[0];

  const highlights = [
    topOrigin && { k: "Most common origin", v: topOrigin.label, p: topOrigin.pct },
    topType && { k: "Most common robot type", v: topType.label, p: topType.pct },
    topTheme && { k: "Leading perspective theme", v: topTheme.label, p: topTheme.pct },
    highAnn && by("annotation-confidence").total > 0 && { k: "High-confidence annotations", v: `${highAnn.count}`, p: highAnn.pct },
    highSrc && by("source-confidence").total > 0 && { k: "High-relevance sources", v: `${highSrc.count}`, p: highSrc.pct },
  ].filter(Boolean) as { k: string; v: string; p: number }[];

  const distCats = CATEGORIES.filter((c) => !c.ordered);
  const confCats = CATEGORIES.filter((c) => c.ordered);

  return (
    <>
      <style>{`
        .dash-card-link{color:inherit;text-decoration:none}
        .dash-card-link:hover h2{color:var(--accent)}
        .dash-more{font-size:12px;color:var(--accent);font-weight:600;text-decoration:none}
        .dash-more:hover{text-decoration:underline}
        .dash-kpi{display:block;color:inherit;text-decoration:none;transition:transform .12s ease}
        .dash-kpi:hover{transform:translateY(-2px)}
        @media (prefers-reduced-motion:reduce){.dash-kpi{transition:none}}
      `}</style>

      <div className="topline">
        <div>
          <h1>{t.dashboardTitle}</h1>
          <p className="muted">{t.dashboardDesc}</p>
        </div>
      </div>

      {dbOffline && (
        <div className="notice" style={{ backgroundColor: "#fffbeb", borderLeftColor: "var(--warning)", marginBottom: "16px" }}>
          <strong>Database Offline:</strong> Live PostgreSQL is unavailable. This dashboard is not substituting example records.
        </div>
      )}

      {/* SUMMARY */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "12px" }}>
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="panel dash-kpi">
            <p className="muted" style={{ fontSize: "12px" }}>{k.label}</p>
            <p style={{ fontSize: "30px", fontWeight: 700, margin: "6px 0 2px" }}>{k.value.toLocaleString()}</p>
            <span className="dash-more">View breakdown →</span>
          </Link>
        ))}
      </div>

      {highlights.length > 0 && (
        <section className="panel" style={{ marginTop: "16px" }}>
          <h2>Overview</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginTop: "10px" }}>
            {highlights.map((h) => (
              <div key={h.k}>
                <p className="muted" style={{ fontSize: "12px" }}>{h.k}</p>
                <p style={{ fontSize: "16px", fontWeight: 600, textTransform: "capitalize" }}>
                  {h.v} <span style={{ color: "var(--accent)" }}>· {fmtPct(h.p)}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DISTRIBUTIONS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginTop: "16px" }}>
        {distCats.map((c) => {
          const { rows, total } = by(c.slug);
          const shown = rows.slice(0, TOP_N);
          const rest = rows.slice(TOP_N);
          const restPct = rest.reduce((a, r) => a + r.pct, 0);
          return (
            <section className="panel" key={c.slug}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                <Link href={`/dashboard/${c.slug}`} className="dash-card-link">
                  <h2>{c.title}</h2>
                </Link>
                <span className="muted" style={{ fontSize: "12px" }}>total {total}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
                {shown.map((r) => (
                  <div key={r.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                      <span style={{ textTransform: "capitalize" }}>{r.label}</span>
                      <strong>{fmtPct(r.pct)} <span className="muted" style={{ fontWeight: 400 }}>({r.count})</span></strong>
                    </div>
                    <div style={{ height: "8px", background: "var(--surface-muted)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${r.pct}%`, height: "100%", background: barColor(r) }} />
                    </div>
                  </div>
                ))}
                {rest.length > 0 && (
                  <div className="muted" style={{ fontSize: "12px" }}>
                    + {rest.length} more · {fmtPct(restPct)}
                  </div>
                )}
                {!rows.length && <div className="empty">No statistics available.</div>}
              </div>
              <div style={{ marginTop: "14px" }}>
                <Link href={`/dashboard/${c.slug}`} className="dash-more">View details →</Link>
              </div>
            </section>
          );
        })}
      </div>

      {/* CONFIDENCE */}
      <h2 style={{ marginTop: "24px" }}>Extracted Confidence Distribution</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "12px" }}>
        {confCats.map((c) => {
          const { rows, total } = by(c.slug);
          return (
            <section className="panel" key={c.slug}>
              <Link href={`/dashboard/${c.slug}`} className="dash-card-link">
                <h2>{c.title} (total: {total})</h2>
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                {rows.map((r) => (
                  <div key={r.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                      <span>{r.label}</span>
                      <strong>{fmtPct(r.pct)} <span className="muted" style={{ fontWeight: 400 }}>({r.count})</span></strong>
                    </div>
                    <div style={{ height: "6px", background: "var(--surface-muted)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${r.pct}%`, height: "100%", background: barColor(r) }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "14px" }}>
                <Link href={`/dashboard/${c.slug}`} className="dash-more">View details →</Link>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}