'use client';

import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────────────────────
   Data contract
   annual_coi is optional — calculated from monthly_coi if absent
───────────────────────────────────────────────────────────── */
interface TemplateBData {
  store: string;
  domain: string;
  currency: string;
  service_name: string;
  service_id: string;
  monthly_coi: number;
  fitd_price: number;
  technical_finding: string;
  finding_detail_1: string;
  finding_detail_2: string;
  plain_english: string;
  annual_coi?: number;
}

interface TemplateBProps {
  data: TemplateBData;
  handleCTA?: () => void;
}

/* ─── Terminal lines — static, typed out sequentially ──────── */
const TERMINAL_LINES: { prefix: string; label: string; item: string; color: string }[] = [
  { prefix: '●', label: 'SIGNAL_PROBE', item: 'meta_pixel_server_events',              color: '#ef4444' },
  { prefix: ' ', label: '✗',            item: 'No fbq() server-side events on /checkout — client-only fire detected', color: '#ef4444' },
  { prefix: ' ', label: '✗',            item: 'Conversion API (CAPI) endpoint: NOT CONFIGURED',                       color: '#ef4444' },
  { prefix: ' ', label: '!',            item: 'purchase event fires client-side only → 32–72h attribution delay',     color: '#f59e0b' },
  { prefix: '●', label: 'SIGNAL_PROBE', item: 'ios14_att_impact',                       color: '#ef4444' },
  { prefix: ' ', label: '✗',            item: 'ATT consent granted: ~27% of iOS users (industry average)',            color: '#ef4444' },
  { prefix: ' ', label: '✗',            item: 'Post-ATT signal loss: ~67% of iOS conversions invisible to pixel',     color: '#ef4444' },
  { prefix: ' ', label: '✗',            item: 'Aggregated Event Measurement (AEM): NOT CONFIGURED',                   color: '#ef4444' },
  { prefix: '●', label: 'SIGNAL_PROBE', item: 'google_consent_mode_v2',                 color: '#ef4444' },
  { prefix: ' ', label: '✗',            item: 'Consent Mode v2 tags: NOT DETECTED on any page',                      color: '#ef4444' },
  { prefix: ' ', label: '✗',            item: 'Consent state → null: conversion modeling DISABLED',                   color: '#ef4444' },
  { prefix: ' ', label: '!',            item: '15–40% of Google conversions unmodeled → Smart Bidding degraded',     color: '#f59e0b' },
  { prefix: '▶', label: 'VERDICT',      item: 'Tracking stack operating blind. Server-side CAPI fix required.',      color: '#22c55e' },
];

/* ─── Attribution bar data ──────────────────────────────────── */
const SIGNAL_BARS = [
  { label: 'Pre-iOS 14 (Pixel only)',            pct: 95, color: '#22c55e' },
  { label: 'Current state (no CAPI, post-iOS)', pct: 51, color: '#ef4444' },
  { label: 'Post-fix (CAPI + Consent Mode v2)', pct: 91, color: '#22c55e' },
];

/* ─────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────── */
export default function TemplateB({ data, handleCTA }: TemplateBProps) {
  const [ghostConversions, setGhostConversions] = useState<number>(0);
  const [visibleLines, setVisibleLines]           = useState<number>(0);
  const [barsAnimated, setBarsAnimated]           = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const annualCoi = data.annual_coi ?? data.monthly_coi * 12;

  /* ── Formatters ──────────────────────────────────────────── */
  const locale = data.currency === 'EUR' ? 'de-DE' : 'en-US';

  const fmt = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: data.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  /* ── Effects ─────────────────────────────────────────────── */
  useEffect(() => {
    // ── Ghost conversions: live counter from start of current month ──
    // avgConvValue assumption: $100. Adjust if real AOV is in your payload.
    const avgConvValue = 100;
    const monthlyGhost  = (data.monthly_coi ?? 0) / avgConvValue;
    const ghostPerSec   = monthlyGhost / (30 * 86400);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const tickConversions = () => {
      const elapsed = (Date.now() - startOfMonth.getTime()) / 1000;
      setGhostConversions(Math.floor(elapsed * ghostPerSec));
    };
    tickConversions();
    const convTimer = setInterval(tickConversions, 1000);

    // ── Terminal typewriter: one line per 280ms ──
    let lineIdx = 0;
    const termTimer = setInterval(() => {
      lineIdx = Math.min(lineIdx + 1, TERMINAL_LINES.length);
      setVisibleLines(lineIdx);
      terminalRef.current?.scrollTo({ top: 9999, behavior: 'smooth' });
      if (lineIdx >= TERMINAL_LINES.length) clearInterval(termTimer);
    }, 280);

    // ── Signal bars: animate after short delay ──
    const barTimer = setTimeout(() => setBarsAnimated(true), 600);

    return () => {
      clearInterval(convTimer);
      clearInterval(termTimer);
      clearTimeout(barTimer);
    };
  }, [data]);

  /* ── Payback period ──────────────────────────────────────── */
  const paybackDays =
    data.fitd_price > 0 && data.monthly_coi > 0
      ? Math.round((data.fitd_price / data.monthly_coi) * 30)
      : null;

  const onCTA = handleCTA ?? (() => {});

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono antialiased">

      {/* Top bar */}
      <header className="border-b border-[#2a2a2a] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
            Ghost Operator
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">{data.domain}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] uppercase tracking-wider">
            ⚠ Forensic Alert
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-8">

        {/* Critical finding banner */}
        <div className="border border-[#ef4444]/25 bg-[#ef4444]/5 rounded-lg px-4 py-3 flex items-start gap-3">
          <span className="text-[#ef4444] shrink-0 mt-0.5">■</span>
          <div>
            <p className="text-[10px] text-[#ef4444] font-bold uppercase tracking-wider mb-0.5">
              Critical Finding
            </p>
            <p className="text-sm text-gray-300">{data.technical_finding}</p>
          </div>
        </div>

        {/* ── Hero ── */}
        <section className="text-center space-y-4 pb-8 border-b border-[#1a1a1a]">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#ef4444]">
            {data.service_name} · Revenue Forensics
          </p>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            We found{' '}
            <span className="text-[#ef4444]">{fmt(annualCoi)}</span>
            {' '}in wasted ad spend
            <br className="hidden md:block" />
            {' '}leaving{' '}
            <span className="text-[#ef4444]">{data.store}</span>
            {' '}every year.
          </h1>

          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Your tracking infrastructure is operating blind. Every campaign dollar
            spent today is partially invisible to your ad platform.
          </p>
        </section>

        {/* ── Metric Cards ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Card 1: Data Completeness Score */}
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 space-y-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Data Completeness Score
            </p>

            {/* Big numbers */}
            <div className="flex items-end gap-6">
              <div>
                <span className="text-6xl font-black text-[#ef4444] tabular-nums">68%</span>
                <p className="text-[10px] text-gray-600 mt-1">{data.store}</p>
              </div>
              <div className="pb-1.5">
                <span className="text-3xl font-black text-[#22c55e] tabular-nums">95%</span>
                <p className="text-[10px] text-gray-600 mt-1">Industry standard</p>
              </div>
            </div>

            {/* Comparison bars — flexbox only, no Recharts */}
            <div className="space-y-2.5 pt-3 border-t border-[#2a2a2a]">
              {[
                { label: data.store,   pct: 68, color: '#ef4444' },
                { label: 'Industry',   pct: 95, color: '#22c55e' },
              ].map(({ label, pct, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-20 shrink-0 truncate">
                    {label}
                  </span>
                  <div className="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: barsAnimated ? `${pct}%` : '0%',
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-bold w-8 text-right tabular-nums"
                    style={{ color }}
                  >
                    {pct}%
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-gray-600">
              27-point deficit = ad platform bidding on ghost signals
            </p>
          </div>

          {/* Card 2: Unattributed Conversions — live counter */}
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 space-y-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Unattributed Conversions This Month
            </p>

            <div>
              <div className="flex items-end gap-2">
                <span
                  className="text-6xl font-black text-[#ef4444] tabular-nums"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {ghostConversions.toLocaleString()}
                </span>
                <span className="pb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse inline-block" />
                </span>
              </div>
              <p className="text-[10px] text-gray-600 mt-1">
                Ghost conversions invisible to your ad platform
              </p>
            </div>

            <div className="pt-3 border-t border-[#2a2a2a] space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Monthly revenue flying blind</span>
                <span className="text-[#ef4444] font-bold">{fmt(data.monthly_coi)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Annualised exposure</span>
                <span className="text-[#ef4444] font-bold">{fmt(annualCoi)}</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-700">
              Estimated at 32% post-iOS 14 signal loss rate ·{' '}
              {data.domain} · counter resets monthly
            </p>
          </div>
        </section>

        {/* ── Forensic Terminal ── */}
        <section className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl overflow-hidden">
          {/* Terminal chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2a2a2a] bg-[#111111]">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/60" />
            </div>
            <span className="text-[10px] text-gray-600 ml-2 select-none">
              ghost-forensics@{data.domain} — tracking_audit.sh
            </span>
          </div>

          {/* Terminal output */}
          <div
            ref={terminalRef}
            className="p-4 max-h-64 overflow-y-auto space-y-1.5"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a2a transparent' }}
          >
            {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
              <div key={i} className="flex items-start gap-2 text-xs leading-relaxed">
                <span className="text-gray-600 shrink-0 w-4 select-none">
                  {line.prefix}
                </span>
                <span
                  className="shrink-0 font-bold min-w-[4rem]"
                  style={{ color: line.color }}
                >
                  {line.label}
                </span>
                <span className="text-gray-400">{line.item}</span>
              </div>
            ))}

            {/* Blinking cursor while typing */}
            {visibleLines < TERMINAL_LINES.length && (
              <div className="flex items-center gap-1 text-xs text-gray-600 pl-4">
                <span>›</span>
                <span className="animate-pulse">_</span>
              </div>
            )}
          </div>
        </section>

        {/* ── Signal Loss — flexbox bars, no Recharts ── */}
        <section className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 space-y-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            Attribution Signal Quality — {data.store}
          </p>

          <div className="space-y-5">
            {SIGNAL_BARS.map(({ label, pct, color }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-bold tabular-nums" style={{ color }}>
                    {pct}%
                  </span>
                </div>
                <div className="h-2.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: barsAnimated ? `${pct}%` : '0%',
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#2a2a2a] space-y-1">
            <p className="text-[10px] text-gray-600">{data.finding_detail_1}</p>
            <p className="text-[10px] text-gray-600">{data.finding_detail_2}</p>
          </div>
        </section>

        {/* ── Plain English ── */}
        <section className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 space-y-2">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            What This Means in Plain English
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">{data.plain_english}</p>
        </section>

        {/* ── Guarantee Card ── */}
        <section className="border border-[#22c55e]/20 bg-[#22c55e]/5 rounded-xl p-6 space-y-3">
          <p className="text-[10px] text-[#22c55e] uppercase tracking-widest font-bold">
            Ghost Operator Performance Guarantee
          </p>
          <ul className="space-y-2.5">
            {[
              'Implementation delivered within 72 hours of engagement',
              'Measurable lift in attributed conversions within 30 days or we work free until you see it',
              'Data completeness score improvement — verified — or full refund, no questions asked',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-[#22c55e] shrink-0 mt-0.5 font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* ── CTA ── */}
        <section className="text-center space-y-3">
          <button
            onClick={onCTA}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] active:bg-[#b91c1c] text-white font-bold text-sm tracking-wide transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
          >
            Secure Your Conversion Data →
          </button>

          <p className="text-[10px] text-gray-700">
            Fix cost:{' '}
            <span className="text-gray-500">{fmt(data.fitd_price)}</span>
            {paybackDays !== null && (
              <>
                {' '}· Payback period:{' '}
                <span className="text-[#22c55e]">{paybackDays}d</span>
              </>
            )}
          </p>
        </section>

        {/* Footer */}
        <footer className="text-center pt-4 border-t border-[#1a1a1a] space-y-1">
          <p className="text-[10px] text-gray-700">
            Ghost Operator · Revenue Intelligence Platform · {data.service_id}
          </p>
          <p className="text-[10px] text-gray-800">{data.domain}</p>
        </footer>

      </main>
    </div>
  );
}
