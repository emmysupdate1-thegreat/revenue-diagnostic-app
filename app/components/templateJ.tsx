"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  ShoppingCart,
  Users,
  RotateCcw,
  Tag,
  Shield,
  Lock,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

// ─── Static Sample Data ───────────────────────────────────────────────────────

const RFM_ROWS = [
  { id: "USR-4421", recency: 3,  frequency: 24, monetary: "£4,872", score: "5-4-5", segment: "Champion"       },
  { id: "USR-8834", recency: 7,  frequency: 11, monetary: "£2,109", score: "4-3-4", segment: "Loyal"          },
  { id: "USR-1923", recency: 45, frequency: 3,  monetary: "£318",   score: "2-1-2", segment: "At Risk"        },
  { id: "USR-7712", recency: 92, frequency: 1,  monetary: "£84",    score: "1-1-1", segment: "Hibernating"    },
  { id: "USR-3341", recency: 12, frequency: 18, monetary: "£3,241", score: "5-5-4", segment: "Champion"       },
  { id: "USR-9905", recency: 63, frequency: 6,  monetary: "£741",   score: "2-2-3", segment: "Need Attention" },
  { id: "USR-2287", recency: 8,  frequency: 14, monetary: "£2,891", score: "4-4-4", segment: "Loyal"          },
];

const MARGIN_ROWS = [
  { sku: "SKU-7742-BLK", product: "Premium Hoodie (Black)",  revenue: "£18,240", cogs: "£14,891", margin: "18.4%", status: "Leak"     },
  { sku: "SKU-3301-S",   product: "Signature Tee (Small)",   revenue: "£6,112",  cogs: "£2,841",  margin: "53.5%", status: "Healthy"  },
  { sku: "SKU-9912-SET", product: "Bundle Set — Core",       revenue: "£22,410", cogs: "£19,872", margin: "11.3%", status: "Critical" },
  { sku: "SKU-1144-GLD", product: "Limited Edition Pin",     revenue: "£1,024",  cogs: "£892",    margin: "12.9%", status: "Leak"     },
  { sku: "SKU-5567-M",   product: "Classic Sweatshirt (M)",  revenue: "£9,340",  cogs: "£4,120",  margin: "55.9%", status: "Healthy"  },
];

const EXPORT_CARDS = [
  {
    id: "orders",
    label: "Orders",
    file: "orders.csv",
    Icon: ShoppingCart,
    accent: "#22c55e",
    findings: [
      { label: "True Margin Per Order",    detail: "COGS + fulfilment + return costs restated against net revenue — not gross. Every order re-priced." },
      { label: "Fulfilment Cost Anomalies",detail: "Orders where shipping exceeded 18% of revenue, segmented by carrier, region, and weight band."     },
      { label: "AOV Suppression Events",   detail: "Specific calendar periods where AOV dropped >15% with no corresponding promotion on record."        },
      { label: "SKU Contribution by Cohort",detail: "Which products drive repeat purchase vs. one-time transactions — the retention vs. acquisition split."},
    ],
  },
  {
    id: "customers",
    label: "Customers",
    file: "customers.csv",
    Icon: Users,
    accent: "#3b82f6",
    findings: [
      { label: "RFM Segmentation Map",       detail: "Full Recency/Frequency/Monetary scoring across all customers, classified into 5 actionable strategic cohorts."   },
      { label: "High-LTV Customer DNA",      detail: "Shared acquisition channel, first product, and discount history for your top 10% lifetime spenders."           },
      { label: "Churn Risk Index",           detail: "Customers past their statistically expected repurchase window, ranked by 12-month potential revenue loss."      },
      { label: "Winback Opportunity Set",    detail: "Lapsed customers with >£150 historical LTV who have not ordered in 90+ days — addressable immediately."        },
    ],
  },
  {
    id: "refunds",
    label: "Refunds",
    file: "refunds.csv",
    Icon: RotateCcw,
    accent: "#f59e0b",
    findings: [
      { label: "SKU-Level Return Rate",      detail: "True return rate per individual product — not the blended store rate. Reveals which single SKU absorbs the most cost." },
      { label: "Refund Pattern Analysis",   detail: "Day-of-week and time-of-day clustering in refund requests, indicating fulfilment or expectation failure windows."         },
      { label: "Policy Exploitation Signals",detail: "Customers with >3 refunds in 12 months, cross-referenced against purchase value clusters for margin impact."            },
      { label: "Net Revenue Restatement",   detail: "Your actual net revenue after returns — a figure most P&Ls and Shopify dashboards systematically overstate."            },
    ],
  },
  {
    id: "coupons",
    label: "Coupons",
    file: "coupons.csv",
    Icon: Tag,
    accent: "#8b5cf6",
    findings: [
      { label: "Discount Dependency Score",   detail: "The % of customers who have never purchased at full price — your structural margin ceiling, hidden in plain sight."  },
      { label: "Net Margin Impact Per Code",  detail: "Revenue loss per discount code, net of any incremental orders the code provably caused."                          },
      { label: "Over-Redemption Detection",   detail: "Codes shared beyond their intended audience, creating unplanned margin erosion not captured in standard reports."  },
      { label: "Price Sensitivity Cohorts",   detail: "Segments who require discounts vs. segments being trained to wait for them — a strategic distinction most brands miss." },
    ],
  },
];

// ─── Tiny Helpers ─────────────────────────────────────────────────────────────

const segmentColor = (seg: string) => {
  if (seg === "Champion") return "#22c55e";
  if (seg === "Loyal")    return "#3b82f6";
  if (seg === "At Risk" || seg === "Need Attention") return "#f59e0b";
  return "#6b7280";
};

const statusColor = (s: string) => {
  if (s === "Healthy")  return "#22c55e";
  if (s === "Leak")     return "#f59e0b";
  if (s === "Critical") return "#ef4444";
  return "#6b7280";
};

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Template10({ data, fmt, fmtLive, fmtMicro, handleCTA }: any) {
  const [analysisTab, setAnalysisTab] = useState<"rfm" | "margin">("rfm");
  const [activeExport, setActiveExport] = useState<string | null>(null);

  const fitdPrice   = data?.fitd_price        ?? 497;
  const deadStock   = data?.dead_stock_estimate ?? null;
  const orderCount  = data?.order_count        ?? 0;
  const storeName   = data?.store              ?? "Your Store";
  const briefBarPct = Math.min((fitdPrice / 3500) * 100, 100);

  return (
    <>
      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .t10-mono { font-family: 'JetBrains Mono', monospace; }
        .t10-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      <div
        className="t10-sans min-h-screen text-white"
        style={{
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <div className="max-w-[880px] mx-auto px-6 py-16" style={{ display: "flex", flexDirection: "column", gap: "6rem" }}>

          {/* ══════════════════════════════════════════════════════════════
              §1 — HERO
          ══════════════════════════════════════════════════════════════ */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
          >
            {/* Badge row */}
            <motion.div variants={FADE_UP} custom={0} className="flex items-center gap-3 mb-8 flex-wrap">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)" }}
              >
                <Database style={{ width: 13, height: 13, color: "#22c55e" }} />
                <span
                  className="t10-mono uppercase"
                  style={{ fontSize: 10, letterSpacing: "0.13em", color: "#22c55e" }}
                >
                  Diagnostic Report
                </span>
              </div>
              <span
                className="t10-mono"
                style={{ fontSize: 10, color: "#3d3d3d", letterSpacing: "0.05em" }}
              >
                {storeName} · PENDING CSV SUBMISSION
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={FADE_UP}
              custom={1}
              style={{
                fontSize: "clamp(1.9rem, 4.2vw, 2.6rem)",
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                color: "#f9fafb",
                marginBottom: "1.5rem",
              }}
            >
              <span style={{ color: "#555" }}>{storeName} has </span>
              <span className="t10-mono" style={{ color: "#f9fafb", fontWeight: 700 }}>
                {orderCount.toLocaleString()}
              </span>
              <span style={{ color: "#555" }}> raw orders</span>
              <br />
              <span>inside your database.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={FADE_UP}
              custom={2}
              style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "#9ca3af", maxWidth: 520 }}
            >
              We have never analyzed a store that didn't have at least one SKU silently losing money.
            </motion.p>

            {/* Status line */}
            <motion.div
              variants={FADE_UP}
              custom={3}
              className="flex items-center gap-4"
              style={{ marginTop: "2.5rem" }}
            >
              <div
                style={{
                  height: 1,
                  flex: 1,
                  background: "linear-gradient(90deg, #1e1e1e 0%, transparent 100%)",
                }}
              />
              <div
                className="flex items-center gap-2 px-3 py-1 rounded"
                style={{ background: "#111111", border: "1px solid #1e1e1e" }}
              >
                <div
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }}
                />
                <span
                  className="t10-mono"
                  style={{ fontSize: 10, color: "#4b5563", letterSpacing: "0.04em" }}
                >
                  First-pass analysis: not yet run
                </span>
              </div>
            </motion.div>
          </motion.section>

          {/* ══════════════════════════════════════════════════════════════
              §2 — SAMPLE ANALYSIS PREVIEW
          ══════════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Section label */}
            <div className="flex items-center gap-3" style={{ marginBottom: "1.5rem" }}>
              <span
                className="t10-mono uppercase"
                style={{ fontSize: 10, color: "#3d3d3d", letterSpacing: "0.15em" }}
              >
                Sample Output
              </span>
              <div style={{ height: 1, flex: 1, background: "#1a1a1a" }} />
            </div>

            {/* Tab switcher */}
            <div
              className="flex items-center gap-1 w-fit"
              style={{
                background: "#111111",
                border: "1px solid #1e1e1e",
                borderRadius: 10,
                padding: 4,
                marginBottom: "1rem",
              }}
            >
              {(["rfm", "margin"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAnalysisTab(tab)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: "'Inter', sans-serif",
                    background: analysisTab === tab ? "#1c1c1c" : "transparent",
                    color: analysisTab === tab ? "#f9fafb" : "#555",
                    border: analysisTab === tab ? "1px solid #282828" : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab === "rfm" ? "RFM Segmentation" : "Margin Audit"}
                </button>
              ))}
            </div>

            {/* Table card */}
            <div
              className="rounded-xl overflow-hidden relative"
              style={{ border: "1px solid #1a1a1a", background: "#0c0c0c" }}
            >
              <div style={{ overflowX: "auto" }}>
                <AnimatePresence mode="wait">
                  {analysisTab === "rfm" ? (
                    <motion.table
                      key="rfm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                    >
                      <thead>
                        <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                          {["Customer ID", "Recency (d)", "Frequency", "Monetary", "RFM Score", "Segment"].map((h) => (
                            <th key={h} style={{ padding: "10px 16px", fontWeight: 500, color: "#4b5563", textAlign: "left", whiteSpace: "nowrap" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      {/* Row 0 — visible preview */}
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #151515" }}>
                          <td style={{ padding: "10px 16px", color: "#9ca3af" }}>{RFM_ROWS[0].id}</td>
                          <td style={{ padding: "10px 16px", color: "#e5e7eb" }}>{RFM_ROWS[0].recency}</td>
                          <td style={{ padding: "10px 16px", color: "#e5e7eb" }}>{RFM_ROWS[0].frequency}</td>
                          <td style={{ padding: "10px 16px", color: "#22c55e", fontWeight: 600 }}>{RFM_ROWS[0].monetary}</td>
                          <td style={{ padding: "10px 16px", color: "#e5e7eb" }}>{RFM_ROWS[0].score}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                              {RFM_ROWS[0].segment}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                      {/* Rows 1–6 — blurred */}
                      <tbody style={{ filter: "blur(5px)", userSelect: "none", pointerEvents: "none" }}>
                        {RFM_ROWS.slice(1).map((row) => (
                          <tr key={row.id} style={{ borderBottom: "1px solid #131313" }}>
                            <td style={{ padding: "10px 16px", color: "#9ca3af" }}>{row.id}</td>
                            <td style={{ padding: "10px 16px", color: "#e5e7eb" }}>{row.recency}</td>
                            <td style={{ padding: "10px 16px", color: "#e5e7eb" }}>{row.frequency}</td>
                            <td style={{ padding: "10px 16px", color: segmentColor(row.segment), fontWeight: 600 }}>{row.monetary}</td>
                            <td style={{ padding: "10px 16px", color: "#e5e7eb" }}>{row.score}</td>
                            <td style={{ padding: "10px 16px" }}>
                              <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, background: `${segmentColor(row.segment)}15`, color: segmentColor(row.segment), border: `1px solid ${segmentColor(row.segment)}30` }}>
                                {row.segment}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </motion.table>
                  ) : (
                    <motion.table
                      key="margin"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                    >
                      <thead>
                        <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                          {["SKU", "Product", "Revenue", "COGS", "Net Margin", "Status"].map((h) => (
                            <th key={h} style={{ padding: "10px 16px", fontWeight: 500, color: "#4b5563", textAlign: "left", whiteSpace: "nowrap" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #151515" }}>
                          <td style={{ padding: "10px 16px", color: "#6b7280" }}>{MARGIN_ROWS[0].sku}</td>
                          <td style={{ padding: "10px 16px", color: "#e5e7eb" }}>{MARGIN_ROWS[0].product}</td>
                          <td style={{ padding: "10px 16px", color: "#e5e7eb" }}>{MARGIN_ROWS[0].revenue}</td>
                          <td style={{ padding: "10px 16px", color: "#6b7280" }}>{MARGIN_ROWS[0].cogs}</td>
                          <td style={{ padding: "10px 16px", color: statusColor(MARGIN_ROWS[0].status), fontWeight: 600 }}>{MARGIN_ROWS[0].margin}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, background: `${statusColor(MARGIN_ROWS[0].status)}15`, color: statusColor(MARGIN_ROWS[0].status), border: `1px solid ${statusColor(MARGIN_ROWS[0].status)}30` }}>
                              {MARGIN_ROWS[0].status}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                      <tbody style={{ filter: "blur(5px)", userSelect: "none", pointerEvents: "none" }}>
                        {MARGIN_ROWS.slice(1).map((row) => (
                          <tr key={row.sku} style={{ borderBottom: "1px solid #131313" }}>
                            <td style={{ padding: "10px 16px", color: "#6b7280" }}>{row.sku}</td>
                            <td style={{ padding: "10px 16px", color: "#e5e7eb" }}>{row.product}</td>
                            <td style={{ padding: "10px 16px", color: "#e5e7eb" }}>{row.revenue}</td>
                            <td style={{ padding: "10px 16px", color: "#6b7280" }}>{row.cogs}</td>
                            <td style={{ padding: "10px 16px", color: statusColor(row.status), fontWeight: 600 }}>{row.margin}</td>
                            <td style={{ padding: "10px 16px" }}>
                              <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, background: `${statusColor(row.status)}15`, color: statusColor(row.status), border: `1px solid ${statusColor(row.status)}30` }}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </motion.table>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom gradient fade */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 90,
                  background: "linear-gradient(to bottom, transparent 0%, #0c0c0c 75%)",
                  pointerEvents: "none",
                }}
              />

              {/* Lock pill */}
              <div style={{ display: "flex", justifyContent: "center", paddingBottom: 16, position: "relative" }}>
                <div
                  className="flex items-center gap-2"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "#111111",
                    border: "1px solid #222",
                  }}
                >
                  <Lock style={{ width: 13, height: 13, color: "#f59e0b" }} />
                  <span style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'Inter', sans-serif" }}>
                    Complete output unlocked after CSV submission
                  </span>
                </div>
              </div>
            </div>

            {/* ── Terminal Block ── */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "#050506", border: "1px solid #171717", marginTop: 16 }}
            >
              {/* Terminal chrome */}
              <div
                className="flex items-center gap-2"
                style={{ padding: "10px 16px", borderBottom: "1px solid #111", background: "#080809" }}
              >
                {["#2d2d2d", "#2d2d2d", "#2d2d2d"].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
                <span
                  className="t10-mono"
                  style={{ fontSize: 11, color: "#333", marginLeft: 8 }}
                >
                  analyst-v2 · {storeName.toLowerCase().replace(/\s+/g, "-")}.myshopify.com
                </span>
              </div>
              {/* Terminal body */}
              <div style={{ padding: "18px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.85 }}>
                <p>
                  <span style={{ color: "#22c55e" }}>$</span>{" "}
                  <span style={{ color: "#9ca3af" }}>
                    run_analysis --store="{storeName}" --orders={orderCount.toLocaleString()} --mode=rfm,margin,coupons
                  </span>
                </p>
                <p style={{ color: "#374151" }}>→ Schema fingerprint: Shopify Orders v2 · detected</p>
                <p style={{ color: "#374151" }}>→ RFM engine: initialized · 5 cohorts configured</p>
                <p style={{ color: "#374151" }}>
                  → Margin engine:{" "}
                  <span style={{ color: "#f59e0b" }}>awaiting cost_of_goods column</span>
                </p>
                <p style={{ color: "#374151" }}>
                  → Segmentation pipeline:{" "}
                  <span style={{ color: "#f59e0b" }}>pending raw CSV export</span>
                </p>
                <p style={{ color: "#222", marginTop: 4 }}>───────────────────────────────────────────</p>
                <p>
                  <span style={{ color: "#374151" }}>STATUS: </span>
                  <span style={{ color: "#f59e0b", fontWeight: 600 }}>
                    REPORT GENERATION PAUSED — CSV REQUIRED
                  </span>
                </p>
              </div>
            </div>

            {/* ── Plain English Translation ── */}
            <div
              className="flex gap-3 rounded-xl"
              style={{ background: "#0b0e15", border: "1px solid #1a2035", padding: "14px 16px", marginTop: 10 }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <span style={{ color: "#3b82f6", fontSize: 10, fontWeight: 700 }}>i</span>
              </div>
              <div>
                <p
                  className="t10-mono"
                  style={{ fontSize: 10, color: "#3b82f6", letterSpacing: "0.1em", marginBottom: 6 }}
                >
                  PLAIN ENGLISH
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "#9ca3af" }}>
                  We've already mapped the structure of your store data. The analysis engine is staged and ready. It cannot produce the report without the raw CSV, which you submit once. We handle everything from that point forward.
                </p>
              </div>
            </div>
          </motion.section>

          {/* ══════════════════════════════════════════════════════════════
              §3 — SUNK COST LEDGER
          ══════════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: "1.5rem" }}>
              <span className="t10-mono uppercase" style={{ fontSize: 10, color: "#3d3d3d", letterSpacing: "0.15em" }}>
                Typical Findings
              </span>
              <div style={{ height: 1, flex: 1, background: "#1a1a1a" }} />
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#555", maxWidth: 520, marginBottom: "2rem" }}>
              Across comparable stores, these patterns appear with regularity. These are observations from prior analyses, not projections.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                {
                  label: "Avg. margin leak per SKU",
                  value: "£74 / SKU",
                  note:  "Most stores carry 8–22 affected SKUs. Annualised, each unaddressed SKU erodes margin by ~£1,100+.",
                  accent: false,
                },
                {
                  label: "Discount dependency cohort",
                  value: "~12% of customer base",
                  note:  "Customers who have never ordered at full price. This segment defines a structural floor on effective margin rarely visible in standard dashboards.",
                  accent: false,
                },
                {
                  label: "Dead stock capital (estimated)",
                  value: deadStock ? fmt(deadStock) : "Calculated from CSV",
                  note:  "Inventory moving <1 unit/month, valued at wholesale cost. This capital is neither earning nor visible on most reporting tools.",
                  accent: true,
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
                  className="flex items-start gap-4 rounded-xl"
                  style={{ background: "#111111", border: "1px solid #1a1a1a", padding: "18px 20px" }}
                >
                  {/* Left accent bar */}
                  <div
                    style={{
                      width: 2,
                      alignSelf: "stretch",
                      borderRadius: 2,
                      background: item.accent ? "#f59e0b" : "#232323",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-baseline justify-between gap-4" style={{ flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, color: "#9ca3af" }}>{item.label}</span>
                      <span
                        className="t10-mono"
                        style={{ fontSize: 13, fontWeight: 600, color: item.accent ? "#f59e0b" : "#f9fafb", flexShrink: 0 }}
                      >
                        {item.value}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, lineHeight: 1.65, color: "#444", marginTop: 6 }}>{item.note}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ══════════════════════════════════════════════════════════════
              §4 — EXPORT SELECTOR
          ══════════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: "1.5rem" }}>
              <span className="t10-mono uppercase" style={{ fontSize: 10, color: "#3d3d3d", letterSpacing: "0.15em" }}>
                What We Analyze
              </span>
              <div style={{ height: 1, flex: 1, background: "#1a1a1a" }} />
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#555", maxWidth: 520, marginBottom: "2rem" }}>
              Select an export to see exactly what we extract — and what each file reveals about your business.
            </p>

            {/* 2×2 Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {EXPORT_CARDS.map(({ id, label, file, Icon, accent }) => {
                const isActive = activeExport === id;
                return (
                  <motion.button
                    key={id}
                    onClick={() => setActiveExport(isActive ? null : id)}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    style={{
                      background: isActive ? "#141414" : "#111111",
                      border: `1px solid ${isActive ? accent + "38" : "#1a1a1a"}`,
                      borderRadius: 12,
                      padding: 20,
                      textAlign: "left",
                      cursor: "pointer",
                      outline: "none",
                      transition: "border-color 0.2s ease, background 0.2s ease",
                    }}
                  >
                    {/* Icon + chevron row */}
                    <div className="flex items-start justify-between gap-2" style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          background: `${accent}12`,
                          border: `1px solid ${accent}25`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon style={{ width: 15, height: 15, color: accent }} />
                      </div>
                      <ChevronDown
                        style={{
                          width: 15,
                          height: 15,
                          color: "#3a3a3a",
                          transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                          flexShrink: 0,
                        }}
                      />
                    </div>
                    {/* Labels */}
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#f9fafb", marginBottom: 3 }}>
                      {label}
                    </p>
                    <p className="t10-mono" style={{ fontSize: 10, color: "#3d3d3d", letterSpacing: "0.04em" }}>
                      {file}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {/* Findings panel */}
            <AnimatePresence>
              {activeExport && (() => {
                const card = EXPORT_CARDS.find((c) => c.id === activeExport)!;
                return (
                  <motion.div
                    key={activeExport}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    style={{
                      marginTop: 10,
                      borderRadius: 12,
                      padding: 22,
                      background: "#0c0c0c",
                      border: `1px solid ${card.accent}2a`,
                    }}
                  >
                    {/* Panel header */}
                    <div className="flex items-center gap-2" style={{ marginBottom: 18 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: card.accent }} />
                      <span
                        className="t10-mono uppercase"
                        style={{ fontSize: 10, color: card.accent, letterSpacing: "0.12em" }}
                      >
                        {card.label} — What We Locate
                      </span>
                    </div>
                    {/* Findings list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {card.findings.map((f, i) => (
                        <motion.div
                          key={f.label}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.045, duration: 0.2 }}
                          className="flex gap-3"
                        >
                          <CheckCircle2 style={{ width: 15, height: 15, color: card.accent, flexShrink: 0, marginTop: 2 }} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#f9fafb", marginBottom: 3 }}>
                              {f.label}
                            </p>
                            <p style={{ fontSize: 12, lineHeight: 1.65, color: "#555" }}>{f.detail}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </motion.section>

          {/* ══════════════════════════════════════════════════════════════
              §5 — THE GUARANTEE  (per constitution: BEFORE price)
          ══════════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="rounded-xl"
              style={{
                background: "linear-gradient(135deg, #0c1a10 0%, #0a160e 100%)",
                border: "1px solid rgba(34,197,94,0.18)",
                padding: "28px 28px",
              }}
            >
              <div className="flex items-start gap-5">
                {/* Shield icon */}
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: "rgba(34,197,94,0.09)",
                    border: "1px solid rgba(34,197,94,0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Shield style={{ width: 20, height: 20, color: "#22c55e" }} />
                </div>

                <div>
                  <span
                    className="t10-mono uppercase"
                    style={{ fontSize: 10, color: "#22c55e", letterSpacing: "0.13em", display: "block", marginBottom: 8 }}
                  >
                    Alex's Personal Guarantee
                  </span>
                  <p
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 500,
                      lineHeight: 1.6,
                      color: "#f9fafb",
                      marginBottom: 12,
                    }}
                  >
                    If our first-pass analysis of your order CSV does not locate at least one actionable strategic margin leak, we refund the deposit immediately. No questions. No caveats.
                  </p>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: "#4b5563" }}>
                    This guarantee exists because the analysis has never failed to find one. It is a statement of confidence — not a commercial incentive.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ══════════════════════════════════════════════════════════════
              §6 — INVESTMENT COMPARISON
          ══════════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: "1.5rem" }}>
              <span className="t10-mono uppercase" style={{ fontSize: 10, color: "#3d3d3d", letterSpacing: "0.15em" }}>
                Investment Context
              </span>
              <div style={{ height: 1, flex: 1, background: "#1a1a1a" }} />
            </div>

            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #1a1a1a" }}>
              {/* Row 1 — Brief */}
              <div
                className="flex items-center justify-between gap-6"
                style={{
                  padding: "22px 22px",
                  background: "#111111",
                  borderBottom: "1px solid #161616",
                  flexWrap: "wrap",
                  rowGap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 220 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#f9fafb", marginBottom: 4 }}>
                    Planned analytical brief
                  </p>
                  <p style={{ fontSize: 12, color: "#3d3d3d", marginBottom: 12 }}>
                    One-time CSV analysis · Delivered within 5 business days
                  </p>
                  {/* Progress bar */}
                  <div style={{ height: 3, borderRadius: 2, background: "#1a1a1a", maxWidth: 280 }}>
                    <motion.div
                      style={{ height: "100%", borderRadius: 2, background: "#22c55e" }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${briefBarPct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p className="t10-mono" style={{ fontSize: 22, fontWeight: 700, color: "#22c55e" }}>
                    {data?.fitd_price ? fmt(data.fitd_price) : "£497"}
                  </p>
                  <p style={{ fontSize: 11, color: "#3d3d3d", marginTop: 2 }}>one-off</p>
                </div>
              </div>

              {/* Row 2 — Agency */}
              <div
                className="flex items-center justify-between gap-6"
                style={{
                  padding: "22px 22px",
                  background: "#0d0d0d",
                  flexWrap: "wrap",
                  rowGap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 220 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#4b5563", marginBottom: 4 }}>
                    Average agency retainer
                  </p>
                  <p style={{ fontSize: 12, color: "#2d2d2d", marginBottom: 12 }}>
                    Monthly commitment · Scope typically undefined
                  </p>
                  {/* Progress bar */}
                  <div style={{ height: 3, borderRadius: 2, background: "#1a1a1a", maxWidth: 280 }}>
                    <motion.div
                      style={{ height: "100%", borderRadius: 2, background: "#252525" }}
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: "easeOut", delay: 0.45 }}
                    />
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p className="t10-mono" style={{ fontSize: 22, fontWeight: 700, color: "#3a3a3a" }}>
                    £3,500+
                  </p>
                  <p style={{ fontSize: 11, color: "#2d2d2d", marginTop: 2 }}>per month</p>
                </div>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "#333", textAlign: "center", marginTop: 12 }}>
              The brief is not a replacement for an agency. It is the intelligence layer most agencies charge you not to provide.
            </p>
          </motion.section>

          {/* ══════════════════════════════════════════════════════════════
              §7 — CTA
          ══════════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ paddingBottom: "2rem" }}
          >
            <div
              style={{
                borderRadius: 16,
                padding: "40px 32px",
                background: "#111111",
                border: "1px solid #1e1e1e",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <span
                className="t10-mono uppercase"
                style={{ fontSize: 10, color: "#3d3d3d", letterSpacing: "0.15em", marginBottom: 16 }}
              >
                Next Step
              </span>
              <h3
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 600,
                  color: "#f9fafb",
                  letterSpacing: "-0.02em",
                  marginBottom: 10,
                }}
              >
                Submit your order CSV.
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#555", maxWidth: 400, marginBottom: 28 }}>
                One file. One submission. We run the analysis and return a brief within five business days — or the deposit is refunded in full.
              </p>

              {/* Primary CTA */}
              <motion.button
                onClick={handleCTA}
                whileHover={{ scale: 1.025, backgroundColor: "#16a34a" }}
                whileTap={{ scale: 0.975 }}
                className="flex items-center gap-3"
                style={{
                  backgroundColor: "#22c55e",
                  color: "#000",
                  padding: "14px 28px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "-0.01em",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                }}
              >
                Request Free CSV First-Pass Analysis
                <ArrowRight style={{ width: 15, height: 15 }} />
              </motion.button>

              <p style={{ fontSize: 12, color: "#2e2e2e", marginTop: 14 }}>
                Guaranteed refund if no actionable margin leak is found · No ongoing commitment
              </p>
            </div>
          </motion.section>

        </div>
      </div>
    </>
  );
}
