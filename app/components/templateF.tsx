"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CheckCheck,
  Clock,
  Layers,
  Lock,
  Shield,
  Star,
  TrendingDown,
  XCircle,
  Zap,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// MOTION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUS CONFIG — plugin compatibility badge system
// ─────────────────────────────────────────────────────────────────────────────
type PluginStatus = "breaking" | "needs_testing" | "compatible";

const STATUS_CFG: Record<
  PluginStatus,
  { label: string; Icon: React.ElementType; bg: string; border: string; color: string }
> = {
  breaking: {
    label: "Breaking Change",
    Icon: XCircle,
    bg: "rgba(239,68,68,0.09)",
    border: "rgba(239,68,68,0.32)",
    color: "#ef4444",
  },
  needs_testing: {
    label: "Needs Testing",
    Icon: AlertTriangle,
    bg: "rgba(245,158,11,0.09)",
    border: "rgba(245,158,11,0.32)",
    color: "#f59e0b",
  },
  compatible: {
    label: "Compatible",
    Icon: CheckCircle2,
    bg: "rgba(34,197,94,0.09)",
    border: "rgba(34,197,94,0.22)",
    color: "#22c55e",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS — defined outside main to avoid remount on every render
// ─────────────────────────────────────────────────────────────────────────────
function TerminalWindow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: "#070707", border: "1px solid #191919" }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid #191919" }}
      >
        <span className="w-3 h-3 rounded-full bg-red-500 opacity-80 flex-shrink-0" />
        <span className="w-3 h-3 rounded-full bg-amber-500 opacity-80 flex-shrink-0" />
        <span className="w-3 h-3 rounded-full bg-green-500 opacity-80 flex-shrink-0" />
        <span
          className="ml-2 text-xs font-['JetBrains_Mono'] truncate"
          style={{ color: "#3a3a3a" }}
        >
          recon@wc-audit-engine:~$ — {title}
        </span>
      </div>
      <div className="p-4 font-['JetBrains_Mono'] text-xs space-y-1 leading-relaxed text-gray-500">
        {children}
      </div>
    </div>
  );
}

function PlainEnglish({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mt-3 p-4 rounded-xl"
      style={{
        backgroundColor: "rgba(245,158,11,0.05)",
        border: "1px solid rgba(245,158,11,0.18)",
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-base flex-shrink-0 mt-0.5">📋</span>
        <p className="text-sm text-gray-300 leading-relaxed">
          <span
            className="text-xs font-bold uppercase tracking-wider mr-1"
            style={{ color: "#f59e0b" }}
          >
            Plain English:
          </span>
          {children}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Template6({
  data,
  fmt,
  fmtLive,
  fmtMicro,
  handleCTA,
}: any) {
  const [liveRisk, setLiveRisk] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const gaugeRef = useRef<HTMLDivElement>(null);
  const gaugeInView = useInView(gaugeRef, { once: true, margin: "-80px" });

  // ── DATA / FALLBACKS ────────────────────────────────────────────────────────
  const store: string = data?.store ?? "YourStore.com";
  const wcVersion: string = data?.wc_version ?? "8.3.5";
  const targetVersion: string = data?.target_version ?? "9.0.0";
  const conflictCount: number = data?.conflict_count ?? 7;
  const downtime6h: number = data?.downtime_loss_6h ?? 14_850;
  const downtime12h: number = data?.downtime_loss_12h ?? 29_700;
  const dailyRevenue: number = data?.daily_revenue ?? 5_940;
  const complexityScore: number = Math.min(
    100,
    Math.max(0, data?.complexity_score ?? 78)
  );

  const hourlyRevenue = dailyRevenue / 24;
  const complexityLabel =
    complexityScore >= 70 ? "HIGH" : complexityScore >= 40 ? "MEDIUM" : "LOW";
  const complexityColor =
    complexityScore >= 70
      ? "#ef4444"
      : complexityScore >= 40
      ? "#f59e0b"
      : "#22c55e";

  const plugins: Array<{
    name: string;
    version: string;
    status: PluginStatus;
    category: string;
  }> = data?.plugins ?? [
    { name: "WooCommerce Subscriptions", version: "5.2.1", status: "breaking", category: "Payments" },
    { name: "WooCommerce Payments", version: "7.1.0", status: "needs_testing", category: "Payments" },
    { name: "WPML WooCommerce Multilingual", version: "4.13.0", status: "breaking", category: "i18n" },
    { name: "WooCommerce Stripe Gateway", version: "8.3.1", status: "needs_testing", category: "Payments" },
    { name: "Advanced Custom Fields Pro", version: "6.2.4", status: "compatible", category: "Fields" },
    { name: "Yoast SEO Premium", version: "21.6", status: "compatible", category: "SEO" },
    { name: "WooCommerce Bookings", version: "2.0.3", status: "breaking", category: "Bookings" },
    { name: "CartFlows Pro", version: "1.11.14", status: "needs_testing", category: "Checkout" },
  ];

  const breakingPlugins = plugins.filter((p) => p.status === "breaking");
  const testingPlugins = plugins.filter((p) => p.status === "needs_testing");
  const compatiblePlugins = plugins.filter((p) => p.status === "compatible");

  // ── LIVE COUNTER — starts from a historical "legacy start" date, not zero ──
  useEffect(() => {
    setIsClient(true);
    const LEGACY_START = new Date();
    LEGACY_START.setDate(LEGACY_START.getDate() - 90); // 90 days of legacy exposure
    const riskPerSecond = (dailyRevenue * 0.18) / 86_400;
    const secsElapsed = (Date.now() - LEGACY_START.getTime()) / 1_000;
    setLiveRisk(secsElapsed * riskPerSecond);
    const id = setInterval(
      () => setLiveRisk((v) => v + riskPerSecond * 0.1),
      100
    );
    return () => clearInterval(id);
  }, [dailyRevenue]);

  // ── MONEY HELPERS ────────────────────────────────────────────────────────
  const money = (v: number) =>
    fmt ? fmt(v) : `£${Math.floor(v).toLocaleString("en-GB")}`;
  const moneyLive = (v: number) =>
    fmtLive ? fmtLive(v) : `£${Math.floor(v).toLocaleString("en-GB")}`;

  // ── SHARED STYLE ATOMS ──────────────────────────────────────────────────
  const card: React.CSSProperties = {
    backgroundColor: "#111111",
    border: "1px solid #2a2a2a",
  };

  // ── SUB-GAUGE DATA ──────────────────────────────────────────────────────
  const subMetrics = [
    {
      label: "Plugin Conflict Depth",
      score: Math.min(100, Math.round(complexityScore * 1.08)),
    },
    {
      label: "Custom Hook Density",
      score: Math.min(100, Math.round(complexityScore * 0.83)),
    },
    {
      label: "DB Schema Changes",
      score: Math.min(100, Math.round(complexityScore * 0.74)),
    },
  ];

  const roiMultiplier = Math.round((downtime12h + 5_000) / 997);

  return (
    <div
      className="min-h-screen w-full antialiased"
      style={{
        backgroundColor: "#0a0a0a",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">

        {/* ══════════════════════════════════════════════════════════════════
         *  SECTION 1 — HERO
         * ══════════════════════════════════════════════════════════════════ */}
        <motion.div initial="hidden" animate="visible" variants={stagger}>

          {/* ── Status badge row ── */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-6">
            <motion.span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{
                backgroundColor: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#ef4444",
              }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              CRITICAL UPGRADE RISK DETECTED
            </motion.span>
            <span
              className="text-xs font-['JetBrains_Mono']"
              style={{ color: "#333" }}
            >
              {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC
            </span>
          </motion.div>

          {/* ── Headline ── */}
          <motion.h1
            variants={fadeUp}
            className="text-3xl md:text-[42px] font-extrabold leading-tight tracking-tight mb-4"
          >
            <span style={{ color: "#ef4444" }}>{store}</span>
            <span className="text-white"> is running legacy </span>
            <span
              className="font-['JetBrains_Mono']"
              style={{ color: "#f59e0b" }}
            >
              WooCommerce {wcVersion}
            </span>
            <span className="text-white">.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl leading-relaxed max-w-3xl mb-8"
            style={{ color: "#b0b0b0" }}
          >
            Version{" "}
            <span className="font-['JetBrains_Mono'] text-white font-semibold">
              {targetVersion}
            </span>{" "}
            drops soon with{" "}
            <strong style={{ color: "#ef4444" }}>
              {conflictCount} known breaking conflicts
            </strong>
            . Your site is one silent auto-update away from going dark —
            mid-transaction.
          </motion.p>

          {/* ── Live Risk Counter ── */}
          <motion.div
            variants={fadeUp}
            className="rounded-xl p-6 relative overflow-hidden"
            style={{
              backgroundColor: "rgba(239,68,68,0.04)",
              border: "1px solid rgba(239,68,68,0.28)",
            }}
          >
            {/* Ambient pulse */}
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 40% 50%, rgba(239,68,68,0.08) 0%, transparent 65%)",
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={13} color="#ef4444" />
                  <span
                    className="text-xs uppercase tracking-widest font-semibold"
                    style={{ color: "#ef4444" }}
                  >
                    Revenue At Risk — Accumulated Since Legacy WC Began
                  </span>
                </div>
                <div
                  className="font-['JetBrains_Mono'] text-5xl md:text-6xl font-black tabular-nums"
                  style={{ color: "#ef4444" }}
                >
                  {isClient ? moneyLive(liveRisk) : "£—"}
                </div>
                <p className="text-xs mt-2" style={{ color: "#3a3a3a" }}>
                  Live · Calculated from the moment {store} fell behind
                  WooCommerce's update curve (~90 days ago)
                </p>
              </div>

              <div className="flex gap-8 sm:flex-col sm:gap-2 flex-shrink-0">
                {[
                  { label: "Per Hour", val: Math.round(hourlyRevenue * 0.18) },
                  { label: "Per Day", val: Math.round(dailyRevenue * 0.18) },
                ].map(({ label, val }) => (
                  <div key={label} className="sm:text-right">
                    <div className="text-xs mb-0.5" style={{ color: "#444" }}>
                      {label}
                    </div>
                    <div
                      className="font-['JetBrains_Mono'] font-bold text-xl"
                      style={{ color: "#f59e0b" }}
                    >
                      {money(val)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Terminal + Plain English ── */}
          <motion.div variants={fadeUp} className="mt-5">
            <TerminalWindow title="UPGRADE RISK PROBE OUTPUT">
              <p style={{ color: "#4ade80" }}>
                $ wc-version-probe --target {targetVersion} --store {store}{" "}
                --deep
              </p>
              <p>Initialising compatibility engine v3.4.1...</p>
              <p>
                → Current install:{" "}
                <span style={{ color: "#f59e0b" }}>
                  WooCommerce {wcVersion}
                </span>
              </p>
              <p>
                → Target release:{" "}
                <span style={{ color: "#fff" }}>{targetVersion}</span>{" "}
                <span style={{ color: "#ef4444" }}>[IMMINENT DROP]</span>
              </p>
              <p>
                → Auto-update risk:{" "}
                <span style={{ color: "#ef4444" }}>
                  HIGH — WordPress applies this silently without confirmation
                </span>
              </p>
              <p>
                → Breaking changes detected:{" "}
                <span style={{ color: "#ef4444", fontWeight: "bold" }}>
                  {conflictCount}
                </span>
              </p>
              <p>
                → Plugins in conflict path:{" "}
                <span style={{ color: "#fff" }}>
                  {breakingPlugins.length} CRITICAL
                </span>{" "}
                +{" "}
                <span style={{ color: "#f59e0b" }}>
                  {testingPlugins.length} UNVERIFIED
                </span>
              </p>
              <p
                style={{
                  color: "#ef4444",
                  paddingTop: 4,
                  fontWeight: "bold",
                }}
              >
                VERDICT: Upgrade without pre-flight = near-certain site outage.
              </p>
            </TerminalWindow>
            <PlainEnglish>
              This scan shows {store} is running a version of WooCommerce that
              WordPress considers out-of-date. The next release ({targetVersion})
              contains{" "}
              <strong className="text-white">{conflictCount} code changes</strong>{" "}
              that will directly break your existing plugins — meaning the moment your
              server auto-updates (which WordPress does silently by default), your
              checkout, payments, and subscriptions could{" "}
              <strong style={{ color: "#ef4444" }}>
                stop working for every customer on your site
              </strong>{" "}
              with zero warning.
            </PlainEnglish>
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
         *  SECTION 2 — VERSION COMPATIBILITY MATRIX
         * ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
        >
          {/* ── Header ── */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-start justify-between gap-4 mb-5"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <Layers size={17} color="#ef4444" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Plugin Compatibility Matrix
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                  Scanned against WooCommerce {targetVersion} API surface
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 text-xs flex-shrink-0">
              {[
                { count: breakingPlugins.length, label: "Breaking", color: "#ef4444" },
                { count: testingPlugins.length, label: "Testing", color: "#f59e0b" },
                { count: compatiblePlugins.length, label: "OK", color: "#22c55e" },
              ].map(({ count, label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span style={{ color: "#777" }}>
                    {count} {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Table ── */}
          <motion.div
            variants={fadeUp}
            className="rounded-xl overflow-hidden"
            style={card}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #1e1e1e",
                      backgroundColor: "#0d0d0d",
                    }}
                  >
                    {[
                      "Plugin",
                      "Version",
                      "Category",
                      `WC ${wcVersion}`,
                      `WC ${targetVersion}`,
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`py-3 px-4 text-xs uppercase tracking-wider font-medium ${
                          i >= 3 ? "text-center" : "text-left"
                        }`}
                        style={{ color: "#3a3a3a" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plugins.map((plugin, i) => {
                    const cfg = STATUS_CFG[plugin.status];
                    const { Icon } = cfg;
                    return (
                      <motion.tr
                        key={plugin.name}
                        initial={{ opacity: 0, x: -14 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.055, duration: 0.4 }}
                        style={{ borderBottom: "1px solid #181818" }}
                        className="transition-colors duration-150"
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLTableRowElement
                          ).style.backgroundColor = "rgba(255,255,255,0.018)";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLTableRowElement
                          ).style.backgroundColor = "transparent";
                        }}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-[3px] h-8 rounded-full flex-shrink-0"
                              style={{ backgroundColor: cfg.color }}
                            />
                            <span className="font-medium text-white">
                              {plugin.name}
                            </span>
                          </div>
                        </td>
                        <td
                          className="py-3.5 px-4 font-['JetBrains_Mono'] text-xs"
                          style={{ color: "#555" }}
                        >
                          v{plugin.version}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{ backgroundColor: "#1a1a1a", color: "#666" }}
                          >
                            {plugin.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full"
                            style={{ backgroundColor: "rgba(34,197,94,0.1)" }}
                          >
                            <CheckCircle2 size={13} color="#22c55e" />
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                            style={{
                              backgroundColor: cfg.bg,
                              border: `1px solid ${cfg.border}`,
                              color: cfg.color,
                            }}
                          >
                            <Icon size={10} />
                            {cfg.label}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── Terminal + Plain English ── */}
          <motion.div variants={fadeUp} className="mt-5">
            <TerminalWindow title="PLUGIN CONFLICT MANIFEST">
              <p style={{ color: "#4ade80" }}>
                $ wc-compat-scan --plugins all --target {targetVersion} --verbose
              </p>
              <p>Resolving hook signatures, filter chains, DB schema delta...</p>
              {breakingPlugins.slice(0, 3).map((p) => (
                <p key={p.name}>
                  →{" "}
                  <span style={{ color: "#ef4444" }}>[BREAKING]</span>{" "}
                  {p.name} v{p.version}:{" "}
                  <span style={{ color: "#fca5a5" }}>
                    Incompatible hook signatures / removed APIs detected
                  </span>
                </p>
              ))}
              {testingPlugins.slice(0, 2).map((p) => (
                <p key={p.name}>
                  →{" "}
                  <span style={{ color: "#f59e0b" }}>[WARN]{" "}</span>{" "}
                  {p.name} v{p.version}:{" "}
                  <span style={{ color: "#fcd34d" }}>
                    Not validated against new REST schema — behaviour unknown
                  </span>
                </p>
              ))}
              <p
                style={{
                  color: "#ef4444",
                  fontWeight: "bold",
                  paddingTop: 4,
                }}
              >
                MANIFEST: {breakingPlugins.length} CRITICAL ·{" "}
                {testingPlugins.length} WARNING · {compatiblePlugins.length}{" "}
                PASS
              </p>
            </TerminalWindow>
            <PlainEnglish>
              Of your {plugins.length} installed plugins,{" "}
              <strong style={{ color: "#ef4444" }}>
                {breakingPlugins.length} will definitively break
              </strong>{" "}
              when WooCommerce updates to {targetVersion}. These use code functions
              that no longer exist in the new version. Another{" "}
              <strong style={{ color: "#f59e0b" }}>
                {testingPlugins.length} are completely untested
              </strong>{" "}
              against {targetVersion} — their behaviour during an update is
              unknown. Your checkout, subscription billing, and payment processing
              are all in the direct line of fire.
            </PlainEnglish>
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
         *  SECTION 3 — DOWNTIME COST ESTIMATOR
         * ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
        >
          {/* ── Header ── */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <Clock size={17} color="#ef4444" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Downtime Cost Estimator
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                Revenue impact locked to {store}'s profile —{" "}
                <span className="inline-flex items-center gap-1">
                  <Lock size={9} />
                  not adjustable
                </span>
              </p>
            </div>
          </motion.div>

          {/* ── Hourly context strip ── */}
          <motion.div
            variants={fadeUp}
            className="rounded-lg px-4 py-3 mb-4 flex flex-wrap items-center gap-x-8 gap-y-2"
            style={card}
          >
            <div className="flex items-center gap-2 text-sm">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#f59e0b" }}
              />
              <span style={{ color: "#888" }}>{store} earns</span>
              <span className="font-['JetBrains_Mono'] font-bold text-white">
                {money(Math.round(hourlyRevenue))}
              </span>
              <span style={{ color: "#888" }}>per hour.</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full flex-shrink-0 bg-red-500" />
              <span style={{ color: "#888" }}>Every hour of downtime is</span>
              <strong style={{ color: "#ef4444" }}>
                gone. No recovery. No refunds.
              </strong>
            </div>
          </motion.div>

          {/* ── Scenario Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* 6h Outage */}
            <motion.div variants={fadeUp}>
              <div
                className="rounded-xl p-6 h-full"
                style={{
                  backgroundColor: "rgba(239,68,68,0.04)",
                  border: "1px solid rgba(239,68,68,0.22)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div
                      className="text-xs uppercase tracking-widest font-semibold mb-0.5"
                      style={{ color: "#555" }}
                    >
                      Scenario A
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      6-Hour Outage
                    </h3>
                    <p className="text-xs mt-1" style={{ color: "#555" }}>
                      Typical emergency resolution time
                    </p>
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    <AlertTriangle size={19} color="#ef4444" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-5">
                  <div
                    className="flex justify-between text-xs mb-1.5"
                    style={{ color: "#333" }}
                  >
                    <span>0h</span>
                    <span>3h</span>
                    <span>6h</span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: "#1a1a1a" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)",
                      }}
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1.6,
                        ease: "easeOut",
                        delay: 0.2,
                      }}
                    />
                  </div>
                </div>

                {/* Cost rows */}
                {[
                  {
                    label: "Revenue Lost",
                    val: money(downtime6h),
                    color: "#ef4444",
                    bold: false,
                  },
                  {
                    label: "Emergency Dev Costs",
                    val: money(2_500),
                    color: "#f59e0b",
                    bold: false,
                  },
                  {
                    label: "Total Damage",
                    val: money(downtime6h + 2_500),
                    color: "#ef4444",
                    bold: true,
                  },
                ].map(({ label, val, color, bold }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2.5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <span
                      className={bold ? "text-sm font-semibold text-white" : "text-sm"}
                      style={bold ? {} : { color: "#888" }}
                    >
                      {label}
                    </span>
                    <span
                      className={`font-['JetBrains_Mono'] font-bold ${bold ? "text-xl" : "text-base"}`}
                      style={{ color }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 12h Outage */}
            <motion.div variants={fadeUp}>
              <div
                className="rounded-xl p-6 h-full"
                style={{
                  backgroundColor: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.32)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div
                      className="text-xs uppercase tracking-widest font-semibold mb-0.5"
                      style={{ color: "#ef4444" }}
                    >
                      Scenario B — Worst Case
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      12-Hour Outage
                    </h3>
                    <p className="text-xs mt-1" style={{ color: "#555" }}>
                      DB conflict cascade / failed rollback
                    </p>
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.14)",
                      border: "1px solid rgba(239,68,68,0.32)",
                    }}
                  >
                    <AlertOctagon size={19} color="#ef4444" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-5">
                  <div
                    className="flex justify-between text-xs mb-1.5"
                    style={{ color: "#333" }}
                  >
                    <span>0h</span>
                    <span>6h</span>
                    <span>12h</span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: "#1a1a1a" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, #ef4444 0%, #7f1d1d 100%)",
                      }}
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 2,
                        ease: "easeOut",
                        delay: 0.3,
                      }}
                    />
                  </div>
                </div>

                {/* Cost rows */}
                {[
                  {
                    label: "Revenue Lost",
                    val: money(downtime12h),
                    color: "#ef4444",
                    bold: false,
                  },
                  {
                    label: "Emergency + Rollback Dev",
                    val: money(5_000),
                    color: "#f59e0b",
                    bold: false,
                  },
                  {
                    label: "Total Damage",
                    val: money(downtime12h + 5_000),
                    color: "#ef4444",
                    bold: true,
                  },
                ].map(({ label, val, color, bold }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2.5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <span
                      className={bold ? "text-sm font-semibold text-white" : "text-sm"}
                      style={bold ? {} : { color: "#888" }}
                    >
                      {label}
                    </span>
                    <span
                      className={`font-['JetBrains_Mono'] font-bold ${bold ? "text-xl" : "text-base"}`}
                      style={{ color }}
                    >
                      {val}
                    </span>
                  </div>
                ))}

                {/* SEO note */}
                <div
                  className="mt-4 p-3 rounded-lg"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.15)",
                  }}
                >
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "#fca5a5" }}
                  >
                    <strong>+ SEO deindex penalty:</strong> Google removes pages
                    that return 500 errors for 12+ hours. Organic recovery takes
                    3–8 weeks minimum.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Terminal + Plain English ── */}
          <motion.div variants={fadeUp} className="mt-5">
            <TerminalWindow title="REVENUE IMPACT MODEL">
              <p style={{ color: "#4ade80" }}>
                $ revenue-impact --store {store} --hourly{" "}
                {Math.round(hourlyRevenue)} --scenarios 6h,12h
              </p>
              <p>
                → Hourly revenue baseline:{" "}
                <span style={{ color: "#fff" }}>
                  {money(Math.round(hourlyRevenue))}
                </span>
              </p>
              <p>
                → 6h downtime:{" "}
                <span style={{ color: "#ef4444", fontWeight: "bold" }}>
                  {money(downtime6h)}
                </span>{" "}
                direct loss +{" "}
                <span style={{ color: "#f59e0b" }}>
                  {money(2_500)} emergency dev
                </span>
              </p>
              <p>
                → 12h downtime:{" "}
                <span style={{ color: "#ef4444", fontWeight: "bold" }}>
                  {money(downtime12h)}
                </span>{" "}
                direct loss +{" "}
                <span style={{ color: "#f59e0b" }}>
                  {money(5_000)} emergency dev
                </span>
              </p>
              <p>
                → SEO deindex risk:{" "}
                <span style={{ color: "#f59e0b" }}>TRIGGERED at 12h+</span>
              </p>
              <p
                style={{
                  color: "#ef4444",
                  fontWeight: "bold",
                  paddingTop: 4,
                }}
              >
                WORST-CASE TOTAL EXPOSURE: {money(downtime12h + 5_000)} +
                ~3 months of SEO recovery
              </p>
            </TerminalWindow>
            <PlainEnglish>
              Your store earns {money(Math.round(hourlyRevenue))} per hour. A
              6-hour outage — the typical time to diagnose and fix a surprise
              update failure —{" "}
              <strong className="text-white">
                costs {money(downtime6h)} in lost sales alone
              </strong>
              , before paying a developer to fix it under pressure. If the
              outage stretches to 12 hours (common when a database migration
              goes wrong), the damage reaches{" "}
              <strong style={{ color: "#ef4444" }}>
                {money(downtime12h + 5_000)}
              </strong>{" "}
              — and Google then starts removing your pages from search results
              on top of that.
            </PlainEnglish>
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
         *  SECTION 5 — MIGRATION COMPLEXITY GAUGE (pure Tailwind + Framer)
         * ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          ref={gaugeRef}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
        >
          {/* ── Header ── */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.22)",
              }}
            >
              <Activity size={17} color="#f59e0b" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Migration Complexity Score
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                Composite: plugin surface area + custom hooks + DB schema
                migrations
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-xl p-6" style={card}>
            {/* ── Score + label ── */}
            <div className="flex flex-wrap items-end gap-4 mb-8">
              <div>
                <div
                  className="text-xs uppercase tracking-widest mb-1"
                  style={{ color: "#444" }}
                >
                  Complexity Score
                </div>
                <div
                  className="font-['JetBrains_Mono'] text-7xl font-black leading-none"
                  style={{ color: complexityColor }}
                >
                  {complexityScore}
                  <span
                    className="text-3xl"
                    style={{ color: "#2a2a2a" }}
                  >
                    /100
                  </span>
                </div>
              </div>
              <div className="pb-1">
                <motion.span
                  className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest"
                  style={{
                    backgroundColor: `${complexityColor}18`,
                    border: `1px solid ${complexityColor}45`,
                    color: complexityColor,
                  }}
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                >
                  {complexityLabel} COMPLEXITY
                </motion.span>
              </div>
            </div>

            {/* ── Level-Meter Gauge — 30 vertical bars, pure Tailwind/Framer ── */}
            <div className="mb-7">
              {/* Zone labels */}
              <div className="grid grid-cols-3 mb-2 px-0.5">
                {(
                  [
                    ["Low Risk", "#22c55e"],
                    ["Medium Risk", "#f59e0b"],
                    ["High Risk", "#ef4444"],
                  ] as [string, string][]
                ).map(([label, color], i) => (
                  <div
                    key={label}
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      i === 0
                        ? "text-left"
                        : i === 1
                        ? "text-center"
                        : "text-right"
                    }`}
                    style={{ color }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="flex items-end gap-[2px] h-16">
                {Array.from({ length: 30 }).map((_, i) => {
                  const pct = ((i + 1) / 30) * 100;
                  const isLit = gaugeInView && pct <= complexityScore;
                  const barColor =
                    pct <= 40
                      ? "#22c55e"
                      : pct <= 70
                      ? "#f59e0b"
                      : "#ef4444";
                  const barH = 30 + (i / 29) * 70; // graduated height 30%→100%
                  return (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-sm origin-bottom"
                      style={{ height: `${barH}%` }}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{
                        scaleY: 1,
                        opacity: 1,
                        backgroundColor: isLit ? barColor : "#1c1c1c",
                        boxShadow: isLit
                          ? `0 0 5px ${barColor}55`
                          : "none",
                      }}
                      transition={{
                        delay: i * 0.028,
                        duration: 0.35,
                        ease: "easeOut",
                      }}
                    />
                  );
                })}
              </div>

              {/* Scale */}
              <div
                className="flex justify-between mt-1.5 px-0.5 font-['JetBrains_Mono'] text-xs"
                style={{ color: "#2e2e2e" }}
              >
                {[0, 25, 50, 75, 100].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </div>

            {/* ── Sub-metric bars ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {subMetrics.map(({ label, score }) => {
                const subColor =
                  score >= 70
                    ? "#ef4444"
                    : score >= 40
                    ? "#f59e0b"
                    : "#22c55e";
                return (
                  <div
                    key={label}
                    className="rounded-lg p-3"
                    style={{
                      backgroundColor: "#0c0c0c",
                      border: "1px solid #1c1c1c",
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs" style={{ color: "#555" }}>
                        {label}
                      </span>
                      <span
                        className="font-['JetBrains_Mono'] text-xs font-bold"
                        style={{ color: subColor }}
                      >
                        {score}
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: "#1a1a1a" }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: subColor }}
                        initial={{ width: 0 }}
                        animate={{
                          width: gaugeInView ? `${score}%` : 0,
                        }}
                        transition={{
                          duration: 1,
                          ease: "easeOut",
                          delay: 0.65,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
         *  SECTION 6 — THE GUARANTEE  (MUST appear before price comparison)
         * ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            className="rounded-xl p-8 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.055) 0%, rgba(34,197,94,0.02) 100%)",
              border: "1px solid rgba(34,197,94,0.22)",
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)",
                transform: "translate(30%, -30%)",
              }}
            />
            {/* Top border glow */}
            <div
              className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.5) 50%, transparent 100%)",
              }}
            />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start gap-5">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.28)",
                  }}
                >
                  <Shield size={26} color="#22c55e" />
                </div>

                <div className="flex-1">
                  {/* Badge + stars */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span
                      className="text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.22)",
                        color: "#22c55e",
                      }}
                    >
                      Alex's Personal Guarantee
                    </span>
                    <span className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill="#f59e0b"
                          color="#f59e0b"
                        />
                      ))}
                    </span>
                  </div>

                  {/* Quote */}
                  <h3 className="text-xl md:text-2xl font-bold text-white leading-snug mb-4">
                    "If our upgrade pre-flight does not map{" "}
                    <em>every</em> breaking plugin conflict before your site
                    updates,{" "}
                    <span style={{ color: "#22c55e" }}>
                      you pay nothing."
                    </span>
                  </h3>

                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{ color: "#888" }}
                  >
                    We deliver a complete conflict manifest — every breaking
                    plugin, every incompatible hook, every database migration
                    required — before your site ever touches {targetVersion}. If
                    we miss a single documented breaking conflict, you receive a
                    full refund. No forms, no questions, no waiting. This is a
                    zero-risk engagement.
                  </p>

                  {/* Trust signals */}
                  <div className="flex flex-wrap gap-5">
                    {[
                      { Icon: CheckCheck, text: "Full refund if we miss anything" },
                      { Icon: Lock, text: "No contract, no lock-in" },
                      { Icon: Zap, text: "Delivered in 48–72 hours" },
                    ].map(({ Icon, text }) => (
                      <div key={text} className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "rgba(34,197,94,0.12)" }}
                        >
                          <Icon size={11} color="#22c55e" />
                        </span>
                        <span className="text-sm" style={{ color: "#ccc" }}>
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
         *  SECTION 4 — PLANNED vs EMERGENCY COMPARISON (price comparison)
         *  Positioned AFTER the guarantee per Hormozi Risk Reversal principle
         * ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
        >
          {/* ── Header ── */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.22)",
              }}
            >
              <Zap size={17} color="#f59e0b" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Two Paths Forward
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                This upgrade is happening. The only question is whether it's on
                your terms.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* ── Planned (good path) ── */}
            <motion.div variants={fadeUp}>
              <motion.div
                className="rounded-xl p-6 h-full flex flex-col"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(34,197,94,0.055) 0%, rgba(34,197,94,0.02) 100%)",
                  border: "1px solid rgba(34,197,94,0.22)",
                }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="flex items-start gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.25)",
                    }}
                  >
                    <CheckCircle2 size={18} color="#22c55e" />
                  </div>
                  <div>
                    <div
                      className="text-xs uppercase tracking-widest font-bold mb-0.5"
                      style={{ color: "#22c55e" }}
                    >
                      Recommended Path
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Planned Pre-Flight Audit
                    </h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div className="font-['JetBrains_Mono'] text-5xl font-black text-white mb-1">
                    £997
                  </div>
                  <div className="text-xs" style={{ color: "#555" }}>
                    One-time, fixed price
                  </div>
                </div>

                {/* Deliverables */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {[
                    "Complete plugin conflict manifest before any update runs",
                    "Step-by-step upgrade runbook for your dev team",
                    "Staging environment pre-migration test report",
                    "Zero-downtime upgrade execution strategy",
                    "14-day post-upgrade monitoring & support window",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: "rgba(34,197,94,0.12)" }}
                      >
                        <CheckCircle2 size={10} color="#22c55e" />
                      </span>
                      <span className="text-sm" style={{ color: "#ccc" }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* ROI box */}
                <div
                  className="rounded-lg p-3"
                  style={{
                    backgroundColor: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.14)",
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs" style={{ color: "#666" }}>
                      Potential damage prevented:
                    </span>
                    <span
                      className="font-['JetBrains_Mono'] font-bold text-sm"
                      style={{ color: "#22c55e" }}
                    >
                      {money(downtime12h + 5_000)}+
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: "#666" }}>
                      Return on investment:
                    </span>
                    <span
                      className="font-['JetBrains_Mono'] font-bold text-sm"
                      style={{ color: "#22c55e" }}
                    >
                      {roiMultiplier}×
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* ── Emergency (bad path) ── */}
            <motion.div variants={fadeUp}>
              <motion.div
                className="rounded-xl p-6 h-full flex flex-col relative"
                style={{
                  backgroundColor: "rgba(239,68,68,0.04)",
                  border: "1px solid rgba(239,68,68,0.18)",
                }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Avoid-this badge */}
                <span
                  className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.22)",
                    color: "#ef4444",
                  }}
                >
                  Avoid This
                </span>

                <div className="flex items-start gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    <AlertOctagon size={18} color="#ef4444" />
                  </div>
                  <div>
                    <div
                      className="text-xs uppercase tracking-widest font-bold mb-0.5"
                      style={{ color: "#555" }}
                    >
                      What Happens Without It
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Emergency Outage Response
                    </h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div
                    className="font-['JetBrains_Mono'] text-5xl font-black mb-1"
                    style={{ color: "#ef4444" }}
                  >
                    £5,000+
                  </div>
                  <div className="text-xs" style={{ color: "#555" }}>
                    Plus lost revenue, plus SEO damage
                  </div>
                </div>

                {/* Consequences */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {[
                    "Site goes dark while live customers are mid-purchase",
                    "Emergency developer hired under maximum time pressure",
                    "DB rollback risks corrupting every order record",
                    "Payment processors may suspend accounts for repeated errors",
                    "Google removes pages returning 500 errors for 12h+",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
                      >
                        <XCircle size={10} color="#ef4444" />
                      </span>
                      <span className="text-sm" style={{ color: "#888" }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Exposure box */}
                <div
                  className="rounded-lg p-3"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.05)",
                    border: "1px solid rgba(239,68,68,0.12)",
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs" style={{ color: "#666" }}>
                      Total exposure:
                    </span>
                    <span
                      className="font-['JetBrains_Mono'] font-bold text-sm"
                      style={{ color: "#ef4444" }}
                    >
                      {money(downtime12h + 5_000)}+
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: "#666" }}>
                      vs. Pre-flight audit:
                    </span>
                    <span
                      className="font-['JetBrains_Mono'] font-bold text-sm text-white"
                    >
                      £997 (fixed)
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
         *  SECTION 7 — CTA (single primary action button → handleCTA)
         * ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="pb-8"
        >
          <motion.div
            variants={fadeUp}
            className="rounded-xl p-8 text-center relative overflow-hidden"
            style={card}
          >
            {/* Ambient top glow */}
            <div
              className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.5) 50%, transparent 100%)",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 55%)",
              }}
            />

            <div className="relative z-10">
              {/* Urgency badge */}
              <div className="flex justify-center mb-5">
                <motion.span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.22)",
                    color: "#ef4444",
                  }}
                >
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                  {conflictCount} breaking conflicts detected — every hour
                  increases outage risk
                </motion.span>
              </div>

              {/* Headline */}
              <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-3">
                Lock in your Pre-Flight Audit before
                <br className="hidden md:block" />{" "}
                <span style={{ color: "#ef4444" }}>
                  your server triggers the update
                </span>
              </h2>

              <p
                className="text-base leading-relaxed max-w-xl mx-auto mb-8"
                style={{ color: "#777" }}
              >
                Every breaking conflict mapped. A full upgrade runbook. 14 days
                of post-upgrade support — all for{" "}
                <span className="font-['JetBrains_Mono'] font-bold text-white">
                  £997
                </span>
                , backed by a full-refund guarantee.
              </p>

              {/* Price vs damage comparison */}
              <div className="flex items-center justify-center gap-6 md:gap-12 mb-8 flex-wrap">
                <div className="text-center">
                  <div className="font-['JetBrains_Mono'] text-4xl font-black text-white">
                    £997
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#555" }}>
                    Pre-flight audit
                  </div>
                </div>
                <div className="text-2xl font-light" style={{ color: "#2a2a2a" }}>
                  vs
                </div>
                <div className="text-center">
                  <div
                    className="font-['JetBrains_Mono'] text-4xl font-black"
                    style={{ color: "#ef4444" }}
                  >
                    {money(downtime12h + 5_000)}+
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#555" }}>
                    Cost of doing nothing
                  </div>
                </div>
              </div>

              {/* ── PRIMARY CTA — single button, no mailto links ── */}
              <motion.button
                onClick={handleCTA}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-xl font-bold text-lg text-black cursor-pointer select-none"
                style={{
                  background:
                    "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 48px rgba(34,197,94,0.45)",
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <span>Secure Your Pre-Flight Upgrade Audit</span>
                <ArrowRight size={20} />
              </motion.button>

              <p className="mt-4 text-xs" style={{ color: "#333" }}>
                Full refund if we miss any documented conflict · No contract ·
                Fixed price · 48–72hr delivery
              </p>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
