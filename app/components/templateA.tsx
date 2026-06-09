'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ShieldCheck, AlertTriangle, Terminal, ArrowRight, Mail } from 'lucide-react'

// 1. Loading State Screen
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-mono text-sm text-[#6b7280]">
      <div className="w-4 h-4 rounded-full bg-[#22c55e] animate-ping mb-4"></div>
      LOADING SECURE DIAGNOSTIC...
    </div>
  )
}

// 2. Error Fallback Screen
function ErrorScreen({ code, hint }: { code: string; hint: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full bg-[#111111] rounded-xl p-8 border border-[#2a2a2a] text-center">
        <span className="font-mono text-xs text-[#ef4444] tracking-widest uppercase mb-2 block">Diagnostic System · Error</span>
        <h1 className="text-5xl font-bold font-mono text-[#ef4444] mb-4">ERR</h1>
        <h2 className="text-lg font-bold text-white mb-2">Invalid or Expired Payload</h2>
        <p className="text-xs text-[#6b7280] mb-6 leading-relaxed">
          This secure link could not be decoded. Ensure the payload was generated correctly by your agent.
        </p>
        <div className="bg-black rounded-lg p-4 font-mono text-left text-xs border border-[#2a2a2a] space-y-1">
          <p className="text-[#ef4444] font-semibold">CODE: {code}</p>
          <p className="text-[#6b7280] mt-2">HINT: {hint}</p>
        </div>
      </div>
    </div>
  )
}

// 3. Main Master Application Component
function DiagnosticDashboard() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [counter, setCounter] = useState(0)
  const [sessionLoss, setSessionLoss] = useState(0)

  // Safe Client-Side Base64 Decoder (With space sanitization)
  useEffect(() => {
    try {
      const payload = searchParams.get('payload')
      if (!payload) {
        setError("NO_PAYLOAD")
        setLoading(false)
        return
      }
      const cleanPayload = payload.replace(/ /g, '+')
      const parsed = JSON.parse(decodeURIComponent(escape(atob(cleanPayload))))
      setData(parsed)
    } catch (e) {
      setError("PAYLOAD_DECODE_FAILURE")
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  // Live compounding loss clock based on scan date
  useEffect(() => {
    if (!data) return

    const scanDate = new Date(`${data.scan_date}T00:00:00Z`)
    const now = new Date()
    const elapsedSeconds = Math.floor((now.getTime() - scanDate.getTime()) / 1000)
    const lossPerSecond = data.monthly_coi / 30 / 24 / 3600

    setCounter(Math.max(0, elapsedSeconds * lossPerSecond))

    const interval = setInterval(() => {
      setCounter((prev) => prev + lossPerSecond)
      setSessionLoss((prev) => prev + lossPerSecond)
    }, 1000)

    return () => clearInterval(interval)
  }, [data])

  if (loading) return <LoadingScreen />
  if (error || !data) {
    return (
      <ErrorScreen 
        code={error || "DECODE_ERROR"} 
        hint={error === "NO_PAYLOAD" ? "The url is missing its ?payload= parameter." : "The URL parameter was modified or corrupted during transit."} 
      />
    )
  }

  // Universal Currency Formatter (Dynamic standard punctuation matching)
  const fmt = (n: number) => {
    const c = data.currency || 'USD'
    return new Intl.NumberFormat(c === 'EUR' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: c,
      maximumFractionDigits: 0
    }).format(n)
  }

  const fmtLive = (n: number) => {
    const c = data.currency || 'USD'
    return new Intl.NumberFormat(c === 'EUR' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: c,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(n)
  }

  const fmtMicro = (n: number) => {
    const c = data.currency || 'USD'
    return new Intl.NumberFormat(c === 'EUR' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: c,
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(n)
  }

  // Tally.so URL construction
  const tallyLink = `https://tally.so/r/aQzvEZ?store=${encodeURIComponent(data.store)}&domain=${encodeURIComponent(data.domain)}&coi=${data.monthly_coi}`

  // Force-Redirect to bypass Next.js Router interception
  const handleCTA = () => {
    window.location.assign(tallyLink)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased pb-32">
      {/* HEADER */}
      <header className="max-w-2xl mx-auto px-4 md:px-6 pt-8 pb-6 border-b border-[#2a2a2a] mb-8">
        <div className="flex justify-between items-center font-mono text-[10px] md:text-xs text-[#6b7280]">
          <span>DIAGNOSTIC REPORT · {data.domain} · {data.scan_timestamp}</span>
          <span>REF: GHO-2026-{data.service_id}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 space-y-6">
        {/* HERO */}
        <div className="text-center space-y-4 py-4">
          <span className="text-[10px] md:text-xs text-[#6b7280] tracking-widest uppercase block font-mono">Revenue Signal Intelligence — {data.store}</span>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight">
            We found <span className="text-[#ef4444]">{fmt(data.annual_coi)}</span> leaving {data.store} every year.
          </h1>
          <p className="text-sm md:text-base text-[#6b7280]">{data.technical_finding}</p>
        </div>

        {/* 1. COMPANION COUNTERS */}
        <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a] relative overflow-hidden">
          <span className="text-[10px] md:text-xs font-mono text-[#6b7280] uppercase tracking-wider block mb-2">Revenue leaving {data.store} since scan</span>
          <div className="font-mono text-4xl md:text-5xl font-bold text-[#ef4444] tabular-nums tracking-tight">
            {fmtLive(counter)}
          </div>
          <div className="text-[10px] md:text-xs text-[#ef4444] mt-2 font-mono animate-pulse">
            Session Loss: {fmtMicro(sessionLoss)} evaporated while viewing this page
          </div>
          <p className="text-xs md:text-sm text-[#6b7280] mt-4 pt-4 border-t border-[#2a2a2a]">
            Running at <span className="text-white font-mono font-bold">{fmt(data.daily_coi)}</span> per day · <span className="text-white font-mono font-bold">{fmt(data.monthly_coi)}</span> per month
          </p>
          <div className="text-[10px] text-[#6b7280] mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono">
            <span>Sessions: ~{data.sessions_est}</span>
            <span>·</span>
            <span>AOV: {fmt(data.aov_est)}</span>
          </div>
        </div>

        {/* 2. TECHNICAL TERMINAL */}
        <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a]">
          <h3 className="text-sm font-semibold text-white mb-4">Forensic Proof</h3>
          <div className="bg-black rounded-lg p-4 font-mono text-xs md:text-sm space-y-1 border border-[#2a2a2a] overflow-x-auto">
            <p className="text-[#22c55e]">$ scan {data.domain} --protocol zero-trust</p>
            <p className="text-[#f59e0b]">&gt; {data.finding_detail_1}</p>
            <p className="text-[#f59e0b]">&gt; {data.finding_detail_2}</p>
            <p className="text-[#ef4444]">&gt; ! {data.finding_detail_3}</p>
            <p className="text-[#22c55e]">✓ Detection verified: {data.service_id}</p>
          </div>
          <div className="mt-4 bg-[#0a0a0a] rounded-lg p-4 border border-[#2a2a2a] border-l-2 border-[#ef4444]">
            <span className="text-[10px] font-mono text-[#6b7280] uppercase block mb-1">Plain English Translation</span>
            <p className="text-xs md:text-sm text-[#9ca3af] leading-relaxed">{data.plain_english}</p>
          </div>
        </div>

        {/* 3. TAILWIND BAR CHART */}
        <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a]">
          <h3 className="text-sm font-semibold text-white mb-1">{data.service_name} exposure score: {data.store} vs. industry</h3>
          <p className="text-[10px] text-[#6b7280] mb-6">Source: {data.benchmark_source}</p>

          <div className="flex items-end gap-12 h-40 mt-4 border-b border-[#2a2a2a] pb-2 px-8">
            {/* Store Bar */}
            <div className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-xs text-white mb-2 font-mono">{data.benchmark_store}/100</span>
              <div className="w-full bg-[#ef4444] rounded-t-md" style={{ height: `${data.benchmark_store}%` }}></div>
              <span className="text-xs text-[#6b7280] mt-3 text-center truncate w-full">{data.store}</span>
            </div>

            {/* Industry Bar */}
            <div className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-xs text-white mb-2 font-mono">{data.benchmark_industry}/100</span>
              <div className="w-full bg-[#22c55e] rounded-t-md" style={{ height: `${data.benchmark_industry}%` }}></div>
              <span className="text-xs text-[#6b7280] mt-3 text-center">Industry</span>
            </div>
          </div>

          <p className="text-xs text-[#6b7280] mt-6 text-center">
            {data.store} scores {data.benchmark_store}/100 vs. the {data.benchmark_industry}/100 industry benchmark. The {data.benchmark_industry - data.benchmark_store}-point gap costs approximately {fmt(data.monthly_coi)} per month.
          </p>
        </div>

        {/* 4. EXPOSURE TIMELINE */}
        <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a]">
          <h3 className="text-sm font-semibold text-white mb-4">Projected cost of inaction</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] text-[#6b7280] uppercase">Monthly</p>
              <p className="text-lg md:text-xl font-bold font-mono text-[#ef4444] mt-1">{fmt(data.monthly_coi)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#6b7280] uppercase">Quarterly</p>
              <p className="text-lg md:text-xl font-bold font-mono text-[#ef4444] mt-1">{fmt(data.monthly_coi * 3)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#6b7280] uppercase">Annual</p>
              <p className="text-lg md:text-xl font-bold font-mono text-[#ef4444] mt-1">{fmt(data.annual_coi)}</p>
            </div>
          </div>
        </div>

        {/* 5. THE GUARANTEE */}
        <div className="bg-[#111111]/40 border-2 border-[#22c55e] rounded-xl p-6 flex gap-4 items-start">
          <ShieldCheck className="w-6 h-6 text-[#22c55e] flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Alex's Personal Guarantee</h3>
            <p className="text-xs md:text-sm text-[#9ca3af] leading-relaxed">
              If the full audit does not surface at least <span className="text-[#22c55e] font-semibold">{fmt(data.fitd_price * 3)}</span> in provable, quantified revenue leaks — I don't charge you. No invoice. You keep the diagnostic report.
            </p>
          </div>
        </div>

        {/* 6. INVESTMENT DECOY COMPARISON */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
            <span className="text-[10px] text-[#6b7280] uppercase tracking-wider font-mono">Monthly loss (doing nothing)</span>
            <p className="text-2xl font-bold text-[#ef4444] font-mono mt-1">{fmt(data.monthly_coi)}</p>
            <span className="text-[10px] text-[#6b7280] block mt-1">every 30 days</span>
          </div>
          <div className="bg-[#111111] border border-[#22c55e] rounded-xl p-5">
            <span className="text-[10px] text-[#6b7280] uppercase tracking-wider font-mono">Your investment (one-time)</span>
            <p className="text-2xl font-bold text-[#22c55e] font-mono mt-1">{fmt(data.fitd_price)}</p>
            <span className="text-[10px] text-[#6b7280] block mt-1">{fmt(data.annual_coi)} recovered over 12 months</span>
          </div>
        </div>

        {/* 7. PRIMARY CALL TO ACTION */}
        <div className="text-center pt-4 space-y-4">
          <button
            onClick={handleCTA}
            className="w-full bg-[#22c55e] hover:bg-[#1ebd51] text-black font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer"
          >
            Stop the Revenue Bleed →
          </button>
          <span className="text-xs text-[#6b7280] block">Typically responds within 4 hours</span>
        </div>

        {/* 8. SCARCITY WINDOW */}
        <div className="text-center text-xs text-[#6b7280] border-t border-[#2a2a2a] pt-4">
          {data.real_urgency}
        </div>
      </main>

      {/* STICKY FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#111111]/95 backdrop-blur-md border-t border-[#2a2a2a] z-50 py-3 px-6 shadow-2xl">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="font-mono text-sm md:text-base flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse"></span>
            <span className="text-[#ef4444] font-bold">{fmtLive(counter)}</span>
            <span className="text-xs text-[#6b7280] hidden md:inline">lost since scan</span>
          </div>
          <button
            onClick={handleCTA}
            className="bg-[#22c55e] hover:bg-[#1ebd51] text-black font-semibold text-xs md:text-sm px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors duration-200 cursor-pointer"
          >
            Claim audit →
          </button>
        </div>
      </footer>
    </div>
  )
}

// Global Router wrapper for search parameters safely inside Next.js Suspense
export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DiagnosticDashboard />
    </Suspense>
  )
}
