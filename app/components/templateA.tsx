'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Mail,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────────
   PROP CONTRACT — field names are consumed by page.tsx router.
   DO NOT rename or restructure.
────────────────────────────────────────────────────────────── */
interface TemplateAProps {
  data: {
    store: string;
    domain: string;
    currency: string;
    scan_date: string;
    scan_timestamp: string;
    service_name: string;
    service_id: string;
    monthly_coi: number;
    daily_coi: number;
    annual_coi: number;
    sessions_est: string;
    aov_est: number;
    fitd_price: number;
    benchmark_store: number;
    benchmark_industry: number;
    benchmark_source: string;
    technical_finding: string;
    finding_detail_1: string;
    finding_detail_2: string;
    finding_detail_3: string;
    plain_english: string;
    real_urgency: string;
    reply_email: string;
  };
  fmt: (n: number) => string;
  onCTA: () => void;
}

/* ──────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
────────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const staggerParent = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const sectionReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */
export default function TemplateA({ data, fmt, onCTA }: TemplateAProps) {

  /* ── RATE CONSTANTS ───────────────────────────────────────── */
  // Dollar amount lost per millisecond
  const ratePerMs = data.monthly_coi / (30 * 24 * 3_600_000);

  // Scan epoch: midnight UTC on the scan_date string (YYYY-MM-DD)
  const scanEpoch = useMemo(
    () => new Date(`${data.scan_date}T00:00:00.000Z`).getTime(),
    [data.scan_date],
  );

  // Page mount timestamp (never changes)
  const mountedAt = useRef<number>(Date.now());

 /* ── STATE ────────────────────────────────────────────────── */
  const [totalLost, setTotalLost] = useState<number>(0);
  const [sessionLost, setSessionLost] = useState<number>(0);

  // Terminal reveal
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [terminalDone, setTerminalDone] = useState(false);

  /* ── LIVE TICKER (100 ms → smooth decimal motion) ─────────── */
  useEffect(() => {
    mountedAt.current = Date.now(); // Sync client time safely
    setTotalLost(Math.max(0, (Date.now() - scanEpoch) * ratePerMs)); // Set initial jump

    const id = setInterval(() => {
      const now = Date.now();
      setTotalLost(Math.max(0, (now - scanEpoch) * ratePerMs));
      setSessionLost((now - mountedAt.current) * ratePerMs);
    }, 100);
    return () => clearInterval(id);
  }, [scanEpoch, ratePerMs]);
  
  /* ── TERMINAL ANIMATION ───────────────────────────────────── */
  useEffect(() => {
    // Build script once at mount — props are stable for the component's life
    const script: string[] = [
      `> INITIATING REVENUE SIGNAL SCAN: ${data.domain}`,
      `> SCAN DATE: ${data.scan_timestamp}`,
      `> SERVICE: ${data.service_name}`,
      `>`,
      `> [FINDING 01] ${data.finding_detail_1}`,
      `> [FINDING 02] ${data.finding_detail_2}`,
      `> [FINDING 03] ${data.finding_detail_3}`,
      `>`,
      `> SIGNAL INTEGRITY: COMPROMISED`,
      `> COI RATE: ${fmt(data.daily_coi)}/day · ${fmt(data.monthly_coi)}/mo · ${fmt(data.annual_coi)}/yr`,
      `> STATUS: ACTIVE REVENUE HEMORRHAGE CONFIRMED ▓`,
    ];

    let idx = 0;
    let tid: ReturnType<typeof setTimeout>;

    const next = () => {
      if (idx < script.length) {
        const line = script[idx++];
        setVisibleLines((prev) => [...prev, line]);
        // Pacing: fast header lines, slower findings, fast status
        const delay = idx <= 3 ? 160 : idx >= 9 ? 220 : 380;
        tid = setTimeout(next, delay);
      } else {
        setTerminalDone(true);
      }
    };

    tid = setTimeout(next, 800);
    return () => clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── MICRO FORMATTER (sub-cent session loss) ──────────────── */
  const fmtMicro = useCallback(
    (n: number): string => {
      if (n < 0.001) return n.toFixed(6);
      if (n < 0.01)  return n.toFixed(4);
      return fmt(n);
    },
    [fmt],
  );

 /* ── GAP CHART DIMENSIONS ─────────────────────────────────── */
  const CHART_H = 164; // px — total bar-area height
  const safeStore = Number(data.benchmark_store) || 0;
  const safeIndustry = Number(data.benchmark_industry) || 0;
  const maxScore  = Math.max(safeStore, safeIndustry, 1);
  const storeBarH = (safeStore / maxScore) * CHART_H;
  const industBarH = (safeIndustry / maxScore) * CHART_H;

  /* ── SMOOTH-SCROLL TO COUNTER ─────────────────────────────── */
  const counterRef = useRef<HTMLDivElement>(null);
  const scrollToCounter = () =>
    counterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* ── LINE COLOUR CLASSIFIER (terminal) ───────────────────── */
  const termLineClass = (line: string): string => {
    if (line.includes('[FINDING'))          return 'text-[#f59e0b]';
    if (line.includes('COMPROMISED') ||
        line.includes('HEMORRHAGE'))        return 'text-[#ef4444] font-semibold';
    if (line.includes('INITIATING') ||
        line.includes('SCAN DATE') ||
        line.includes('SERVICE:'))          return 'text-[#22c55e]';
    if (line === '>')                       return 'text-[#252830]';
    return 'text-[#5a6070]';
  };

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── GLOBAL STYLES + FONT IMPORT ─────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        /* Utility aliases */
        .f-sans { font-family: 'Inter', sans-serif; }
        .f-mono { font-family: 'JetBrains Mono', monospace; }

        /* Pulsing green glow on primary CTA */
        @keyframes glowPulse {
          0%, 100% {
            box-shadow:
              0 0 18px rgba(34,197,94,.22),
              0 0 40px rgba(34,197,94,.08);
          }
          50% {
            box-shadow:
              0 0 32px rgba(34,197,94,.44),
              0 0 72px rgba(34,197,94,.18);
          }
        }
        .btn-pulse { animation: glowPulse 2.6s ease-in-out infinite; }

        /* Sweeping scanline across terminal */
        @keyframes scanline {
          0%   { top: -6px; opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 102%; opacity: 0; }
        }
        .terminal-body { position: relative; overflow: hidden; }
        .terminal-body::after {
          content: '';
          position: absolute;
          left: 0; right: 0;
          height: 3px;
          background: linear-gradient(
            transparent,
            rgba(34,197,94,.05),
            transparent
          );
          animation: scanline 5s linear infinite;
          pointer-events: none;
        }

        /* Prevent any horizontal bleed at 320 px */
        * { box-sizing: border-box; }
        html, body { overflow-x: hidden; }
      `}</style>

      {/* ── ROOT ────────────────────────────────────────────── */}
      <div
        className="f-sans min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden"
        style={{ paddingBottom: '72px' }}
      >

        {/* Ambient depth glows — fixed, pointer-events none */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 overflow-hidden"
        >
          <div
            className="absolute rounded-full"
            style={{
              top: '-80px', left: '20%',
              width: '700px', height: '500px',
              background: 'radial-gradient(ellipse, rgba(239,68,68,.055) 0%, transparent 70%)',
              filter: 'blur(0px)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              bottom: '15%', right: '-60px',
              width: '420px', height: '420px',
              background: 'radial-gradient(ellipse, rgba(239,68,68,.03) 0%, transparent 70%)',
              filter: 'blur(0px)',
            }}
          />
        </div>

        {/* ── CONTENT COLUMN ────────────────────────────────── */}
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6">

          {/* ════════════════════════════════════════════════
              1. HEADER
          ════════════════════════════════════════════════ */}
          <header className="flex items-center justify-between py-4 border-b border-[#1a1a1a]">
            <span
              className="f-mono text-[10px] text-[#3b3f48] tracking-widest uppercase truncate mr-3"
              style={{ letterSpacing: '0.12em' }}
            >
              DIAGNOSTIC REPORT · {data.domain} · {data.scan_timestamp}
            </span>
            <span
              className="f-mono text-[10px] text-[#3b3f48] tracking-widest whitespace-nowrap flex-shrink-0"
              style={{ letterSpacing: '0.12em' }}
            >
              REF: GHO-2026-{data.service_id}
            </span>
          </header>

          {/* ════════════════════════════════════════════════
              2. HERO
          ════════════════════════════════════════════════ */}
          <motion.section
            className="pt-12 pb-10"
            initial="hidden"
            animate="visible"
            variants={staggerParent}
          >
            {/* Eye-brow */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.48 }}
              className="f-mono text-[11px] tracking-[0.18em] uppercase text-[#f59e0b] mb-4"
            >
              Revenue Signal Intelligence — {data.store}
            </motion.p>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.54 }}
              className="font-bold leading-[1.14] text-white mb-5"
              style={{ fontSize: 'clamp(1.75rem, 5.5vw, 2.6rem)' }}
            >
              We found{' '}
              <span className="f-mono text-[#ef4444]">{fmt(data.annual_coi)}</span>
              {' '}leaving {data.store} every year.
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.54 }}
              className="text-[#8a8f9c] leading-relaxed border-l-2 border-[#ef4444]/20 pl-4 mb-8"
              style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)' }}
            >
              {data.technical_finding}
            </motion.p>

            {/* Hero CTA — smooth-scrolls to counter */}
            <motion.button
              variants={fadeUp}
              transition={{ duration: 0.48 }}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.975 }}
              onClick={scrollToCounter}
              className="inline-flex items-center gap-2.5 border border-[#ef4444]/32 text-[#ef4444] px-6 py-3 rounded-lg font-medium text-sm transition-colors duration-200 group"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(239,68,68,0.07)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              See the full diagnostic
              <ArrowRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform duration-200"
              />
            </motion.button>
          </motion.section>

          {/* ════════════════════════════════════════════════
              3. LIVE REVENUE LOSS COUNTER
          ════════════════════════════════════════════════ */}
          <motion.div
            ref={counterRef}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={sectionReveal}
            className="mb-5"
          >
            <div
              className="bg-[#111111] border border-[#242424] rounded-xl p-6 relative overflow-hidden"
            >
              {/* Inner radial glow */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 25% 15%, rgba(239,68,68,.07) 0%, transparent 55%)',
                }}
              />

              <div className="relative">
                {/* LIVE badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inset-0 rounded-full bg-[#ef4444] opacity-70" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]" />
                  </span>
                  <p
                    className="f-mono text-[10px] text-[#ef4444] uppercase"
                    style={{ letterSpacing: '0.16em' }}
                  >
                    LIVE — Revenue Leak Since Scan Date
                  </p>
                </div>

                {/* Primary counter */}
                <p
                  className="f-mono font-bold text-[#ef4444] tabular-nums leading-none mb-2"
                  style={{ fontSize: 'clamp(2.4rem, 9vw, 4.1rem)' }}
                >
                  {fmt(totalLost)}
                </p>

                {/* Rate annotation */}
                <p className="f-mono text-[11px] text-[#3b3f48] mb-5">
                  Running at{' '}
                  <span className="text-[#ef4444]">{fmt(data.daily_coi)}</span>
                  {' '}per day ·{' '}
                  <span className="text-[#ef4444]">{fmt(data.monthly_coi)}</span>
                  {' '}per month
                </p>

                {/* Session loss micro-counter */}
                <div className="bg-[#161616] border border-[#1f1f1f] rounded-lg px-4 py-3 mb-5">
                  <p className="f-mono text-[11px] text-[#4a5060]">
                    Session Loss:{' '}
                    <span className="text-[#f59e0b] font-semibold">
                      {fmtMicro(sessionLost)}
                    </span>
                    {' '}evaporated while viewing this page
                  </p>
                </div>

                {/* Locked metadata badges — NO editable inputs */}
                <div className="flex flex-wrap gap-2.5">
                  {(
                    [
                      { label: 'Sessions Est.', val: data.sessions_est },
                      { label: 'AOV Est.',       val: fmt(data.aov_est) },
                      { label: 'Service ID',     val: data.service_id   },
                    ] as const
                  ).map(({ label, val }) => (
                    <div
                      key={label}
                      className="bg-[#161616] border border-[#1f1f1f] rounded-md px-3 py-2"
                    >
                      <p
                        className="f-mono text-[9px] text-[#3b3f48] uppercase mb-1"
                        style={{ letterSpacing: '0.12em' }}
                      >
                        {label}
                      </p>
                      <p className="f-mono text-sm text-[#e0e2e8] font-semibold">
                        {val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ════════════════════════════════════════════════
              4. TECHNICAL EVIDENCE TERMINAL
          ════════════════════════════════════════════════ */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={sectionReveal}
            className="mb-5"
          >
            <div className="bg-[#111111] border border-[#242424] rounded-xl overflow-hidden">

              {/* macOS-style title bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#151515] border-b border-[#1e1e1e]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c840]" />
                </div>
                <div className="flex items-center gap-1.5 ml-2.5">
                  <Terminal size={11} className="text-[#3b3f48]" />
                  <span className="f-mono text-[10px] text-[#3b3f48]">
                    revenue-signal-scan.sh
                  </span>
                </div>
              </div>

              {/* Terminal body with scanline */}
              <div className="terminal-body p-5 min-h-[220px]">
                {visibleLines.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1 }}
                    className={`f-mono leading-[1.85] ${termLineClass(line)}`}
                    style={{ fontSize: 'clamp(10px, 2.5vw, 12px)' }}
                  >
                    {line || '\u00A0'}
                  </motion.p>
                ))}
                {!terminalDone && (
                  <span className="f-mono text-xs text-[#22c55e] animate-pulse">
                    █
                  </span>
                )}
              </div>

              {/* Plain-English translation */}
              <div className="border-t border-[#1a1a1a] p-5 bg-[#0d0d0d]">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={14}
                    className="text-[#f59e0b] flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p
                      className="f-mono text-[9px] text-[#f59e0b] uppercase mb-2"
                      style={{ letterSpacing: '0.14em' }}
                    >
                      Plain English Translation
                    </p>
                    <p className="text-sm text-[#b5b9c4] leading-relaxed">
                      {data.plain_english}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ════════════════════════════════════════════════
              5. GAP ANALYSIS CHART
              Pure Tailwind + framer-motion height animation.
              Zero external chart libraries.
          ════════════════════════════════════════════════ */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={sectionReveal}
            className="mb-5"
          >
            <div className="bg-[#111111] border border-[#242424] rounded-xl p-6">
              <p
                className="f-mono text-[9px] text-[#3b3f48] uppercase mb-1"
                style={{ letterSpacing: '0.14em' }}
              >
                Signal Integrity Analysis · Diagnostic Score
              </p>
              <h3 className="text-base font-semibold text-white mb-7">
                {data.store} vs. Industry Benchmark
              </h3>

              {/* Bar chart */}
              <div
                className="relative flex items-end justify-center gap-10 sm:gap-20"
                style={{ height: `${CHART_H + 16}px` }}
              >
                {/* Horizontal grid lines */}
                {[0.25, 0.5, 0.75, 1].map((frac) => (
                  <div
                    key={frac}
                    aria-hidden
                    className="absolute left-0 right-0 border-t border-[#181818]"
                    style={{ bottom: `${frac * CHART_H + 8}px` }}
                  />
                ))}

                {/* ── Store bar (Red) */}
                <div className="flex flex-col items-center gap-2">
                  <span className="f-mono text-sm font-bold text-[#ef4444]">
                    {data.benchmark_store}
                  </span>
                  <div
                    className="relative flex-shrink-0"
                    style={{ width: 'clamp(64px, 18vw, 108px)', height: `${CHART_H}px` }}
                  >
                    <motion.div
                      className="absolute bottom-0 inset-x-0 rounded-t"
                      style={{
                        background:
                          'linear-gradient(to top, #ef4444, rgba(239,68,68,.55) 60%, rgba(239,68,68,.12))',
                        transformOrigin: 'bottom',
                      }}
                      initial={{ height: 0 }}
                      whileInView={{ height: storeBarH }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.95,
                        ease: [0.16, 1, 0.3, 1],
                        delay: 0.15,
                      }}
                    />
                  </div>
                  <p
                    className="f-mono text-[9px] text-[#ef4444] uppercase text-center leading-tight max-w-[110px] px-1"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    {data.store}
                  </p>
                </div>

                {/* ── Industry bar (Green) */}
                <div className="flex flex-col items-center gap-2">
                  <span className="f-mono text-sm font-bold text-[#22c55e]">
                    {data.benchmark_industry}
                  </span>
                  <div
                    className="relative flex-shrink-0"
                    style={{ width: 'clamp(64px, 18vw, 108px)', height: `${CHART_H}px` }}
                  >
                    <motion.div
                      className="absolute bottom-0 inset-x-0 rounded-t"
                      style={{
                        background:
                          'linear-gradient(to top, #22c55e, rgba(34,197,94,.55) 60%, rgba(34,197,94,.12))',
                        transformOrigin: 'bottom',
                      }}
                      initial={{ height: 0 }}
                      whileInView={{ height: industBarH }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.95,
                        ease: [0.16, 1, 0.3, 1],
                        delay: 0.35,
                      }}
                    />
                  </div>
                  <p
                    className="f-mono text-[9px] text-[#22c55e] uppercase text-center leading-tight max-w-[110px] px-1"
                    style={{ letterSpacing: '0.1em' }}
                  >
                    Industry Benchmark
                  </p>
                </div>
              </div>

              <p
                className="f-mono text-[9px] text-[#252830] text-right mt-3"
                style={{ letterSpacing: '0.08em' }}
              >
                Source: {data.benchmark_source}
              </p>
            </div>
          </motion.div>

          {/* ════════════════════════════════════════════════
              6. ALEX'S PERSONAL GUARANTEE
          ════════════════════════════════════════════════ */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={sectionReveal}
            className="mb-5"
          >
            <div
              className="relative overflow-hidden bg-[#111111] border rounded-xl p-6"
              style={{ borderColor: 'rgba(34,197,94,.22)' }}
            >
              <div
                aria-hidden
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 0% 0%, rgba(34,197,94,.06) 0%, transparent 55%)',
                }}
              />
              <div className="relative flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
                  style={{
                    background: 'rgba(34,197,94,.08)',
                    border: '1px solid rgba(34,197,94,.18)',
                  }}
                >
                  <ShieldCheck size={17} className="text-[#22c55e]" />
                </div>
                <div>
                  <p
                    className="f-mono text-[9px] text-[#22c55e] uppercase mb-2.5"
                    style={{ letterSpacing: '0.14em' }}
                  >
                    Alex's Personal Guarantee
                  </p>
                  <p className="text-sm text-[#b5b9c4] leading-relaxed">
                    If our full audit does not surface at least{' '}
                    <span className="f-mono text-[#22c55e] font-semibold">
                      {fmt(data.fitd_price * 3)}
                    </span>
                    {' '}in provable, quantified revenue leaks — I don't charge
                    you. No invoice. You keep the diagnostic report.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ════════════════════════════════════════════════
              7. INVESTMENT COMPARISON
          ════════════════════════════════════════════════ */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={sectionReveal}
            className="mb-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Cost of inaction */}
              <div
                className="relative overflow-hidden bg-[#111111] border rounded-xl p-6"
                style={{ borderColor: 'rgba(239,68,68,.15)' }}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at 100% 0%, rgba(239,68,68,.06) 0%, transparent 60%)',
                  }}
                />
                <div className="relative">
                  <p
                    className="f-mono text-[9px] text-[#3b3f48] uppercase mb-3 leading-tight"
                    style={{ letterSpacing: '0.12em' }}
                  >
                    Monthly Loss
                    <br />
                    <span style={{ color: '#252830' }}>(Doing nothing)</span>
                  </p>
                  <p
                    className="f-mono font-bold text-[#ef4444] mb-1.5 leading-none"
                    style={{ fontSize: 'clamp(1.55rem, 5.5vw, 2.1rem)' }}
                  >
                    {fmt(data.monthly_coi)}
                  </p>
                  <p className="f-mono text-[10px] text-[#3b3f48]">
                    per month · ongoing · compounding
                  </p>
                </div>
              </div>

              {/* Audit investment */}
              <div
                className="relative overflow-hidden bg-[#111111] border rounded-xl p-6"
                style={{ borderColor: 'rgba(34,197,94,.15)' }}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at 0% 0%, rgba(34,197,94,.06) 0%, transparent 60%)',
                  }}
                />
                <div className="relative">
                  <p
                    className="f-mono text-[9px] text-[#3b3f48] uppercase mb-3 leading-tight"
                    style={{ letterSpacing: '0.12em' }}
                  >
                    Your Investment
                    <br />
                    <span style={{ color: '#252830' }}>(One-time)</span>
                  </p>
                  <p
                    className="f-mono font-bold text-[#22c55e] mb-1.5 leading-none"
                    style={{ fontSize: 'clamp(1.55rem, 5.5vw, 2.1rem)' }}
                  >
                    {fmt(data.fitd_price)}
                  </p>
                  <p className="f-mono text-[10px] text-[#3b3f48]">
                    one time · guaranteed ROI · zero risk
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ════════════════════════════════════════════════
              REAL URGENCY — conditional render
          ════════════════════════════════════════════════ */}
          {data.real_urgency && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={sectionReveal}
              className="mb-5"
            >
              <div
                className="flex items-start gap-3 bg-[#111111] border rounded-xl p-5"
                style={{ borderColor: 'rgba(245,158,11,.14)' }}
              >
                <AlertTriangle
                  size={14}
                  className="text-[#f59e0b] flex-shrink-0 mt-0.5"
                />
                <p className="text-sm text-[#8a8f9c] leading-relaxed">
                  {data.real_urgency}
                </p>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════
              8. PRIMARY CALL TO ACTION
              Pulsing shadow. onClick MUST fire onCTA prop.
          ════════════════════════════════════════════════ */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={sectionReveal}
            className="pt-1 mb-10"
          >
            <motion.button
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.975 }}
              onClick={onCTA}
              className="btn-pulse w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#22c55e] text-[#080a08] font-bold px-8 py-4 rounded-xl text-base transition-colors duration-150"
              style={{ minWidth: 'min(100%, 300px)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#16a34a')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#22c55e')
              }
            >
              Stop the Revenue Bleed
              <ArrowRight size={17} strokeWidth={2.5} />
            </motion.button>

            <div className="flex items-center gap-1.5 mt-5">
              <Mail size={11} className="text-[#252830]" />
              <p className="f-mono text-[10px] text-[#252830]">
                Questions? Reply directly: {data.reply_email}
              </p>
            </div>
          </motion.div>

        </div>{/* /content column */}

        {/* ════════════════════════════════════════════════
            9. STICKY FOOTER
            h-[60px] · fixed bottom-0 left-0 right-0 z-50
            Desktop: pulsing dot + live counter + "lost since scan" + green CTA
            Mobile:  live numeric only + compact "Claim →" button
        ════════════════════════════════════════════════ */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1a1a1a]"
          style={{
            height: '60px',
            background: 'rgba(17,17,17,0.95)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <div
            className="max-w-2xl mx-auto flex items-center justify-between h-full gap-3"
            style={{ padding: '0 1rem' }}
          >

            {/* Left: live counter */}
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              {/* Pulsing dot — desktop only */}
              <span className="hidden md:flex relative h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inset-0 rounded-full bg-[#ef4444] opacity-65" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]" />
              </span>

              <span
                className="f-mono font-bold text-[#ef4444] tabular-nums truncate"
                style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)' }}
              >
                {fmt(totalLost)}
              </span>

              <span
                className="hidden md:inline f-mono text-[10px] text-[#3b3f48] whitespace-nowrap flex-shrink-0"
                style={{ letterSpacing: '0.1em' }}
              >
                lost since scan
              </span>
            </div>

            {/* Right: CTA */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onCTA}
              className="flex-shrink-0 inline-flex items-center gap-1.5 bg-[#22c55e] text-[#080a08] font-bold px-4 py-2 rounded-lg text-sm transition-colors duration-150"
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#16a34a')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#22c55e')
              }
            >
              <span className="hidden md:inline">Claim audit →</span>
              <span className="md:hidden">Claim →</span>
            </motion.button>

          </div>
        </div>

      </div>{/* /root */}
    </>
  );
}
