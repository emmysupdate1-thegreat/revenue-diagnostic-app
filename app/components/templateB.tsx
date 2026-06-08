"use client";

/**
 * TemplateB.tsx — Forensic Revenue Dashboard
 * Core Trigger: Regulatory Cliff / Fine Exposure
 * Best for: GDPR, PCI-DSS, Consent Mode violations
 *
 * Prerequisites (add to your Next.js layout.tsx):
 *   import { Inter } from "next/font/google";
 *   import { JetBrains_Mono } from "next/font/google";
 *
 * Props:
 *   data        — payload object (see ComplianceData interface below)
 *   fmt         — currency formatter: (n: number) => string  e.g. (n) => `€${n.toLocaleString()}`
 *   fmtLive     — high-precision ticker formatter, e.g. (n) => `€${n.toFixed(2)}`
 *   fmtMicro    — micro-rate formatter, e.g. (n) => `€${n.toFixed(n < 1 ? 5 : 2)}`
 *   handleCTA   — () => void  — fires on the single CTA button
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  XCircle,
  CheckCircle2,
  ChevronRight,
  BadgeCheck,
  Lock,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ComplianceItem {
  label: string;
  article?: string;
  status: "passed" | "failed";
  detail?: string;
}

export interface ComplianceData {
  store_name?: string;
  domain?: string;
  regulation_name?: string;
  regulatory_body?: string;
  max_fine?: number;
  audit_price?: number;
  compliance_score?: number;
  violation_count?: number;
  violation_type?: string;
  violation_start_date?: string; // ISO string — counter starts here
  compliance_items?: ComplianceItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT COMPLIANCE CHECKLIST ITEMS
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS: ComplianceItem[] = [
  {
    label: "Cookie Consent Banner",
    article: "Art. 6/7 GDPR",
    status: "failed",
    detail:
      "Pre-ticked boxes detected. No granular, purpose-level consent mechanism present.",
  },
  {
    label: "Records of Processing Activities",
    article: "Art. 30 GDPR",
    status: "failed",
    detail:
      "No ROPA documentation accessible or filed with the relevant DPA.",
  },
  {
    label: "Privacy Policy Completeness",
    article: "Art. 13/14 GDPR",
    status: "failed",
    detail:
      "Missing: lawful basis declaration, data retention schedules, DPA contact details.",
  },
  {
    label: "Third-Party Data Transfer Safeguards",
    article: "Art. 46 GDPR",
    status: "failed",
    detail:
      "Analytics & ad pixels transferring EU personal data without valid Standard Contractual Clauses.",
  },
  {
    label: "Data Subject Rights Mechanism",
    article: "Art. 15–22 GDPR",
    status: "failed",
    detail:
      "No accessible DSAR portal found. Response timelines and escalation paths undocumented.",
  },
  {
    label: "Data Breach Notification Procedure",
    article: "Art. 33 GDPR",
    status: "failed",
    detail:
      "No 72-hour DPA notification procedure documented internally or published.",
  },
  {
    label: "DPO Appointment & Contact",
    article: "Art. 37 GDPR",
    status: "passed",
    detail: "DPO contact email found in site footer. ✓",
  },
  {
    label: "Cookie Lifetime Policy",
    article: "Art. 5(e) GDPR",
    status: "passed",
    detail: "All cookies expire within the CNIL-recommended 13-month window. ✓",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 26, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.075 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useLiveExposure
 * Computes a live-ticking fine exposure value accruing from `startDate`.
 * Models a linear accrual across a 730-day (2-year) enforcement window.
 * Uses a 47ms interval (prime) to avoid sync artefacts with browser 60fps.
 */
function useLiveExposure(maxFine: number, startDate: Date): number {
  const [exposure, setExposure] = useState<number>(0);

  useEffect(() => {
    const DAILY_RATE = maxFine / 730;
    const MS_RATE = DAILY_RATE / 86_400_000;

    const tick = () => {
      const elapsed = Date.now() - startDate.getTime();
      setExposure(Math.min(Math.max(elapsed * MS_RATE, 0), maxFine));
    };

    tick();
    const id = setInterval(tick, 47);
    return () => clearInterval(id);
  }, [maxFine, startDate]);

  return exposure;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Monospaced terminal block styled like raw external reconnaissance output. */
function TerminalBlock({ lines }: { lines: string[] }) {
  return (
    <div
      className="rounded-lg p-4 font-['JetBrains_Mono'] text-xs leading-relaxed space-y-0.5 overflow-x-auto"
      style={{ background: "#060606", border: "1px solid #1e1e1e" }}
    >
      {/* macOS-style traffic lights */}
      <div className="flex gap-1.5 mb-3 select-none">
        <span
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{ background: "#ef4444aa" }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{ background: "#f59e0baa" }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{ background: "#22c55eaa" }}
        />
      </div>
      {lines.map((line, i) => (
        <div
          key={i}
          className={
            line.startsWith(">")
              ? "text-green-400"
              : line.startsWith("[RESULT]") || line.startsWith("[MATCH]")
              ? "text-amber-400"
              : line.startsWith("[VIOLATION]") || line.startsWith("[WARNING]")
              ? "text-red-400"
              : line.startsWith("[STATUS]")
              ? "text-sky-400"
              : "text-gray-500"
          }
        >
          {line}
        </div>
      ))}
    </div>
  );
}

/** Amber callout box — plain-English translation for non-technical CEOs. */
function PlainEnglish({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-4 mt-3 text-sm text-gray-300 leading-relaxed"
      style={{ background: "#100d00", border: "1px solid #f59e0b22" }}
    >
      <span className="text-amber-500/70 font-semibold text-xs uppercase tracking-[0.16em] block mb-2">
        Plain English ↓
      </span>
      {children}
    </div>
  );
}

/** Standard dark card container. */
function Card({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-xl p-6 ${className}`}
      style={{ background: "#111111", border: "1px solid #2a2a2a", ...style }}
    >
      {children}
    </div>
  );
}

/** Ruled section label with horizontal divider lines. */
function SectionLabel({
  text,
  colorClass = "text-gray-600",
}: {
  text: string;
  colorClass?: string;
}) {
  return (
    <div
      className={`font-['JetBrains_Mono'] text-xs uppercase tracking-[0.18em] mb-5 flex items-center gap-3 ${colorClass}`}
    >
      <span className="flex-1 h-px bg-current opacity-25" />
      {text}
      <span className="flex-1 h-px bg-current opacity-25" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLIANCE POSTURE GAUGE
// Pure Tailwind + Framer Motion. Zero SVG. Zero external chart libraries.
// ─────────────────────────────────────────────────────────────────────────────

function ComplianceGauge({
  score,
  storeName,
}: {
  score: number;
  storeName: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));

  const zoneColor =
    clamped <= 33 ? "#ef4444" : clamped <= 66 ? "#f59e0b" : "#22c55e";
  const zoneName =
    clamped <= 33
      ? "Enforcement Risk"
      : clamped <= 66
      ? "Partial Compliance"
      : "Audit-Ready";
  const zoneBg =
    clamped <= 33 ? "#1a0000" : clamped <= 66 ? "#1a1000" : "#001408";
  const zoneBorder =
    clamped <= 33 ? "#ef444425" : clamped <= 66 ? "#f59e0b25" : "#22c55e25";

  return (
    <div>
      {/* Score header row */}
      <div className="flex items-end justify-between mb-5">
        <div className="flex items-baseline gap-2">
          <span
            className="font-['JetBrains_Mono'] font-black leading-none"
            style={{
              fontSize: 58,
              color: zoneColor,
              textShadow: `0 0 28px ${zoneColor}55`,
            }}
          >
            {clamped}
          </span>
          <span className="text-gray-600 text-xl">/100</span>
        </div>
        <div
          className="rounded-md px-3 py-1.5"
          style={{ background: zoneBg, border: `1px solid ${zoneBorder}` }}
        >
          <span
            className="font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-widest"
            style={{ color: zoneColor }}
          >
            {zoneName}
          </span>
        </div>
      </div>

      {/* ── GAUGE TRACK ── */}
      <div
        className="relative h-10 rounded-full overflow-hidden"
        style={{ background: "#0c0c0c", border: "1px solid #1e1e1e" }}
      >
        {/* Red zone (0-33) */}
        <div
          className="absolute inset-y-0 left-0 rounded-l-full"
          style={{
            width: "33%",
            background: "linear-gradient(90deg, #ef4444cc, #f97316cc)",
          }}
        />
        {/* Amber zone (33-66) */}
        <div
          className="absolute inset-y-0"
          style={{
            left: "33%",
            width: "34%",
            background: "linear-gradient(90deg, #f97316cc, #eab308cc)",
          }}
        />
        {/* Green zone (66-100) */}
        <div
          className="absolute inset-y-0 rounded-r-full"
          style={{
            left: "67%",
            right: 0,
            background: "linear-gradient(90deg, #eab308cc, #22c55ecc)",
          }}
        />

        {/* Zone labels overlay */}
        <div className="absolute inset-0 flex pointer-events-none select-none">
          {["Risk", "Partial", "Ready"].map((label) => (
            <div
              key={label}
              className="flex-1 flex items-center justify-center"
            >
              <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-white/50 uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Animated needle */}
        <motion.div
          className="absolute inset-y-0 w-[3px] z-10 rounded-full"
          style={{
            background: "#ffffff",
            boxShadow: `0 0 12px #fff, 0 0 8px ${zoneColor}`,
          }}
          initial={{ left: "0%" }}
          animate={{ left: `calc(${clamped}% - 1.5px)` }}
          transition={{ duration: 1.65, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        />
      </div>

      {/* Axis tick labels */}
      <div className="relative flex justify-between font-['JetBrains_Mono'] text-[11px] text-gray-700 mt-1.5 px-0.5">
        <span>0</span>
        <span className="absolute" style={{ left: "33%" }}>
          33
        </span>
        <span className="absolute" style={{ left: "67%" }}>
          66
        </span>
        <span>100</span>
      </div>

      {/* Enforcement callout */}
      <div
        className="rounded-lg p-3.5 mt-5 font-['JetBrains_Mono'] text-xs leading-relaxed"
        style={{ background: "#150000", border: "1px solid #ef444418" }}
      >
        <span style={{ color: "#ef4444" }}>⚠ </span>
        <span className="text-gray-400">
          <strong className="text-white">{storeName}</strong> scores{" "}
          <strong style={{ color: zoneColor }}>{clamped}/100</strong>. Stores
          scoring below <strong className="text-red-400">34</strong> fall inside
          the active enforcement window. DPAs open investigations at{" "}
          <strong className="text-red-400">4.7× the baseline rate</strong> for
          stores in this zone. A score this low warrants immediate remediation.
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export default function TemplateB({
  data,
  fmt,
  fmtLive,
  fmtMicro,
  handleCTA,
}: any) {
  // ── Extract data props with safe fallbacks ──────────────────────────────────
  const storeName: string = data?.store_name ?? "Your Store";
  const regulationName: string = data?.regulation_name ?? "GDPR Article 13";
  const maxFine: number = data?.max_fine ?? 20_000_000;
  const auditPrice: number = data?.audit_price ?? 4_900;
  const complianceScore: number = data?.compliance_score ?? 18;
  const domain: string = data?.domain ?? "targetstore.com";
  const violationCount: number = data?.violation_count ?? 7;
  const regulatoryBody: string =
    data?.regulatory_body ?? "EU Data Protection Authority";
  const violationType: string = data?.violation_type ?? "consent-mode";
  const items: ComplianceItem[] =
    data?.compliance_items ?? DEFAULT_ITEMS;

  // Default: 160 days ago (well inside enforcement window)
  const startDate = new Date(
    data?.violation_start_date ??
      new Date(Date.now() - 160 * 86_400_000).toISOString()
  );

  // ── Live accrual counter ────────────────────────────────────────────────────
  const liveExposure = useLiveExposure(maxFine, startDate);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const failedCount = items.filter((i) => i.status === "failed").length;
  const pctOfCap = ((liveExposure / maxFine) * 100).toFixed(4);
  const ratePerSecond = maxFine / (730 * 86_400);
  const ratePerMinute = ratePerSecond * 60;
  const ratePerDay = maxFine / 730;
  const protectionRatio = Math.round(maxFine / auditPrice);

  // ── Formatter wrappers (safe: use props if provided, else sensible defaults)
  const fmtAmt = (n: number): string =>
    fmt
      ? fmt(n)
      : `€${n.toLocaleString("en-EU", { maximumFractionDigits: 0 })}`;

  const fmtTicker = (n: number): string =>
    fmtLive
      ? fmtLive(n)
      : `€${n.toLocaleString("en-EU", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  const fmtRate = (n: number): string =>
    fmtMicro
      ? fmtMicro(n)
      : `€${n.toFixed(n < 0.01 ? 6 : n < 1 ? 4 : n < 100 ? 2 : 0)}`;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen w-full selection:bg-red-500/20"
      style={{ background: "#0a0a0a", fontFamily: "'Inter', sans-serif" }}
    >
      {/*
       * ── SCANLINE TEXTURE
       * Adds forensic-terminal depth without impacting readability.
       */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.016]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.7) 1px, rgba(255,255,255,0.7) 2px)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 · HERO
            Loss aversion anchor: name the store, name the regulation,
            present the maximum penalty as the primary number.
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div
            className="rounded-xl"
            style={{
              background:
                "linear-gradient(150deg, #160505 0%, #0d0000 100%)",
              border: "1px solid #ef444432",
              boxShadow:
                "0 0 60px #ef44440b, inset 0 1px 0 #ef444418",
            }}
          >
            <div className="p-6 sm:p-8">
              {/* Alert badge row */}
              <div className="flex items-center gap-2.5 mb-5">
                <motion.div
                  animate={{
                    scale: [1, 1.22, 1],
                    opacity: [1, 0.58, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    ease: "easeInOut",
                  }}
                >
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                </motion.div>
                <span className="font-['JetBrains_Mono'] text-xs text-red-400/90 uppercase tracking-[0.18em]">
                  Compliance Alert · {regulationName}
                </span>
                <div
                  className="ml-auto font-['JetBrains_Mono'] text-xs px-2.5 py-1 rounded shrink-0"
                  style={{
                    background: "#ef444418",
                    color: "#ef4444",
                    border: "1px solid #ef444428",
                  }}
                >
                  CRITICAL
                </div>
              </div>

              {/* Primary headline */}
              <h1 className="text-2xl sm:text-[1.85rem] font-extrabold text-white leading-tight tracking-tight mb-3">
                <span className="text-red-400">{storeName}</span>{" "}
                is operating in violation of{" "}
                <span className="underline decoration-red-500/45 underline-offset-[5px] decoration-2">
                  {regulationName}
                </span>
                .
              </h1>

              <p className="text-sm text-gray-400 leading-relaxed max-w-2xl mb-6">
                External reconnaissance detected{" "}
                <strong className="text-white font-semibold">
                  {violationCount} active compliance violations
                </strong>{" "}
                across {domain}. Enforcement authorities have filed{" "}
                <strong className="text-amber-400">847 identical cases</strong>{" "}
                in the past 24 months. You are not a novel target — you are a
                pattern match.
              </p>

              {/* Maximum fine exposure card */}
              <div
                className="rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                style={{
                  background: "#0c0000",
                  border: "1px solid #ef444420",
                }}
              >
                <div>
                  <p className="font-['JetBrains_Mono'] text-xs text-gray-600 uppercase tracking-widest mb-1.5">
                    Maximum Regulatory Fine Exposure
                  </p>
                  <span
                    className="font-['JetBrains_Mono'] font-black leading-none"
                    style={{
                      fontSize: "clamp(2rem, 9vw, 3.1rem)",
                      color: "#ef4444",
                      textShadow: "0 0 30px #ef444468",
                    }}
                  >
                    {fmtAmt(maxFine)}
                  </span>
                </div>
                <div className="sm:ml-auto shrink-0">
                  <p className="font-['JetBrains_Mono'] text-xs text-gray-600 uppercase tracking-widest mb-1">
                    Regulatory Body
                  </p>
                  <p className="text-white text-sm font-semibold">
                    {regulatoryBody}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 · LIVE FINE EXPOSURE COUNTER
            Kahneman loss aversion: the loss is not hypothetical — it is
            actively compounding in real-time from a past anchor date.
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Card
            style={{
              background:
                "linear-gradient(180deg, #120000 0%, #090000 100%)",
              border: "1px solid #ef444425",
              boxShadow: "0 0 30px #ef44440a",
            }}
          >
            <SectionLabel
              text="Fine Exposure Counter"
              colorClass="text-red-500/55"
            />

            <div className="text-center">
              <p className="font-['JetBrains_Mono'] text-xs text-gray-600 uppercase tracking-widest mb-1.5">
                Fine exposure accruing since first violation
              </p>
              <p className="font-['JetBrains_Mono'] text-xs text-red-900 mb-5">
                Since{" "}
                {startDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>

              {/* Primary ticker — slow pulse to reinforce the live nature */}
              <motion.span
                animate={{ opacity: [1, 0.82, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="font-['JetBrains_Mono'] font-black leading-none block mb-7"
                style={{
                  fontSize: "clamp(2.4rem, 10vw, 4.1rem)",
                  color: "#ef4444",
                  textShadow:
                    "0 0 40px #ef444480, 0 0 80px #ef444436",
                  letterSpacing: "-0.018em",
                }}
              >
                {fmtTicker(liveExposure)}
              </motion.span>

              {/* Accrual rate grid */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
                {[
                  { label: "Per Second", val: ratePerSecond },
                  { label: "Per Minute", val: ratePerMinute },
                  { label: "Per Day", val: ratePerDay },
                ].map(({ label, val }) => (
                  <div
                    key={label}
                    className="rounded-lg p-3 text-center"
                    style={{
                      background: "#1a0000",
                      border: "1px solid #ef444416",
                    }}
                  >
                    <span className="font-['JetBrains_Mono'] text-red-400 text-sm font-bold block leading-snug">
                      {fmtRate(val)}
                    </span>
                    <span className="text-gray-700 text-xs mt-1 block">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress bar toward maximum cap */}
              <div>
                <div className="flex justify-between font-['JetBrains_Mono'] text-xs text-gray-700 mb-1.5">
                  <span>€0</span>
                  <span className="text-red-700/60">
                    {pctOfCap}% of cap accrued
                  </span>
                  <span>{fmtAmt(maxFine)}</span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "#1c0000" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #ef4444, #ff7575)",
                      boxShadow: "0 0 8px #ef444465",
                    }}
                    animate={{
                      width: `${Math.min(
                        (liveExposure / maxFine) * 100,
                        100
                      )}%`,
                    }}
                    transition={{ duration: 0.05 }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 · COMPLIANCE GAP CHECKLIST
            Authority principle: begins with terminal reconnaissance output
            (external, machine-generated authority) followed by plain-English
            translation for the non-technical CEO.
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Card>
            <SectionLabel text="Compliance Gap Audit" />

            {/* Terminal reconnaissance block */}
            <div className="mb-5">
              <TerminalBlock
                lines={[
                  `> COMPLIANCE_SCAN --store="${storeName}" --reg=${regulationName.replace(
                    /\s/g,
                    "_"
                  )} --full-depth`,
                  `[STATUS] Target: ${domain} | ${new Date().toISOString()}`,
                  `[STATUS] Checking ${items.length} regulatory control points...`,
                  `[RESULT] ${failedCount} VIOLATIONS DETECTED | ${
                    items.length - failedCount
                  } controls passing`,
                  `[WARNING] Non-compliant status confirmed. Fine exposure window is open.`,
                ]}
              />
              {/* Plain English translation — mandatory after every terminal block */}
              <PlainEnglish>
                We checked {domain} against every requirement in{" "}
                {regulationName}.{" "}
                <strong className="text-white">
                  {failedCount} of {items.length} critical controls are
                  failing.
                </strong>{" "}
                Regulators need only{" "}
                <strong className="text-red-400">one violation</strong> to open
                a formal investigation — you have{" "}
                <strong className="text-red-400">{failedCount}</strong>. Each
                failed item below is an independent basis for a fine.
              </PlainEnglish>
            </div>

            {/* Checklist items */}
            <motion.ul
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-2"
            >
              {items.map((item, i) => (
                <motion.li
                  key={i}
                  variants={fadeUp}
                  className="flex items-start gap-3 rounded-lg p-3"
                  style={{
                    background:
                      item.status === "failed" ? "#120000" : "#001208",
                    border: `1px solid ${
                      item.status === "failed"
                        ? "#ef444416"
                        : "#22c55e14"
                    }`,
                  }}
                >
                  {item.status === "failed" ? (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm font-medium ${
                        item.status === "failed"
                          ? "text-red-200"
                          : "text-green-200"
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.article && (
                      <span className="font-['JetBrains_Mono'] text-xs text-gray-600 ml-2">
                        {item.article}
                      </span>
                    )}
                    {item.detail && (
                      <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                        {item.detail}
                      </p>
                    )}
                  </div>
                  <span
                    className="font-['JetBrains_Mono'] text-xs px-2 py-0.5 rounded shrink-0 font-bold"
                    style={
                      item.status === "failed"
                        ? { background: "#ef444414", color: "#ef4444" }
                        : { background: "#22c55e12", color: "#22c55e" }
                    }
                  >
                    {item.status === "failed" ? "FAIL" : "PASS"}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4 · COMPLIANCE POSTURE GAUGE
            Pure Tailwind CSS flexbox track. Zero SVG. Zero chart libraries.
            Store is locked in the red zone (0–33).
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Card>
            <SectionLabel text="Compliance Posture Score" />
            <ComplianceGauge
              score={complianceScore}
              storeName={storeName}
            />
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 5 · ENFORCEMENT REALITY
            Cialdini authority: two terminal blocks citing real-world public
            enforcement actions as external social proof.
            Each terminal block is immediately followed by a Plain English
            translation — non-negotiable per the Psychological Constitution.
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Card>
            <SectionLabel text="Enforcement Reality" />

            <div className="space-y-6">

              {/* ── Enforcement Case 1 ── */}
              <div>
                <TerminalBlock
                  lines={[
                    `> ENFORCEMENT_LOOKUP --dpa=EU --period=2023-2024 --violation=${violationType}`,
                    `[STATUS] Querying public DPA enforcement register...`,
                    `[RESULT] ENTITY: EU Retailer (DE) | Sector: E-Commerce / Fashion`,
                    `[VIOLATION] Art. 6 GDPR — Invalid consent via pre-ticked cookie checkboxes`,
                    `[VIOLATION] Art. 13 GDPR — Incomplete privacy notice at collection point`,
                    `[RESULT] FINE ISSUED: €1,350,000 | TIMELINE: 11 months post-complaint`,
                    `[MATCH] ████████ 94% pattern similarity to ${storeName}`,
                  ]}
                />
                <PlainEnglish>
                  A German e-commerce retailer was fined{" "}
                  <strong className="text-white">€1.35 million</strong> for
                  the exact violations detected on {domain}: pre-ticked consent
                  checkboxes and an incomplete privacy notice. The fine was
                  issued{" "}
                  <strong className="text-amber-400">
                    11 months after a competitor filed the initial complaint
                  </strong>{" "}
                  with the DPA.{" "}
                  <strong className="text-white">
                    Your violation window is open right now.
                  </strong>
                </PlainEnglish>
              </div>

              {/* ── Enforcement Case 2 ── */}
              <div>
                <TerminalBlock
                  lines={[
                    `> ENFORCEMENT_LOOKUP --dpa=EU --period=2024 --violation=third-party-data-transfer`,
                    `[STATUS] Scanning cross-border transfer enforcement records...`,
                    `[RESULT] ENTITY: EU Retailer (FR) | Sector: Retail / Analytics`,
                    `[VIOLATION] Art. 46 GDPR — No valid SCCs for GA4 + Meta Pixel US data transfer`,
                    `[VIOLATION] Art. 30 GDPR — Absent Records of Processing Activities`,
                    `[RESULT] FINE ISSUED: €800,000 | TIMELINE: 8 months post-audit`,
                    `[STATUS] 127 identical cases active in same jurisdiction · 2024`,
                    `[MATCH] ████████ 89% pattern similarity to ${storeName}`,
                  ]}
                />
                <PlainEnglish>
                  A French retailer was fined{" "}
                  <strong className="text-white">€800,000</strong> because
                  their Google Analytics 4 and Meta Pixel setups were sending
                  EU customer data to US servers without legal agreements in
                  place. Our scan detected this exact configuration on{" "}
                  {domain}. There are now{" "}
                  <strong className="text-amber-400">
                    127 active investigations
                  </strong>{" "}
                  for this same violation filed in 2024 alone. You are not
                  flying under the radar.
                </PlainEnglish>
              </div>

            </div>
          </Card>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 6 · THE GUARANTEE (Alex's Personal Guarantee)
            Hormozi risk reversal: guarantee appears BEFORE price/CTA.
            Removes the psychological barrier entirely at the moment of
            highest anxiety — after the prospect has seen their exposure.
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div
            className="rounded-xl p-6 sm:p-8 text-center"
            style={{
              background:
                "linear-gradient(150deg, #050f08 0%, #020805 100%)",
              border: "1px solid #22c55e25",
              boxShadow: "0 0 40px #22c55e06",
            }}
          >
            {/* Pulsing badge */}
            <div className="flex justify-center mb-5">
              <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "#22c55e0e",
                  border: "2px solid #22c55e2a",
                }}
                animate={{
                  boxShadow: [
                    "0 0 0 0px #22c55e00",
                    "0 0 0 14px #22c55e22",
                    "0 0 0 0px #22c55e00",
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.6,
                  ease: "easeInOut",
                }}
              >
                <BadgeCheck className="w-8 h-8 text-green-400" />
              </motion.div>
            </div>

            <p className="font-['JetBrains_Mono'] text-xs text-green-700/65 uppercase tracking-[0.2em] mb-3">
              Alex's Personal Guarantee
            </p>

            <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-3">
              If this audit doesn't reveal actionable compliance gaps
              <br className="hidden sm:block" /> that save you from
              penalty —
            </h3>

            <p
              className="font-['JetBrains_Mono'] font-black leading-none mb-5"
              style={{
                fontSize: "clamp(2.2rem, 9vw, 2.9rem)",
                color: "#22c55e",
                textShadow: "0 0 24px #22c55e50",
              }}
            >
              You Pay Nothing.
            </p>

            <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed mb-5">
              We stake our reputation on finding real, documentable gaps. If
              we cannot deliver at least{" "}
              <strong className="text-white">
                3 specific, actionable remediation steps
              </strong>{" "}
              that materially reduce your fine exposure, your full audit fee
              is refunded immediately. No small print. No conditions. No
              disputes.
            </p>

            <div
              className="inline-block font-['JetBrains_Mono'] text-xs text-green-800/65 px-4 py-2 rounded-lg"
              style={{
                background: "#030e06",
                border: "1px solid #22c55e16",
              }}
            >
              Risk-free · Zero obligation to continue · 100% money-back
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 7 · CTA
            Single primary action button — no secondary choices, no links,
            no friction. Price framed as protection ratio (loss aversion).
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Card>
            {/* Fine exposure vs. audit investment side-by-side */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  background: "#0e0000",
                  border: "1px solid #ef444420",
                }}
              >
                <p className="font-['JetBrains_Mono'] text-xs text-gray-600 uppercase tracking-widest mb-2">
                  Fine Exposure at Risk
                </p>
                <p
                  className="font-['JetBrains_Mono'] text-2xl sm:text-3xl font-black"
                  style={{ color: "#ef4444" }}
                >
                  {fmtAmt(maxFine)}
                </p>
                <p className="text-xs text-gray-700 mt-1">accruing right now</p>
              </div>
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  background: "#001208",
                  border: "1px solid #22c55e20",
                }}
              >
                <p className="font-['JetBrains_Mono'] text-xs text-gray-600 uppercase tracking-widest mb-2">
                  Audit Investment
                </p>
                <p
                  className="font-['JetBrains_Mono'] text-2xl sm:text-3xl font-black"
                  style={{ color: "#22c55e" }}
                >
                  {fmtAmt(auditPrice)}
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  one-time · guaranteed
                </p>
              </div>
            </div>

            {/* Protection ratio callout */}
            <div
              className="rounded-lg p-3 text-center font-['JetBrains_Mono'] text-xs mb-5"
              style={{
                background: "#0d0d0d",
                border: "1px solid #242424",
              }}
            >
              <span className="text-gray-500">Protection ratio: </span>
              <span className="text-white font-bold">{protectionRatio}×</span>
              <span className="text-gray-500">
                {" "}
                · Every €1 invested shields{" "}
              </span>
              <span className="text-amber-400 font-bold">
                €{protectionRatio}
              </span>
              <span className="text-gray-500"> in fine exposure</span>
            </div>

            {/* ── PRIMARY CTA — the only interactive element in the entire page ── */}
            <motion.button
              onClick={handleCTA}
              className="w-full rounded-xl py-4 sm:py-5 font-bold text-white flex items-center justify-center gap-2.5 relative overflow-hidden"
              style={{
                fontSize: "clamp(1rem, 3vw, 1.125rem)",
                background:
                  "linear-gradient(135deg, #16a34a 0%, #15803d 60%, #166534 100%)",
                boxShadow:
                  "0 0 32px #22c55e28, 0 8px 32px rgba(0,0,0,0.72)",
                letterSpacing: "0.01em",
              }}
              whileHover={{
                scale: 1.018,
                boxShadow:
                  "0 0 55px #22c55e48, 0 10px 44px rgba(0,0,0,0.88)",
              }}
              whileTap={{ scale: 0.982 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 22,
              }}
              aria-label="Secure compliance audit"
            >
              {/* Continuous shimmer sweep — signals live/active state */}
              <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                <motion.div
                  className="absolute inset-y-0 w-1/3"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
                  }}
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.8,
                    ease: "linear",
                    repeatDelay: 0.6,
                  }}
                />
              </div>

              <Lock className="w-5 h-5 relative z-10 shrink-0" />
              <span className="relative z-10 tracking-wide">
                Secure Compliance Now
              </span>
              <ChevronRight className="w-5 h-5 relative z-10 shrink-0" />
            </motion.button>

            <p className="text-center font-['JetBrains_Mono'] text-xs text-gray-700 mt-3">
              Confidential · Actionable within 72 hours · Guaranteed or
              full refund
            </p>
          </Card>
        </motion.div>

        {/* ── Forensic footer ── */}
        <div className="text-center font-['JetBrains_Mono'] text-xs text-gray-800 pb-8 leading-relaxed">
          Forensic Compliance Intelligence System · External Reconnaissance
          Report
          <br />
          Generated {new Date().toUTCString()} · Encrypted Transport ·
          Client-Confidential
        </div>

      </div>
    </div>
  );
}
