'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

// Synchronized Casing and Codenames
import TemplateA from './components/templateA'
import TemplateB from './components/templateB'
import TemplateC from './components/templateC'
import TemplateE from './components/templateE'
import TemplateF from './components/templateF'
import TemplateG from './components/templateG'
import TemplateJ from './components/templateJ'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-mono text-sm text-[#6b7280]">
      <div className="w-4 h-4 rounded-full bg-[#22c55e] animate-ping mb-4"></div>
      LOADING DIAGNOSTIC PAYLOAD...
    </div>
  )
}

function ErrorScreen({ code }: { code: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#0a0a0a]">
      <h1 className="text-6xl font-bold font-mono text-[#ef4444] mb-4">ERR</h1>
      <h2 className="text-xl font-bold text-white mb-2">Diagnostic Expired or Invalid</h2>
      <p className="text-[#6b7280] text-sm">CODE: {code}. Please contact your audit consultant.</p>
    </div>
  )
}

function Dashboard() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

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

  if (error) return <ErrorScreen code={error} />
  if (!data) return <div className="min-h-screen flex items-center justify-center text-[#22c55e] font-mono animate-pulse bg-[#0a0a0a]">DECRYPTING PAYLOAD...</div>

  // Universal Currency Formatter (Natively fixes Comma vs. Full Stop based on currency)
  const fmt = (n: number) => {
    const c = data.currency || 'USD'
    return new Intl.NumberFormat(c === 'EUR' ? 'de-DE' : 'en-US', { 
      style: 'currency', 
      currency: c, 
      maximumFractionDigits: 0 
    }).format(n)
  }
  
  // Tally.so Link
  const tallyLink = `https://tally.so/r/aQzvEZ?store=${encodeURIComponent(data.store || '')}&domain=${encodeURIComponent(data.domain || '')}&coi=${data.monthly_coi || 0}`
  const handleCTA = () => window.location.assign(tallyLink)

  // ROUTER (Passes both onCTA and handleCTA props to neutralize Claude's naming bugs)
  if (data.template_type === "A") return <TemplateA data={data} fmt={fmt} onCTA={handleCTA} handleCTA={handleCTA} />
  if (data.template_type === "B") return <TemplateB data={data} fmt={fmt} onCTA={handleCTA} handleCTA={handleCTA} />
  if (data.template_type === "C") return <TemplateC data={data} fmt={fmt} onCTA={handleCTA} handleCTA={handleCTA} />
  if (data.template_type === "E") return <TemplateE data={data} fmt={fmt} onCTA={handleCTA} handleCTA={handleCTA} />
  if (data.template_type === "F") return <TemplateF data={data} fmt={fmt} onCTA={handleCTA} handleCTA={handleCTA} />
  if (data.template_type === "G") return <TemplateG data={data} fmt={fmt} onCTA={handleCTA} handleCTA={handleCTA} />
  if (data.template_type === "J") return <TemplateJ data={data} fmt={fmt} onCTA={handleCTA} handleCTA={handleCTA} />

  return <ErrorScreen code="TEMPLATE_NOT_FOUND" />
}

export default function Page() {
  return <Suspense fallback={<LoadingScreen />}><Dashboard /></Suspense>
}
