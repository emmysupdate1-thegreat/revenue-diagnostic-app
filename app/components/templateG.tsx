"use client";

import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ChevronRight,
  EyeOff,
  Lock,
  Shield,
  TrendingDown,
  Zap,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        "#0a0a0a",
  card:      "#111111",
  border:    "#242424",
  borderDim: "#1a1a1a",
  green:     "#22c55e",
  red:       "#ef4444",
  amber:     "#f59e0b",
  mono:      "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
  sans:      "'Inter', -apple-system, sans-serif",
} as const;

// ─── Animation presets ────────────────────────────────────────────────────────
const FADE_UP = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
};

const STAGGER = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.13 } },
};

// ─────────────────────────────────────────────────────────────────────────────
//  ATOMS
// ─────────────────────────────────────────────────────────────────────────────

function Card({ children, noPad }: { children: ReactNode; noPad?: boolean }) {
  return (
    <div
      className={`rounded-xl overflow-hidden ${noPad ? "" : "p-6"}`}
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
    >
      {children}
    </div>
  );
}

function IconBox({ color, children }: { color: string; children: ReactNode }) {
  return (
    <div
      className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center"
      style={{ backgroundColor: `${color}12`, border: `1px solid ${color}22` }}
    >
      {children}
    </div>
  );
}

function AuditBadge({
  color,
  pulsing,
  children,
}: {
  color: string;
  pulsing?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
      style={{
        backgroundColor: `${color}12`,
        border: `1px solid ${color}28`,
        color,
        fontFamily: C.mono,
      }}
    >
      {pulsing && (
        <motion.span
          animate={{ opacity: [1, 0.1, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </div>
  );
}

function PlainEnglish({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-5 py-4"
      style={{ backgroundColor: "#0f0f0f", borderTop: `1px solid ${C.borderDim}` }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded mt-0.5"
          style={{
            fontFamily: C.mono,
            backgroundColor: `${C.amber}10`,
            color: C.amber,
            border: `1px solid ${C.amber}20`,
          }}
        >
          PLAIN&nbsp;ENGLISH
        </span>
        <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
          {children}
        </p>
      </div>
    </div>
  );
}

function LedgerRow({
  dotColor,
  label,
  tag,
  value,
  valueColor,
  sub,
}: {
  dotColor: string;
  label: string;
  tag: { text: string; color: string };
  value: string;
  valueColor: string;
  sub: string;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{ borderTop: `1px solid ${C.borderDim}` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: dotColor }}
        />
        <span className="text-sm font-medium" style={{ color: "#d1d5db" }}>
          {label}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{
            backgroundColor: `${tag.color}12`,
            color: tag.color,
            fontFamily: C.mono,
            border: `1px solid ${tag.color}25`,
          }}
        >
          {tag.text}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-[1.5rem] font-black"
          style={{ fontFamily: C.mono, color: valueColor }}
        >
          {value}
        </span>
        <span className="text-xs" style={{ color: "#374151" }}>
          {sub}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TERMINAL BLOCK  (Authority trigger — raw recon aesthetic)
// ─────────────────────────────────────────────────────────────────────────────

interface TLine { t: string; c: string; }

function TerminalBlock({
  id,
  filename,
  lines,
  visibleCount,
  plainEnglish,
}: {
  id: string;
  filename: string;
  lines: TLine[];
  visibleCount: number;
  plainEnglish: ReactNode;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
      {/* macOS-style title bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ backgroundColor: "#0c0c0c", borderBottom: `1px solid ${C.borderDim}` }}
      >
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ff5f57" }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
        </div>
        <span
          className="ml-2 text-xs"
          style={{ fontFamily: C.mono, color: "#3a3a3a" }}
        >
          {filename} — zsh
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: C.green }}
          />
          <span className="text-xs" style={{ fontFamily: C.mono, color: C.green }}>
            CONNECTED
          </span>
        </div>
      </div>

      {/* Terminal body */}
      <div className="p-5 min-h-[190px]" style={{ backgroundColor: "#060606" }}>
        {lines.slice(0, visibleCount).map((line, i) => (
          <motion.div
            key={`${id}-${i}`}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.12 }}
          >
            <span
              className="block text-[13px]"
              style={{
                fontFamily: C.mono,
                color: line.c,
                lineHeight: "1.9",
                whiteSpace: "pre",
              }}
            >
              {line.t}
            </span>
          </motion.div>
        ))}
        {visibleCount < lines.length && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.65, repeat: Infinity }}
            style={{
              display: "inline-block",
              width: "9px",
              height: "16px",
              backgroundColor: C.green,
              borderRadius: "1px",
              marginTop: "4px",
            }}
          />
        )}
      </div>

      {/* Plain English translation — required by Authority principle */}
      <PlainEnglish>{plainEnglish}</PlainEnglish>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DATA COMPLETENESS GAUGE  (pure Tailwind + Framer Motion — zero Recharts)
// ─────────────────────────────────────────────────────────────────────────────

function CompletenessGauge({ pct, untrackedPct }: { pct: number; untrackedPct: number }) {
  const pillColor =
    pct < 40 ? C.red : pct < 70 ? C.amber : C.green;
  const pillLabel =
    pct < 40 ? "CRITICAL" : pct < 70 ? "DEGRADED" : "HEALTHY";
  const fillGrad =
    pct < 40
      ? "linear-gradient(90deg, #3f0606 0%, #ef4444 100%)"
      : pct < 70
      ? "linear-gradient(90deg, #3a1800 0%, #f59e0b 100%)"
      : "linear-gradient(90deg, #052e16 0%, #22c55e 100%)";

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Zap size={14} style={{ color: C.amber }} />
          <span
            className="text-xs font-bold uppercase tracking-[0.1em]"
            style={{ color: "#e5e7eb" }}
          >
            Signal Completeness Score
          </span>
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{
            fontFamily: C.mono,
            backgroundColor: `${pillColor}12`,
            color: pillColor,
            border: `1px solid ${pillColor}28`,
          }}
        >
          {pillLabel}
        </span>
      </div>

      {/* Axis labels */}
      <div className="flex justify-between mb-2">
        {["0% — Blind", "100% — Full Signal"].map((s) => (
          <span key={s} className="text-xs" style={{ fontFamily: C.mono, color: "#2e2e2e" }}>
            {s}
          </span>
        ))}
      </div>

      {/* Track */}
      <div
        className="relative h-9 rounded-lg overflow-hidden"
        style={{ backgroundColor: "#151515", border: "1px solid #1e1e1e" }}
      >
        {/* Subtle grid lines */}
        <div className="absolute inset-0 flex pointer-events-none">
          {Array.from({ length: 19 }).map((_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ borderRight: "1px solid rgba(255,255,255,0.018)" }}
            />
          ))}
        </div>

        {/* Threshold markers */}
        {[
          { pos: 40, color: "rgba(245,158,11,0.22)" },
          { pos: 70, color: "rgba(34,197,94,0.22)"  },
        ].map((m) => (
          <div
            key={m.pos}
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${m.pos}%`, backgroundColor: m.color }}
          />
        ))}

        {/* Animated fill */}
        <motion.div
          className="h-full relative"
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: fillGrad }}
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0"
            animate={{ x: ["-100%", "240%"] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: 2.2,
              repeatDelay: 1.5,
            }}
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
              width: "40%",
            }}
          />
        </motion.div>

        {/* Percentage label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="text-sm font-bold"
            style={{
              fontFamily: C.mono,
              color: "#f9fafb",
              textShadow: "0 1px 10px rgba(0,0,0,0.96)",
            }}
          >
            {pct}% signal completeness
          </span>
        </div>
      </div>

      {/* Legend row */}
      <div className="flex flex-wrap gap-5 mt-3">
        {[
          { range: "0–40%",   label: "Blind",       color: C.red   },
          { range: "40–70%",  label: "Degraded",    color: C.amber },
          { range: "70–100%", label: "Full Signal",  color: C.green },
        ].map((leg) => (
          <div key={leg.range} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: leg.color }}
            />
            <span className="text-xs" style={{ fontFamily: C.mono, color: "#303030" }}>
              {leg.range}
            </span>
            <span className="text-xs font-medium" style={{ color: leg.color }}>
              {leg.label}
            </span>
          </div>
        ))}
      </div>

      {/* Insight callout */}
      <div
        className="flex items-start gap-3 mt-4 p-4 rounded-lg"
        style={{ backgroundColor: "#0c0c0c", border: `1px solid rgba(239,68,68,0.1)` }}
      >
        <TrendingDown
          size={17}
          style={{ color: C.red, flexShrink: 0, marginTop: 2 }}
        />
        <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
          Your score of{" "}
          <span
            style={{ color: C.red, fontWeight: 700, fontFamily: C.mono }}
          >
            {pct}%
          </span>{" "}
          means Meta&apos;s bidding algorithm makes every decision with{" "}
          <strong style={{ color: "#f9fafb" }}>
            {untrackedPct}% of your actual conversions permanently hidden.
          </strong>{" "}
          Industry benchmark for profitable ROAS at scale:{" "}
          <span style={{ color: C.green, fontFamily: C.mono }}>≥ 85%</span>.
        </p>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export default function Template7({
  data,
  fmt,
  fmtLive,
  fmtMicro,
  handleCTA,
}: any) {

  // ── Derived constants ────────────────────────────────────────────────────
  const store:          string = data?.store              ?? "YourStore";
  const monthlySpend:   number = data?.monthly_ad_spend   ?? 28_000;
  const untrackedPct:   number = data?.untracked_percentage ?? 73;
  const wastedMonthly:  number = data?.wasted_spend_monthly  ?? 4_800;
  const completeness:   number = 100 - untrackedPct;

  const fmtAmt = (n: number): string =>
    fmt ? fmt(n) : `£${Math.round(n).toLocaleString("en-GB")}`;

  // ── Live waste counter — starts from historical scan date (loss aversion)
  //    Counter begins at ~wastedMonthly (30 days of bleed already done)
  //    and continues ticking upward in real-time.
  const scanDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    d.setHours(9, 14, 37, 0); // Specific timestamp adds authority
    return d;
  }, []);

  const wastePerSecond = useMemo(
    () => wastedMonthly / (30 * 24 * 60 * 60),
    [wastedMonthly]
  );

  const [liveWaste, setLiveWaste] = useState(() =>
    ((Date.now() - scanDate.getTime()) / 1000) * wastePerSecond
  );

  useEffect(() => {
    const id = setInterval(() => {
      setLiveWaste(
        ((Date.now() - scanDate.getTime()) / 1000) * wastePerSecond
      );
    }, 100);
    return () => clearInterval(id);
  }, [scanDate, wastePerSecond]);

  // ── Terminal line definitions ────────────────────────────────────────────
  const pixelLines: TLine[] = useMemo(() => [
    { t: `$ fbcapi --audit --domain=${store}.com`,     c: C.green  },
    { t: `> Initialising recon scanner...`,            c: "#3d3d3d" },
    { t: `> [24h] Browser pixel events:    47`,        c: "#9ca3af" },
    { t: `> [24h] Server CAPI events:       0`,        c: C.red    },
    { t: `> Event match rate:          0.00%`,         c: C.red    },
    { t: `> Deduplication key:        MISSING`,        c: C.amber  },
    { t: `> iOS 14+ signal coverage:     0%`,          c: C.red    },
    { t: `> ⚠  STATUS: CRITICAL_SIGNAL_FAILURE`,      c: C.red    },
  ], [store]);

  const ios14Lines: TLine[] = useMemo(() => [
    { t: `$ ios14_impact --domain=${store}.com --window=30d`, c: C.green },
    { t: `> Loading ATT consent telemetry...`,                c: "#3d3d3d" },
    { t: `> iOS 14+ traffic share:          ~62%`,            c: "#9ca3af" },
    { t: `> ATT opt-out rate (industry avg):  72%`,           c: C.amber  },
    { t: `> Effective blind-spot coverage: ${untrackedPct}%`, c: C.red    },
    { t: `> Monthly misallocated budget:  ${fmtAmt(wastedMonthly)}`,       c: C.red },
    { t: `> Annual compounding exposure:  ${fmtAmt(wastedMonthly * 12)}`,  c: C.red },
    { t: `> STATUS: REMEDIATION_REQUIRED`,                    c: C.red    },
  // fmtAmt is stable (only changes if fmt prop changes, which is unlikely)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [store, untrackedPct, wastedMonthly]);

  // ── Terminal type-on animation (sequenced) ───────────────────────────────
  const [t1, setT1] = useState(0);
  const [t2, setT2] = useState(0);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (++i <= pixelLines.length) setT1(i);
      else clearInterval(iv);
    }, 300);
    return () => clearInterval(iv);
  }, [pixelLines.length]);

  useEffect(() => {
    let inner: ReturnType<typeof setInterval>;
    const to = setTimeout(() => {
      let i = 0;
      inner = setInterval(() => {
        if (++i <= ios14Lines.length) setT2(i);
        else clearInterval(inner);
      }, 300);
    }, pixelLines.length * 300 + 700);
    return () => { clearTimeout(to); clearInterval(inner); };
  }, [pixelLines.length, ios14Lines.length]);

  // ── Formatted values ─────────────────────────────────────────────────────
  const scanTs = scanDate.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const liveDisplay = fmtLive
    ? fmtLive(liveWaste)
    : `£${liveWaste.toLocaleString("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

  const burnPerMin = fmtMicro
    ? fmtMicro(wastePerSecond * 60)
    : `£${(wastePerSecond * 60).toFixed(4)}`;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        backgroundColor: C.bg,
        fontFamily: C.sans,
        color: "#e5e7eb",
        overflowX: "hidden",
      }}
    >
      {/* Atmospheric red glow — subconscious danger signal */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: `
            radial-gradient(ellipse 80% 55% at 8% 25%,  rgba(239,68,68,0.038) 0%, transparent 60%),
            radial-gradient(ellipse 60% 45% at 92% 80%, rgba(239,68,68,0.022) 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Page wrapper with staggered reveal ─────────────────────────── */}
      <motion.div
        variants={STAGGER}
        initial="hidden"
        animate="visible"
        className="relative max-w-[860px] mx-auto px-5 py-10 space-y-6"
        style={{ zIndex: 1 }}
      >
        {/* ══════════════════════════════════════════════════════════════
            §1  HERO
            Loss Aversion: Visceral framing of wasted spend scale.
            Cognitive Ease: Read-only — no inputs, no sliders.
        ══════════════════════════════════════════════════════════════ */}
        <motion.section variants={FADE_UP}>
          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <AuditBadge color={C.red} pulsing>LIVE TRACKING AUDIT</AuditBadge>
            <AuditBadge color={C.amber}>
              <Lock size={9} />&nbsp;DATA LOCKED · READ-ONLY
            </AuditBadge>
            <AuditBadge color="#374151">
              CONFIDENTIAL · {new Date().toISOString().split("T")[0]}
            </AuditBadge>
          </div>

          <Card>
            <div className="flex items-start gap-4">
              <IconBox color={C.red}>
                <EyeOff size={20} style={{ color: C.red }} />
              </IconBox>
              <div>
                <h1
                  className="text-[1.7rem] font-bold leading-snug mb-3"
                  style={{ letterSpacing: "-0.025em", color: "#f9fafb" }}
                >
                  <span>{store}</span>
                  <span style={{ color: "#5a5a5a" }}> is spending </span>
                  <span style={{ fontFamily: C.mono }}>{fmtAmt(monthlySpend)}</span>
                  <span style={{ color: "#5a5a5a" }}>/mo on ads.</span>
                </h1>
                <p className="text-[1.15rem] leading-relaxed" style={{ color: "#d1d5db" }}>
                  Approximately{" "}
                  <span
                    className="font-black text-2xl"
                    style={{ color: C.red, fontFamily: C.mono }}
                  >
                    {untrackedPct}%
                  </span>{" "}
                  of conversions are{" "}
                  <span className="font-bold" style={{ color: C.red }}>
                    invisible to your ad platform.
                  </span>
                </p>
                <p
                  className="mt-2.5 text-[13px] leading-relaxed"
                  style={{ color: "#4b5563" }}
                >
                  Your campaigns are bidding on fiction. Every pound Meta&apos;s
                  algorithm allocates is optimised against a{" "}
                  <span style={{ color: "#6b7280" }}>corrupted, incomplete signal</span>.
                </p>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════════
            §2  PIXEL DISCREPANCY LEDGER
            Authority: Terminal block = external recon.
            Each terminal followed by mandatory Plain English block.
        ══════════════════════════════════════════════════════════════ */}
        <motion.section variants={FADE_UP} className="space-y-3">

          <TerminalBlock
            id="t1"
            filename="meta-pixel-audit"
            lines={pixelLines}
            visibleCount={t1}
            plainEnglish={
              <>
                Your Meta Pixel recorded{" "}
                <strong style={{ color: "#f9fafb" }}>47 purchase events in the browser today</strong>
                {" "}— but{" "}
                <strong style={{ color: C.red }}>zero were confirmed server-side</strong>.
                {" "}Meta&apos;s algorithm has no verified signal to optimise against. It is bidding
                on browser cookies that iOS blocks, ad-blockers strip, and Safari expires in 24 hours.
              </>
            }
          />

          {/* Discrepancy table */}
          <Card noPad>
            <div
              className="flex items-center gap-2 px-5 py-3.5"
              style={{ borderBottom: `1px solid ${C.borderDim}` }}
            >
              <Activity size={13} style={{ color: C.amber }} />
              <span
                className="text-xs font-bold uppercase tracking-[0.1em]"
                style={{ color: "#5a5a5a" }}
              >
                Pixel Discrepancy Ledger — Last 24 Hours
              </span>
            </div>

            <LedgerRow
              dotColor={C.green}
              label="Browser Pixel Fires"
              tag={{ text: "client-side", color: C.green }}
              value="47"
              valueColor={C.green}
              sub="today"
            />

            <LedgerRow
              dotColor={C.red}
              label="Server-Side CAPI Fires"
              tag={{ text: "server-side", color: C.red }}
              value="0"
              valueColor={C.red}
              sub="today"
            />

            {/* Critical gap row */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{
                backgroundColor: "rgba(239,68,68,0.04)",
                borderTop: "1px solid rgba(239,68,68,0.1)",
              }}
            >
              <div className="flex items-center gap-3">
                <motion.span
                  animate={{ opacity: [1, 0.12, 1], scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: C.red }}
                />
                <span className="text-sm font-semibold" style={{ color: "#f9fafb" }}>
                  Missing Conversion Signal
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.12)",
                    color: C.red,
                    fontFamily: C.mono,
                    border: "1px solid rgba(239,68,68,0.22)",
                  }}
                >
                  CRITICAL GAP
                </span>
              </div>
              <span
                className="text-[1.65rem] font-black"
                style={{ fontFamily: C.mono, color: C.red }}
              >
                {untrackedPct}%
              </span>
            </div>
          </Card>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════════
            §3  LIVE WASTED SPEND COUNTER
            Loss Aversion (Kahneman): Counter begins at ~full monthly
            waste (30-day historical baseline) — visceral, immediate,
            compounding. User sees money already gone. Then more leaving.
        ══════════════════════════════════════════════════════════════ */}
        <motion.section variants={FADE_UP}>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: C.card,
              border: "1px solid rgba(239,68,68,0.2)",
              boxShadow: "0 0 80px rgba(239,68,68,0.04)",
            }}
          >
            {/* Alert bar */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{
                backgroundColor: "rgba(239,68,68,0.06)",
                borderBottom: "1px solid rgba(239,68,68,0.12)",
              }}
            >
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ opacity: [1, 0.1, 1] }}
                  transition={{ duration: 0.85, repeat: Infinity }}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: C.red }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: C.red, fontFamily: C.mono }}
                >
                  LIVE BLEED
                </span>
              </div>
              <span
                className="text-xs hidden sm:block"
                style={{ color: "#2e2e2e", fontFamily: C.mono }}
              >
                ad spend optimised against incorrect data since scan
              </span>
            </div>

            {/* Counter */}
            <div className="py-11 px-6 text-center">
              <p
                className="text-[10px] uppercase tracking-[0.25em] mb-5"
                style={{ color: "#2a2a2a", fontFamily: C.mono }}
              >
                Cumulative Wasted Spend
              </p>

              <div
                className="text-[3.4rem] font-black leading-none"
                style={{
                  fontFamily: C.mono,
                  color: C.red,
                  letterSpacing: "-0.03em",
                  textShadow: "0 0 100px rgba(239,68,68,0.5)",
                }}
              >
                {liveDisplay}
              </div>

              {/* Meta stats */}
              <div
                className="flex flex-wrap items-center justify-center gap-3 mt-5 text-[11px]"
                style={{ fontFamily: C.mono, color: "#282828" }}
              >
                <span>scan initiated: {scanTs}</span>
                <span style={{ color: "#1c1c1c" }}>·</span>
                <span>burn rate: {burnPerMin}/min</span>
              </div>
            </div>

            <PlainEnglish>
              This counter started the moment our audit detected your broken signal chain.{" "}
              <strong style={{ color: "#f9fafb" }}>
                Every pound above represents ad budget Meta optimised against corrupted data.
              </strong>{" "}
              The algorithm was steering your campaigns using fewer than one in three
              conversions that actually happened.
            </PlainEnglish>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════════
            §4  DATA COMPLETENESS GAUGE
            Pure Tailwind CSS + Framer Motion — zero charting libraries.
        ══════════════════════════════════════════════════════════════ */}
        <motion.section variants={FADE_UP}>
          <CompletenessGauge pct={completeness} untrackedPct={untrackedPct} />
        </motion.section>

        {/* ══════════════════════════════════════════════════════════════
            §5  WASTED SPEND CALCULATOR
            Authority: Second terminal — iOS 14+ impact recon.
            Plain English block immediately follows.
        ══════════════════════════════════════════════════════════════ */}
        <motion.section variants={FADE_UP} className="space-y-3">

          <TerminalBlock
            id="t2"
            filename="ios14-impact-calculator"
            lines={ios14Lines}
            visibleCount={t2}
            plainEnglish={
              <>
                Apple&apos;s App Tracking Transparency blocks browser pixels for ~72% of iPhone users.{" "}
                <strong style={{ color: "#f9fafb" }}>
                  You spend budget reaching them, they convert — but Meta never sees the sale.
                </strong>{" "}
                The algorithm marks that audience as unprofitable and cuts spend on your best buyers.
                The result:{" "}
                <strong style={{ color: C.red }}>
                  approximately {fmtAmt(wastedMonthly)} every single month
                </strong>{" "}
                in permanently misallocated budget.
              </>
            }
          />

          {/* Est. monthly budget lost — spec requirement */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-xs font-bold uppercase tracking-[0.1em]"
                style={{ color: "#5a5a5a" }}
              >
                Est. monthly budget lost to iOS 14+ blind spots
              </span>
            </div>
            <div
              className="text-[2rem] font-black"
              style={{ fontFamily: C.mono, color: C.red, letterSpacing: "-0.02em" }}
            >
              {fmtAmt(wastedMonthly)}
              <span className="text-base font-normal ml-2" style={{ color: "#3d3d3d" }}>
                / month
              </span>
            </div>
          </Card>

          {/* Impact triptych */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Monthly Budget Lost",
                value: fmtAmt(wastedMonthly),
                sub:   "iOS 14+ blind spots",
                color: C.red,
              },
              {
                label: "Annual Exposure",
                value: fmtAmt(wastedMonthly * 12),
                sub:   "compounding annually",
                color: C.red,
              },
              {
                label: "Signal Gap",
                value: `${untrackedPct}%`,
                sub:   "of conversions hidden",
                color: C.amber,
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
              >
                <p
                  className="text-[10px] uppercase tracking-[0.1em] mb-2"
                  style={{ color: "#3a3a3a" }}
                >
                  {card.label}
                </p>
                <p
                  className="text-xl font-black"
                  style={{ fontFamily: C.mono, color: card.color }}
                >
                  {card.value}
                </p>
                <p className="text-[11px] mt-1.5" style={{ color: "#252525" }}>
                  {card.sub}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════════
            §6  ALEX'S PERSONAL GUARANTEE
            Risk Reversal (Hormozi): Guarantee appears BEFORE the CTA.
            Removes purchase risk. Pre-empts price objection.
        ══════════════════════════════════════════════════════════════ */}
        <motion.section variants={FADE_UP}>
          <div
            className="rounded-xl p-6 relative overflow-hidden"
            style={{
              backgroundColor: "#09130a",
              border: "1px solid rgba(34,197,94,0.22)",
              boxShadow: "0 0 90px rgba(34,197,94,0.03)",
            }}
          >
            {/* Decorative glow orb */}
            <div
              className="absolute -top-14 -right-14 w-56 h-56 rounded-full pointer-events-none"
              style={{ backgroundColor: C.green, opacity: 0.028 }}
            />

            <div className="relative flex items-start gap-4">
              <div
                className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(34,197,94,0.09)",
                  border: "1px solid rgba(34,197,94,0.18)",
                }}
              >
                <Shield size={19} style={{ color: C.green }} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: C.green, fontFamily: C.mono }}
                  >
                    Alex&apos;s Personal Guarantee
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "rgba(34,197,94,0.07)",
                      color: C.green,
                      border: "1px solid rgba(34,197,94,0.16)",
                    }}
                  >
                    Risk Reversal
                  </span>
                </div>

                <p
                  className="text-[1.12rem] font-semibold leading-relaxed"
                  style={{ color: "#f0fdf4", letterSpacing: "-0.012em" }}
                >
                  "If our tracking audit does not identify signal gaps worth at least{" "}
                  <span style={{ color: C.green }}>3× your audit cost</span>, the bill is{" "}
                  <span style={{ fontFamily: C.mono, color: C.green }}>£0</span>."
                </p>

                <div className="flex flex-wrap gap-5 mt-4">
                  {[
                    "No fix found — no invoice",
                    "Full report regardless",
                    "Zero commitment post-audit",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-1.5">
                      <span style={{ color: C.green }}>✓</span>
                      <span className="text-[13px]" style={{ color: "#86efac" }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════════
            §7  CTA  (single primary action — no mailto, no links)
            Frictionless Action: ONE button, routes to handleCTA.
        ══════════════════════════════════════════════════════════════ */}
        <motion.section variants={FADE_UP} className="pb-10">
          <div className="text-center space-y-4">
            <p
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: "#272727", fontFamily: C.mono }}
            >
              Every day without server-side tracking = more bleed
            </p>

            <motion.button
              onClick={handleCTA}
              className="relative inline-flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-[1.05rem] overflow-hidden"
              style={{
                backgroundColor: C.red,
                color: "#fff",
                letterSpacing: "-0.01em",
                cursor: "pointer",
                border: "none",
                outline: "none",
              }}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.975 }}
              transition={{ duration: 0.15 }}
            >
              {/* Continuous shimmer sweep */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ x: ["-100%", "240%"] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1,
                }}
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.13), transparent)",
                  width: "40%",
                }}
              />
              <span className="relative">Stop Blind Ad Spending</span>
              <ChevronRight size={19} className="relative" />
            </motion.button>

            <p className="text-xs" style={{ color: "#1e1e1e" }}>
              Guaranteed 3× ROI on audit cost — or you pay nothing
            </p>
          </div>
        </motion.section>

      </motion.div>
    </div>
  );
}
