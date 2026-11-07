import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, fmtPct, getCategory, withPercent } from "@/lib/dashboardStats";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  return {
    title: c ? `${c.title} | Robotics Ecosystem Dashboard` : "Dashboard",
    description: c?.desc,
    alternates: { canonical: `/dashboard/${category}` },
  };
}

export default async function DashboardDetailPage({ params }: Props) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  let rows: ReturnType<typeof withPercent>["rows"] = [];
  let total = 0;
  let dbOffline = false;
  try {
    ({ rows, total } = withPercent(await cat.load(), cat.ordered));
  } catch (error) {
    console.error(`Database connection failed in dashboard/${category}:`, error);
    dbOffline = true;
  }

  const top = rows[0];
  const colorOf = (i: number, color?: string) =>
    color || `color-mix(in srgb, var(--accent) ${Math.max(35, 100 - i * 12)}%, transparent)`;

  return (
    <>
      <style>{`
        .dd-back{font-size:13px;color:var(--accent);font-weight:600;text-decoration:none}
        .dd-back:hover{text-decoration:underline}
        .dd-chip{display:inline-block;padding:6px 12px;border-radius:999px;border:1px solid var(--surface-muted);font-size:12px;color:inherit;text-decoration:none}
        .dd-chip:hover{border-color:var(--accent);color:var(--accent)}
        .dd-chip[aria-current="page"]{background:var(--accent);color:#fff;border-color:var(--accent)}
        .dd-table{width:100%;border-collapse:collapse;font-size:13px}
        .dd-table th{text-align:left;font-weight:600;padding:8px 10px;border-bottom:1px solid var(--surface-muted);font-size:12px}
        .dd-table td{padding:10px;border-bottom:1px solid var(--surface-muted);vertical-align:middle}
        .dd-table .num{text-align:right;white-space:nowrap}
      `}</style>

      <div className="topline">
        <div>
          <p style={{ marginBottom: "6px" }}>
            <Link href="/dashboard" className="dd-back">← Back to Dashboard</Link>
          </p>
          <h1>{cat.title}</h1>
          <p className="muted">{cat.desc}</p>
        </div>
      </div>

      {dbOffline && (
        <div className="notice" style={{ backgroundColor: "#fffbeb", borderLeftColor: "var(--warning)", marginBottom: "16px" }}>
          <strong>Database Offline:</strong> Live PostgreSQL is unavailable. This page is not substituting example records.
        </div>
      )}

      {/* หัวข้ออื่น */}
      <nav aria-label="Dashboard topics" style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "12px 0 16px" }}>
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/dashboard/${c.slug}`} className="dd-chip" aria-current={c.slug === cat.slug ? "page" : undefined}>
            {c.title}
          </Link>
        ))}
      </nav>

      {/* สรุป */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <section className="panel">
          <p className="muted" style={{ fontSize: "12px" }}>Total records</p>
          <p style={{ fontSize: "28px", fontWeight: 700 }}>{total.toLocaleString()}</p>
        </section>
        <section className="panel">
          <p className="muted" style={{ fontSize: "12px" }}>Distinct groups</p>
          <p style={{ fontSize: "28px", fontWeight: 700 }}>{rows.length}</p>
        </section>
        <section className="panel">
          <p className="muted" style={{ fontSize: "12px" }}>{cat.ordered ? "Highest confidence share" : "Largest group"}</p>
          <p style={{ fontSize: "18px", fontWeight: 700, textTransform: "capitalize" }}>
            {top ? top.label : "—"}
          </p>
          <p style={{ color: "var(--accent)", fontWeight: 600 }}>{top ? fmtPct(top.pct) : ""}</p>
        </section>
      </div>

      {/* แถบสัดส่วนรวม */}
      {total > 0 && (
        <section className="panel" style={{ marginTop: "16px" }}>
          <h2>Overall proportion</h2>
          <div
            role="img"
            aria-label={rows.map((r) => `${r.label} ${fmtPct(r.pct)}`).join(", ")}
            style={{ display: "flex", height: "16px", borderRadius: "8px", overflow: "hidden", marginTop: "10px", background: "var(--surface-muted)" }}
          >
            {rows.map((r, i) => (
              <div key={r.label} title={`${r.label}: ${fmtPct(r.pct)}`} style={{ width: `${r.pct}%`, background: colorOf(i, r.color) }} />
            ))}
          </div>
        </section>
      )}

      {/* ตารางรายละเอียด */}
      <section className="panel" style={{ marginTop: "16px", overflowX: "auto" }}>
        <h2>Breakdown</h2>
        {rows.length ? (
          <table className="dd-table" style={{ marginTop: "8px" }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Group</th>
                <th style={{ width: "40%" }}>Share</th>
                <th className="num">Percent</th>
                <th className="num">Count</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label}>
                  <td className="muted">{i + 1}</td>
                  <td style={{ textTransform: "capitalize" }}>{r.label}</td>
                  <td>
                    <div style={{ height: "8px", background: "var(--surface-muted)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${r.pct}%`, height: "100%", background: r.color || "var(--accent)" }} />
                    </div>
                  </td>
                  <td className="num"><strong>{fmtPct(r.pct)}</strong></td>
                  <td className="num muted">{r.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No statistics available.</div>
        )}
      </section>
    </>
  );
}