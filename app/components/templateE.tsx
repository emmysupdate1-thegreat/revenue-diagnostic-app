"use client";

/**
 * Template5.tsx — Speed Tax / Core Web Vitals Forensic Revenue Dashboard
 *
 * Expected `data` shape:
 * {
 *   store:                string;   // e.g. "acme.com"
 *   load_time:            number;   // seconds, e.g. 4.2
 *   performance_score:    number;   // 0–100, e.g. 34
 *   fcp:                  number;   // seconds, e.g. 3.2
 *   lcp:                  number;   // seconds, e.g. 5.8
 *   inp:                  number;   // ms, e.g. 450
 *   cls:                  number;   // score, e.g. 0.24
 *   ttfb:                 number;   // ms, e.g. 980  (optional)
 *   monthly_sessions:     number;   // e.g. 48000
 *   aov:                  number;   // dollars, e.g. 85
 *   base_conversion_rate: number;   // decimal, e.g. 0.028
 *   annual_speed_loss:    number;   // dollars, precomputed
 *   audit_cost?:          number;   // dollars, e.g. 2500
 * }
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Shield,
  Lock,
  DollarSign,
  Gauge,
  ArrowRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Terminal-style recon block */
function ReconBlock({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-6 mb-3"
      style={{ background: "#060606", border: "1px solid #181818" }}
    >
      {/* Traffic lights */}
      <div className="flex items-center gap-2 mb-4">
        {(["#ef4444", "#f59e0b", "#22c55e"] as const).map((c) => (
          <div
            key={c}
            className="w-3 h-3 rounded-full"
            style={{ background: c }}
          />
        ))}
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            color: "#374151",
            marginLeft: "10px",
            letterSpacing: "0.08em",
          }}
        >
          {children}
        </span>
      </div>
    </div>
  );
}

/** Plain-English translation block (Authority → accessibility bridge) */
function PlainEnglish({
  emoji,
  children,
}: {
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg p-4 mb-5"
      style={{
        background: "rgba(245,158,11,0.045)",
        border: "1px solid rgba(245,158,11,0.22)",
        borderLeft: "4px solid #f59e0b",
      }}
    >
      <div className="flex items-start gap-3">
        <span style={{ fontSize: "16px", flexShrink: 0, lineHeight: "1.4" }}>
          {emoji}
        </span>
        <div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#f59e0b",
              letterSpacing: "0.14em",
              marginBottom: "7px",
            }}
          >
            PLAIN ENGLISH
          </div>
          <div style={{ fontSize: "13px", color: "#d1d5db", lineHeight: 1.7 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function Template5({
  data,
  fmt,
  fmtLive,
  fmtMicro,
  handleCTA,
}: any) {
  // ── Fallback formatters ────────────────────────────────────────────────────
  const $fmt =
    fmt ?? ((n: number) => `$${Math.round(n).toLocaleString("en-US")}`);

  // ── Destructure data with safe fallbacks ──────────────────────────────────
  const store: string = data?.store ?? "YourStore.com";
  const loadTime: number = data?.load_time ?? 4.2;
  const perfScore: number = data?.performance_score ?? 34;
  const fcp: number = data?.fcp ?? 3.2;
  const lcp: number = data?.lcp ?? 5.8;
  const inp: number = data?.inp ?? 450;
  const cls: number = data?.cls ?? 0.24;
  const ttfb: number = data?.ttfb ?? 980;
  const monthlySessions: number = data?.monthly_sessions ?? 48000;
  const aov: number = data?.aov ?? 85;
  const baseCvr: number = data?.base_conversion_rate ?? 0.028;
  const annualSpeedLoss: number = data?.annual_speed_loss ?? 0;
  const auditCost: number = data?.audit_cost ?? 2500;

  // ── Core penalty math ─────────────────────────────────────────────────────
  const penaltySeconds = Math.max(0, loadTime - 2.3);
  const conversionPenaltyRate = penaltySeconds * 0.07;            // 7%/s rule
  const penaltyPct = Math.min(conversionPenaltyRate * 100, 49);   // cap 49%

  // ── Live counter math ─────────────────────────────────────────────────────
  const dailySessions = monthlySessions / 30;
  const lostConvsPerDay = dailySessions * baseCvr * conversionPenaltyRate;
  const lostRevPerDay = lostConvsPerDay * aov;
  const lostRevPerSec = lostRevPerDay / 86400;
  const lostConvsPerSec = lostConvsPerDay / 86400;

  const getMidnightElapsed = () => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    return (Date.now() - midnight.getTime()) / 1000;
  };

  // ── State: live counters start from midnight, not zero ─────────────────────
  const [revLost, setRevLost] = useState(() => getMidnightElapsed() * lostRevPerSec);
  const [convsLost, setConvsLost] = useState(() => getMidnightElapsed() * lostConvsPerSec);
  const [secondsToday, setSecondsToday] = useState(() => getMidnightElapsed());

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = getMidnightElapsed();
      setSecondsToday(elapsed);
      setRevLost(elapsed * lostRevPerSec);
      setConvsLost(elapsed * lostConvsPerSec);
    }, 80); // 80 ms — smooth without thrashing
    return () => clearInterval(id);
  }, [lostRevPerSec, lostConvsPerSec]);

  // ── Speedometer data (7%/s CVR penalty model) ─────────────────────────────
  const speedPoints = [
    { time: 1.0, label: "1s",   cvr: 100, xPct: 0     },
    { time: 2.3, label: "2.3s", cvr: 100, xPct: 21.7  },
    { time: 3.0, label: "3s",   cvr: 95,  xPct: 33.3  },
    { time: 4.0, label: "4s",   cvr: 88,  xPct: 50.0  },
    { time: 5.0, label: "5s",   cvr: 81,  xPct: 66.7  },
    { time: 6.0, label: "6s",   cvr: 74,  xPct: 83.3  },
    { time: 7.0, label: "7s+",  cvr: 67,  xPct: 100   },
  ];

  const markerPct = Math.min(
    Math.max(((loadTime - 1.0) / (7.0 - 1.0)) * 100, 0),
    100
  );

  // ── PageSpeed metric config ───────────────────────────────────────────────
  const metrics = [
    { label: "First Contentful Paint", abbr: "FCP",  val: `${fcp}s`,    raw: fcp,  good: 1.8, poor: 3.0  },
    { label: "Largest Contentful Paint", abbr: "LCP", val: `${lcp}s`,   raw: lcp,  good: 2.5, poor: 4.0  },
    { label: "Interaction to Next Paint", abbr: "INP", val: `${inp}ms`, raw: inp,  good: 200, poor: 500  },
    { label: "Cumulative Layout Shift",  abbr: "CLS",  val: `${cls}`,   raw: cls,  good: 0.1, poor: 0.25 },
  ];

  const metricColor = (raw: number, good: number, poor: number) =>
    raw <= good ? "#22c55e" : raw >= poor ? "#ef4444" : "#f59e0b";
  const metricLabel = (raw: number, good: number, poor: number) =>
    raw <= good ? "Good" : raw >= poor ? "Poor" : "Needs Improvement";

  // ── Perf score dial ───────────────────────────────────────────────────────
  const perfColor =
    perfScore >= 90 ? "#22c55e" : perfScore >= 50 ? "#f59e0b" : "#ef4444";
  const circleR = 30;
  const circleC = 2 * Math.PI * circleR;

  // ── ROI ───────────────────────────────────────────────────────────────────
  const roi = Math.round(annualSpeedLoss / auditCost);

  // ── Zone for speedometer ─────────────────────────────────────────────────
  const zone =
    loadTime <= 2.3 ? "fast" : loadTime <= 4.0 ? "friction" : "danger";

  // ── Stagger helper ────────────────────────────────────────────────────────
  const s = (i: number, base = 0) => ({ delay: base + i * 0.08, duration: 0.6 });

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Google Fonts ────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;900&display=swap');
        .t5 { font-family: 'Inter', system-ui, sans-serif; }
        .t5-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .t5-scanline {
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(255,255,255,0.007) 3px,
            rgba(255,255,255,0.007) 4px
          );
        }
        @keyframes t5-breathe {
          0%, 100% { opacity: 0.04; transform: scale(1); }
          50%       { opacity: 0.08; transform: scale(1.6); }
        }
        @keyframes t5-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
        @keyframes t5-shimmer {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
        .t5-shimmer {
          animation: t5-shimmer 2.8s ease-in-out infinite;
          animation-delay: 0.6s;
        }
      `}</style>

      <div
        className="t5 t5-scanline min-h-screen w-full"
        style={{ background: "#0a0a0a", color: "#fff" }}
      >
        <div className="relative max-w-4xl mx-auto px-5 py-14 space-y-8">

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* § 1 — HERO                                                      */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Recon label */}
            <div className="flex items-center gap-3 mb-7">
              <div
                className="h-px flex-1"
                style={{
                  background: "linear-gradient(to right, transparent, #2a2a2a)",
                }}
              />
              <span
                className="t5-mono"
                style={{
                  fontSize: "9px",
                  color: "#ef4444",
                  letterSpacing: "0.22em",
                }}
              >
                CONFIDENTIAL // SPEED FORENSICS REPORT
              </span>
              <div
                className="h-px flex-1"
                style={{
                  background: "linear-gradient(to left, transparent, #2a2a2a)",
                }}
              />
            </div>

            <div
              className="rounded-xl p-8 border"
              style={{
                background:
                  "linear-gradient(160deg, #140a0a 0%, #111111 55%, #0f0f0f 100%)",
                borderColor: "#ef4444",
                boxShadow:
                  "0 0 100px rgba(239,68,68,0.07), inset 0 0 80px rgba(0,0,0,0.18)",
              }}
            >
              {/* Status badge row */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="rounded-md px-3 py-1"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                >
                  <span
                    className="t5-mono"
                    style={{
                      fontSize: "10px",
                      color: "#ef4444",
                      letterSpacing: "0.12em",
                    }}
                  >
                    SPEED TAX AUDIT
                  </span>
                </div>
                <motion.div
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.1 }}
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#ef4444" }}
                />
                <span style={{ fontSize: "11px", color: "#6b7280" }}>
                  Live reconnaissance
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-black leading-tight mb-6"
                style={{
                  fontSize: "clamp(24px, 4.5vw, 42px)",
                  letterSpacing: "-0.025em",
                }}
              >
                <span
                  className="t5-mono"
                  style={{
                    color: "#ef4444",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "6px",
                    padding: "2px 10px",
                    fontSize: "0.88em",
                  }}
                >
                  {store}
                </span>{" "}
                loads in{" "}
                <span
                  className="t5-mono"
                  style={{
                    color: "#ef4444",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.38)",
                    borderRadius: "6px",
                    padding: "2px 10px",
                  }}
                >
                  {loadTime}s
                </span>{" "}
                on mobile.
              </h1>

              {/* Sub-copy */}
              <div
                className="rounded-lg p-5"
                style={{
                  background: "rgba(239,68,68,0.04)",
                  border: "1px solid rgba(239,68,68,0.14)",
                  borderLeft: "3px solid #ef4444",
                }}
              >
                <p style={{ fontSize: "16px", color: "#d1d5db", lineHeight: 1.78 }}>
                  Every extra second above{" "}
                  <span
                    className="t5-mono"
                    style={{ color: "#f59e0b" }}
                  >
                    2.3s
                  </span>{" "}
                  costs{" "}
                  <strong style={{ color: "#ef4444" }}>
                    7% of your conversions.
                  </strong>{" "}
                  You are{" "}
                  <span
                    className="t5-mono"
                    style={{ color: "#ef4444", fontWeight: 700 }}
                  >
                    {penaltySeconds.toFixed(1)}s
                  </span>{" "}
                  over that threshold — dragging a{" "}
                  <strong style={{ color: "#ef4444" }}>
                    -{Math.round(penaltyPct)}% conversion penalty
                  </strong>{" "}
                  into every single session you ever paid to acquire.
                </p>
              </div>

              {/* Stat trio */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { label: "Your Load Time",    value: `${loadTime}s`,              bad: true  },
                  { label: "Google's Threshold", value: "2.3s",                     bad: false },
                  { label: "Conv. Penalty",      value: `-${Math.round(penaltyPct)}%`, bad: true  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg p-4 text-center"
                    style={{
                      background: s.bad
                        ? "rgba(239,68,68,0.07)"
                        : "rgba(34,197,94,0.07)",
                      border: `1px solid ${
                        s.bad
                          ? "rgba(239,68,68,0.22)"
                          : "rgba(34,197,94,0.22)"
                      }`,
                    }}
                  >
                    <div
                      className="t5-mono"
                      style={{
                        fontSize: "clamp(18px,3vw,28px)",
                        fontWeight: 700,
                        color: s.bad ? "#ef4444" : "#22c55e",
                        lineHeight: 1.1,
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#6b7280",
                        marginTop: "5px",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* § 2 — PAGESPEED INSIGHTS MOCKUP                                */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {/* ── Terminal recon block ── */}
            <div
              className="rounded-xl p-6 mb-3"
              style={{ background: "#060606", border: "1px solid #181818" }}
            >
              <div className="flex items-center gap-2 mb-4">
                {(["#ef4444", "#f59e0b", "#22c55e"] as const).map((c) => (
                  <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                ))}
                <span
                  className="t5-mono"
                  style={{
                    fontSize: "10px",
                    color: "#374151",
                    marginLeft: "10px",
                    letterSpacing: "0.08em",
                  }}
                >
                  pagespeed.web.dev — LIVE AUDIT — {store}
                </span>
              </div>
              <div
                className="t5-mono space-y-1"
                style={{ fontSize: "11px", lineHeight: 1.7 }}
              >
                <div style={{ color: "#374151" }}>
                  $ psi --url="{store}" --strategy=mobile --format=json
                </div>
                <div style={{ color: "#22c55e" }}>
                  ▶ Connecting to Google Lighthouse infrastructure...
                </div>
                <div style={{ color: "#22c55e" }}>
                  ▶ Audit complete. Parsing Core Web Vitals...
                </div>
                <div style={{ color: perfScore < 50 ? "#ef4444" : "#f59e0b" }}>
                  {perfScore < 50 ? "✗" : "⚠"} Performance Score:{" "}
                  <span style={{ fontWeight: 700 }}>{perfScore}/100</span> [POOR: &lt;50 |
                  NEEDS-WORK: 50–89 | GOOD: 90+]
                </div>
                <div style={{ color: "#ef4444" }}>
                  ✗ First Contentful Paint: {fcp}s &nbsp;&nbsp;— threshold 1.8s — FAIL
                </div>
                <div style={{ color: "#ef4444" }}>
                  ✗ Largest Contentful Paint: {lcp}s — threshold 2.5s — FAIL
                </div>
                <div style={{ color: "#ef4444" }}>
                  ✗ Interaction to Next Paint: {inp}ms — threshold 200ms — FAIL
                </div>
                <div style={{ color: cls >= 0.25 ? "#ef4444" : "#f59e0b" }}>
                  {cls >= 0.25 ? "✗" : "⚠"} Cumulative Layout Shift: {cls} &nbsp;&nbsp;
                  — threshold 0.1 — {cls >= 0.25 ? "FAIL" : "NEEDS IMPROVEMENT"}
                </div>
                <div style={{ color: "#f59e0b" }}>
                  ⚠ Time to First Byte: {ttfb}ms — threshold 800ms —{" "}
                  {ttfb > 800 ? "NEEDS IMPROVEMENT" : "OK"}
                </div>
                <div
                  style={{ color: "#ef4444", marginTop: "6px", fontWeight: 700 }}
                >
                  ▶ VERDICT: Mobile experience is critically degraded. Revenue
                  impact classified: HIGH.
                </div>
              </div>
            </div>

            {/* ── Plain English ── */}
            <PlainEnglish emoji="🔍">
              Google graded your mobile site{" "}
              <strong style={{ color: "#ef4444" }}>{perfScore}/100</strong> — a
              failing grade by any standard. Your main product image takes{" "}
              <strong style={{ color: "#ef4444" }}>{lcp} seconds</strong> to
              appear. Google's own published research is unambiguous: every
              extra second of load time raises abandonment rates and demotes
              your search ranking. You are losing{" "}
              <em>traffic</em> and <em>conversions</em> simultaneously on every
              visit.
            </PlainEnglish>

            {/* ── PageSpeed UI Mockup ── */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: "#111111", borderColor: "#2a2a2a" }}
            >
              {/* Header bar */}
              <div
                className="px-6 py-5 flex items-center justify-between"
                style={{
                  background: "#0d0d0d",
                  borderBottom: "1px solid #1a1a1a",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#9ca3af",
                    }}
                  >
                    Google PageSpeed Insights
                  </div>
                  <div
                    className="t5-mono"
                    style={{
                      fontSize: "11px",
                      color: "#4b5563",
                      marginTop: "2px",
                    }}
                  >
                    {store} · Mobile
                  </div>
                </div>

                {/* SVG arc score dial */}
                <div
                  className="relative flex items-center justify-center flex-shrink-0"
                  style={{ width: 78, height: 78 }}
                >
                  <svg
                    viewBox="0 0 78 78"
                    className="absolute inset-0"
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    <circle
                      cx="39"
                      cy="39"
                      r={circleR}
                      fill="none"
                      stroke="#1a1a1a"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="39"
                      cy="39"
                      r={circleR}
                      fill="none"
                      stroke={perfColor}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circleC}
                      initial={{ strokeDashoffset: circleC }}
                      animate={{
                        strokeDashoffset:
                          circleC * (1 - perfScore / 100),
                      }}
                      transition={{
                        duration: 1.6,
                        delay: 0.4,
                        ease: "easeOut",
                      }}
                      style={{
                        filter: `drop-shadow(0 0 6px ${perfColor}99)`,
                      }}
                    />
                  </svg>
                  <div className="flex flex-col items-center z-10">
                    <span
                      className="t5-mono"
                      style={{
                        fontSize: "22px",
                        fontWeight: 700,
                        color: perfColor,
                        lineHeight: 1,
                      }}
                    >
                      {perfScore}
                    </span>
                    <span
                      style={{
                        fontSize: "7px",
                        color: "#6b7280",
                        letterSpacing: "0.06em",
                        marginTop: "2px",
                      }}
                    >
                      SCORE
                    </span>
                  </div>
                </div>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-2 gap-3 p-5">
                {metrics.map((m, i) => {
                  const c = metricColor(m.raw, m.good, m.poor);
                  const lbl = metricLabel(m.raw, m.good, m.poor);
                  const barPct =
                    m.raw <= m.good ? 20 : m.raw >= m.poor ? 86 : 54;
                  return (
                    <motion.div
                      key={m.abbr}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={s(i, 0.4)}
                      className="rounded-lg p-4"
                      style={{
                        background: "#0d0d0d",
                        border: `1px solid ${c}28`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#6b7280",
                          marginBottom: "8px",
                          lineHeight: 1.4,
                        }}
                      >
                        {m.label}
                      </div>
                      <div
                        className="t5-mono"
                        style={{
                          fontSize: "clamp(18px,3vw,26px)",
                          fontWeight: 700,
                          color: c,
                        }}
                      >
                        {m.val}
                      </div>
                      {/* Progress bar */}
                      <div
                        className="mt-3 rounded-full overflow-hidden"
                        style={{ height: 4, background: "#1a1a1a" }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barPct}%` }}
                          transition={{
                            duration: 1,
                            delay: 0.65 + i * 0.1,
                            ease: "easeOut",
                          }}
                          className="h-full rounded-full"
                          style={{ background: c }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#4b5563",
                          marginTop: "5px",
                        }}
                      >
                        Target: {m.good}
                        {m.abbr === "INP" ? "ms" : m.abbr === "CLS" ? "" : "s"} ·{" "}
                        <span style={{ color: c }}>{lbl}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* § 3 — LIVE SPEED TAX COUNTER                                   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div
              className="rounded-xl p-8 border relative overflow-hidden text-center"
              style={{
                background: "#111111",
                borderColor: "#ef4444",
                boxShadow: "0 0 120px rgba(239,68,68,0.06)",
              }}
            >
              {/* Radial breathe animation */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(239,68,68,0.06) 0%, transparent 70%)",
                  animation: "t5-breathe 3.5s ease-in-out infinite",
                }}
              />

              <div className="relative z-10">
                {/* Live badge */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: "#ef4444",
                      animation: "t5-blink 0.9s ease-in-out infinite",
                    }}
                  />
                  <span
                    className="t5-mono"
                    style={{
                      fontSize: "10px",
                      color: "#ef4444",
                      letterSpacing: "0.2em",
                    }}
                  >
                    LIVE · ACCUMULATING SINCE MIDNIGHT
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: "15px",
                    color: "#9ca3af",
                    fontWeight: 500,
                    marginBottom: "24px",
                  }}
                >
                  Conversions Lost Today to Load-Time Friction
                </h2>

                {/* Big revenue number */}
                <div
                  className="rounded-xl p-6 inline-block w-full mb-6"
                  style={{
                    background: "rgba(239,68,68,0.05)",
                    border: "1px solid rgba(239,68,68,0.18)",
                  }}
                >
                  <div
                    className="t5-mono"
                    style={{
                      fontSize: "clamp(40px, 8vw, 76px)",
                      fontWeight: 900,
                      color: "#ef4444",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {$fmt(revLost)}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "10px",
                    }}
                  >
                    revenue evaporated today from slow load time
                  </div>
                </div>

                {/* Secondary trio */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      label: "Conversions lost",
                      value: Math.round(convsLost).toLocaleString("en-US"),
                    },
                    {
                      label: "Hours elapsed",
                      value: (secondsToday / 3600).toFixed(1) + "h",
                    },
                    {
                      label: "Loss per hour",
                      value: $fmt(lostRevPerSec * 3600),
                    },
                  ].map((st) => (
                    <div
                      key={st.label}
                      className="rounded-lg p-4"
                      style={{
                        background: "rgba(239,68,68,0.04)",
                        border: "1px solid rgba(239,68,68,0.1)",
                      }}
                    >
                      <div
                        className="t5-mono"
                        style={{
                          fontSize: "clamp(13px,2.5vw,20px)",
                          fontWeight: 700,
                          color: "#ef4444",
                        }}
                      >
                        {st.value}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#6b7280",
                          marginTop: "4px",
                        }}
                      >
                        {st.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* § 4 — SPEED vs CONVERSION SPEEDOMETER                          */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
          >
            <div
              className="rounded-xl p-6 border"
              style={{ background: "#111111", borderColor: "#2a2a2a" }}
            >
              <div className="flex items-center gap-3 mb-1">
                <Gauge size={17} style={{ color: "#f59e0b" }} />
                <h2
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  Speed vs. Conversion Rate Impact
                </h2>
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "32px",
                }}
              >
                Measured conversion rate at each load time. Your store is
                marked below.
              </p>

              {/* ── Gradient track + marker ── */}
              <div
                className="relative"
                style={{ paddingBottom: "64px", marginBottom: "8px" }}
              >
                {/* Track */}
                <div
                  className="w-full rounded-full"
                  style={{
                    height: "32px",
                    background:
                      "linear-gradient(to right," +
                      "#22c55e 0%," +
                      "#22c55e 20%," +
                      "#84cc16 28%," +
                      "#facc15 36%," +
                      "#f59e0b 46%," +
                      "#f97316 56%," +
                      "#ef4444 68%," +
                      "#dc2626 80%," +
                      "#7f1d1d 100%)",
                    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5)",
                  }}
                />

                {/* Ticks */}
                {speedPoints.map((sp, i) => {
                  const isFirst = i === 0;
                  const isLast = i === speedPoints.length - 1;
                  return (
                    <div
                      key={sp.time}
                      className="absolute"
                      style={{
                        top: "32px",
                        left: isFirst
                          ? "0"
                          : isLast
                          ? "auto"
                          : `${sp.xPct}%`,
                        right: isLast ? "0" : "auto",
                        transform:
                          isFirst || isLast
                            ? "none"
                            : "translateX(-50%)",
                        textAlign: isLast ? "right" : "left",
                      }}
                    >
                      <div
                        style={{
                          width: 1,
                          height: 8,
                          background: "#2a2a2a",
                          margin:
                            isFirst ? "0" : isLast ? "0 0 0 auto" : "0 auto",
                        }}
                      />
                      <div
                        className="t5-mono"
                        style={{
                          fontSize: "9px",
                          color: "#4b5563",
                          marginTop: "4px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {sp.label}
                      </div>
                      <div
                        className="t5-mono"
                        style={{
                          fontSize: "9px",
                          color:
                            sp.cvr < 80
                              ? "#ef4444"
                              : sp.cvr < 93
                              ? "#f59e0b"
                              : "#22c55e",
                          marginTop: "2px",
                          fontWeight: 700,
                        }}
                      >
                        {sp.cvr}%
                      </div>
                    </div>
                  );
                })}

                {/* Animated YOU-ARE-HERE marker */}
                <motion.div
                  initial={{ left: "0%" }}
                  animate={{ left: `calc(${markerPct}% - 14px)` }}
                  transition={{
                    duration: 1.5,
                    delay: 0.7,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className="absolute flex flex-col items-center"
                  style={{ top: "-9px" }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#0a0a0a",
                      border: "3px solid #ffffff",
                      boxShadow:
                        "0 0 0 4px rgba(239,68,68,0.25)," +
                        "0 0 18px rgba(239,68,68,0.7)," +
                        "0 0 40px rgba(239,68,68,0.35)",
                    }}
                  />
                  <div
                    className="t5-mono rounded px-2 py-1 mt-2"
                    style={{
                      background: "#ef4444",
                      fontSize: "9px",
                      color: "#fff",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      letterSpacing: "0.06em",
                    }}
                  >
                    YOU → {loadTime}s
                  </div>
                </motion.div>
              </div>

              {/* ── Zone cards ── */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  {
                    id: "fast",
                    label: "Fast Zone",
                    range: "≤ 2.3s",
                    desc: "Full conversion potential. Visitors stay. Google rewards with rankings.",
                    color: "#22c55e",
                  },
                  {
                    id: "friction",
                    label: "Friction Zone",
                    range: "2.3 – 4.0s",
                    desc: "7–12% conversion bleed per excess second. Revenue quietly evaporating.",
                    color: "#f59e0b",
                  },
                  {
                    id: "danger",
                    label: "Danger Zone",
                    range: "> 4.0s",
                    desc: "20%+ conversion penalty. Visitors abandon. Google demotes you.",
                    color: "#ef4444",
                  },
                ].map((z) => {
                  const here = zone === z.id;
                  return (
                    <div
                      key={z.id}
                      className="rounded-lg p-4"
                      style={{
                        background: `${z.color}0d`,
                        border: `1px solid ${z.color}${here ? "55" : "28"}`,
                        boxShadow: here
                          ? `0 0 24px ${z.color}18`
                          : "none",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: z.color,
                        }}
                      >
                        {z.label}
                      </div>
                      <div
                        className="t5-mono"
                        style={{
                          fontSize: "11px",
                          color: "#6b7280",
                          margin: "4px 0 7px",
                        }}
                      >
                        {z.range}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#6b7280",
                          lineHeight: 1.55,
                        }}
                      >
                        {z.desc}
                      </div>
                      {here && (
                        <div
                          style={{
                            fontSize: "10px",
                            color: z.color,
                            fontWeight: 700,
                            marginTop: "9px",
                            letterSpacing: "0.05em",
                          }}
                        >
                          ◀ YOU ARE HERE
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* § 5 — SPEED TAX CALCULATOR                                     */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.36 }}
          >
            {/* ── Terminal recon block ── */}
            <div
              className="rounded-xl p-6 mb-3"
              style={{ background: "#060606", border: "1px solid #181818" }}
            >
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  {(["#ef4444", "#f59e0b", "#22c55e"] as const).map((c) => (
                    <div
                      key={c}
                      className="w-3 h-3 rounded-full"
                      style={{ background: c }}
                    />
                  ))}
                  <span
                    className="t5-mono"
                    style={{
                      fontSize: "10px",
                      color: "#374151",
                      marginLeft: "10px",
                      letterSpacing: "0.08em",
                    }}
                  >
                    speed-tax-engine v3.2 — FORENSIC CALCULATION
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock size={10} style={{ color: "#374151" }} />
                  <span
                    className="t5-mono"
                    style={{
                      fontSize: "9px",
                      color: "#374151",
                      letterSpacing: "0.1em",
                    }}
                  >
                    READ-ONLY
                  </span>
                </div>
              </div>
              <div
                className="t5-mono space-y-1"
                style={{ fontSize: "11px", lineHeight: 1.8 }}
              >
                <div style={{ color: "#374151" }}>
                  $ calc-speed-tax --sessions={monthlySessions.toLocaleString()}{" "}
                  --aov={aov} --cvr={baseCvr} --load={loadTime}s
                </div>
                <div style={{ color: "#22c55e" }}>
                  ▶ Resolving penalty matrix...
                </div>
                <div style={{ color: "#9ca3af" }}>
                  &nbsp;&nbsp;penalty_seconds &nbsp;= {loadTime} – 2.3 ={" "}
                  <span style={{ color: "#f59e0b" }}>{penaltySeconds.toFixed(1)}s</span>
                </div>
                <div style={{ color: "#9ca3af" }}>
                  &nbsp;&nbsp;conv_penalty_rate = {penaltySeconds.toFixed(1)} ×
                  7.0% ={" "}
                  <span style={{ color: "#f59e0b" }}>{penaltyPct.toFixed(1)}%</span>
                </div>
                <div style={{ color: "#9ca3af" }}>
                  &nbsp;&nbsp;monthly_lost_cvrs = {monthlySessions.toLocaleString()} ×
                  {(baseCvr * 100).toFixed(2)}% ×{" "}
                  {(conversionPenaltyRate * 100).toFixed(2)}% ={" "}
                  <span style={{ color: "#f59e0b" }}>
                    {Math.round(
                      monthlySessions * baseCvr * conversionPenaltyRate
                    ).toLocaleString()}
                  </span>
                </div>
                <div style={{ color: "#9ca3af" }}>
                  &nbsp;&nbsp;annual_rev_loss &nbsp;= monthly × 12 × ${aov} ={" "}
                  <span style={{ color: "#ef4444", fontWeight: 700 }}>
                    {$fmt(annualSpeedLoss)}
                  </span>
                </div>
                <div
                  style={{
                    color: "#ef4444",
                    fontWeight: 700,
                    marginTop: "6px",
                  }}
                >
                  ✗ ANNUAL SPEED TAX:{" "}
                  <span style={{ fontSize: "12px" }}>
                    {$fmt(annualSpeedLoss)}
                  </span>{" "}
                  — YOU ARE PAYING THIS RIGHT NOW
                </div>
              </div>
            </div>

            {/* ── Plain English ── */}
            <PlainEnglish emoji="📊">
              Based on your{" "}
              <strong style={{ color: "#fff" }}>
                {monthlySessions.toLocaleString()} monthly visitors
              </strong>{" "}
              and your{" "}
              <strong style={{ color: "#fff" }}>${aov} average order</strong>,
              your {loadTime}s load time is silently billing you{" "}
              <strong style={{ color: "#ef4444" }}>
                {$fmt(annualSpeedLoss)} every year.
              </strong>{" "}
              This is not a worst-case projection — it is the conservative
              estimate using Google's own published 7%-per-second
              conversion-penalty research.
            </PlainEnglish>

            {/* ── Calculator UI ── */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: "#111111", borderColor: "#2a2a2a" }}
            >
              {/* Card header */}
              <div
                className="px-6 py-4 flex items-center gap-3"
                style={{
                  background: "#0d0d0d",
                  borderBottom: "1px solid #1a1a1a",
                }}
              >
                <DollarSign size={14} style={{ color: "#f59e0b" }} />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#e5e7eb",
                  }}
                >
                  Annual Speed Tax Breakdown
                </span>
                <div
                  className="ml-auto rounded t5-mono"
                  style={{
                    fontSize: "9px",
                    background: "rgba(239,68,68,0.1)",
                    color: "#ef4444",
                    border: "1px solid rgba(239,68,68,0.28)",
                    padding: "2px 8px",
                    letterSpacing: "0.1em",
                  }}
                >
                  LOCKED — FORENSIC DATA
                </div>
              </div>

              <div className="p-6">
                {/* ── Formula display ── */}
                <div
                  className="rounded-lg p-4 mb-7 overflow-x-auto"
                  style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}
                >
                  <div
                    className="t5-mono flex items-center gap-2"
                    style={{
                      minWidth: "max-content",
                      flexWrap: "nowrap",
                    }}
                  >
                    {[
                      {
                        label: "Sessions/mo",
                        val: monthlySessions.toLocaleString(),
                      },
                      { op: "×" },
                      { label: "AOV", val: `$${aov}` },
                      { op: "×" },
                      { label: "Base CVR", val: `${(baseCvr * 100).toFixed(1)}%` },
                      { op: "×" },
                      {
                        label: "Speed Penalty",
                        val: `${penaltyPct.toFixed(0)}%`,
                      },
                      { op: "×" },
                      { label: "12 Months", val: "12" },
                      { op: "=" },
                      {
                        label: "Annual Tax",
                        val: $fmt(annualSpeedLoss),
                        highlight: true,
                      },
                    ].map((item, i) =>
                      "op" in item ? (
                        <div
                          key={i}
                          style={{
                            fontSize: "16px",
                            color: "#374151",
                            flexShrink: 0,
                            paddingLeft: "2px",
                            paddingRight: "2px",
                          }}
                        >
                          {item.op}
                        </div>
                      ) : (
                        <div
                          key={i}
                          className="rounded-lg p-3 flex flex-col items-center text-center flex-shrink-0"
                          style={{
                            background: item.highlight
                              ? "rgba(239,68,68,0.1)"
                              : "rgba(255,255,255,0.025)",
                            border: `1px solid ${
                              item.highlight
                                ? "rgba(239,68,68,0.4)"
                                : "#2a2a2a"
                            }`,
                            minWidth: item.highlight ? 118 : 76,
                            boxShadow: item.highlight
                              ? "0 0 28px rgba(239,68,68,0.18)"
                              : "none",
                          }}
                        >
                          <div
                            style={{
                              fontSize: item.highlight ? "17px" : "14px",
                              fontWeight: 700,
                              color: item.highlight ? "#ef4444" : "#e5e7eb",
                              lineHeight: 1.15,
                            }}
                          >
                            {item.val}
                          </div>
                          <div
                            style={{
                              fontSize: "8px",
                              color: "#4b5563",
                              marginTop: "5px",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {item.label}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* ── Time-horizon bars ── */}
                <div className="space-y-4">
                  {[
                    {
                      label: "This Month",
                      value: annualSpeedLoss / 12,
                      color: "#f59e0b",
                      pct: 8,
                      bold: false,
                    },
                    {
                      label: "This Quarter",
                      value: annualSpeedLoss / 4,
                      color: "#f97316",
                      pct: 25,
                      bold: false,
                    },
                    {
                      label: "This Year",
                      value: annualSpeedLoss,
                      color: "#ef4444",
                      pct: 100,
                      bold: false,
                    },
                    {
                      label: "3-Year Compounding",
                      value: annualSpeedLoss * 3.27,
                      color: "#b91c1c",
                      pct: 100,
                      bold: true,
                    },
                  ].map((row, i) => (
                    <div key={row.label} className="flex items-center gap-4">
                      <div
                        style={{
                          width: 148,
                          fontSize: "12px",
                          color: row.bold ? "#e5e7eb" : "#9ca3af",
                          flexShrink: 0,
                          fontWeight: row.bold ? 600 : 400,
                        }}
                      >
                        {row.label}
                      </div>
                      <div
                        className="flex-1 rounded-full overflow-hidden"
                        style={{
                          height: row.bold ? 10 : 7,
                          background: "#1a1a1a",
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${row.pct}%` }}
                          transition={{
                            duration: 1.15,
                            delay: 0.85 + i * 0.12,
                            ease: "easeOut",
                          }}
                          className="h-full rounded-full"
                          style={{
                            background: row.color,
                            boxShadow: row.bold
                              ? `0 0 10px ${row.color}cc`
                              : "none",
                          }}
                        />
                      </div>
                      <div
                        className="t5-mono"
                        style={{
                          fontSize: row.bold ? "14px" : "13px",
                          fontWeight: 700,
                          color: row.color,
                          width: 114,
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        {$fmt(row.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* § 6 — GUARANTEE (Risk Reversal — BEFORE price)                 */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.44 }}
          >
            <div
              className="rounded-xl p-8 border relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(150deg, #091409 0%, #111111 100%)",
                borderColor: "#22c55e",
                boxShadow: "0 0 100px rgba(34,197,94,0.07)",
              }}
            >
              {/* Ambient glow pulse */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 40% 50%, rgba(34,197,94,0.07) 0%, transparent 70%)",
                  animation: "t5-breathe 5s ease-in-out infinite",
                }}
              />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-7">
                  <div
                    className="rounded-xl p-3 flex-shrink-0"
                    style={{
                      background: "rgba(34,197,94,0.1)",
                      border: "1px solid rgba(34,197,94,0.3)",
                    }}
                  >
                    <Shield size={26} style={{ color: "#22c55e" }} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#22c55e",
                        letterSpacing: "0.18em",
                        marginBottom: "5px",
                      }}
                    >
                      ALEX'S PERSONAL GUARANTEE
                    </div>
                    <div
                      style={{
                        fontSize: "22px",
                        fontWeight: 800,
                        color: "#fff",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Zero Risk. Zero Excuses.
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <div
                  className="rounded-lg p-6 mb-7"
                  style={{
                    background: "rgba(34,197,94,0.05)",
                    border: "1px solid rgba(34,197,94,0.18)",
                    borderLeft: "4px solid #22c55e",
                  }}
                >
                  <p
                    style={{
                      fontSize: "clamp(14px,2.5vw,18px)",
                      fontWeight: 600,
                      color: "#e5e7eb",
                      lineHeight: 1.72,
                    }}
                  >
                    "If we do not identify and document speed optimizations
                    worth at least{" "}
                    <span style={{ color: "#22c55e" }}>3× your audit cost</span>
                    , the audit is{" "}
                    <span style={{ color: "#22c55e", fontWeight: 800 }}>
                      completely free.
                    </span>
                    "
                  </p>
                </div>

                {/* Checkmarks */}
                <div className="space-y-3 mb-7">
                  {[
                    "Full documented audit report delivered regardless of outcome",
                    "Instant refund, no questions asked, if 3× value is not found and documented",
                    "All findings are yours to keep and implement whether you pay or not",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div
                        className="rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 20,
                          height: 20,
                          background: "rgba(34,197,94,0.14)",
                          border: "1px solid rgba(34,197,94,0.38)",
                          marginTop: "2px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#22c55e",
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#9ca3af",
                          lineHeight: 1.6,
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ROI math — THE PRICE COMPARISON appears here, after the guarantee */}
                <div
                  className="rounded-lg p-5"
                  style={{
                    background: "rgba(0,0,0,0.28)",
                    border: "1px solid #1a1a1a",
                  }}
                >
                  <div
                    className="t5-mono"
                    style={{
                      fontSize: "10px",
                      color: "#4b5563",
                      letterSpacing: "0.12em",
                      marginBottom: "16px",
                    }}
                  >
                    THE SIMPLE MATH:
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Current annual tax */}
                    <div
                      className="rounded-lg p-4 text-center"
                      style={{
                        background: "rgba(239,68,68,0.07)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        minWidth: 136,
                      }}
                    >
                      <div
                        className="t5-mono"
                        style={{
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#ef4444",
                        }}
                      >
                        {$fmt(annualSpeedLoss)}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        Annual speed tax (now)
                      </div>
                    </div>

                    <ArrowRight size={18} style={{ color: "#374151", flexShrink: 0 }} />

                    {/* Audit investment */}
                    <div
                      className="rounded-lg p-4 text-center"
                      style={{
                        background: "rgba(34,197,94,0.07)",
                        border: "1px solid rgba(34,197,94,0.2)",
                        minWidth: 136,
                      }}
                    >
                      <div
                        className="t5-mono"
                        style={{
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#22c55e",
                        }}
                      >
                        {$fmt(auditCost)}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        One-time audit investment
                      </div>
                    </div>

                    <ArrowRight size={18} style={{ color: "#374151", flexShrink: 0 }} />

                    {/* ROI */}
                    <div
                      className="rounded-lg p-4 text-center"
                      style={{
                        background: "rgba(34,197,94,0.12)",
                        border: "1px solid rgba(34,197,94,0.4)",
                        boxShadow: "0 0 28px rgba(34,197,94,0.12)",
                        minWidth: 108,
                      }}
                    >
                      <div
                        className="t5-mono"
                        style={{
                          fontSize: "24px",
                          fontWeight: 700,
                          color: "#22c55e",
                        }}
                      >
                        {roi}×
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        Potential ROI
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* § 7 — CTA                                                       */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.52 }}
            className="text-center pb-16"
          >
            {/* Urgency ticker */}
            <div
              className="t5-mono mb-6"
              style={{
                fontSize: "10px",
                color: "#374151",
                letterSpacing: "0.2em",
              }}
            >
              EVERY HOUR YOU WAIT ·{" "}
              <span style={{ color: "#ef4444" }}>
                {$fmt(lostRevPerSec * 3600)}
              </span>{" "}
              GONE · PERMANENTLY
            </div>

            {/* Primary CTA — single button, no mailto */}
            <motion.button
              onClick={handleCTA}
              whileHover={{
                scale: 1.04,
                boxShadow:
                  "0 0 70px rgba(34,197,94,0.4), 0 0 130px rgba(34,197,94,0.15)",
              }}
              whileTap={{ scale: 0.97 }}
              className="relative inline-flex items-center gap-3 rounded-xl font-bold overflow-hidden cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, #14532d 0%, #16a34a 40%, #22c55e 70%, #15803d 100%)",
                color: "#fff",
                fontSize: "clamp(15px, 2.5vw, 19px)",
                padding: "22px 56px",
                border: "1px solid #4ade80",
                boxShadow:
                  "0 0 36px rgba(34,197,94,0.24), inset 0 1px 0 rgba(255,255,255,0.16)",
                letterSpacing: "-0.01em",
              }}
            >
              {/* Shimmer sweep */}
              <div
                className="t5-shimmer absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.16) 50%, transparent 100%)",
                  width: "40%",
                }}
              />
              <Zap size={20} />
              <span>Eradicate Your Speed Tax →</span>
            </motion.button>

            <div
              style={{
                fontSize: "12px",
                color: "#374151",
                marginTop: "14px",
              }}
            >
              No commitment required. 3× value guarantee — or it's completely
              free.
            </div>

            {/* Footer separator */}
            <div className="flex items-center gap-3 mt-12">
              <div
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(to right, transparent, #1a1a1a)",
                }}
              />
              <span
                className="t5-mono"
                style={{
                  fontSize: "9px",
                  color: "#1f2937",
                  letterSpacing: "0.2em",
                }}
              >
                SPEED FORENSICS // END OF REPORT
              </span>
              <div
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(to left, transparent, #1a1a1a)",
                }}
              />
            </div>
          </motion.section>

        </div>
      </div>
    </>
  );
}
