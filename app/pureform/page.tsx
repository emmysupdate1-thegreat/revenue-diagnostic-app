'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Terminal as TerminalIcon, TrendingDown, ArrowRight, Activity, Target, Zap } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// PROSPECT DATA (Hardcoded for maximum stability)
// ─────────────────────────────────────────────────────────────────────────────
const P = {
  store: 'PureForm Nutrition',
  domain: 'pureformnutrition.co.uk',
  currency: 'GBP',
  scan_date: '2026-06-02',
  scan_timestamp: '02 JUN 2026 - 14:23 UTC',
  service_name: 'WC Subscriptions Silent Failure',
  service_id: 'W01',
  monthly_coi: 2371,
  daily_coi: 79,
  annual_coi: 28452,
  sessions_est: '38,000',
  aov_est: 52,
  fitd_price: 997,
  benchmark_store: 34,
  benchmark_industry: 71,
  benchmark_source: 'Patchstack 2026',
  technical_finding: 'WooCommerce Subscriptions v1.8.9 detected. CVE-2026-1926 Active.',
  finding_detail_1: 'Vulnerability CVE-2026-1926 (CVSS 7.5) — active',
  finding_detail_2: 'Sybre-Waaijer subscription database desync identified',
  finding_detail_3: 'Stripe gateway renewals failing silently with zero database logs',
  plain_english: 'Your payment processor is rejecting specific renewals, but WooCommerce still thinks they are active. You are shipping products to customers who have not paid.',
  tally_link: 'https://tally.so/r/aQzvEZ?store=PureForm+Nutrition&coi=2371',
};

const fmt = (value: number, decimals = 0) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: P.currency, minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.11 } } };

export default function DiagnosticReport() {
  const [mounted, setMounted] = useState(false);
  const [revenueLoss, setRevenueLoss] = useState(0);
  const [sessionLoss, setSessionLoss] = useState(0);
  const [linesToShow, setLinesToShow] = useState(0); // Bulletproof terminal state
  const [barsVisible, setBarsVisible] = useState(false);

  const ratePerMs = P.monthly_coi / 30 / 24 / 3600 / 1000;
  const scanMs = new Date(`${P.scan_date}T00:00:00Z`).getTime();

  useEffect(() => {
    setMounted(true);
    setRevenueLoss(Math.max(0, (Date.now() - scanMs) * ratePerMs));

    const ticker = setInterval(() => {
      const delta = ratePerMs * 50;
      setRevenueLoss(p => p + delta);
      setSessionLoss(p => p + delta);
    }, 50);

    // Bulletproof Terminal Logic (Immune to React double-mount)
    const logger = setInterval(() => {
      setLinesToShow(prev => (prev < 6 ? prev + 1 : prev));
    }, 700);

    const barTimer = setTimeout(() => setBarsVisible(true), 1100);

    return () => { clearInterval(ticker); clearInterval(logger); clearTimeout(barTimer); };
  }, [scanMs, ratePerMs]);

  const findings = [
    `> [SCAN]  Connecting to ${P.domain}...`,
    `> [INFO]  WooCommerce Subscriptions v1.8.9 detected`,
    `> [WARN]  ${P.finding_detail_1}`,
    `> [CRIT]  ${P.finding_detail_2}`,
    `> [CRIT]  ${P.finding_detail_3}`,
    `> [HALT]  Annual exposure: ${fmt(P.annual_coi)}`,
  ];

  const lineColor = (line: string) => {
    if (line.includes('[HALT]')) return 'text-[#ef4444] font-semibold';
    if (line.includes('[CRIT]')) return 'text-[#ef4444]';
    if (line.includes('[WARN]')) return 'text-[#f59e0b]';
    return 'text-[#505050]';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-28 font-sans selection:bg-[#22c55e]/30">
      <style dangerouslySetContent={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace !important; }
        .font-sans { font-family: 'Inter', sans-serif !important; }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 15px rgba(34,197,94,0.15); } 50% { box-shadow: 0 0 30px rgba(34,197,94,0.3); } }
        .btn-glow { animation: glow 2.5s ease-in-out infinite; }
      `}} />

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-5">
          
          {/* HEADER */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inset-0 rounded-full bg-[#ef4444] opacity-60" /><span className="relative rounded-full h-2 w-2 bg-[#ef4444]" /></span>
              <span className="font-mono text-[10px] tracking-[.2em] uppercase text-[#484848]">Confidential Diagnostic Report</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight leading-none">{P.domain}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="font-mono text-[11px] bg-[#141414] border border-[#272727] text-[#666] px-2 py-1 rounded-md">REF: GHO-2026-{P.service_id}</span>
              <span className="font-mono text-[11px] text-[#3a3a3a]">{P.scan_timestamp}</span>
            </div>
          </motion.div>

          {/* HERO */}
          <motion.div variants={fadeUp} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle size={14} className="text-[#f59e0b] shrink-0" />
              <span className="font-mono text-[10px] tracking-[.18em] uppercase text-[#f59e0b] font-medium">Revenue Exposure Detected</span>
            </div>
            <h2 className="text-[1.65rem] md:text-[2rem] font-bold leading-tight">
              We found <span className="text-[#ef4444] font-mono">{fmt(P.annual_coi)}</span> leaving <span className="text-white">{P.store}</span> every year.
            </h2>
            <p className="mt-3 text-sm text-[#5a5a5a] font-mono leading-relaxed">{P.technical_finding}</p>
          </motion.div>

          {/* LIVE COUNTER */}
          <motion.div variants={fadeUp} className="bg-[#111111] border border-[#ef4444]/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={13} className="text-[#ef4444]" />
              <span className="font-mono text-[10px] tracking-[.18em] uppercase text-[#ef4444]/80">Live Revenue Loss · Since {P.scan_date}</span>
            </div>
            <div className="font-mono text-[2.6rem] md:text-[3.2rem] font-semibold text-[#ef4444] leading-none mt-3">
              {mounted ? fmt(revenueLoss, 2) : fmt(0, 2)}
            </div>
            <p className="font-mono text-[11px] text-[#3a3a3a] mt-1 mb-5">Accruing at {fmt(P.daily_coi)}/day since scan date</p>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded-lg p-3">
                <div className="font-mono text-[10px] text-[#484848] uppercase tracking-wide mb-1.5">This Session</div>
                <div className="font-mono text-sm font-semibold text-[#f59e0b] leading-tight break-all">{mounted ? fmt(sessionLoss, 4) : fmt(0, 4)}</div>
              </div>
              <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded-lg p-3">
                <div className="font-mono text-[10px] text-[#484848] uppercase tracking-wide mb-1.5">Daily Rate</div>
                <div className="font-mono text-sm font-semibold text-[#f59e0b] leading-tight break-all">{fmt(P.daily_coi)}</div>
              </div>
              <div className="bg-[#0c0c0c] border border-[#1e1e1e] rounded-lg p-3">
                <div className="font-mono text-[10px] text-[#484848] uppercase tracking-wide mb-1.5">Monthly Rate</div>
                <div className="font-mono text-sm font-semibold text-[#f59e0b] leading-tight break-all">{fmt(P.monthly_coi)}</div>
              </div>
            </div>
          </motion.div>

          {/* TERMINAL */}
          <motion.div variants={fadeUp} className="flex flex-col gap-3">
            <div className="bg-[#070707] border border-[#1e1e1e] rounded-xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0f0f0f] border-b border-[#1a1a1a]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#3a3a3a] ml-3"><TerminalIcon size={10} /> ghost-scanner v2.4</span>
              </div>
              <div className="p-5 min-h-[172px] space-y-0.5 overflow-x-auto">
                {findings.slice(0, linesToShow).map((line, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={`font-mono text-xs leading-[1.7] whitespace-nowrap ${lineColor(line)}`}>
                    {line}
                  </motion.div>
                ))}
                {linesToShow < 6 && mounted && <span className="font-mono text-xs text-[#3a3a3a] animate-pulse">█</span>}
              </div>
            </div>
            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2.5">
                <Zap size={13} className="text-[#f59e0b] shrink-0" />
                <span className="font-mono text-[10px] tracking-[.18em] uppercase text-[#f59e0b] font-medium">Plain English Translation</span>
              </div>
              <p className="text-sm text-[#b0b0b0] leading-relaxed">{P.plain_english}</p>
            </div>
          </motion.div>

          {/* GAP CHART */}
          <motion.div variants={fadeUp} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-0.5">
              <Target size={13} className="text-[#484848]" />
              <span className="font-mono text-[10px] tracking-[.18em] uppercase text-[#484848]">Renewal Success Rate · Benchmark</span>
            </div>
            <p className="font-mono text-[11px] text-[#333] mb-8">Source: {P.benchmark_source}</p>
            <div className="flex items-end justify-center gap-14 h-[140px] border-b border-[#1a1a1a] pb-2">
              <div className="flex flex-col items-center gap-2 w-[100px]">
                <span className="font-mono text-[1.05rem] font-semibold text-[#ef4444]">{P.benchmark_store}%</span>
                <div className="w-full bg-[#0d0d0d] rounded-t-md h-full relative overflow-hidden">
                  <motion.div className="absolute bottom-0 w-full bg-gradient-to-t from-[#991b1b] to-[#ef4444]" initial={{ height: 0 }} animate={{ height: barsVisible ? `${(P.benchmark_store/100)*100}%` : 0 }} transition={{ duration: 1.1 }} />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 w-[100px]">
                <span className="font-mono text-[1.05rem] font-semibold text-[#22c55e]">{P.benchmark_industry}%</span>
                <div className="w-full bg-[#0d0d0d] rounded-t-md h-full relative overflow-hidden">
                  <motion.div className="absolute bottom-0 w-full bg-gradient-to-t from-[#166534] to-[#22c55e]" initial={{ height: 0 }} animate={{ height: barsVisible ? `${(P.benchmark_industry/100)*100}%` : 0 }} transition={{ duration: 1.1, delay: 0.2 }} />
                </div>
              </div>
            </div>
            <div className="mt-6 bg-[#0c0c0c] border border-[#1e1e1e] rounded-lg py-3 px-4 text-center">
              <span className="font-mono text-xs text-[#666]">Gap: <span className="text-[#ef4444] font-semibold">{P.benchmark_industry - P.benchmark_store}%</span> fewer renewals recovered than industry standard</span>
            </div>
          </motion.div>

          {/* INVESTMENT & GUARANTEE */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111111] border border-[#ef4444]/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4"><TrendingDown size={14} className="text-[#ef4444]" /><span className="font-mono text-[10px] tracking-[.18em] uppercase text-[#ef4444]">Monthly Loss</span></div>
              <div className="font-mono text-[2rem] font-semibold text-[#ef4444] leading-none mb-2">{fmt(P.monthly_coi)}</div>
              <p className="text-xs text-[#484848]">Recurring. Compounding. Unmitigated.</p>
            </div>
            <div className="bg-[#111111] border border-[#22c55e]/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4"><ShieldCheck size={14} className="text-[#22c55e]" /><span className="font-mono text-[10px] tracking-[.18em] uppercase text-[#22c55e]">Your Investment</span></div>
              <div className="font-mono text-[2rem] font-semibold text-[#22c55e] leading-none mb-2">{fmt(P.fitd_price)}</div>
              <p className="text-xs text-[#484848]">One-time. Guaranteed ROI. Paid back in days.</p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="pt-2 pb-2">
            <button onClick={() => window.location.assign(P.tally_link)} className="btn-glow w-full flex items-center justify-center gap-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-4 px-8 rounded-xl text-[15px] transition-colors cursor-pointer">
              Claim Your Revenue Fix <ArrowRight size={17} strokeWidth={2.5} />
            </button>
            <p className="font-mono text-[11px] text-[#333] text-center mt-3">Free diagnostic call · No obligation · Response within 24h</p>
          </motion.div>
        </motion.div>
      </div>

      {/* STICKY FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#080808]/95 backdrop-blur-sm border-t border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] tracking-[.15em] uppercase text-[#3a3a3a]">Losing right now</span>
            <span className="font-mono text-base font-semibold text-[#ef4444] leading-tight truncate">{mounted ? fmt(revenueLoss, 2) : '—'}</span>
          </div>
          <button onClick={() => window.location.assign(P.tally_link)} className="btn-glow flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-2.5 px-5 rounded-lg text-sm transition-colors cursor-pointer">
            Fix It Now <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
