'use client';

/**
 * PureForm Nutrition — Diagnostic Report Dashboard
 * ─────────────────────────────────────────────────
 * Stack: Next.js App Router · Tailwind CSS · Framer Motion · lucide-react
 * Install deps: npm i framer-motion lucide-react
 *
 * Font note: In production, move Google Fonts to layout.tsx via next/font/google.
 * The <style> @import below is a drop-in that works without layout changes.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  AlertTriangle,
  Terminal as TerminalIcon,
  TrendingDown,
  ArrowRight,
  Activity,
  Target,
  Zap,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// HARDCODED PROSPECT DATA
// Edit this single object to repurpose this report for any client.
// ─────────────────────────────────────────────────────────────────────────────
const P = {
  store:              'PureForm Nutrition',
  domain:             'pureformnutrition.co.uk',
  currency:           'GBP',
  scan_date:          '2026-06-02',
  scan_timestamp:     '02 JUN 2026 - 14:23 UTC',
  service_name:       'WC Subscriptions Silent Failure',
  service_id:         'W01',
  monthly_coi:        2371,
  daily_coi:          79,
  annual_coi:         28452,
  sessions_est:       '38,000',
  aov_est:            52,
  fitd_price:         997,
  benchmark_store:    34,
  benchmark_industry: 71,
  benchmark_source:   'Patchstack 2026',
  technical_finding:  'WooCommerce Subscriptions v1.8.9 detected. CVE-2026-1926 Active.',
  finding_detail_1:   'Vulnerability CVE-2026-1926 (CVSS 7.5) — active',
  finding_detail_2:   'Sybre-Waaijer subscription database desync identified',
  finding_detail_3:   'Stripe gateway renewals failing silently with zero database logs',
  plain_english:
    'Your payment processor is rejecting specific renewals, but WooCommerce still thinks they are active. You are shipping products to customers who have not paid.',
  tally_link:
    'https://tally.so/r/aQzvEZ?store=PureForm+Nutrition&coi=2371',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCY FORMATTER
// Locale-aware. Add entries below to support more currencies.
// ─────────────────────────────────────────────────────────────────────────────
const LOCALE_MAP: Record<string, string> = {
  GBP: 'en-GB',
  USD: 'en-US',
  EUR: 'de-DE',
  AUD: 'en-AU',
  CAD: 'en-CA',
};

const fmt = (value: number, decimals = 0): string =>
  new Intl.NumberFormat(LOCALE_MAP[P.currency] ?? 'en-GB', {
    style:                 'currency',
    currency:              P.currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

// ─────────────────────────────────────────────────────────────────────────────
// FRAMER MOTION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.11 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// CHART CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const BAR_MAX_PX = 140;

const BARS = [
  {
    id:       'store',
    name:     P.store,
    sub:      'Current Rate',
    value:    P.benchmark_store,
    pxH:      Math.round((P.benchmark_store    / 100) * BAR_MAX_PX),
    gradient: 'from-red-700  to-red-500',
    numCls:   'text-red-400',
    subCls:   'text-red-400',
    cap:      'Failing',
    delay:    0.25,
  },
  {
    id:       'industry',
    name:     'Industry Avg',
    sub:      P.benchmark_source,
    value:    P.benchmark_industry,
    pxH:      Math.round((P.benchmark_industry / 100) * BAR_MAX_PX),
    gradient: 'from-green-700 to-green-500',
    numCls:   'text-green-400',
    subCls:   'text-green-400',
    cap:      'Standard',
    delay:    0.45,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function DiagnosticReport() {
  const [mounted,      setMounted]      = useState(false);
  const [revenueLoss,  setRevenueLoss]  = useState(0);
  const [sessionLoss,  setSessionLoss]  = useState(0);
  const [logLines,     setLogLines]     = useState<string[]>([]);
  const [barsVisible,  setBarsVisible]  = useState(false);

  // Cost-of-inaction rate
  const ratePerMs = P.monthly_coi / 30 / 24 / 3600 / 1000;

  useEffect(() => {
    setMounted(true);

    // Seed total elapsed loss from scan_date midnight UTC → now
    const scanMs  = new Date(`${P.scan_date}T00:00:00Z`).getTime();
    const initial = (Date.now() - scanMs) * ratePerMs;
    setRevenueLoss(initial);

    // Live counter — tick every 50 ms for smooth decimal motion
    const ticker = setInterval(() => {
      const Δ = ratePerMs * 50;
      setRevenueLoss(p => p + Δ);
      setSessionLoss(p => p + Δ);
    }, 50);

    // Terminal typewriter — one line per 700 ms
    const findings = [
      `> [SCAN]  Connecting to ${P.domain}...`,
      `> [INFO]  WooCommerce Subscriptions v1.8.9 detected`,
      `> [WARN]  ${P.finding_detail_1}`,
      `> [CRIT]  ${P.finding_detail_2}`,
      `> [CRIT]  ${P.finding_detail_3}`,
      `> [HALT]  Annual exposure: ${fmt(P.annual_coi)}`,
    ];
    let i = 0;
    const logger = setInterval(() => {
      if (i < findings.length) { setLogLines(prev => [...prev, findings[i]]); i++; }
      else clearInterval(logger);
    }, 700);

    // Trigger chart bars after sections have entered
    const barTimer = setTimeout(() => setBarsVisible(true), 1100);

    return () => {
      clearInterval(ticker);
      clearInterval(logger);
      clearTimeout(barTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Stat rows reused in investment cards ──────────────────────────────────
  const lossStats = [
    { k: 'Annual exposure',  v: fmt(P.annual_coi)  },
    { k: 'Daily drain',      v: fmt(P.daily_coi)   },
    { k: 'Est. sessions/mo', v: P.sessions_est      },
  ];
  const investStats = [
    { k: 'Payback period',     v: `~${Math.ceil(P.fitd_price / P.daily_coi)} days`         },
    { k: 'Year-1 net recovery',v: fmt(P.annual_coi - P.fitd_price)                         },
    { k: 'ROI multiple',       v: `${(P.annual_coi / P.fitd_price).toFixed(1)}×`           },
  ];

  // ── Log line colour ────────────────────────────────────────────────────────
  const lineColor = (line: string) => {
    if (line.includes('[HALT]')) return 'text-red-500  font-semibold';
    if (line.includes('[CRIT]')) return 'text-red-400';
    if (line.includes('[WARN]')) return 'text-amber-400';
    return 'text-[#505050]';
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Fonts + global styles ─────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #0a0a0a; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; color: #fff; -webkit-font-smoothing: antialiased; }

        .mono { font-family: 'JetBrains Mono', 'Fira Code', monospace !important; }
        .tabular { font-variant-numeric: tabular-nums; }

        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0   rgba(34,197,94,.5); }
          65%  { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0   rgba(34,197,94,0); }
        }
        @keyframes cursor-blink { 0%,100% { opacity:1; } 50% { opacity:0; } }

        .cta-pulse  { animation: pulse-ring 2s ease-out infinite; }
        .cur::after {
          content: '█';
          animation: cursor-blink 1.1s step-end infinite;
          margin-left: 2px;
          font-size: .72em;
          vertical-align: middle;
          color: #555;
        }
        .scrollbar-none::-webkit-scrollbar { display:none; }
        .scrollbar-none { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      {/* ── Page shell ────────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-[#0a0a0a] text-white pb-28">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
          <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-5">

            {/* ═══════════════════════════════════════════════════
                1 · HEADER
            ═══════════════════════════════════════════════════ */}
            <motion.div variants={fadeUp}>
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inset-0 rounded-full bg-red-500 opacity-60" />
                  <span className="relative rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="mono text-[10px] tracking-[.2em] uppercase text-[#484848]">
                  Confidential Diagnostic Report
                </span>
              </div>

              <h1 className="text-lg font-semibold tracking-tight leading-none">{P.domain}</h1>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="mono text-[11px] bg-[#141414] border border-[#272727] text-[#666] px-2 py-1 rounded-md">
                  REF: GHO-2026-{P.service_id}
                </span>
                <span className="mono text-[11px] text-[#3a3a3a]">{P.scan_timestamp}</span>
              </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════
                2 · HERO
            ═══════════════════════════════════════════════════ */}
            <motion.div
              variants={fadeUp}
              className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                <span className="mono text-[10px] tracking-[.18em] uppercase text-amber-500 font-medium">
                  Revenue Exposure Detected
                </span>
              </div>

              <h2 className="text-[1.65rem] md:text-[2rem] font-bold leading-tight">
                We found{' '}
                <span className="text-red-400 mono">{fmt(P.annual_coi)}</span>
                {' '}leaving{' '}
                <span className="text-white">{P.store}</span>
                {' '}every year.
              </h2>

              <p className="mt-3 text-sm text-[#5a5a5a] mono leading-relaxed">
                {P.technical_finding}
              </p>
            </motion.div>

            {/* ═══════════════════════════════════════════════════
                3 · LIVE REVENUE LOSS COUNTER
            ═══════════════════════════════════════════════════ */}
            <motion.div
              variants={fadeUp}
              className="bg-[#111111] border border-red-500/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-1">
                <Activity size={13} className="text-red-500" />
                <span className="mono text-[10px] tracking-[.18em] uppercase text-red-500/80">
                  Live Revenue Loss · Since {P.scan_date}
                </span>
              </div>

              {/* Primary counter */}
              <div className="mono tabular text-[2.6rem] md:text-[3.2rem] font-semibold text-red-400 leading-none mt-3">
                {mounted ? fmt(revenueLoss, 2) : fmt(0, 2)}
              </div>
              <p className="mono text-[11px] text-[#3a3a3a] mt-1 mb-5">
                Accruing at {fmt(P.daily_coi)}/day since scan date
              </p>

              {/* Sub-counters */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: 'This Session', value: mounted ? fmt(sessionLoss, 4) : fmt(0, 4) },
                  { label: 'Daily Rate',   value: fmt(P.daily_coi)                          },
                  { label: 'Monthly Rate', value: fmt(P.monthly_coi)                        },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-[#0c0c0c] border border-[#1e1e1e] rounded-lg p-3"
                  >
                    <div className="mono text-[10px] text-[#484848] uppercase tracking-wide mb-1.5">
                      {label}
                    </div>
                    <div className="mono tabular text-sm font-semibold text-amber-400 leading-tight break-all">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════
                4 · TECHNICAL EVIDENCE TERMINAL
            ═══════════════════════════════════════════════════ */}
            <motion.div variants={fadeUp} className="flex flex-col gap-3">

              {/* Terminal window */}
              <div className="bg-[#070707] border border-[#1e1e1e] rounded-xl overflow-hidden">
                {/* Titlebar */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0f0f0f] border-b border-[#1a1a1a]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="flex items-center gap-1.5 mono text-[11px] text-[#3a3a3a] ml-3">
                    <TerminalIcon size={10} />
                    ghost-scanner v2.4 · {P.domain}
                  </span>
                </div>

                {/* Log output */}
                <div
                  className="p-5 min-h-[172px] space-y-0.5 overflow-x-auto scrollbar-none"
                  aria-live="polite"
                >
                  {logLines.map((line, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.22 }}
                      className={`mono text-xs leading-[1.7] whitespace-nowrap ${lineColor(line)}`}
                    >
                      {line}
                    </motion.div>
                  ))}
                  {logLines.length < 6 && mounted && (
                    <span className="mono text-xs text-[#3a3a3a] cur" />
                  )}
                </div>
              </div>

              {/* Plain-English box */}
              <div className="bg-amber-500/[.07] border border-amber-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <Zap size={13} className="text-amber-400 shrink-0" />
                  <span className="mono text-[10px] tracking-[.18em] uppercase text-amber-400 font-medium">
                    Plain English Translation
                  </span>
                </div>
                <p className="text-sm text-[#b0b0b0] leading-relaxed">{P.plain_english}</p>
              </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════
                5 · GAP ANALYSIS CHART
            ═══════════════════════════════════════════════════ */}
            <motion.div
              variants={fadeUp}
              className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <Target size={13} className="text-[#484848]" />
                <span className="mono text-[10px] tracking-[.18em] uppercase text-[#484848]">
                  Renewal Success Rate · Benchmark
                </span>
              </div>
              <p className="mono text-[11px] text-[#333] mb-8">
                Source: {P.benchmark_source}
              </p>

              {/* Bars */}
              <div className="flex items-start justify-center gap-14">
                {BARS.map(bar => (
                  <div
                    key={bar.id}
                    className="flex flex-col items-center gap-2"
                    style={{ width: '100px' }}
                  >
                    {/* Value label above bar */}
                    <span className={`mono text-[1.05rem] font-semibold tabular ${bar.numCls}`}>
                      {bar.value}%
                    </span>

                    {/* Fixed-height bar container */}
                    <div
                      className="relative w-full rounded-t-md overflow-hidden bg-[#0d0d0d]"
                      style={{ height: `${BAR_MAX_PX}px` }}
                    >
                      {/* Bar grows from bottom */}
                      <div
                        className="absolute bottom-0 left-0 right-0"
                        style={{ height: `${bar.pxH}px` }}
                      >
                        <motion.div
                          className={`w-full h-full bg-gradient-to-t ${bar.gradient}`}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: barsVisible ? 1 : 0 }}
                          transition={{
                            duration: 1.1,
                            delay:    bar.delay,
                            ease:     [0.22, 1, 0.36, 1],
                          }}
                          style={{ transformOrigin: 'bottom' }}
                        />
                      </div>
                    </div>

                    {/* Label below */}
                    <div className="text-center mt-1">
                      <div className="text-xs text-white mono font-medium leading-tight">
                        {bar.name}
                      </div>
                      <div className={`mono text-[10px] mt-0.5 ${bar.subCls}`}>{bar.cap}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gap callout */}
              <div className="mt-6 bg-[#0c0c0c] border border-[#1e1e1e] rounded-lg py-3 px-4 text-center">
                <span className="mono text-xs text-[#666]">
                  Gap:{' '}
                  <span className="text-red-400 font-semibold">
                    {P.benchmark_industry - P.benchmark_store}%
                  </span>{' '}
                  fewer renewals recovered than industry standard
                </span>
              </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════
                6 · GUARANTEE
            ═══════════════════════════════════════════════════ */}
            <motion.div
              variants={fadeUp}
              className="bg-[#111111] border border-green-500/20 rounded-xl p-6"
            >
              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-green-500/[.08] border border-green-500/20 flex items-center justify-center">
                  <ShieldCheck size={18} className="text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">
                    Alex's Personal Guarantee
                  </h3>
                  <p className="text-sm text-[#7a7a7a] leading-relaxed">
                    If this fix does not generate a minimum{' '}
                    <span className="text-white font-semibold">3× ROI</span> within 90 days —
                    measured against your documented monthly loss — you pay nothing further.
                    Every recommendation is tied to evidence in this report, not estimates.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['3× ROI Guarantee', '90-Day Term', 'Evidence-Based', 'Zero Fluff'].map(tag => (
                      <span
                        key={tag}
                        className="mono text-[10px] bg-green-500/[.06] border border-green-500/15 text-green-400 px-2.5 py-1 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════
                7 · INVESTMENT COMPARISON
            ═══════════════════════════════════════════════════ */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Monthly Loss */}
              <div className="bg-[#111111] border border-red-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown size={14} className="text-red-400" />
                  <span className="mono text-[10px] tracking-[.18em] uppercase text-red-400">
                    Monthly Loss
                  </span>
                </div>
                <div className="mono tabular text-[2rem] font-semibold text-red-400 leading-none mb-2">
                  {fmt(P.monthly_coi)}
                </div>
                <p className="text-xs text-[#484848] mb-5">
                  Recurring. Compounding. Unmitigated.
                </p>
                <div className="border-t border-[#191919] pt-4 space-y-2.5">
                  {lossStats.map(({ k, v }) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="mono text-xs text-[#484848]">{k}</span>
                      <span className="mono text-xs text-red-400">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your Investment */}
              <div className="bg-[#111111] border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={14} className="text-green-400" />
                  <span className="mono text-[10px] tracking-[.18em] uppercase text-green-400">
                    Your Investment
                  </span>
                </div>
                <div className="mono tabular text-[2rem] font-semibold text-green-400 leading-none mb-2">
                  {fmt(P.fitd_price)}
                </div>
                <p className="text-xs text-[#484848] mb-5">
                  One-time. Guaranteed ROI. Paid back in days.
                </p>
                <div className="border-t border-[#191919] pt-4 space-y-2.5">
                  {investStats.map(({ k, v }) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="mono text-xs text-[#484848]">{k}</span>
                      <span className="mono text-xs text-green-400">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════
                8 · PRIMARY CTA
            ═══════════════════════════════════════════════════ */}
            <motion.div variants={fadeUp} className="flex flex-col items-center gap-3 pt-2 pb-2">
              <a
                href={P.tally_link}
                className="cta-pulse w-full flex items-center justify-center gap-2.5 bg-[#22c55e] hover:bg-[#16a34a] active:bg-[#15803d] text-black font-bold py-4 px-8 rounded-xl text-[15px] transition-colors duration-150 select-none"
              >
                Claim Your Revenue Fix
                <ArrowRight size={17} strokeWidth={2.5} />
              </a>
              <p className="mono text-[11px] text-[#333] text-center">
                Free diagnostic call · No obligation · Response within 24h
              </p>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          STICKY FOOTER — live loss left · CTA right
      ═══════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#080808]/95 backdrop-blur-sm border-t border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">

          {/* Live counter */}
          <div className="min-w-0 flex flex-col gap-0.5">
            <span className="mono text-[10px] tracking-[.15em] uppercase text-[#3a3a3a]">
              Losing right now
            </span>
            <span className="mono tabular text-base font-semibold text-red-400 leading-tight truncate">
              {mounted ? fmt(revenueLoss, 2) : '—'}
            </span>
          </div>

          {/* CTA */}
          <a
            href={P.tally_link}
            className="cta-pulse shrink-0 flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] active:bg-[#15803d] text-black font-bold py-2.5 px-5 rounded-lg text-sm transition-colors duration-150 whitespace-nowrap select-none"
          >
            Fix It Now
            <ArrowRight size={14} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </>
  );
}
