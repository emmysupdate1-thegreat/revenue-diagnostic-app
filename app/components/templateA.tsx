"use client";

/**
 * TemplateA.tsx — Forensic Revenue Dashboard
 * Core Trigger: Silent Bleed / Revenue Leak
 * Best for: Subscription failures, abandoned carts, checkout drops.
 *
 * ── PSYCHOLOGICAL CONSTITUTION ──────────────────────────────────────────────
 * §1 Loss Aversion   : Live counters tick from historical scan_date, not zero.
 * §2 Cognitive Ease  : Zero editable inputs. All data is read-only.
 * §3 Authority       : Every terminal block is followed by a Plain English block.
 * §4 Risk Reversal   : The Guarantee appears BEFORE the Protection Math.
 * §5 Frictionless    : ONE CTA — handleCTA. No mailto, no anchors.
 *
 * ── REQUIRED DATA SHAPE ─────────────────────────────────────────────────────
 * {
 *   store           : string    — "NexaCommerce.io"
 *   annual_coi      : number    — 148600  (Annual Cost of Inaction)
 *   technical_finding: string   — short hero sub-head
 *   scan_date       : string    — ISO 8601, must be in the past
 *   monthly_loss    : number    — 12383
 *   fix_investment  : number    — 7800
 *   terminal_lines  : Array<{ type:"ok"|"warn"|"crit"; text:string }>
 *   plain_english   : string    — CEO-readable translation
 * }
 *
 * ── PROP FORMATTERS ─────────────────────────────────────────────────────────
 * fmt(n)      → "$148,600"      (static rounded currency)
 * fmtLive(n)  → "$148,600.00"   (2dp live counter)
 * fmtMicro(n) → "$1.2348"       (4dp session loss)
 */

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Shield,
  Terminal,
  Activity,
  CheckCircle,
  ArrowRight,
  Lock,
  TrendingDown,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLE DATA — for standalone preview only. Pass via props in production.
// ═══════════════════════════════════════════════════════════════════════════
const _SAMPLE: any = {
  store: "NexaCommerce.io",
  annual_coi: 148_600,
  technical_finding:
    "14.2% checkout abandonment rate detected across 3 critical drop-off nodes",
  scan_date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
  monthly_loss: 12_383,
  fix_investment: 7_800,
  terminal_lines: [
    {
      type: "ok",
      text: 'target="NexaCommerce.io" protocol=HTTPS/2 nodes_crawled=1,204 tls_grade=A session_tracking=ACTIVE',
    },
    {
      type: "warn",
      text: "checkout_abandon_rate=14.2% [baseline=6.8%] ghost_carts=2,104/mo annual_exposure=$148,600",
    },
    {
      type: "crit",
      text: "payment_gw_timeout=3.1% | stripe_webhook_fail=19/day | drop_node=/checkout/payment [UNPATCHED]",
    },
  ],
  plain_english:
    "Your payment page is timing out on 3% of customers. Stripe is silently failing to confirm 19 orders every single day. Customers hit a dead end at the exact moment they're ready to pay — not because they changed their mind, but because your infrastructure failed them first.",
};

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════
const T = {
  bg: "#0a0a0a",
  card: "#111111",
  border: "#2a2a2a",
  red: "#ef4444",
  green: "#22c55e",
  amber: "#f59e0b",
  mono: "'JetBrains Mono', monospace",
  ui: "'Inter', sans-serif",
} as const;

const CARD: React.CSSProperties = {
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: 12,
  padding: 24,
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: Blinking Cursor
// ═══════════════════════════════════════════════════════════════════════════
function BlinkCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
      style={{
        display: "inline-block",
        width: 8,
        height: 16,
        background: T.green,
        marginLeft: 4,
        verticalAlign: "middle",
        borderRadius: 1,
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: Terminal Line (staggered reveal)
// ═══════════════════════════════════════════════════════════════════════════
function TermLine({
  type,
  text,
  delay,
}: {
  type: "ok" | "warn" | "crit";
  text: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const palette = {
    ok:   { pfx: "[ OK ]", prefixColor: T.green, textColor: "#525252" },
    warn: { pfx: "[WARN]", prefixColor: T.amber, textColor: T.amber   },
    crit: { pfx: "[CRIT]", prefixColor: T.red,   textColor: T.red     },
  };
  const p = palette[type];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        fontFamily: T.mono,
        fontSize: 12,
        lineHeight: 1.95,
        display: "flex",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <span style={{ color: p.prefixColor, fontWeight: 700, flexShrink: 0 }}>
        {p.pfx}
      </span>
      <span style={{ color: p.textColor, wordBreak: "break-all" }}>{text}</span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: Recovery Gauge
// Pure SVG semi-circle + Framer Motion — ZERO chart libraries.
// ═══════════════════════════════════════════════════════════════════════════
function RecoveryGauge({ score = 91 }: { score?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(0);

  // Geometry
  const R = 88, CX = 120, CY = 110;
  const C = Math.PI * R; // semi-circumference
  const tgtOffset = C * (1 - score / 100);
  const arcD = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

  // Animated score counter via rAF (avoids motion.text SVG quirks)
  useEffect(() => {
    if (!inView) return;
    let id: number;
    const t0 = performance.now();
    const dur = 1800;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * score));
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [inView, score]);

  const animatedArc = {
    d: arcD,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeDasharray: C,
    initial: { strokeDashoffset: C },
    animate: { strokeDashoffset: inView ? tgtOffset : C },
    transition: {
      duration: 1.8,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      delay: 0.2,
    },
  };

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="240" height="128" viewBox="0 0 240 128" overflow="visible">
        {/* Track */}
        <path d={arcD} fill="none" stroke="#1e1e1e" strokeWidth="16" strokeLinecap="round" />

        {/* Glow bloom */}
        <motion.path
          {...animatedArc}
          stroke={T.green}
          strokeWidth="26"
          opacity={0.12}
          style={{ filter: "blur(10px)" }}
        />

        {/* Arc fill */}
        <motion.path {...animatedArc} stroke={T.green} strokeWidth="16" />

        {/* Tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const a = -Math.PI + p * Math.PI;
          return (
            <line
              key={i}
              x1={CX + (R + 7) * Math.cos(a)}
              y1={CY + (R + 7) * Math.sin(a)}
              x2={CX + (R + 16) * Math.cos(a)}
              y2={CY + (R + 16) * Math.sin(a)}
              stroke="#282828"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Animated score value */}
        <text
          x={CX} y={CY - 14}
          textAnchor="middle"
          fill={T.green}
          fontSize="46"
          fontWeight="700"
          fontFamily={T.mono}
        >
          {display}
        </text>

        {/* /100 */}
        <text x={CX} y={CY + 8} textAnchor="middle" fill="#555" fontSize="12" fontFamily={T.ui}>
          / 100
        </text>

        {/* Scale ends */}
        <text x={CX - R - 10} y={CY + 18} textAnchor="middle" fill="#383838" fontSize="10" fontFamily={T.mono}>0</text>
        <text x={CX + R + 10} y={CY + 18} textAnchor="middle" fill="#383838" fontSize="10" fontFamily={T.mono}>100</text>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function TemplateA({
  data       = _SAMPLE,
  fmt,
  fmtLive,
  fmtMicro,
  handleCTA,
}: any) {

  // ── Default formatters ───────────────────────────────────────────────────
  const $fmt   = fmt     ?? ((n: number) => "$" + Math.round(n).toLocaleString("en-US"));
  const $live  = fmtLive ?? ((n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const $micro = fmtMicro ?? ((n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 }));
  const onCTA = handleCTA ?? (() => {});

  // ── Live counter (Loss Aversion: calculated from historical scan_date) ───
  const [totalLost,   setTotalLost]   = useState(0);
  const [sessionLost, setSessionLost] = useState(0);
  const sessionStart = useRef(Date.now());
  const perSec = data.annual_coi / 365 / 24 / 3600;

  useEffect(() => {
    const scanTs = new Date(data.scan_date).getTime();
    const tick = () => {
      const now = Date.now();
      setTotalLost(  (perSec * (now - scanTs)) / 1000);
      setSessionLost((perSec * (now - sessionStart.current)) / 1000);
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [perSec, data.scan_date]);

  // ── Derived math ─────────────────────────────────────────────────────────
  const bkEven = (data.fix_investment / data.monthly_loss).toFixed(1);
  const netRec = data.annual_coi - data.fix_investment;
  const roiPct = Math.round((netRec / data.fix_investment) * 100);

  // ── Animation presets ────────────────────────────────────────────────────
  const fadeUp = {
    hidden:  { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  };
  const stg = { visible: { transition: { staggerChildren: 0.1 } } };

  // Reusable scroll-reveal props for sections
  const sr = {
    initial:    { opacity: 0, y: 30 },
    whileInView:{ opacity: 1, y: 0  },
    viewport:   { once: true, margin: "-40px" },
    transition: { duration: 0.5 },
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background:  T.bg,
        minHeight:   "100vh",
        color:       "#e5e5e5",
        fontFamily:  T.ui,
        maxWidth:    860,
        margin:      "0 auto",
        padding:     "48px 24px 96px",
      }}
    >
      {/* ── Google Fonts injection ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        ::selection { background: #ef444420; color: #ef4444; }
      `}</style>

      {/* ════════════════════════════════════════════════════════════════
          §1  HERO
          "We found {annual_coi} leaving {store} every year."
      ════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={stg}
        style={{ marginBottom: 52, textAlign: "center" }}
      >
        {/* Live recon badge */}
        <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <span
            style={{
              display:     "inline-flex",
              alignItems:  "center",
              gap:         8,
              background:  "#0c180c",
              border:      `1px solid ${T.green}28`,
              borderRadius: 9999,
              padding:     "6px 16px",
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.45, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: T.green }}
            />
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.green, letterSpacing: "0.1em" }}>
              FORENSIC_SCAN_COMPLETE
            </span>
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          variants={fadeUp}
          style={{
            fontSize:      "clamp(26px, 4.5vw, 46px)",
            fontWeight:    900,
            lineHeight:    1.12,
            letterSpacing: "-0.025em",
            color:         "#ffffff",
            marginBottom:  18,
          }}
        >
          We found{" "}
          <span style={{ position: "relative", display: "inline-block" }}>
            {/* Pulsing red halo behind loss amount */}
            <motion.span
              animate={{ opacity: [0.15, 0.5, 0.15] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                position:    "absolute",
                inset:       "-6px -10px",
                background:  "#ef44440d",
                borderRadius: 8,
                pointerEvents: "none",
              }}
            />
            <span style={{ color: T.red }}>{$fmt(data.annual_coi)}</span>
          </span>{" "}
          leaving <span style={{ color: "#f5f5f5" }}>{data.store}</span> every year.
        </motion.h1>

        {/* Technical subhead */}
        <motion.p
          variants={fadeUp}
          style={{ color: "#737373", fontSize: 16, lineHeight: 1.65, maxWidth: 520, margin: "0 auto 36px" }}
        >
          {data.technical_finding}
        </motion.p>

        {/* Section rule */}
        <motion.div
          variants={fadeUp}
          style={{ height: 1, background: "linear-gradient(90deg,transparent,#2a2a2a 25%,#2a2a2a 75%,transparent)" }}
        />
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════
          §2  LIVE COUNTER
          Red, ticking upwards from historical scan_date (Loss Aversion).
          Includes a Session Loss micro-counter.
      ════════════════════════════════════════════════════════════════ */}
      <motion.section {...sr} style={{ marginBottom: 52 }}>
        <div
          style={{
            ...CARD,
            background: "#0e0808",
            border:     `1px solid ${T.red}28`,
            position:   "relative",
            overflow:   "hidden",
          }}
        >
          {/* Ambient radial bleed */}
          <div
            style={{
              position:  "absolute",
              top:       -100,
              left:      "50%",
              transform: "translateX(-50%)",
              width:     700,
              height:    280,
              background: "radial-gradient(ellipse,#ef44440d 0%,transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            {/* Live label */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 22 }}>
              <motion.span
                animate={{ opacity: [1, 0.1, 1] }}
                transition={{ duration: 0.58, repeat: Infinity }}
                style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: T.red }}
              />
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.red, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Revenue leaving {data.store} since scan
              </span>
            </div>

            {/* Primary loss counter */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div
                style={{
                  fontFamily:    T.mono,
                  fontSize:      "clamp(38px, 8vw, 70px)",
                  fontWeight:    700,
                  color:         T.red,
                  letterSpacing: "-0.02em",
                  lineHeight:    1,
                  textShadow:    `0 0 50px ${T.red}38`,
                }}
              >
                {$live(totalLost)}
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: "#383838", letterSpacing: "0.12em", marginTop: 10 }}>
                ACCUMULATED · REAL-TIME · COMPOUNDING
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#1e1e1e", marginBottom: 22 }} />

            {/* Session micro-counter */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        10,
                  background: "#160a0a",
                  border:     `1px solid ${T.red}18`,
                  borderRadius: 10,
                  padding:    "10px 22px",
                }}
              >
                <Activity size={14} color={T.red} />
                <span style={{ color: "#525252", fontSize: 13 }}>Session Loss</span>
                <span style={{ fontFamily: T.mono, fontSize: 20, color: T.red, fontWeight: 600, marginLeft: 10 }}>
                  {$micro(sessionLost)}
                </span>
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: "#2e2e2e", letterSpacing: "0.1em" }}>
                MONEY LOST WHILE VIEWING THIS PAGE
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════
          §3  FORENSIC PROOF
          Black terminal (Authority: raw external reconnaissance).
          ALWAYS followed by Plain English translation for non-technical CEOs.
      ════════════════════════════════════════════════════════════════ */}
      <motion.section {...sr} style={{ marginBottom: 52 }}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Terminal size={14} color="#525252" />
          <span style={{ color: "#525252", fontSize: 12, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>
            External Forensic Recon
          </span>
          <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
          <span
            style={{
              display:    "inline-flex",
              alignItems: "center",
              gap:        6,
              background: "#0a160a",
              border:     `1px solid ${T.green}1a`,
              borderRadius: 999,
              padding:    "3px 11px",
            }}
          >
            <Lock size={9} color={T.green} />
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.green, letterSpacing: "0.06em" }}>ENCRYPTED</span>
          </span>
        </div>

        {/* Terminal block */}
        <div
          style={{
            background:   "#050505",
            border:       "1px solid #1a1a1a",
            borderRadius: 12,
            overflow:     "hidden",
            marginBottom: 14,
          }}
        >
          {/* macOS-style chrome */}
          <div
            style={{
              background:   "#0f0f0f",
              borderBottom: "1px solid #1a1a1a",
              padding:      "10px 18px",
              display:      "flex",
              alignItems:   "center",
              gap:          8,
            }}
          >
            {[T.red, T.amber, T.green].map((c) => (
              <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.72 }} />
            ))}
            <span style={{ marginLeft: 10, fontFamily: T.mono, fontSize: 11, color: "#383838" }}>
              forensic-recon v3.1.0 — {data.store}
            </span>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: "#2e2e2e", marginBottom: 10 }}>
              $ forensic-recon --target {data.store} --depth=full --output=structured
            </div>
            {data.terminal_lines.map((ln: any, i: number) => (
              <TermLine key={i} type={ln.type} text={ln.text} delay={0.15 + i * 0.18} />
            ))}
            <div style={{ marginTop: 8, display: "flex", alignItems: "center" }}>
              <span style={{ fontFamily: T.mono, fontSize: 12, color: "#262626" }}>$</span>
              <BlinkCursor />
            </div>
          </div>
        </div>

        {/* ── PLAIN ENGLISH TRANSLATION (Authority §3 — mandatory after every terminal) ── */}
        <div
          style={{
            background:   "#0b110b",
            border:       `1px solid ${T.green}1a`,
            borderLeft:   `3px solid ${T.green}`,
            borderRadius: "0 10px 10px 0",
            padding:      "16px 20px",
            display:      "flex",
            gap:          14,
            alignItems:   "flex-start",
          }}
        >
          <div
            style={{
              background:    `${T.green}18`,
              borderRadius:  6,
              padding:       "5px 8px",
              fontFamily:    T.mono,
              fontSize:      9,
              color:         T.green,
              letterSpacing: "0.08em",
              flexShrink:    0,
              lineHeight:    1.5,
              textTransform: "uppercase",
              marginTop:     1,
            }}
          >
            Plain<br />English
          </div>
          <p style={{ color: "#d4d4d4", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
            {data.plain_english}
          </p>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════
          §4  RECOVERY GAUGE
          Pure SVG + Framer Motion semi-circle. Score: 91/100. Zero chart libs.
      ════════════════════════════════════════════════════════════════ */}
      <motion.section {...sr} style={{ marginBottom: 52 }}>
        <div style={CARD}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <Activity size={14} color={T.green} />
            <span style={{ color: "#737373", fontSize: 12, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Recovery Potential
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <RecoveryGauge score={91} />

            <div style={{ textAlign: "center" }}>
              <div style={{ color: T.green, fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", marginBottom: 8 }}>
                HIGH CONFIDENCE RECOVERY
              </div>
              <p style={{ color: "#525252", fontSize: 13, lineHeight: 1.65, maxWidth: 420, margin: "0 auto" }}>
                91% of identified leaks fall within standard recovery protocols.
                All 3 failure nodes are patchable without platform migration or vendor changes.
              </p>
            </div>

            {/* Recovery breakdown pills */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
              {[
                { label: "Payment Gateway Fix", pct: "97%", c: T.green },
                { label: "Cart Abandonment",    pct: "88%", c: T.green },
                { label: "Session Drops",       pct: "83%", c: T.amber },
              ].map((x) => (
                <div
                  key={x.label}
                  style={{
                    display:    "flex",
                    alignItems: "center",
                    gap:        8,
                    background: "#161616",
                    border:     `1px solid ${T.border}`,
                    borderRadius: 9999,
                    padding:    "6px 16px",
                  }}
                >
                  <span style={{ color: "#737373", fontSize: 12 }}>{x.label}</span>
                  <span style={{ color: x.c, fontFamily: T.mono, fontSize: 12, fontWeight: 700 }}>{x.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════
          §5  THE GUARANTEE
          Risk Reversal (Hormozi): MUST appear BEFORE Protection Math.
      ════════════════════════════════════════════════════════════════ */}
      <motion.section {...sr} style={{ marginBottom: 52 }}>
        <div
          style={{
            ...CARD,
            background: "#0b100b",
            border:     `1px solid ${T.green}28`,
            position:   "relative",
            overflow:   "hidden",
          }}
        >
          {/* Ambient green bloom */}
          <div
            style={{
              position:  "absolute",
              top:       -80,
              left:      "50%",
              transform: "translateX(-50%)",
              width:     600,
              height:    260,
              background: `radial-gradient(ellipse,${T.green}08 0%,transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 22 }}>
              <div
                style={{
                  width:       56,
                  height:      56,
                  background:  `${T.green}14`,
                  border:      `1.5px solid ${T.green}38`,
                  borderRadius: 14,
                  display:     "flex",
                  alignItems:  "center",
                  justifyContent: "center",
                  flexShrink:  0,
                }}
              >
                <Shield size={26} color={T.green} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily:    T.mono,
                    fontSize:      10,
                    color:         T.green,
                    letterSpacing: "0.12em",
                    marginBottom:  4,
                    textTransform: "uppercase",
                  }}
                >
                  Alex's Personal Guarantee
                </div>
                <div style={{ color: "#f5f5f5", fontSize: 22, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.015em" }}>
                  Zero Risk. You Win First.
                </div>
              </div>
            </div>

            {/* Body */}
            <p style={{ color: "#c4c4c4", fontSize: 16, lineHeight: 1.8, marginBottom: 22 }}>
              If I don't surface at least{" "}
              <strong style={{ color: T.green }}>3× your investment</strong>{" "}
              in recoverable revenue within 30 days of our engagement,
              you pay <strong style={{ color: "#ffffff" }}>absolutely nothing.</strong>
            </p>

            {/* Bullets */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "No contracts. No lock-in. Full refund within 30 days — no questions asked.",
                "You see the recoverable revenue before you're billed for the discovery phase.",
                "Every finding is independently verifiable by your own analytics stack.",
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <CheckCircle size={15} color={T.green} style={{ flexShrink: 0, marginTop: 3 }} />
                  <span style={{ color: "#8a8a8a", fontSize: 14, lineHeight: 1.65 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════
          §6  PROTECTION MATH
          Monthly Loss vs. One-Time Fix Investment.
          Placed AFTER the guarantee (Risk Reversal rule).
      ════════════════════════════════════════════════════════════════ */}
      <motion.section {...sr} style={{ marginBottom: 52 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <TrendingDown size={14} color="#525252" />
          <span style={{ color: "#525252", fontSize: 12, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>
            The Math
          </span>
          <div style={{ flex: 1, height: 1, background: "#1a1a1a" }} />
        </div>

        {/* 2-column comparison */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>

          {/* Monthly Loss */}
          <div style={{ ...CARD, background: "#0e0808", border: `1px solid ${T.red}28` }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.red, letterSpacing: "0.1em", marginBottom: 14, textTransform: "uppercase" }}>
              ↓ Monthly Loss
            </div>
            <div
              style={{
                fontFamily:  T.mono,
                fontSize:    "clamp(22px, 4vw, 34px)",
                fontWeight:  700,
                color:       T.red,
                textShadow:  `0 0 28px ${T.red}28`,
                lineHeight:  1,
                marginBottom: 8,
              }}
            >
              {$fmt(data.monthly_loss)}
            </div>
            <div style={{ color: "#444", fontSize: 12, marginBottom: 16 }}>Every month. Compounding.</div>
            {/* Full-width red bar */}
            <div style={{ height: 4, background: "#1e1e1e", borderRadius: 99, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
                style={{ height: "100%", background: `linear-gradient(90deg,${T.red},#dc2626)`, borderRadius: 99 }}
              />
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: "#333", marginTop: 6 }}>
              = {$fmt(data.annual_coi)} / year
            </div>
          </div>

          {/* One-Time Fix */}
          <div style={{ ...CARD, background: "#0b100b", border: `1px solid ${T.green}28` }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.green, letterSpacing: "0.1em", marginBottom: 14, textTransform: "uppercase" }}>
              ✓ One-Time Fix
            </div>
            <div
              style={{
                fontFamily:  T.mono,
                fontSize:    "clamp(22px, 4vw, 34px)",
                fontWeight:  700,
                color:       T.green,
                textShadow:  `0 0 28px ${T.green}28`,
                lineHeight:  1,
                marginBottom: 8,
              }}
            >
              {$fmt(data.fix_investment)}
            </div>
            <div style={{ color: "#444", fontSize: 12, marginBottom: 16 }}>Paid once. Recovered forever.</div>
            {/* Proportional green bar */}
            <div style={{ height: 4, background: "#1e1e1e", borderRadius: 99, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min((data.fix_investment / data.annual_coi) * 100, 100)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.35 }}
                style={{ height: "100%", background: `linear-gradient(90deg,${T.green},#16a34a)`, borderRadius: 99 }}
              />
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: "#333", marginTop: 6 }}>
              break-even: {bkEven} months
            </div>
          </div>
        </div>

        {/* ROI summary strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.3 }}
          style={{ ...CARD, padding: "16px 24px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 12 }}
        >
          {[
            { label: "Year-1 ROI",   value: `${roiPct}%`,    c: T.green },
            { label: "Break-even",   value: `${bkEven} mo`,  c: T.amber },
            { label: "Net Recovery", value: $fmt(netRec),     c: T.green },
          ].map((x) => (
            <div key={x.label} style={{ textAlign: "center", padding: "4px 12px" }}>
              <div style={{ fontFamily: T.mono, fontSize: "clamp(20px,3vw,26px)", fontWeight: 700, color: x.c, lineHeight: 1 }}>
                {x.value}
              </div>
              <div style={{ color: "#444", fontSize: 10, marginTop: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {x.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════
          §7  CTA — SINGLE BUTTON (Frictionless Action)
          No mailto. No secondary links. One action: handleCTA.
      ════════════════════════════════════════════════════════════════ */}
      <motion.section {...sr} style={{ textAlign: "center" }}>

        {/* Urgency echo of live counter */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 22 }}>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.85, repeat: Infinity }}
            style={{ fontFamily: T.mono, fontSize: 13, color: T.red, fontWeight: 700 }}
          >
            {$live(totalLost)}
          </motion.span>
          <span style={{ color: "#444", fontSize: 13 }}>lost since this scan started</span>
        </div>

        {/* THE CTA */}
        <motion.button
          onClick={onCTA}
          whileHover={{ scale: 1.025, boxShadow: `0 0 52px ${T.red}44` }}
          whileTap={{ scale: 0.97 }}
          style={{
            background:    `linear-gradient(135deg, ${T.red} 0%, #dc2626 60%, #b91c1c 100%)`,
            border:        `1px solid ${T.red}44`,
            borderRadius:  12,
            padding:       "18px 52px",
            color:         "#ffffff",
            fontSize:      18,
            fontWeight:    800,
            fontFamily:    T.ui,
            letterSpacing: "-0.01em",
            cursor:        "pointer",
            display:       "inline-flex",
            alignItems:    "center",
            gap:           10,
            boxShadow:     `0 0 0 1px ${T.red}1a, 0 8px 40px ${T.red}2a`,
          }}
        >
          Stop the Revenue Bleed
          <ArrowRight size={20} />
        </motion.button>

        {/* Guarantee echo */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 7, marginTop: 16, color: "#404040", fontSize: 12 }}>
          <Shield size={12} color="#404040" />
          <span>Protected by Alex's Personal Guarantee — 3× ROI or you pay nothing</span>
        </div>
      </motion.section>
    </div>
  );
}
