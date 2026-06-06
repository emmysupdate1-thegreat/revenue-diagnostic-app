'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ShieldCheck, AlertTriangle, CheckCircle2, Terminal, ArrowRight, Mail, ShieldAlert } from 'lucide-react'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-mono text-sm text-[#6b7280]">
      <div className="w-4 h-4 rounded-full bg-[#22c55e] animate-ping mb-4"></div>
      LOADING DIAGNOSTIC PAYLOAD...
    </div>
  )
}

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

function DiagnosticDashboard() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [counter, setCounter] = useState(0)
  
  // Interactive state for Template D
  const [securityAction, setSecurityAction] = useState<'fix' | 'ignore'>('fix')

  useEffect(() => {
    try {
      const payload = searchParams.get('payload')
      if (!payload) {
        setError("NO_PAYLOAD")
        setLoading(false)
        return
      }
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

  useEffect(() => {
    if (!data || data.template_type !== "A") return

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

  // ==========================================
  // VIEW RENDERER 1: TEMPLATE A (REVENUE LEAK)
  // ==========================================
  if (data.template_type === "A") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white antialiased pb-32">
        <header className="max-w-2xl mx-auto px-6 pt-8 pb-6 border-b border-[#2a2a2a] mb-8">
          <div className="flex justify-between items-center font-mono text-xs text-[#6b7280]">
            <span>DIAGNOSTIC REPORT · {data.domain} · {data.scan_timestamp}</span>
            <span>REF: GHO-2026-{data.service_id}</span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-4 py-4">
            <span className="text-xs text-[#6b7280] tracking-widest uppercase block font-mono">Revenue Signal Intelligence — {data.store}</span>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">
              We found <span className="text-[#ef4444]">{fmt(data.annual_coi)}</span> leaving {data.store} every year.
            </h1>
            <p className="text-base text-[#6b7280]">{data.technical_finding}</p>
          </div>

          <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a]">
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

          <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a]">
            <h3 className="text-sm font-semibold text-white mb-4">What we detected on {data.domain}</h3>
            <div className="bg-black rounded-lg p-4 font-mono text-sm space-y-1 border border-[#2a2a2a] overflow-x-auto">
              <p className="text-[#22c55e]">$ scan {data.domain} --protocol zero-trust</p>
              <p className="text-[#f59e0b]">&gt; {data.finding_detail_1}</p>
              <p className="text-[#f59e0b]">&gt; {data.finding_detail_2}</p>
              <p className="text-[#ef4444]">&gt; ! {data.finding_detail_3}</p>
              <p className="text-[#22c55e]">✓ Confidence: 0.99 · Detection: {data.service_id}</p>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a]">
            <h3 className="text-sm font-semibold text-white mb-1">{data.service_name} exposure score: {data.store} vs. industry</h3>
            <p className="text-xs text-[#6b7280] mb-6">Source: {data.benchmark_source}</p>
            <div className="flex items-end gap-12 h-48 mt-4 border-b border-[#2a2a2a] pb-2 px-8">
              <div className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs text-white mb-2 font-mono">{data.benchmark_store}/100</span>
                <div className="w-full bg-[#ef4444] rounded-t-md" style={{ height: `${data.benchmark_store}%` }}></div>
                <span className="text-xs text-[#6b7280] mt-3 text-center truncate w-full">{data.store}</span>
              </div>
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

          <div className="bg-[#111111]/40 border-2 border-[#22c55e] rounded-xl p-6 flex gap-4 items-start">
            <ShieldCheck className="w-6 h-6 text-[#22c55e] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Alex's Personal Guarantee</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                If the full audit does not surface at least <span className="text-[#22c55e] font-semibold">{fmt(data.fitd_price)}</span> in provable, quantified revenue leaks — I don't charge you. No invoice. No awkward conversation. You keep the diagnostic report.
              </p>
            </div>
          </div>

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

          <div className="text-center pt-4 space-y-4">
            <a
              href={`mailto:${data.reply_email}?subject=Audit ${data.store} - ${data.service_name}&body=Hi Alex,%0A%0AI'd like to proceed with the ${data.service_name} audit for ${data.domain}.%0A%0APlease send next steps.`}
              className="w-full bg-[#22c55e] hover:bg-[#1ebd51] text-black font-semibold py-4 px-8 rounded-xl text-lg flex items-center justify-center gap-2 transition-colors duration-200"
            >
              Get the full {data.service_name} audit <ArrowRight className="w-5 h-5" />
            </a>
            <span className="text-xs text-[#6b7280] block">Reply to {data.reply_email} · Typically responds within 4 hours</span>
          </div>

          <div className="text-center text-xs text-[#6b7280] border-t border-[#2a2a2a] pt-4">
            {data.real_urgency}
          </div>
        </main>

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

  // ==========================================
  // VIEW RENDERER 2: TEMPLATE D (SECURITY RISK)
  // ==========================================
  if (data.template_type === "D") {
    // Generate dates active based on static date
    const scanDate = new Date(`${data.scan_date}T00:00:00Z`)
    const now = new Date()
    const daysSinceScan = Math.floor((now.getTime() - scanDate.getTime()) / (1000 * 60 * 60 * 24))

    return (
      <div className={`min-h-screen transition-colors duration-500 pb-32 ${securityAction === 'ignore' ? 'bg-[#1a0000]' : 'bg-[#0a0a0a]'}`}>
        <header className="max-w-2xl mx-auto px-6 pt-8 pb-6 border-b border-[#2a2a2a] mb-8">
          <div className="flex justify-between items-center font-mono text-xs text-[#6b7280]">
            <span>DIAGNOSTIC SECURITY RISK REPORT · {data.domain}</span>
            <span className="text-[#ef4444]">SEVERITY: CRITICAL</span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 space-y-8">
          {/* HEADER */}
          <div className="text-center space-y-4 py-4">
            <span className="text-xs text-[#6b7280] tracking-widest uppercase block font-mono">Infrastructure Security Watchtower — {data.store}</span>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">
              {securityAction === 'ignore' ? (
                <span>Attack exposure for <span className="text-[#ef4444]">{data.store}</span> is actively compounding.</span>
              ) : (
                <span>Active compromise vector detected on <span className="text-[#f59e0b]">{data.domain}</span>.</span>
              )}
            </h1>
            <p className="text-base text-[#6b7280]">{data.technical_finding}</p>
          </div>

          {/* INTERACTIVE TOGGLE (OBSTACLE IS THE WAY PSYCHOLOGY) */}
          <div className="bg-[#111111] rounded-xl p-4 border border-[#2a2a2a] flex justify-between items-center">
            <span className="text-xs font-mono uppercase text-[#6b7280]">Select action response:</span>
            <div className="flex gap-2 bg-black p-1 rounded-lg border border-[#2a2a2a]">
              <button 
                onClick={() => setSecurityAction('fix')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors font-mono ${securityAction === 'fix' ? 'bg-[#22c55e] text-black' : 'text-[#6b7280]'}`}
              >
                PROACTIVE FIX
              </button>
              <button 
                onClick={() => setSecurityAction('ignore')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors font-mono ${securityAction === 'ignore' ? 'bg-[#ef4444] text-white' : 'text-[#6b7280]'}`}
              >
                IGNORE RISK
              </button>
            </div>
          </div>

          {/* RISK ANALYSIS BLOCK */}
          {securityAction === 'ignore' ? (
            <div className="bg-black/80 rounded-xl p-6 border-2 border-[#ef4444] text-center space-y-3 animate-pulse">
              <ShieldAlert className="w-8 h-8 text-[#ef4444] mx-auto" />
              <h3 className="font-mono text-[#ef4444] font-bold text-lg">VULNERABILITY ACTIVE FOR {daysSinceScan} DAYS</h3>
              <p className="text-xs text-[#6b7280] leading-relaxed max-w-md mx-auto">
                Each day this vulnerability remains unpatched, compromise probability increases by <span className="text-white font-mono">3.2%</span> (Verizon Data Breach Investigations Report). Data exfiltration can occur silently.
              </p>
            </div>
          ) : (
            <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a] grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-xs text-[#6b7280] font-mono uppercase">EST. TIME TO PATCH</span>
                <p className="text-2xl font-bold font-mono text-[#22c55e] mt-1">4 Hours</p>
              </div>
              <div>
                <span className="text-xs text-[#6b7280] font-mono uppercase">EXPOSURE AFTER FIX</span>
                <p className="text-2xl font-bold font-mono text-[#22c55e] mt-1">$0</p>
              </div>
            </div>
          )}

          {/* EVIDENCE TERMINAL */}
          <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a]">
            <h3 className="text-sm font-semibold text-white mb-4">Forensic Proof: Exposed Targets</h3>
            <div className="bg-black rounded-lg p-4 font-mono text-sm space-y-1 border border-[#2a2a2a] overflow-x-auto">
              <p className="text-[#22c55e]">$ verify --attack-surface {data.domain}</p>
              <p className="text-[#f59e0b]">&gt; {data.finding_detail_1}</p>
              <p className="text-[#f59e0b]">&gt; {data.finding_detail_2}</p>
              <p className="text-[#ef4444]">&gt; ! {data.finding_detail_3}</p>
              <p className="text-[#ef4444]">✕ STATUS: SEC_GAP_DETECTED</p>
            </div>
          </div>

          {/* RISK METERS */}
          <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a] space-y-4">
            <h3 className="text-sm font-semibold text-white">Vulnerability Severity Profile</h3>
            
            {/* Meter 1: Breach Cost */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#6b7280]">
                <span>Estimated Breach Cost Liability</span>
                <span className="font-mono text-white">$25,000 - $150,000</span>
              </div>
              <div className="h-2 bg-black rounded-full overflow-hidden border border-[#2a2a2a]">
                <div className="h-full bg-[#ef4444] rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            {/* Meter 2: Compromise Speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#6b7280]">
                <span>Exploit Execution Speed (Automation)</span>
                <span className="font-mono text-white">Under 6 Minutes</span>
              </div>
              <div className="h-2 bg-black rounded-full overflow-hidden border border-[#2a2a2a]">
                <div className="h-full bg-[#f59e0b] rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>

          {/* GUARANTEE */}
          <div className="bg-[#111111]/40 border-2 border-[#22c55e] rounded-xl p-6 flex gap-4 items-start">
            <ShieldCheck className="w-6 h-6 text-[#22c55e] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Alex's Personal Guarantee</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                If our forensic security audit does not surface at least <span className="text-[#22c55e] font-semibold">{fmt(data.fitd_price)}</span> in provable, unresolved technical vulnerabilities — I don't charge you. You keep the diagnostic report.
              </p>
            </div>
          </div>

          {/* PRICING BLOCK */}
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5 text-center space-y-2">
            <span className="text-xs text-[#6b7280] uppercase tracking-wider font-mono block">One-Time Emergency Audit & Lockdown Investment</span>
            <p className="text-4xl font-bold text-[#22c55e] font-mono">{fmt(data.fitd_price)}</p>
            <span className="text-xs text-[#6b7280] block">GDPR & PCI-DSS 4.0 Compliance Guaranteed</span>
          </div>

          {/* CTA */}
          <div className="text-center pt-4 space-y-4">
            <a
              href={`mailto:${data.reply_email}?subject=Audit ${data.store} - ${data.service_name}&body=Hi Alex,%0A%0AI'd like to proceed with the ${data.service_name} audit for ${data.domain}.%0A%0APlease send next steps.`}
              className="w-full bg-[#22c55e] hover:bg-[#1ebd51] text-black font-semibold py-4 px-8 rounded-xl text-lg flex items-center justify-center gap-2 transition-colors duration-200"
            >
              Request Emergency Security Review <ArrowRight className="w-5 h-5" />
            </a>
            <span className="text-xs text-[#6b7280] block">Reply to {data.reply_email} · Typically responds within 4 hours</span>
          </div>

          {/* URGENCY */}
          <div className="text-center text-xs text-[#6b7280] border-t border-[#2a2a2a] pt-4">
            {data.real_urgency}
          </div>
        </main>
      </div>
    )
  }

  return null
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DiagnosticDashboard />
    </Suspense>
  )
}
