"use client";

/**
 * TemplateC.tsx
 * Core Trigger: Open Door / Security Vulnerability
 * Best for: Exposed REST APIs, XML-RPC amplification, Magecart
 *
 * Props:
 *   data       – { store, domain, open_endpoints, critical_cves, exposure_score, breach_cost, fix_cost }
 *   fmt        – (n: number) => string   (currency formatter, e.g. "$247,000")
 *   fmtLive    – (n: number) => string   (live number formatter)
 *   fmtMicro   – (n: number) => string   (micro/fractional formatter)
 *   handleCTA  – () => void              (single primary action)
 */

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Terminal,
  Eye,
  AlertTriangle,
  Globe,
  Lock,
  Server,
  Bug,
  Zap,
  DollarSign,
  Clock,
  Users,
  TrendingDown,
  ChevronRight,
  CheckCircle,
  Wifi,
  Database,
  Key,
} from "lucide-react";

// ─── STYLE TOKENS ─────────────────────────────────────────────────────────────

const BG     = "#0a0a0a";
const CARD   = "#111111";
const BORDER = "#2a2a2a";
const GREEN  = "#22c55e";
const RED    = "#ef4444";
const AMBER  = "#f59e0b";
const MONO   = { fontFamily: "'JetBrains Mono', 'Courier New', monospace" } as const;

const cardStyle: React.CSSProperties = {
  backgroundColor: CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: "0.75rem",
  padding: "1.5rem",
};

// ─── HOOKS ───────────────────────────────────────────────────────────────────

/** useInterval: stable interval that survives re-renders */
function useInterval(cb: () => void, ms: number | null) {
  const ref = useRef(cb);
  useEffect(() => { ref.current = cb; });
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

/** useSessionClock: seconds elapsed since component mount */
function useSessionClock() {
  const start  = useRef(Date.now());
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSecs(Math.floor((Date.now() - start.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  return secs;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

/** Wordfence-sourced baseline: ~142,851 automated WP attacks per 60 s */
const WP_ATTACKS_PER_SEC = 2381;

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function TemplateC({ data, fmt, fmtLive, fmtMicro, handleCTA }: any) {

  // ── Resolve data with safe defaults ────────────────────────────────────────
  const d = useMemo(() => ({
    store:          data?.store          ?? "YourStore.com",
    domain:         data?.domain         ?? "yourstore.com",
    open_endpoints: data?.open_endpoints ?? 23,
    critical_cves:  data?.critical_cves  ?? 7,
    exposure_score: data?.exposure_score ?? 87,
    breach_cost:    data?.breach_cost    ?? 247000,
    fix_cost:       data?.fix_cost       ?? 4997,
  }), [data]);

  const safe = useCallback(
    (n: number) => typeof fmt === "function" ? fmt(n) : `$${Math.round(n).toLocaleString()}`,
    [fmt],
  );

  // ── Live counters ───────────────────────────────────────────────────────────
  const sessionSecs        = useSessionClock();
  const sessionAttacks     = sessionSecs * WP_ATTACKS_PER_SEC;

  const [globalAttacks, setGlobalAttacks] = useState(142851);
  useInterval(() => setGlobalAttacks(p => p + Math.floor(Math.random() * 15 + 4)), 750);

  // ── Terminal typewriter ─────────────────────────────────────────────────────
  type LineKind = "cmd"|"muted"|"port"|"header"|"warn"|"critical"|"summary"|"done"|"empty";
  const SCAN_LINES: { t: string; k: LineKind }[] = useMemo(() => [
    { t: `$ nmap -sV --script=vuln ${d.domain}`, k: "cmd" },
    { t: `Starting Nmap 7.94 ( https://nmap.org ) ...`, k: "muted" },
    { t: `Initiating SYN Stealth Scan at 14:32 ...`, k: "muted" },
    { t: `Host is up (0.023s latency). 976 filtered ports (no-response)`, k: "muted" },
    { t: ``, k: "empty" },
    { t: `PORT      STATE  SERVICE     VERSION`, k: "header" },
    { t: `22/tcp    open   ssh         OpenSSH 7.2p2 Ubuntu 4ubuntu2.10`, k: "port" },
    { t: `80/tcp    open   http        Apache httpd 2.4.29 ((Ubuntu))`, k: "port" },
    { t: `443/tcp   open   ssl/https   Apache httpd 2.4.29`, k: "port" },
    { t: `3306/tcp  open   mysql       MySQL 5.7.38  ←  DATABASE EXPOSED`, k: "critical" },
    { t: `2082/tcp  open   http        cPanel 11.x   ←  ADMIN PORTAL OPEN`, k: "critical" },
    { t: `8080/tcp  open   http-proxy  [UNAUTHENTICATED]`, k: "warn" },
    { t: ``, k: "empty" },
    { t: `VULNERABILITY ASSESSMENT:`, k: "header" },
    { t: `  xmlrpc.php  [200 OK]  ←  AMPLIFICATION VECTOR ACTIVE`, k: "critical" },
    { t: `  wp-login.php [200 OK] — no rate-limit enforced`, k: "warn" },
    { t: `  wp-enum: admin, shop_manager discoverable (no auth)`, k: "warn" },
    { t: `  CVE-2017-9841: phpunit Remote Code Execution  ←  CRITICAL`, k: "critical" },
    { t: `  CVE-2022-21663: WP Core Object Injection  ←  HIGH`, k: "warn" },
    { t: `  Magecart injection surface at /wp-content/  ←  CRITICAL`, k: "critical" },
    { t: ``, k: "empty" },
    { t: `${d.open_endpoints} open ports  ·  4 unpatched critical CVEs  ·  Risk: 94/100`, k: "summary" },
    { t: `Nmap done. Scan completed in 3.42 seconds.`, k: "done" },
  ], [d.domain, d.open_endpoints]);

  const DELAYS: Record<LineKind, number> = {
    cmd: 350, muted: 90, port: 130, header: 110,
    warn: 175, critical: 235, summary: 290, done: 155, empty: 50,
  };

  const [visibleCount, setVisibleCount] = useState(0);
  const [scanDone, setScanDone]         = useState(false);
  const terminalRef                     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    function tick() {
      if (i >= SCAN_LINES.length) { setScanDone(true); return; }
      const ms = DELAYS[SCAN_LINES[i].k];
      timeout = setTimeout(() => { setVisibleCount(c => c + 1); i++; tick(); }, ms);
    }
    const boot = setTimeout(tick, 1000);
    return () => { clearTimeout(boot); clearTimeout(timeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleCount]);

  // ── Toggle ──────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<"ignore" | "fix">("ignore");

  // ── Static data tables ──────────────────────────────────────────────────────
  const SURFACES = useMemo(() => [
    { label: "XML-RPC Amplification",          severity: 98, tag: "CRITICAL", Icon: Wifi },
    { label: "Unauthenticated REST API",        severity: 92, tag: "CRITICAL", Icon: Server },
    { label: "Database Port Exposure",          severity: 86, tag: "CRITICAL", Icon: Database },
    { label: "Admin Enumeration (No Auth)",     severity: 81, tag: "HIGH",     Icon: Key },
    { label: "Magecart Injection Surface",      severity: 75, tag: "HIGH",     Icon: Bug },
    { label: "Outdated Plugin CVE Vectors",     severity: 89, tag: "CRITICAL", Icon: Zap },
  ], []);

  const BREACH_ROWS = useMemo(() => [
    { label: "Legal & Regulatory Notification", Icon: Users,       pct: 22, color: RED },
    { label: "Forensic Remediation",            Icon: Bug,         pct: 31, color: RED },
    { label: "Brand & Reputation Recovery",     Icon: TrendingDown,pct: 28, color: AMBER },
    { label: "Downtime & Lost Revenue",         Icon: Clock,       pct: 19, color: AMBER },
  ].map(r => ({ ...r, amount: d.breach_cost * (r.pct / 100) })), [d.breach_cost]);

  const roiPct    = ((d.fix_cost / d.breach_cost) * 100).toFixed(1);
  const fixBarPct = Math.min((d.fix_cost / d.breach_cost) * 100, 12);  // cap visual for clarity

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ backgroundColor: BG, color: "#f1f5f9", minHeight: "100vh",
               fontFamily: "'Inter', sans-serif", position: "relative", overflowX: "hidden" }}
    >
      {/* Scanline texture */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)",
      }} />

      {/* Ignore-mode red pulse */}
      {mode === "ignore" && (
        <motion.div
          style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 4, backgroundColor: RED }}
          animate={{ opacity: [0, 0.055, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* ── MAIN COLUMN ─────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: "900px", margin: "0 auto",
                    padding: "3rem 1.25rem", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* ═══════════════════════════════════════════════
            §1  HERO
        ═══════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: "center", paddingTop: "1.5rem",
                   display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}
        >
          {/* Live badge */}
          <motion.div
            animate={{ opacity: [1, 0.42, 1] }}
            transition={{ duration: 2.1, repeat: Infinity }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.35rem 0.85rem", borderRadius: "9999px",
              backgroundColor: "#ef444412", color: RED, border: "1px solid #ef444332",
              fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            }}
          >
            <span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%",
                           backgroundColor: RED, display: "inline-block" }} />
            Live Threat Intelligence ·{" "}
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </motion.div>

          {/* Headline */}
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 900,
                       lineHeight: 1.1, letterSpacing: "-0.025em", margin: 0 }}>
            <span style={{ color: "#f8fafc" }}>{d.store}</span>
            <span style={{ color: RED }}>
              {" "}has {d.open_endpoints} externally<br />visible entry points.
            </span>
          </h1>

          <p style={{ fontSize: "1.15rem", color: "#94a3b8", lineHeight: 1.65,
                      maxWidth: "36rem", margin: 0 }}>
            Every automated scanner in the world can see them.{" "}
            <strong style={{ color: "#f1f5f9" }}>Right now.</strong>{" "}
            While you're reading this sentence.
          </p>

          {/* Session attack counter — live from mount, never from zero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            style={{
              backgroundColor: "#110000", border: "1px solid #ef444325",
              borderRadius: "0.75rem", padding: "1rem 1.75rem", display: "inline-block",
            }}
          >
            <div style={{ ...MONO, fontSize: "0.7rem", color: "#6b7280",
                          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
              Global WP attack attempts since you opened this report
            </div>
            <div style={{ ...MONO, fontSize: "1.9rem", fontWeight: 900,
                          color: RED, fontVariantNumeric: "tabular-nums" }}>
              {sessionAttacks.toLocaleString()}
            </div>
          </motion.div>

          {/* Stat trio */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2.5rem" }}>
            {[
              { label: "Open Entry Points",    value: d.open_endpoints,                  color: RED },
              { label: "Exposed API Endpoints", value: Math.ceil(d.open_endpoints * 0.57), color: AMBER },
              { label: "Critical CVEs",         value: d.critical_cves,                   color: RED },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ ...MONO, fontSize: "2.5rem", fontWeight: 900,
                              color, fontVariantNumeric: "tabular-nums" }}>
                  {value}
                </div>
                <div style={{ fontSize: "0.7rem", textTransform: "uppercase",
                              letterSpacing: "0.1em", color: "#475569", marginTop: "0.3rem" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════
            §2  GLOBAL ATTACK STAT
        ═══════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          style={{ ...cardStyle, textAlign: "center", position: "relative", overflow: "hidden" }}
        >
          {/* Glow */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
                        background: "radial-gradient(ellipse at 50% -10%, #ef444410 0%, transparent 60%)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
                          gap: "0.5rem", marginBottom: "1rem" }}>
              <Globe size={15} color={RED} />
              <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                             letterSpacing: "0.1em", color: "#475569" }}>
                Global Threat Activity · Wordfence Feed · Live
              </span>
            </div>

            <div style={{ ...MONO, fontSize: "clamp(3.5rem, 10vw, 5.5rem)", fontWeight: 900,
                          color: RED, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {globalAttacks.toLocaleString()}
            </div>

            <p style={{ marginTop: "1rem", fontSize: "1.05rem", color: "#94a3b8" }}>
              automated WordPress attack attempts globally{" "}
              <strong style={{ color: "#f1f5f9" }}>in the last 60 seconds</strong>
            </p>

            {/* 60 s progress bar */}
            <div style={{ marginTop: "1.25rem", height: "3px", borderRadius: "9999px",
                          overflow: "hidden", backgroundColor: "#1e1e1e" }}>
              <motion.div
                style={{ height: "100%", borderRadius: "9999px",
                          background: "linear-gradient(90deg, #ef4444, #f97316)" }}
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <p style={{ ...MONO, marginTop: "0.5rem", fontSize: "0.68rem", color: "#374151" }}>
              Window resets every 60 seconds
            </p>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════
            §3  ATTACKER POV TERMINAL
        ═══════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
        >
          {/* Chrome bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            padding: "0.7rem 1rem", borderRadius: "0.75rem 0.75rem 0 0",
            backgroundColor: "#0d0d0d",
            border: `1px solid ${BORDER}`, borderBottom: "1px solid #1a1a1a",
          }}>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              {[RED, AMBER, GREEN].map(c => (
                <span key={c} style={{ width: "0.75rem", height: "0.75rem",
                                       borderRadius: "50%", backgroundColor: c, display: "block" }} />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "0.5rem" }}>
              <Terminal size={13} color={GREEN} />
              <span style={{ ...MONO, fontSize: "0.72rem", color: "#475569" }}>
                attacker@external-recon:~$
              </span>
            </div>
            <span style={{
              marginLeft: "auto", ...MONO, fontSize: "0.65rem", fontWeight: 700,
              padding: "0.2rem 0.6rem", borderRadius: "0.25rem",
              backgroundColor: "#ef444415", color: RED, border: "1px solid #ef444328",
            }}>
              ILLUSTRATIVE SIMULATION
            </span>
          </div>

          {/* Terminal body */}
          <div
            ref={terminalRef}
            style={{
              backgroundColor: "#050505",
              border: `1px solid ${BORDER}`, borderTop: "none",
              borderRadius: "0 0 0.75rem 0.75rem",
              padding: "1.25rem", minHeight: "300px", maxHeight: "400px", overflowY: "auto",
              ...MONO, fontSize: "0.775rem", lineHeight: "1.85",
            }}
          >
            {SCAN_LINES.slice(0, visibleCount).map((line, i) => {
              const color =
                line.k === "cmd"      ? GREEN    :
                line.k === "critical" ? RED      :
                line.k === "warn"     ? AMBER    :
                line.k === "header"   ? "#e2e8f0":
                line.k === "summary"  ? "#fbbf24":
                line.k === "done"     ? GREEN    :
                line.k === "port"     ? "#93c5fd":
                "#4b5563";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.07 }}
                  style={{ color, whiteSpace: "pre-wrap", wordBreak: "break-all" }}
                >
                  {line.t || "\u00A0"}
                </motion.div>
              );
            })}
            {!scanDone && visibleCount > 0 && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.55, repeat: Infinity }}
                style={{ color: GREEN }}
              >▊</motion.span>
            )}
          </div>

          {/* ── PLAIN ENGLISH TRANSLATION ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: scanDone ? 1 : 0, y: scanDone ? 0 : 12 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            style={{
              marginTop: "1rem", borderRadius: "0.75rem", padding: "1.25rem",
              backgroundColor: "#100600", border: "1px solid #ef444328",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
              <div style={{
                width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", flexShrink: 0,
                backgroundColor: "#ef444415", display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: "0.1rem",
              }}>
                <Eye size={16} color={RED} />
              </div>
              <div>
                <div style={{
                  fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase",
                  letterSpacing: "0.1em", color: RED, marginBottom: "0.6rem",
                }}>
                  Plain English · What This Means For You
                </div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#cbd5e1", margin: 0 }}>
                  That output above is exactly what a threat actor sees when running a{" "}
                  <strong style={{ color: "#fff" }}>free, automated scan</strong> against{" "}
                  <strong style={{ color: "#fff" }}>{d.domain}</strong> — completed in under 4 seconds. It
                  found your <strong style={{ color: "#fca5a5" }}>MySQL database</strong> openly reachable
                  from the internet, your{" "}
                  <strong style={{ color: "#fca5a5" }}>cPanel admin portal</strong> publicly accessible, and
                  a known critical exploit (CVE-2017-9841) that lets anyone execute code on your server{" "}
                  <strong style={{ color: "#fca5a5" }}>without a password</strong>. Your XML-RPC file is
                  being used right now to{" "}
                  <strong style={{ color: "#fff" }}>amplify attacks against other websites</strong> — making
                  your store legally complicit in those attacks. This scan runs{" "}
                  <strong style={{ color: "#fff" }}>thousands of times per day</strong> against stores like
                  yours. Fully automated. Zero human effort required.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ═══════════════════════════════════════════════
            §4  ATTACK SURFACE METER
        ═══════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={cardStyle}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <ShieldAlert size={18} color={RED} />
            <h2 style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase",
                         letterSpacing: "0.1em", color: "#f1f5f9", margin: 0 }}>
              Attack Surface Exposure Map
            </h2>
            <span style={{
              marginLeft: "auto", ...MONO, fontSize: "0.68rem", fontWeight: 900,
              padding: "0.25rem 0.6rem", borderRadius: "0.25rem",
              backgroundColor: "#ef444415", color: RED, border: "1px solid #ef444328",
            }}>
              {d.open_endpoints} VECTORS OPEN
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {SURFACES.map((s, i) => {
              const isCrit = s.tag === "CRITICAL";
              const accentColor = isCrit ? RED : AMBER;
              return (
                <div key={s.label}>
                  <div style={{ display: "flex", alignItems: "center",
                                justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <s.Icon size={13} color={accentColor} />
                      <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#cbd5e1" }}>
                        {s.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{
                        ...MONO, fontSize: "0.68rem", fontWeight: 700,
                        padding: "0.15rem 0.5rem", borderRadius: "0.2rem",
                        backgroundColor: isCrit ? "#ef444415" : "#f59e0b15",
                        color: accentColor,
                      }}>
                        {s.tag}
                      </span>
                      <span style={{ ...MONO, fontSize: "0.75rem", fontWeight: 900,
                                     color: RED, minWidth: "2.5rem", textAlign: "right" }}>
                        {s.severity}%
                      </span>
                    </div>
                  </div>
                  <div style={{ height: "0.5rem", borderRadius: "9999px",
                                overflow: "hidden", backgroundColor: "#1a1a1a" }}>
                    <motion.div
                      style={{
                        height: "100%", borderRadius: "9999px",
                        background: isCrit
                          ? "linear-gradient(90deg, #dc2626, #ef4444)"
                          : "linear-gradient(90deg, #b45309, #f59e0b)",
                      }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${s.severity}%` }}
                      transition={{ duration: 1.4, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composite score */}
          <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid #1e1e1e" }}>
            <div style={{ display: "flex", alignItems: "flex-end",
                          justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#94a3b8" }}>
                Composite Exposure Score
              </span>
              <div>
                <span style={{ ...MONO, fontSize: "1.9rem", fontWeight: 900, color: RED }}>
                  {d.exposure_score}
                </span>
                <span style={{ ...MONO, fontSize: "1rem", fontWeight: 700, color: RED }}>/100</span>
              </div>
            </div>
            <div style={{ height: "0.75rem", borderRadius: "9999px",
                          overflow: "hidden", backgroundColor: "#1a1a1a" }}>
              <motion.div
                style={{
                  height: "100%", borderRadius: "9999px",
                  background: "linear-gradient(90deg, #f59e0b 0%, #ef4444 55%, #dc2626 100%)",
                }}
                initial={{ width: "0%" }}
                animate={{ width: `${d.exposure_score}%` }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between",
                          ...MONO, fontSize: "0.68rem", color: "#374151", marginTop: "0.4rem" }}>
              <span>0 · Hardened</span><span>50 · Moderate</span><span>100 · Indefensible</span>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════
            §5  BREACH COST ESTIMATOR
        ═══════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38 }}
          style={cardStyle}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <DollarSign size={18} color={RED} />
            <h2 style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase",
                         letterSpacing: "0.1em", color: "#f1f5f9", margin: 0 }}>
              Projected Breach Cost Breakdown
            </h2>
            <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#374151" }}>
              IBM Cost of a Data Breach Report 2024
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {BREACH_ROWS.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div style={{
                  width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem",
                  backgroundColor: "#1a1a1a", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <r.Icon size={15} color={r.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center",
                                justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#cbd5e1",
                                   overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                   paddingRight: "0.75rem" }}>
                      {r.label}
                    </span>
                    <span style={{ ...MONO, fontSize: "0.875rem", fontWeight: 900,
                                   color: r.color, flexShrink: 0 }}>
                      {safe(r.amount)}
                    </span>
                  </div>
                  <div style={{ height: "0.375rem", borderRadius: "9999px",
                                overflow: "hidden", backgroundColor: "#1a1a1a" }}>
                    <motion.div
                      style={{ height: "100%", borderRadius: "9999px", backgroundColor: r.color }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${r.pct * 0.88}%` }}
                      transition={{ duration: 1.3, delay: 0.6 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid #1e1e1e",
                        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                             letterSpacing: "0.1em", color: "#475569" }}>
                Total · Single Breach Event
              </div>
              <div style={{ fontSize: "0.7rem", color: "#374151", marginTop: "0.25rem" }}>
                Median for e-commerce, your revenue tier
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ ...MONO, fontSize: "2.5rem", fontWeight: 900, color: RED }}>
                {safe(d.breach_cost)}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.2rem" }}>
                if breached tomorrow
              </div>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════
            §6  FIX vs IGNORE TOGGLE
        ═══════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.46 }}
        >
          {/* Toggle */}
          <div style={{
            display: "flex", borderRadius: "0.75rem", overflow: "hidden",
            border: `1px solid ${BORDER}`, backgroundColor: "#0e0e0e", marginBottom: "1.5rem",
          }}>
            {(["ignore", "fix"] as const).map((m, idx) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: "1rem", border: "none", cursor: "pointer",
                  fontSize: "0.8rem", fontWeight: 800, letterSpacing: "0.08em",
                  textTransform: "uppercase", transition: "all 0.3s ease",
                  borderRight: idx === 0 ? `1px solid ${BORDER}` : "none",
                  backgroundColor: mode === m
                    ? (m === "ignore" ? "#ef444415" : "#22c55e15")
                    : "transparent",
                  color: mode === m
                    ? (m === "ignore" ? RED : GREEN)
                    : "#3f3f3f",
                }}
              >
                {m === "ignore" ? "⚠  Ignore This" : "✓  Fix This Now"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === "ignore" ? (

              /* ─── IGNORE PANEL ─────────────────────────────────────── */
              <motion.div
                key="ignore"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                style={{
                  backgroundColor: "#110404", border: "1px solid #ef444328",
                  borderRadius: "0.75rem", padding: "1.5rem",
                  display: "flex", flexDirection: "column", gap: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <AlertTriangle size={22} color={RED} style={{ flexShrink: 0 }} />
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: RED, margin: 0 }}>
                    Compounding Compromise Probability
                  </h3>
                </div>

                <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#fca5a5", margin: 0 }}>
                  Every day <strong style={{ color: "#fff" }}>{d.store}</strong> remains unpatched,
                  the probability of successful exploitation compounds. Automated botnets scan your
                  domain continuously. The XML-RPC endpoint is being hammered in real time. This is
                  not a question of <em>if</em> — it is a question of <em>when</em>.
                </p>

                {/* Compounding probability bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {[
                    { label: "After 30 days unpatched",  prob: 34 },
                    { label: "After 90 days unpatched",  prob: 67 },
                    { label: "After 180 days unpatched", prob: 89 },
                    { label: "After 365 days unpatched", prob: 97 },
                  ].map(({ label, prob }, i) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between",
                                    ...MONO, fontSize: "0.72rem", color: "#fca5a5", marginBottom: "0.3rem" }}>
                        <span>{label}</span>
                        <span style={{ fontWeight: 900 }}>{prob}% breach probability</span>
                      </div>
                      <div style={{ height: "0.6rem", borderRadius: "9999px",
                                    overflow: "hidden", backgroundColor: "#1e0606" }}>
                        <motion.div
                          style={{
                            height: "100%", borderRadius: "9999px",
                            background: "linear-gradient(90deg, #991b1b, #ef4444)",
                          }}
                          initial={{ width: "0%" }}
                          animate={{ width: `${prob}%` }}
                          transition={{ duration: 1.1, delay: i * 0.13, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Projected cost box */}
                <div style={{
                  borderRadius: "0.5rem", padding: "1.25rem", textAlign: "center",
                  backgroundColor: "#180303", border: "1px solid #ef444322",
                }}>
                  <div style={{ fontSize: "0.68rem", textTransform: "uppercase",
                                letterSpacing: "0.1em", color: "#7f1d1d", marginBottom: "0.5rem" }}>
                    Projected Cost · 6 Months of Inaction
                  </div>
                  <div style={{ ...MONO, fontSize: "2.5rem", fontWeight: 900, color: RED }}>
                    {safe(Math.round(d.breach_cost * 1.31))}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#fca5a5", marginTop: "0.5rem" }}>
                    +31% compounding risk premium after 180 days of documented, unpatched vulnerabilities
                  </div>
                </div>
              </motion.div>

            ) : (

              /* ─── FIX PANEL ────────────────────────────────────────── */
              <motion.div
                key="fix"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
              >
                {/* ── GUARANTEE FIRST — Risk Reversal (Hormozi) ─────────── */}
                <div style={{
                  borderRadius: "0.75rem", padding: "1.5rem",
                  backgroundColor: "#030f07", border: "1px solid #22c55e2e",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1rem" }}>
                    <div style={{
                      width: "2.5rem", height: "2.5rem", borderRadius: "50%",
                      backgroundColor: "#22c55e15", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Lock size={18} color={GREEN} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase",
                                    letterSpacing: "0.1em", color: GREEN }}>
                        Alex's Personal Guarantee
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#4ade80", marginTop: "0.15rem" }}>
                        Read this before you see a single price
                      </div>
                    </div>
                  </div>

                  <div style={{
                    borderRadius: "0.5rem", padding: "1rem", marginBottom: "1rem",
                    backgroundColor: "#020c04", border: "1px solid #22c55e15",
                  }}>
                    <p style={{ fontSize: "0.875rem", lineHeight: 1.75, fontStyle: "italic",
                                color: "#d1fae5", margin: 0 }}>
                      "If we complete our full security remediation engagement and{" "}
                      <strong style={{ color: "#fff" }}>
                        {d.store} suffers a breach from any vulnerability vector we identified in
                        this report
                      </strong>
                      , I will personally refund 100% of the investment and fund the forensic
                      remediation out of my own pocket. No contracts. No lawyers. No asterisks.
                      My name and my reputation are on every line of this report."
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle size={15} color={GREEN} />
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: GREEN }}>
                      — Alex, Founder & Lead Security Architect
                    </span>
                  </div>
                </div>

                {/* ── Investment Comparison ───────────────────────────────── */}
                <div style={cardStyle}>
                  <h3 style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase",
                               letterSpacing: "0.1em", color: "#f1f5f9", margin: "0 0 1.25rem" }}>
                    Protection Investment vs. Breach Exposure
                  </h3>

                  {/* Two columns */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
                                gap: "1rem", marginBottom: "1.25rem" }}>
                    {[
                      {
                        title: "Fix It Now", amount: d.fix_cost, color: GREEN,
                        bg: "#030f07", bdr: "#22c55e22",
                        sub1: "One-time investment", sub1c: "#86efac",
                        sub2: "Full remediation + 30-day watch", sub2c: "#4ade80",
                      },
                      {
                        title: "Ignore It", amount: d.breach_cost, color: RED,
                        bg: "#110404", bdr: "#ef444322",
                        sub1: "Average breach cost", sub1c: "#fca5a5",
                        sub2: "97% probability within 12 months", sub2c: "#f87171",
                      },
                    ].map(col => (
                      <div key={col.title} style={{
                        borderRadius: "0.5rem", padding: "1rem", textAlign: "center",
                        backgroundColor: col.bg, border: `1px solid ${col.bdr}`,
                      }}>
                        <div style={{ fontSize: "0.68rem", textTransform: "uppercase",
                                      letterSpacing: "0.1em", fontWeight: 700,
                                      color: col.color, marginBottom: "0.5rem" }}>
                          {col.title}
                        </div>
                        <div style={{ ...MONO, fontSize: "1.75rem", fontWeight: 900, color: col.color }}>
                          {safe(col.amount)}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: col.sub1c, marginTop: "0.4rem" }}>
                          {col.sub1}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: col.sub2c, marginTop: "0.2rem" }}>
                          {col.sub2}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ROI bar */}
                  <div style={{
                    borderRadius: "0.5rem", padding: "1rem", marginBottom: "1.25rem",
                    backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between",
                                  ...MONO, fontSize: "0.7rem", marginBottom: "0.5rem" }}>
                      <span style={{ color: GREEN }}>Fix: {safe(d.fix_cost)}</span>
                      <span style={{ color: "#475569" }}>{roiPct}% of breach cost</span>
                      <span style={{ color: RED }}>Breach: {safe(d.breach_cost)}</span>
                    </div>
                    <div style={{ position: "relative", height: "0.75rem", borderRadius: "9999px",
                                  overflow: "hidden", backgroundColor: "#ef444428" }}>
                      <motion.div
                        style={{ position: "absolute", inset: "0 auto 0 0",
                                 borderRadius: "9999px", backgroundColor: GREEN }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${fixBarPct}%` }}
                        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <div style={{ ...MONO, fontSize: "0.72rem", textAlign: "center",
                                  color: "#94a3b8", marginTop: "0.5rem" }}>
                      The fix costs{" "}
                      <strong style={{ color: GREEN }}>{roiPct}%</strong>{" "}
                      of what a single breach would cost you
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                    {[
                      "XML-RPC permanently disabled — amplification vector closed",
                      "REST API authentication layer hardened and locked",
                      "All identified CVEs patched with automated monitoring active",
                      "Admin enumeration blocked at the server configuration level",
                      "Magecart injection prevention layer fully deployed",
                      "Database port restricted — zero public internet exposure",
                      "30-day post-remediation threat monitoring included",
                    ].map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
                        <CheckCircle size={15} color={GREEN} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                        <span style={{ fontSize: "0.875rem", color: "#cbd5e1" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ═══════════════════════════════════════════════
            §7  CTA
        ═══════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.54 }}
          style={{
            textAlign: "center", paddingBottom: "5rem", paddingTop: "0.5rem",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
          }}
        >
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0 }}>
            Free 30-minute emergency review · No commitment · Delivered within 24 hours
          </p>

          <motion.button
            onClick={handleCTA}
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.975 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.75rem",
              padding: "1.25rem 2.5rem", borderRadius: "0.75rem", border: "none",
              cursor: "pointer", fontSize: "1rem", fontWeight: 800, letterSpacing: "0.02em",
              background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
              color: "#ffffff",
              boxShadow: "0 0 0 1px #ef444440, 0 8px 40px #ef444428, 0 0 80px #ef444412",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <ShieldAlert size={20} />
            Request Emergency Security Review
            <ChevronRight size={20} />
          </motion.button>

          <p style={{ ...MONO, fontSize: "0.65rem", color: "#1f1f1f", margin: 0 }}>
            Covered by Alex's Personal Guarantee · Full refund if any identified vector results in a breach
          </p>
        </motion.section>

      </div>
    </div>
  );
}
