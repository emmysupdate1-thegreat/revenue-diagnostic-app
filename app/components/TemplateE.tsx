import React, { useState, useEffect } from 'react'
import { ShieldCheck, CheckCircle2, ChevronDown, ShieldAlert } from 'lucide-react'

export default function TemplateE({ data, fmt, handleCTA }: { data: any, fmt: (n: number) => string, handleCTA: () => void }) {
  const [openScope, setOpenScope] = useState<number | null>(null)
  const [showDark, setShowDark] = useState(false)
  const [displayScore, setDisplayScore] = useState(0)

  // Animate the Health Score Gauge
  useEffect(() => {
    const timer = setTimeout(() => setDisplayScore(data.score_current || 48), 500)
    return () => clearTimeout(timer)
  }, [data])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased pb-32">
      {/* HEADER */}
      <header className="max-w-2xl mx-auto px-6 pt-8 pb-6 mb-2 flex justify-between font-mono text-xs text-[#6b7280]">
        <span>INTELLIGENCE BRIEFING · {data.domain}</span>
        <span>REF: {data.account_ref}</span>
      </header>

      {/* VICTORY BANNER (GREEN SAVED COUNTER) */}
      <div className="bg-[#052010] border-b border-[#22c55e] px-6 py-8 mb-8 shadow-[0_4px_30px_rgba(34,197,94,0.1)]">
        <div className="max-w-2xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div>
            <span className="text-xs text-[#22c55e] uppercase tracking-widest font-mono mb-2 block">Revenue secured since {data.fix_date_str}</span>
            <div className="font-mono text-4xl md:text-5xl font-bold text-[#22c55e]">{fmt(data.fitd1_annual_saved)}/yr</div>
            <p className="text-sm text-[#6b7280] mt-2 border-l-2 border-[#22c55e] pl-3">
              {data.fitd1_service} <strong className="text-white">neutralized</strong>.
            </p>
          </div>
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-[#22c55e] mx-auto mb-1" />
            <span className="text-xs text-[#22c55e] font-mono tracking-widest">SECURED</span>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 space-y-6">
        
        {/* REVENUE HEALTH SCORE */}
        <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a] grid grid-cols-2 gap-8 items-center">
          <div className="text-center flex flex-col items-center">
            <h3 className="text-sm font-semibold text-white mb-4">Current Health Score</h3>
            <div className="relative w-32 h-32 rounded-full border-[8px] border-[#1f1f1f] flex items-center justify-center">
              <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="351" strokeDashoffset={351 - (351 * displayScore) / 100} className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="text-3xl font-bold font-mono text-[#f59e0b]">{displayScore}</div>
            </div>
            <p className="text-xs text-[#6b7280] mt-4">{data.risks?.length || 3} signals still unmonitored</p>
          </div>

          <div className="bg-[#1a2a1a] border border-[#22c55e] rounded-xl p-5 text-center">
            <span className="text-xs text-[#22c55e] uppercase font-mono tracking-wide mb-2 block">With Retainer Guard</span>
            <div className="text-4xl font-bold font-mono text-[#22c55e]">89/100</div>
            <div className="w-full bg-[#111111] h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#22c55e] h-full w-[89%]"></div>
            </div>
            <p className="text-xs text-[#6b7280] mt-3">41-point infrastructure uplift</p>
          </div>
        </div>

        {/* OPEN RISKS */}
        <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a]">
          <div className="flex justify-between items-center mb-6 border-b border-[#2a2a2a] pb-4">
            <h3 className="text-sm font-semibold text-white">Signals still open</h3>
            <span className="text-xs text-[#ef4444] font-mono animate-pulse">ACTION REQUIRED</span>
          </div>
          <div className="space-y-4">
            {data.risks?.map((risk: any, i: number) => (
              <div key={i} className="flex justify-between items-center bg-black p-4 rounded-lg border border-[#2a2a2a]">
                <div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${risk.severity === 'CRITICAL' ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'}`}>
                    {risk.severity}
                  </span>
                  <p className="text-sm font-bold text-white mt-2">{risk.name}</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-bold ${risk.severity === 'CRITICAL' ? 'text-[#ef4444]' : 'text-[#f59e0b]'}`}>{fmt(risk.monthly_risk)}/mo</p>
                  <p className="text-[10px] text-[#6b7280] uppercase">Unmonitored Risk</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* THE PROTECTION MATH */}
        <div className="bg-[#0f1a0f] border border-[#22c55e] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-5">The Protection Math</h3>
          <div className="space-y-4 font-mono">
            <div className="flex justify-between border-b border-[#2a2a2a] pb-3">
              <span className="text-sm text-[#6b7280]">Annual revenue protected</span>
              <span className="text-lg font-bold text-[#22c55e]">{fmt(data.total_protected_annual || 78336)}</span>
            </div>
            <div className="flex justify-between border-b border-[#2a2a2a] pb-3">
              <span className="text-sm text-[#6b7280]">Annual monitoring investment</span>
              <span className="text-lg font-bold text-[#9ca3af]">{fmt((data.retainer_price || 1500) * 12)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-sm font-semibold text-white">Protection ratio</span>
              <span className="text-2xl font-bold text-[#22c55e]">{data.protection_ratio || "4.35"} : 1</span>
            </div>
          </div>
        </div>

        {/* WHAT HAPPENS IF THEY CANCEL */}
        <div className="bg-[#111111] rounded-xl p-6 border border-[#2a2a2a]">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowDark(!showDark)}>
            <h3 className="text-sm font-semibold text-white">What happens without activating monitoring?</h3>
            <ChevronDown className={`w-5 h-5 text-[#6b7280] transition-transform ${showDark ? 'rotate-180' : ''}`} />
          </div>
          {showDark && (
            <div className="mt-4 pt-4 border-t border-[#2a2a2a] space-y-4">
              <p className="text-xs text-[#6b7280] mb-4">Monitoring does not run passively. Without activation, the following timeline applies:</p>
              {data.dark_timeline?.map((item: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                    {i !== data.dark_timeline.length - 1 && <div className="w-[1px] h-full bg-[#2a2a2a] my-1"></div>}
                  </div>
                  <div className="pb-4">
                    <span className="text-[10px] font-mono text-[#ef4444] bg-[#ef4444]/10 px-2 py-0.5 rounded">{item.day}</span>
                    <p className="text-sm text-white mt-1">{item.event}</p>
                    <p className="text-xs text-[#6b7280] mt-0.5">{item.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-8 text-center mt-8">
          <span className="text-xs text-[#22c55e] bg-[#22c55e]/10 px-3 py-1 rounded-full font-mono mb-4 inline-block">REVENUE SIGNAL GUARD</span>
          <div className="font-mono text-5xl font-bold text-white mb-2">{fmt(data.retainer_price || 1500)} <span className="text-lg text-[#6b7280]">/mo</span></div>
          <p className="text-sm text-[#6b7280] mb-8">Cancel anytime. 72-hour threat detection guarantee.</p>
          
          <button onClick={handleCTA} className="w-full bg-[#22c55e] hover:bg-[#1ebd51] text-black font-bold py-4 rounded-xl transition-colors cursor-pointer text-lg shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            Continue protecting {data.store} →
          </button>
        </div>
      </main>
    </div>
  )
}
