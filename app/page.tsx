'use client'

/**
 * WooCommerce Forensic Revenue Audit Dashboard
 * ─────────────────────────────────────────────
 * Stack  : Next.js 14+ App Router · Tailwind CSS · Recharts · lucide-react
 * Data   : Zero-database — reads ?payload= URL param (Base64-encoded JSON)
 * Theme  : Dark-only, Industrial/Security-Ops aesthetic
 * Fonts  : Inter (body) · JetBrains Mono (numbers/terminal)
 *
 * USAGE
 *   1. Drop this file into app/page.tsx (or any route)
 *   2. Install deps: npm i recharts lucide-react
 *   3. Generate a payload:  btoa(JSON.stringify({ ...data }))
 *   4. Visit /?payload=<base64string>
 */

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  Lock,
  Mail,
  Shield,
  Terminal,
  TrendingDown,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  TYPES                                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

interface AuditPayload {
  template_type: string
  store: string
  domain: string
  currency: string
  scan_date: string
  scan_timestamp: string
  service_name: string
  service_id: string
  monthly_coi: number
  daily_coi: number
  annual_coi: number
  sessions_est: string
  aov_est: number
  fitd_price: number
  benchmark_store: number
  benchmark_industry: number
  benchmark_source: string
  technical_finding: string
  finding_detail_1: string
  finding_detail_2: string
  finding_detail_3: string
  real_urgency: string
  reply_email: string
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  UTILITIES                                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */

/** Format a number as currency with no decimal places */
function fmt(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Decode a Base64-encoded JSON payload from the URL */
function parsePayload(encoded: string): AuditPayload | null {
  try {
    const decoded = atob(encoded)
    const parsed = JSON.parse(decoded)
    // Minimal structural validation
    if (
      typeof parsed.store !== 'string' ||
      typeof parsed.monthly_coi !== 'number'
    ) {
      return null
    }
    return parsed as AuditPayload
  } catch {
    return null
  }
}

/** Calculate elapsed seconds between scan_date and right now */
function getElapsedSeconds(scanDate: string): number {
  const scan = new Date(scanDate)
  const now = new Date()
  return Math.max(0, Math.floor((now.getTime() - scan.getTime()) / 1000))
}

/** Revenue lost per second based on monthly COI */
function ratePerSecond(monthlyCOI: number): number {
  return monthlyCOI / 30 / 24 / 3600
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SHARED STATIC SCREENS                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0a0a0a' }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: '#22c55e',
          fontSize: '13px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      >
        Decoding diagnostic payload…
      </div>
    </div>
  )
}

function InvalidScreen() {
  return (
    <>
      <GlobalStyles />
      <div
        className="min-h-screen flex items-center justify-center p-8"
        style={{ background: '#0a0a0a', fontFamily: "'Inter', sans-serif" }}
      >
        <div className="text-center max-w-lg">
          {/* Scan-line decorative top */}
          <div
            className="mb-12 mx-auto"
            style={{
              width: 1,
              height: 80,
              background:
                'linear-gradient(to bottom, transparent, #ef4444, transparent)',
              opacity: 0.4,
            }}
          />

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: '#444',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: '28px',
            }}
          >
            DIAGNOSTIC SYSTEM · AUTHENTICATION ERROR
          </div>

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '88px',
              fontWeight: 700,
              color: '#ef4444',
              lineHeight: 1,
              marginBottom: '24px',
              opacity: 0.9,
            }}
          >
            ERR
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 600,
              color: '#fff',
              marginBottom: '16px',
            }}
          >
            Diagnostic Expired or Invalid
          </h1>

          <p
            style={{
              fontSize: '14px',
              color: '#555',
              lineHeight: '1.7',
              marginBottom: '36px',
            }}
          >
            This diagnostic link is malformed, expired, or the payload could
            not be decoded. Please contact your audit consultant for a fresh
            diagnostic link.
          </p>

          {/* Error terminal box */}
          <div
            style={{
              background: '#080808',
              border: '1px solid #1a1a1a',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                lineHeight: '1.8',
              }}
            >
              <div style={{ color: '#ef4444' }}>
                ERROR_CODE: PAYLOAD_DECODE_FAILURE
              </div>
              <div style={{ color: '#333' }}>STATUS: 0x0 — no valid JSON found</div>
              <div style={{ color: '#333' }}>
                HINT: Ensure ?payload= is a valid base64-encoded JSON string
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  GLOBAL STYLES (injected into <head> via <style>)                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      *, *::before, *::after { box-sizing: border-box; }

      html { scroll-behavior: smooth; }

      body {
        margin: 0;
        padding: 0;
        background: #0a0a0a;
        color: #fff;
        font-family: 'Inter', sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      .mono {
        font-family: 'JetBrains Mono', monospace;
        font-variant-numeric: tabular-nums;
      }

      /* Pulsing ping animation for live indicators */
      @keyframes ping {
        75%, 100% { transform: scale(2); opacity: 0; }
      }
      @keyframes pulse-opacity {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes bounce-y {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(4px); }
      }
      @keyframes flicker {
        0%, 90%, 92%, 94%, 100% { opacity: 1; }
        91%, 93% { opacity: 0.75; }
      }
      @keyframes scan {
        0%   { transform: translateY(-100%); }
        100% { transform: translateY(800px); }
      }
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes counterGlow {
        0%, 100% { text-shadow: 0 0 20px rgba(239,68,68,0.15); }
        50%       { text-shadow: 0 0 40px rgba(239,68,68,0.35); }
      }

      .animate-ping      { animation: ping 1.2s cubic-bezier(0,0,.2,1) infinite; }
      .animate-pulse     { animation: pulse-opacity 2s ease-in-out infinite; }
      .animate-bounce    { animation: bounce-y 1.4s ease-in-out infinite; }
      .terminal-flicker  { animation: flicker 6s infinite; }
      .counter-glow      { animation: counterGlow 2.5s ease-in-out infinite; }
      .fade-up           { animation: fadeSlideUp 0.5s ease both; }

      /* CTA button green glow */
      .cta-btn {
        box-shadow: 0 0 18px rgba(34,197,94,0.25), 0 0 36px rgba(34,197,94,0.08);
        transition: box-shadow .2s ease, background .2s ease, transform .15s ease;
      }
      .cta-btn:hover {
        box-shadow: 0 0 28px rgba(34,197,94,0.45), 0 0 56px rgba(34,197,94,0.18);
        transform: translateY(-1px);
      }
      .cta-btn:active { transform: translateY(0); }

      /* Subtle noise overlay for depth */
      .noise::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
        pointer-events: none;
        border-radius: inherit;
      }

      /* Scanline effect for terminal */
      .scanlines {
        position: relative;
        overflow: hidden;
      }
      .scanlines::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: linear-gradient(to bottom, transparent, rgba(34,197,94,0.06), transparent);
        animation: scan 4s linear infinite;
        pointer-events: none;
        z-index: 10;
      }

      /* Section reveal */
      .section-card {
        background: #111111;
        border: 1px solid #2a2a2a;
        border-radius: 16px;
      }

      /* Recharts override */
      .recharts-tooltip-wrapper { outline: none !important; }
    `}</style>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CUSTOM RECHARTS TOOLTIP                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#0f0f0f',
        border: '1px solid #2a2a2a',
        borderRadius: '8px',
        padding: '10px 14px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '12px',
      }}
    >
      <div style={{ color: '#888', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: '#fff', fontWeight: 600 }}>
        Score: {payload[0].value}%
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  LOCKED BADGE COMPONENT                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */

function LockedBadge({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#0d0d0d',
        border: '1px solid #1e1e1e',
        borderRadius: '12px',
        padding: '14px 20px',
      }}
    >
      <Lock size={13} color="#333" />
      <div>
        <div
          className="mono"
          style={{
            fontSize: '9px',
            color: '#444',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}
        >
          {label}
        </div>
        <div
          className="mono"
          style={{ fontSize: '20px', fontWeight: 600, color: '#fff' }}
        >
          {value}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN DASHBOARD (inner — requires Suspense wrapper for useSearchParams)     */
/* ═══════════════════════════════════════════════════════════════════════════ */

function DiagnosticDashboard() {
  const searchParams = useSearchParams()
  const encodedParam = searchParams.get('payload')

  /* ── State ─────────────────────────────────────────────────────────────── */
  const [payload, setPayload] = useState<AuditPayload | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [lostRevenue, setLostRevenue] = useState(0)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [terminalDone, setTerminalDone] = useState(false)

  const ctaRef = useRef<HTMLDivElement>(null)

  /* ── 1. Parse payload on mount ─────────────────────────────────────────── */
  useEffect(() => {
    if (!encodedParam) {
      setInvalid(true)
      return
    }
    const parsed = parsePayload(encodedParam)
    if (!parsed) {
      setInvalid(true)
      return
    }
    setPayload(parsed)

    // Seed counter with revenue already lost since scan_date
    const elapsedSec = getElapsedSeconds(parsed.scan_date)
    setLostRevenue(elapsedSec * ratePerSecond(parsed.monthly_coi))
  }, [encodedParam])

  /* ── 2. Live counter — increment every second ───────────────────────────── */
  useEffect(() => {
    if (!payload) return
    const rps = ratePerSecond(payload.monthly_coi)
    const id = setInterval(() => setLostRevenue((prev) => prev + rps), 1000)
    return () => clearInterval(id)
  }, [payload])

  /* ── 3. Terminal typewriter animation ────────────────────────────────────── */
  useEffect(() => {
    if (!payload) return
    const script: string[] = [
      `$ wc-scanner --target ${payload.domain} --deep --module subscriptions`,
      `> Initializing WooCommerce forensics engine v4.1.2 ...`,
      `> Resolving target: ${payload.domain}`,
      `> Fingerprinting plugin stack ...`,
      ``,
      `[CRITICAL] ${payload.finding_detail_1}`,
      `[CRITICAL] ${payload.finding_detail_2}`,
      `[WARNING]  ${payload.finding_detail_3}`,
      ``,
      `> Calculating revenue impact model ...`,
      `> COI Estimate: ${fmt(payload.monthly_coi, payload.currency)}/month confirmed`,
      `> Scan complete. 3 issue(s) found. Audit recommended immediately.`,
    ]
    let idx = 0
    const id = setInterval(() => {
      if (idx < script.length) {
        setTerminalLines((prev) => [...prev, script[idx]])
        idx++
      } else {
        setTerminalDone(true)
        clearInterval(id)
      }
    }, 190)
    return () => clearInterval(id)
  }, [payload])

  /* ── Early returns ──────────────────────────────────────────────────────── */
  if (invalid) return <InvalidScreen />
  if (!payload) return <LoadingScreen />

  /* ── Derived values ─────────────────────────────────────────────────────── */
  const mailtoLink = `mailto:${payload.reply_email}?subject=${encodeURIComponent(
    `Audit Request: ${payload.service_name} — ${payload.domain}`
  )}&body=${encodeURIComponent(
    `Hello,\n\nI would like to proceed with the ${payload.service_name} audit for ${payload.domain}.\n\nPlease send me the next steps and timeline.\n\nThank you.`
  )}`

  const chartData = [
    { name: payload.store.length > 14 ? payload.store.slice(0, 14) + '…' : payload.store, value: payload.benchmark_store },
    { name: 'Industry Avg', value: payload.benchmark_industry },
  ]

  const roiDays = Math.ceil(payload.fitd_price / (payload.monthly_coi / 30))

  const scrollToCTA = () =>
    ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  /* ────────────────────────────────────────────────────────────────────────── */
  return (
    <>
      <GlobalStyles />

      <div style={{ minHeight: '100vh', background: '#0a0a0a', paddingBottom: '100px' }}>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HEADER                                                               */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            borderBottom: '1px solid #1c1c1c',
            background: 'rgba(10,10,10,0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '14px 24px',
          }}
        >
          <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              className="mono"
              style={{ fontSize: '10px', color: '#3a3a3a', letterSpacing: '0.22em', textTransform: 'uppercase' }}
            >
              DIAGNOSTIC REPORT · {payload.domain} · {payload.scan_timestamp}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Ping dot */}
              <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px' }}>
                <span
                  className="animate-ping"
                  style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: '#22c55e', opacity: 0.6,
                  }}
                />
                <span
                  style={{
                    position: 'relative', borderRadius: '50%',
                    width: '8px', height: '8px', background: '#22c55e',
                    display: 'inline-block',
                  }}
                />
              </span>
              <span
                className="mono"
                style={{ fontSize: '10px', color: '#22c55e', letterSpacing: '0.2em', textTransform: 'uppercase' }}
              >
                LIVE
              </span>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* §1 HERO                                                          */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <section style={{ padding: '96px 0 72px', textAlign: 'center' }}>

            {/* Alert badge */}
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '999px',
                background: 'rgba(239,68,68,0.07)',
                marginBottom: '40px',
              }}
            >
              <AlertTriangle size={12} color="#ef4444" />
              <span
                className="mono"
                style={{ fontSize: '10px', color: '#ef4444', letterSpacing: '0.2em', textTransform: 'uppercase' }}
              >
                Revenue Leak Detected · {payload.service_id}
              </span>
            </div>

            {/* Main headline */}
            <h1
              style={{
                fontSize: 'clamp(40px, 7vw, 72px)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                marginBottom: '28px',
                color: '#fff',
              }}
            >
              We found{' '}
              <span style={{ color: '#ef4444', position: 'relative' }}>
                {fmt(payload.annual_coi, payload.currency)}
                {/* Underline accent */}
                <svg
                  aria-hidden
                  viewBox="0 0 200 6"
                  style={{ position: 'absolute', bottom: '-4px', left: 0, width: '100%', height: '4px' }}
                  preserveAspectRatio="none"
                >
                  <path d="M0 3 Q50 0 100 3 Q150 6 200 3" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.35" fill="none" />
                </svg>
              </span>
              {' '}leaving{' '}
              <span style={{ color: '#22c55e' }}>{payload.store}</span>
              {' '}every year.
            </h1>

            {/* Technical sub-heading */}
            <p
              className="mono"
              style={{
                fontSize: '14px', color: '#666', maxWidth: '560px',
                margin: '0 auto 44px', lineHeight: '1.75',
              }}
            >
              {payload.technical_finding}
            </p>

            {/* Scroll CTA */}
            <button
              onClick={scrollToCTA}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                background: 'transparent',
                color: '#777',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'color .2s, border-color .2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#ccc'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#444'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#777'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a'
              }}
            >
              See the full diagnostic →
              <span className="animate-bounce" style={{ display: 'inline-flex' }}>
                <ChevronDown size={15} />
              </span>
            </button>
          </section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* §2 LIVE COUNTER                                                   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <section style={{ marginBottom: '56px' }}>
            <div
              className="section-card noise"
              style={{ padding: '56px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
            >
              {/* Red gradient atmosphere */}
              <div
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '160px',
                  background: 'linear-gradient(to bottom, rgba(239,68,68,0.05), transparent)',
                  pointerEvents: 'none',
                }}
              />

              {/* Label */}
              <p
                className="mono"
                style={{
                  fontSize: '10px', color: '#444', letterSpacing: '0.22em',
                  textTransform: 'uppercase', marginBottom: '20px', position: 'relative',
                }}
              >
                Revenue leaving {payload.store} since diagnostic
              </p>

              {/* Counter */}
              <div
                className="mono counter-glow"
                style={{
                  fontSize: 'clamp(52px, 10vw, 88px)',
                  fontWeight: 700,
                  color: '#ef4444',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  marginBottom: '48px',
                  position: 'relative',
                }}
              >
                {fmt(lostRevenue, payload.currency)}
              </div>

              {/* Locked badges row */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '12px',
                  position: 'relative',
                }}
              >
                <LockedBadge label="Est. Monthly Sessions" value={payload.sessions_est} />
                <LockedBadge label="Avg Order Value" value={fmt(payload.aov_est, payload.currency)} />
                <LockedBadge label="Daily COI" value={fmt(payload.daily_coi, payload.currency)} />
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* §3 TERMINAL PROOF                                                */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <section style={{ marginBottom: '56px' }}>
            {/* Section label */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}
            >
              <Terminal size={14} color="#22c55e" />
              <span
                className="mono"
                style={{ fontSize: '10px', color: '#444', letterSpacing: '0.2em', textTransform: 'uppercase' }}
              >
                Technical Proof · Live Scan Output
              </span>
            </div>

            <div
              className="terminal-flicker scanlines"
              style={{
                background: '#030303',
                border: '1px solid #1a1a1a',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {/* Terminal title bar */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px',
                  borderBottom: '1px solid #141414',
                  background: '#0a0a0a',
                }}
              >
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: 'rgba(239,68,68,0.6)', display: 'inline-block' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: 'rgba(245,158,11,0.6)', display: 'inline-block' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: 'rgba(34,197,94,0.6)', display: 'inline-block' }} />
                <span
                  className="mono"
                  style={{ fontSize: '11px', color: '#2a2a2a', marginLeft: '10px' }}
                >
                  wc-scanner · {payload.domain}
                </span>
              </div>

              {/* Terminal output */}
              <div style={{ padding: '24px', minHeight: '200px' }}>
                {terminalLines.map((line, i) => {
                  const color =
                    line.startsWith('[CRITICAL]') ? '#ef4444'
                    : line.startsWith('[WARNING]')  ? '#f59e0b'
                    : line.startsWith('$')          ? '#22c55e'
                    : line.startsWith('>')          ? '#3a3a3a'
                    : '#1e1e1e'

                  return (
                    <div
                      key={i}
                      className="mono fade-up"
                      style={{
                        fontSize: '13px',
                        lineHeight: '1.75',
                        color,
                        animationDelay: `${i * 0.04}s`,
                      }}
                    >
                      {line || '\u00A0'}
                    </div>
                  )
                })}
                {!terminalDone && (
                  <span
                    className="mono animate-pulse"
                    style={{ fontSize: '14px', color: '#22c55e' }}
                  >
                    █
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* §4 BENCHMARK CHART                                               */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <section style={{ marginBottom: '56px' }}>
            <div className="section-card" style={{ padding: '36px 36px 28px' }}>
              {/* Header */}
              <div style={{ marginBottom: '28px' }}>
                <h3
                  className="mono"
                  style={{
                    fontSize: '10px', color: '#444', letterSpacing: '0.2em',
                    textTransform: 'uppercase', margin: '0 0 6px',
                  }}
                >
                  Vulnerability Score Benchmark
                </h3>
                <p style={{ fontSize: '12px', color: '#3a3a3a', margin: 0 }}>
                  {payload.benchmark_source}
                </p>
              </div>

              {/* Chart */}
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 20, left: -8, bottom: 0 }}
                    barCategoryGap="40%"
                  >
                    <CartesianGrid
                      strokeDasharray="2 6"
                      stroke="#1a1a1a"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={{ stroke: '#1e1e1e' }}
                      tickLine={false}
                      tick={{
                        fill: '#444',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                      }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#444',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                      }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      content={<CustomTooltip />}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={90}>
                      <Cell fill="#ef4444" />
                      <Cell fill="#22c55e" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div
                style={{
                  display: 'flex', gap: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid #1a1a1a',
                  marginTop: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444', display: 'inline-block' }} />
                  <span className="mono" style={{ fontSize: '11px', color: '#444' }}>
                    {payload.store}: {payload.benchmark_store}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#22c55e', display: 'inline-block' }} />
                  <span className="mono" style={{ fontSize: '11px', color: '#444' }}>
                    Industry Average: {payload.benchmark_industry}%
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* §5 IMPACT TABLE                                                  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <section style={{ marginBottom: '56px' }}>
            {/* Section label */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}
            >
              <TrendingDown size={14} color="#ef4444" />
              <span
                className="mono"
                style={{ fontSize: '10px', color: '#444', letterSpacing: '0.2em', textTransform: 'uppercase' }}
              >
                Estimated Cost of Inaction (COI)
              </span>
            </div>

            {/* 3-column grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '12px',
              }}
            >
              {[
                { label: 'Monthly',   value: payload.monthly_coi,       note: '30 days'  },
                { label: 'Quarterly', value: payload.monthly_coi * 3,   note: '90 days'  },
                { label: 'Annual',    value: payload.annual_coi,         note: '365 days' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="section-card"
                  style={{ padding: '28px 20px', textAlign: 'center' }}
                >
                  <div
                    className="mono"
                    style={{
                      fontSize: '9px', color: '#3a3a3a', letterSpacing: '0.2em',
                      textTransform: 'uppercase', marginBottom: '16px',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 'clamp(24px, 3.5vw, 36px)',
                      fontWeight: 700,
                      color: '#ef4444',
                      lineHeight: 1,
                      marginBottom: '8px',
                    }}
                  >
                    {fmt(item.value, payload.currency)}
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: '10px', color: '#2a2a2a' }}
                  >
                    {item.note}
                  </div>
                </div>
              ))}
            </div>

            {/* Urgency notice */}
            <div
              style={{
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }}>⚠</span>
              <span
                className="mono"
                style={{ fontSize: '11px', color: '#444', lineHeight: '1.65' }}
              >
                {payload.real_urgency}
              </span>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* §6 GUARANTEE CARD                                                */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <section style={{ marginBottom: '56px' }}>
            <div
              style={{
                background: '#111',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: '16px',
                padding: '40px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Green glow orb */}
              <div
                style={{
                  position: 'absolute', top: '-80px', right: '-80px',
                  width: '300px', height: '300px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                {/* Icon */}
                <div
                  style={{
                    padding: '14px',
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.15)',
                    borderRadius: '12px',
                    flexShrink: 0,
                  }}
                >
                  <Shield size={22} color="#22c55e" />
                </div>

                <div>
                  <div
                    className="mono"
                    style={{
                      fontSize: '9px', color: '#22c55e', letterSpacing: '0.2em',
                      textTransform: 'uppercase', marginBottom: '10px',
                    }}
                  >
                    Performance Guarantee
                  </div>
                  <h3
                    style={{
                      fontSize: '22px', fontWeight: 700,
                      margin: '0 0 12px', color: '#fff',
                    }}
                  >
                    Alex's Personal Guarantee
                  </h3>
                  <p
                    style={{
                      fontSize: '15px', color: '#666',
                      lineHeight: '1.7', margin: 0,
                    }}
                  >
                    If the full audit does not surface at least{' '}
                    <strong style={{ color: '#fff' }}>
                      {fmt(payload.fitd_price, payload.currency)}
                    </strong>
                    {' '}in provable revenue leaks,{' '}
                    <strong style={{ color: '#22c55e' }}>I don't charge you.</strong>
                    {' '}Zero risk. Full accountability. You win either way.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* §7 INVESTMENT COMPARISON                                         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <section style={{ marginBottom: '56px' }} ref={ctaRef}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                The Decision Is Simple
              </h2>
              <p
                className="mono"
                style={{ fontSize: '12px', color: '#3a3a3a', margin: 0 }}
              >
                Every day costs more than the fix.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              {/* Loss card */}
              <div
                style={{
                  background: '#111',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '16px',
                  padding: '40px 32px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(239,68,68,0.06), transparent)', pointerEvents: 'none' }} />
                <div
                  className="mono"
                  style={{ fontSize: '9px', color: '#ef4444', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}
                >
                  Monthly Revenue Loss
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 700, color: '#ef4444', lineHeight: 1, marginBottom: '10px' }}
                >
                  {fmt(payload.monthly_coi, payload.currency)}
                </div>
                <div className="mono" style={{ fontSize: '11px', color: '#3a3a3a' }}>
                  Every 30 days you don't act
                </div>
              </div>

              {/* Investment card */}
              <div
                style={{
                  background: '#111',
                  border: '1px solid rgba(34,197,94,0.25)',
                  borderRadius: '16px',
                  padding: '40px 32px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(34,197,94,0.06), transparent)', pointerEvents: 'none' }} />
                <div
                  className="mono"
                  style={{ fontSize: '9px', color: '#22c55e', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}
                >
                  Your Investment
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 700, color: '#22c55e', lineHeight: 1, marginBottom: '10px' }}
                >
                  {fmt(payload.fitd_price, payload.currency)}
                </div>
                <div className="mono" style={{ fontSize: '11px', color: '#3a3a3a' }}>
                  One-time · Guaranteed ROI
                </div>
              </div>
            </div>

            {/* ROI note */}
            <div style={{ textAlign: 'center' }}>
              <span
                className="mono"
                style={{ fontSize: '11px', color: '#2a2a2a' }}
              >
                Estimated payback period:{' '}
                <span style={{ color: '#22c55e' }}>{roiDays} days</span>
                {' '}assuming full leak recovery
              </span>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* §8 FINAL CTA                                                     */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <section style={{ marginBottom: '80px' }}>
            <div
              className="section-card"
              style={{
                padding: '64px 40px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Green radial glow */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '600px', height: '300px',
                  background: 'radial-gradient(ellipse, rgba(34,197,94,0.05) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Slot available badge */}
              <div
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '5px 12px',
                  border: '1px solid rgba(34,197,94,0.15)',
                  borderRadius: '999px',
                  background: 'rgba(34,197,94,0.05)',
                  marginBottom: '28px',
                }}
              >
                <Clock size={11} color="#22c55e" />
                <span
                  className="mono"
                  style={{ fontSize: '10px', color: '#22c55e', letterSpacing: '0.15em' }}
                >
                  {payload.service_id} · Audit slot available
                </span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  margin: '0 0 16px',
                }}
              >
                Ready to stop the leak?
              </h2>

              <p
                style={{
                  fontSize: '14px', color: '#555',
                  maxWidth: '480px', margin: '0 auto 40px',
                  lineHeight: '1.7',
                }}
              >
                Reply to receive your full audit plan for the{' '}
                <strong style={{ color: '#ccc' }}>{payload.service_name}</strong> fix.
                Turnaround is 24–48 hours.
              </p>

              {/* Primary CTA */}
              <a
                href={mailtoLink}
                className="cta-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px 32px',
                  background: '#22c55e',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '15px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <Mail size={17} />
                Proceed with the Audit →
              </a>

              {/* Mailto hint */}
              <div
                className="mono"
                style={{ marginTop: '18px', fontSize: '10px', color: '#2a2a2a' }}
              >
                Opens your email client · {payload.reply_email}
              </div>
            </div>
          </section>

        </main>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STICKY FOOTER                                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            zIndex: 50,
            borderTop: '1px solid #181818',
            background: 'rgba(10,10,10,0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              maxWidth: '960px',
              margin: '0 auto',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Left: pulsing counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Pulse dot */}
              <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px' }}>
                <span
                  className="animate-ping"
                  style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%', background: '#ef4444', opacity: 0.55,
                  }}
                />
                <span
                  style={{
                    position: 'relative', borderRadius: '50%',
                    width: '8px', height: '8px', background: '#ef4444', display: 'inline-block',
                  }}
                />
              </span>
              <div>
                <div
                  className="mono"
                  style={{ fontSize: '9px', color: '#333', letterSpacing: '0.15em', textTransform: 'uppercase', lineHeight: 1, marginBottom: '3px' }}
                >
                  Lost since scan
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: '20px', fontWeight: 700,
                    color: '#ef4444', lineHeight: 1,
                  }}
                >
                  {fmt(lostRevenue, payload.currency)}
                </div>
              </div>
            </div>

            {/* Right: CTA button */}
            <a
              href={mailtoLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#22c55e',
                color: '#000',
                fontWeight: 700,
                fontSize: '13px',
                fontFamily: "'JetBrains Mono', monospace",
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'background .2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = '#16a34a')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = '#22c55e')}
            >
              <Mail size={14} />
              Proceed with Audit →
            </a>
          </div>
        </div>

      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  PAGE EXPORT                                                                 */
/*  Wraps DiagnosticDashboard in Suspense (required by Next.js for             */
/*  useSearchParams in App Router client components)                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DiagnosticDashboard />
    </Suspense>
  )
}
