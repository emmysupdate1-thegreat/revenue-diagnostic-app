'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import TemplateA from './components/templateA'

function Dashboard() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    try {
      const payload = searchParams.get('payload')
      if (!payload) return;
      // Flawless UTF-8 Decoding
      const parsed = JSON.parse(decodeURIComponent(escape(atob(payload.replace(/ /g, '+')))))
      setData(parsed)
    } catch (e) {
      console.error(e)
    }
  }, [searchParams])

  if (!data) return <div className="min-h-screen flex items-center justify-center text-[#22c55e] font-mono animate-pulse bg-[#0a0a0a]">DECRYPTING PAYLOAD...</div>

  const fmt = (n: number) => new Intl.NumberFormat(data.currency === 'EUR' ? 'de-DE' : 'en-US', { style: 'currency', currency: data.currency || 'USD', maximumFractionDigits: 0 }).format(n)
  
  const tallyLink = `https://tally.so/r/aQzvEZ?store=${encodeURIComponent(data.store || '')}&domain=${encodeURIComponent(data.domain || '')}&coi=${data.monthly_coi || 0}`
  const handleCTA = () => window.location.assign(tallyLink)

  if (data.template_type === "A") return <TemplateA data={data} fmt={fmt} onCTA={handleCTA} />

  return <div className="text-white text-center pt-20">Template Not Found</div>
}

export default function Page() {
  return <Suspense><Dashboard /></Suspense>
}
