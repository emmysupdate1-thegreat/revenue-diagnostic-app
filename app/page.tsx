'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ShieldCheck, AlertTriangle, CheckCircle2, Terminal, ArrowRight, Mail } from 'lucide-react'

// 1. Safe Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-mono text-sm text-[#6b7280]">
      <div className="w-4 h-4 rounded-full bg-[#22c55e] animate-ping mb-4"></div>
      LOADING DIAGNOSTIC PAYLOAD...
    </div>
  )
}

// 2. Safe Error Screen Component
function ErrorScreen({ code, hint }: { code: string; hint: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full bg-[#111111] rounded-xl p-8 border border-[#2a2a2a] text-center">
        <span className="font-mono text-xs text-[#ef4444] tracking-widest uppercase mb-2 block">Diagnostic System · Authentication Error</span>
        <h1 className="text-6xl font-bold font-mono text-[#ef4444] mb-6">ERR</h1>
        <h2 className="text-xl font-bold text-white mb-2">Diagnostic Expired or Invalid</h2>
        <p className="text-sm text-[#6b7280] mb-6 leading-relaxed">
          This diagnostic link is malformed, expired, or the payload could not be decoded. Please contact your audit consultant for a fresh diagnostic link.
        </p>
        <div className="bg-black rounded-lg p-4 font-mono text-xs text-left border border-[#2a2a2a] space-y-1">
          <p className="text-[#ef4444] font-semibold">ERROR_CODE: {code}</p>
          <p className="text-[#6b7280]">STATUS: 0x0 - no valid JSON found</p>
          <p className="text-[#6b7280] mt-2">HINT: {hint}</p>
        </div>
      </div>
    </div>
  )
}

// 3. Interactive Diagnostic Dashboard
function DiagnosticDashboard() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [counter, setCounter] = useState(0)

  // Decode Payload safely on client-side
  useEffect(() => {
    try {
      const payload = searchParams.get('payload')
      if (!payload) {
        setError("NO_PAYLOAD")
        setLoading(false)
        return
      }
      
      // Fix browser URL decoding replacing '+' with ' '
      const cleanPayload = payload.replace(/ /g, '+')
      const decoded = atob(cleanPayload)
      const parsed = JSON.parse(decoded)
      
      setData(parsed)
    } catch (e) {
      setError("PAYLOAD_DECODE_FAILURE")
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  // Real-time counter logic from scan date
  useEffect(() => {
    if (!data) return

    const scanDate = new Date(`${data.scan_date}T00:00:00Z`)
    const now = new Date()
    const elapsedSeconds = Math.floor((now.getTime() - scanDate.getTime()) / 1000)
    const lossPerSecond = data.monthly_coi / 30 / 24 / 3600

    setCounter(elapsedSeconds * lossPerSecond)

    const interval = setInterval(() => {
      setCounter((prev) => prev + lossPerSecond)
    }, 1000)

    return () => clearInterval(interval)
  }, [data])

  if (loading) return <LoadingScreen />
  if (error || !data) {
    return (
      <ErrorScreen 
        code={error || "UNKNOWN_ERROR"} 
        hint={error === "NO_PAYLOAD" ? "Ensure ?payload= parameter is present in the URL." : "Ensure payload is a valid base64-encoded JSON string."} 
      />
    )
  }

  // Format currency localization based on country payload
  const fmt = (n: number) => {
    const currency = data.currency || 'USD'
    return new Intl.NumberFormat(currency === 'EUR' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(n)
  }

  const fmtPrecise = (n: number) => {
    const currency = data.currency || 'USD'
    return new Intl.NumberFormat(currency === 'EUR' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: n < 1000 ? 2 : 0,
      maximumFractionDigits: n < 1000 ? 2 : 0
    }).format(n)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased selection:bg-[#22c55e]/30 selection:text-white pb-32">
      {/* HEADER */}
      <header className="max-w-2xl mx-auto px-6 pt-8 pb-6 border-b border-[#2a2a2a] mb-8">
        <div className="flex justify-between items-center font-mono text-xs text-[#6b7280]">
          <span>DIAGNOSTIC REPORT · {data.domain} · {data.scan_timestamp}</span>
          <span>REF: GHO-2026-{data.service_id}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 space-y-8">
        {/* HERO SECTION */}
        <div className="text-center space-y-4 py-4">
          <span className="text-xs text-[#6b7280] tracking-widest uppercase block font-mono">Revenue Signal Intelligence — {data.store}</span>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">
            We found <span className="text-[#ef4444]">{fmt(data.annual_coi)}</span> leaving {data.store} every year.
          </h1>
          <p className="text-base text-[#6b7280]">{data.technical_finding}</p>
        </div>

        {/* 1. LIVE REVENUE LOSS COUNTER */}
        <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a] relative overflow-hidden">
          <span className="text-xs font-mono text-[#6b7280] uppercase tracking-wider block mb-2">Revenue leaving {data.store} since diagnostic</span>
          <div className="font-mono text-4xl md:text-5xl font-bold text-[#ef4444] tabular-nums tracking-tight">
            {fmtPrecise(counter)}
          </div>
          <div className="text-sm text-[#6b7280] mt-3">
            Running at <span className="text-[#ef4444] font-semibold font-mono">{fmt(data.daily_coi)}</span> per day · <span className="text-[#ef4444] font-semibold font-mono">{fmt(data.monthly_coi)}</span> per month
          </div>
          <div className="text-xs text-[#6b7280] mt-4 border-t border-[#2a2a2a] pt-4 flex flex-wrap gap-x-4 gap-y-1">
            <span>Based on: ~{data.sessions_est} est. monthly sessions</span>
            <span>·</span>
            <span>~{fmt(data.aov_est)} est. AOV</span>
            <span>·</span>
            <span>{data.service_id} signal confirmed</span>
          </div>
        </div>

        {/* 2. TECHNICAL EVIDENCE TERMINAL */}
        <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a]">
          <h3 className="text-sm font-semibold text-white mb-4">What we detected on {data.domain}</h3>
          <div className="bg-black rounded-lg p-4 font-mono text-sm space-y-1 border border-[#2a2a2a] overflow-x-auto">
            <p className="text-[#22c55e]">$ scan {data.domain} --protocol zero-trust</p>
            <p className="text-[#f59e0b]">&gt; {data.finding_detail_1}</p>
            <p className="text-[#f59e0b]">&gt; {data.finding_detail_2}</p>
            <p className="text-[#ef4444]">&gt; ! {data.finding_detail_3}</p>
            <p className="text-[#22c55e]">✓ Confidence: 0.99 · Detection: {data.service_id}</p>
          </div>
          <p className="text-xs text-[#6b7280] mt-3">
            Scan executed {data.scan_timestamp}. Zero site access required. Methodology: external reconnaissance via HTTP header analysis and endpoint probing.
          </p>
        </div>

        {/* 3. INDUSTRY BENCHMARK CHART (PURE TAILWIND - NO RECHARTS CRASH) */}
        <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a]">
          <h3 className="text-sm font-semibold text-white mb-1">{data.service_name} exposure score: {data.store} vs. industry</h3>
          <p className="text-xs text-[#6b7280] mb-6">Source: {data.benchmark_source}</p>

          <div className="flex items-end gap-12 h-48 mt-4 border-b border-[#2a2a2a] pb-2 px-8">
            {/* Store Bar */}
            <div className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-xs text-white mb-2 font-mono">{data.benchmark_store}/100</span>
              <div 
                className="w-full bg-[#ef4444] rounded-t-md transition-all duration-1000 ease-out" 
                style={{ height: `${data.benchmark_store}%` }}
              ></div>
              <span className="text-xs text-[#6b7280] mt-3 text-center truncate w-full">{data.store}</span>
            </div>

            {/* Industry Bar */}
            <div className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-xs text-white mb-2 font-mono">{data.benchmark_industry}/100</span>
              <div 
                className="w-full bg-[#22c55e] rounded-t-md transition-all duration-1000 ease-out" 
                style={{ height: `${data.benchmark_industry}%` }}
              ></div>
              <span className="text-xs text-[#6b7280] mt-3 text-center">Industry</span>
            </div>
          </div>

          <p className="text-xs text-[#6b7280] mt-6 text-center">
            {data.store} scores {data.benchmark_store}/100 vs. the {data.benchmark_industry}/100 industry benchmark. The {data.benchmark_industry - data.benchmark_store}-point gap costs approximately {fmt(data.monthly_coi)} per month.
          </p>
        </div>

        {/* 4. IMPACT PROJECTION */}
        <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a]">
          <h3 className="text-sm font-semibold text-white mb-4">Projected cost of inaction</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-[#6b7280] mb-1">Monthly</p>
              <p className="text-xl md:text-2xl font-bold font-mono text-[#ef4444]">{fmt(data.monthly_coi)}</p>
            </div>
            <div>
              <p className="text-xs text-[#6b7280] mb-1">Quarterly</p>
              <p className="text-xl md:text-2xl font-bold font-mono text-[#ef4444]">{fmt(data.monthly_coi * 3)}</p>
            </div>
            <div>
              <p className="text-xs text-[#6b7280] mb-1">Annual</p>
              <p className="text-xl md:text-2xl font-bold font-mono text-[#ef4444]">{fmt(data.annual_coi)}</p>
            </div>
          </div>
        </div>

        {/* 5. GUARANTEE (RISK REVERSAL) */}
        <div className="bg-[#111111]/40 border-2 border-[#22c55e] rounded-xl p-6 flex gap-4 items-start">
          <ShieldCheck className="w-6 h-6 text-[#22c55e] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Alex's Personal Guarantee</h3>
            <p className="text-sm text-[#6b7280] leading-relaxed">
              If the full audit does not surface at least <span className="text-[#22c55e] font-semibold">{fmt(data.fitd_price)}</span> in provable, quantified revenue leaks — I don't charge you. No invoice. No awkward conversation. You keep the diagnostic report.
            </p>
          </div>
        </div>

        {/* 6. INVESTMENT COMPARISON */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
            <span className="text-[10px] text-[#6b7280] uppercase tracking-wider font-mono">Monthly loss (doing nothing)</span>
            <p className="text-2xl md:text-3xl font-bold text-[#ef4444] font-mono mt-1">{fmt(data.monthly_coi)}</p>
            <span className="text-[10px] text-[#6b7280] block mt-1">every 30 days</span>
          </div>
          <div className="bg-[#111111] border border-[#22c55e] rounded-xl p-5">
            <span className="text-[10px] text-[#6b7280] uppercase tracking-wider font-mono">Your investment (one-time)</span>
            <p className="text-2xl md:text-3xl font-bold text-[#22c55e] font-mono mt-1">{fmt(data.fitd_price)}</p>
            <span className="text-[10px] text-[#6b7280] block mt-1">{fmt(data.annual_coi)} recovered over 12 months</span>
          </div>
        </div>

        {/* 7. FINAL CALL TO ACTION */}
        <div className="text-center pt-4 space-y-4">
          <a
            href={`mailto:${data.reply_email}?subject=Audit ${data.store} - ${data.service_name}&body=Hi Alex,%0A%0AI'd like to proceed with the ${data.service_name} audit for ${data.domain}.%0A%0APlease send next steps.`}
            className="w-full bg-[#22c55e] hover:bg-[#1ebd51] text-black font-semibold py-4 px-8 rounded-xl text-lg flex items-center justify-center gap-2 transition-colors duration-200"
          >
            Get the full {data.service_name} audit <ArrowRight className="w-5 h-5" />
          </a>
          <span className="text-xs text-[#6b7280] block">Reply to {data.reply_email} · Typically responds within 4 hours</span>
        </div>

        {/* 8. URGENCY STATEMENT */}
        <div className="text-center text-xs text-[#6b7280] border-t border-[#2a2a2a] pt-4">
          {data.real_urgency}
        </div>
      </main>

      {/* STICKY FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#111111]/95 backdrop-blur-md border-t border-[#2a2a2a] z-50 py-3 px-6 shadow-2xl">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="font-mono text-sm md:text-base flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse"></span>
            <span className="text-[#ef4444] font-bold">{fmtPrecise(counter)}</span>
            <span className="text-xs text-[#6b7280] hidden md:inline">lost since scan</span>
          </div>
          <a
            href={`mailto:${data.reply_email}?subject=Audit ${data.store} - ${data.service_name}&body=Hi Alex,%0A%0AI'd like to proceed with the ${data.service_name} audit for ${data.domain}.%0A%0APlease send next steps.`}
            className="bg-[#22c55e] hover:bg-[#1ebd51] text-black font-semibold text-xs md:text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors duration-200"
          >
            Claim audit <Mail className="w-4 h-4" />
          </a>
        </div>
      </footer>
    </div>
  )
}

// Suspense Boundary Wrapper for Next.js app router
export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DiagnosticDashboard />
    </Suspense>
  )
}
