'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ShieldCheck, ArrowRight, ShieldAlert } from 'lucide-react'

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
function ErrorScreen({ code }: { code: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold font-mono text-[#ef4444] mb-4">ERR</h1>
      <h2 className="text-xl font-bold text-white mb-2">Diagnostic Expired or Invalid</h2>
      <p className="text-[#6b7280] text-sm">CODE: {code}. Please contact your audit consultant.</p>
    </div>
  )
}

// 3. Interactive Diagnostic Dashboard
function Dashboard() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [counter, setCounter] = useState(0)
  const [securityAction, setSecurityAction] = useState<'fix'|'ignore'>('fix')

  useEffect(() => {
    try {
      const payload = searchParams.get('payload')
      if (!payload) return setError("NO_PAYLOAD")
      
      const cleanPayload = payload.replace(/ /g, '+')
      const parsed = JSON.parse(decodeURIComponent(escape(atob(cleanPayload))))
      setData(parsed)
    } catch (e) {
      setError("PAYLOAD_DECODE_FAILURE")
    }
  }, [searchParams])

  useEffect(() => {
    if (!data || data.template_type !== "A") return
    
    // Anchor counter to historic scan date
    const scanDate = new Date(`${data.scan_date}T00:00:00Z`)
    const now = new Date()
    const elapsedSeconds = Math.floor((now.getTime() - scanDate.getTime()) / 1000)
    const lossPerSecond = data.monthly_coi / 30 / 24 / 3600

    setCounter(Math.max(0, elapsedSeconds * lossPerSecond))

    const interval = setInterval(() => {
      setCounter(prev => prev + lossPerSecond)
    }, 1000)
    return () => clearInterval(interval)
  }, [data])

  if (error) return <ErrorScreen code={error} />
  if (!data) return <div className="min-h-screen flex items-center justify-center text-[#22c55e] font-mono animate-pulse">DECRYPTING PAYLOAD...</div>

  // Elite Currency Formatter (Handles EUR vs USD correctly)
  const fmt = (n: number) => {
    const c = data.currency || 'USD'
    return new Intl.NumberFormat(c === 'EUR' ? 'de-DE' : 'en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n)
  }
  const fmtLive = (n: number) => {
    const c = data.currency || 'USD'
    return new Intl.NumberFormat(c === 'EUR' ? 'de-DE' : 'en-US', { style: 'currency', currency: c, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
  }

  // Dynamic Tally.so URL with auto-filled Hidden Fields
  const tallyLink = `https://tally.so/r/aQzvEZ?store=${encodeURIComponent(data.store)}&domain=${encodeURIComponent(data.domain)}&coi=${data.monthly_coi}`

  // =====================================
  // TEMPLATE A: REVENUE LEAK (Silent Bleed)
  // =====================================
  if (data.template_type === "A") {
    return (
      <div className="min-h-screen pb-32">
        <header className="max-w-2xl mx-auto px-6 pt-8 pb-6 border-b border-[#2a2a2a] mb-8 font-mono text-xs text-[#6b7280] flex justify-between">
          <span>DIAGNOSTIC · {data.domain}</span>
          <span>REF: GHO-{data.service_id}</span>
        </header>
        
        <main className="max-w-2xl mx-auto px-6 space-y-6">
          <div className="text-center pb-4">
            <h1 className="text-3xl font-bold mb-3">We found <span className="text-[#ef4444]">{fmt(data.annual_coi)}</span> leaving {data.store} every year.</h1>
            <p className="text-[#6b7280]">{data.technical_finding}</p>
          </div>

          <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a]">
            <span className="text-xs font-mono text-[#6b7280] uppercase mb-2 block">Revenue leaving {data.store} since scan</span>
            <div className="font-mono text-5xl font-bold text-[#ef4444]">{fmtLive(counter)}</div>
            <p className="text-sm text-[#6b7280] mt-2">Running at {fmt(data.daily_coi)} per day</p>
          </div>

          <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a]">
            <h3 className="text-sm font-semibold mb-4">Forensic Proof</h3>
            <div className="bg-black p-4 rounded-lg font-mono text-xs space-y-1 border border-[#2a2a2a]">
              <p className="text-[#22c55e]">$ scan {data.domain} --protocol zero-trust</p>
              <p className="text-[#f59e0b]">&gt; {data.finding_detail_1}</p>
              <p className="text-[#ef4444]">&gt; ! {data.finding_detail_2}</p>
              <p className="text-[#22c55e]">✓ Detection: {data.service_id}</p>
            </div>
            <p className="text-xs text-[#6b7280] mt-3">Translation: {data.plain_english}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111111] border border-[#2a2a2a] p-5 rounded-xl">
              <span className="text-[10px] text-[#6b7280] uppercase font-mono">Monthly Loss</span>
              <p className="text-2xl font-bold text-[#ef4444] font-mono mt-1">{fmt(data.monthly_coi)}</p>
            </div>
            <div className="bg-[#111111] border border-[#22c55e] p-5 rounded-xl">
              <span className="text-[10px] text-[#6b7280] uppercase font-mono">Fix Investment</span>
              <p className="text-2xl font-bold text-[#22c55e] font-mono mt-1">{fmt(data.fitd_price)}</p>
            </div>
          </div>

          <div className="bg-[#111111]/40 border border-[#22c55e] rounded-xl p-5 flex gap-4">
            <ShieldCheck className="w-6 h-6 text-[#22c55e] flex-shrink-0" />
            <p className="text-sm text-[#6b7280]">
              <strong className="text-white">Alex's Guarantee:</strong> If the full audit doesn't surface at least {fmt(data.fitd_price * 3)} in recoverable revenue, you pay nothing. I eat the cost.
            </p>
          </div>

          <a href={tallyLink} target="_blank" className="w-full block text-center bg-[#22c55e] hover:bg-[#1ebd51] text-black font-bold py-4 rounded-xl transition-colors">
            Stop the Revenue Bleed →
          </a>
        </main>
      </div>
    )
  }

  // =====================================
  // TEMPLATE D: SECURITY RISK (Open Door)
  // =====================================
  if (data.template_type === "D") {
    return (
      <div className={`min-h-screen pb-32 transition-colors duration-500 ${securityAction === 'ignore' ? 'bg-[#1a0000]' : 'bg-[#0a0a0a]'}`}>
        <header className="max-w-2xl mx-auto px-6 pt-8 pb-6 border-b border-[#2a2a2a] mb-8 font-mono text-xs flex justify-between">
          <span className="text-[#6b7280]">SECURITY WATCHTOWER · {data.domain}</span>
          <span className="text-[#ef4444]">SEVERITY: CRITICAL</span>
        </header>

        <main className="max-w-2xl mx-auto px-6 space-y-6">
          <div className="text-center pb-4">
            <h1 className="text-3xl font-bold mb-3">Active compromise vector detected on <span className="text-[#f59e0b]">{data.store}</span>.</h1>
            <p className="text-[#6b7280]">{data.technical_finding}</p>
          </div>

          <div className="bg-[#111111] rounded-xl p-4 border border-[#2a2a2a] flex justify-between items-center">
            <span className="text-xs font-mono uppercase text-[#6b7280]">Select action response:</span>
            <div className="flex gap-2 bg-black p-1 rounded-lg border border-[#2a2a2a]">
              <button onClick={() => setSecurityAction('fix')} className={`px-4 py-1.5 rounded-md text-xs font-bold font-mono ${securityAction === 'fix' ? 'bg-[#22c55e] text-black' : 'text-[#6b7280]'}`}>PROACTIVE FIX</button>
              <button onClick={() => setSecurityAction('ignore')} className={`px-4 py-1.5 rounded-md text-xs font-bold font-mono ${securityAction === 'ignore' ? 'bg-[#ef4444] text-white' : 'text-[#6b7280]'}`}>IGNORE RISK</button>
            </div>
          </div>

          {securityAction === 'ignore' ? (
            <div className="bg-black/80 rounded-xl p-6 border-2 border-[#ef4444] text-center animate-pulse">
              <ShieldAlert className="w-8 h-8 text-[#ef4444] mx-auto mb-3" />
              <h3 className="font-mono text-[#ef4444] font-bold">VULNERABILITY REMAINS ACTIVE</h3>
              <p className="text-xs text-[#6b7280] mt-2">Each day this remains unpatched, compromise probability increases. Data exfiltration can occur silently.</p>
            </div>
          ) : (
            <div className="bg-[#111111] border border-[#2a2a2a] p-5 rounded-xl text-center">
              <span className="text-[10px] text-[#6b7280] uppercase font-mono">One-Time Emergency Lockdown</span>
              <p className="text-3xl font-bold text-[#22c55e] font-mono mt-1">{fmt(data.fitd_price)}</p>
            </div>
          )}

          <a href={tallyLink} target="_blank" className="w-full block text-center bg-[#22c55e] hover:bg-[#1ebd51] text-black font-bold py-4 rounded-xl transition-colors">
            Request Emergency Security Review →
          </a>
        </main>
      </div>
    )
  }

  return null
}

export default function Page() {
  return <Suspense fallback={<LoadingScreen />}><Dashboard /></Suspense>
}
