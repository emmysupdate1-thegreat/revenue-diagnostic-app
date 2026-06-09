export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com" async></script>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2235%22 fill=%22%2322c55e%22/></svg>" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <title>Revenue Signal Intelligence</title>
        <style>{`body { font-family: 'Inter', sans-serif !important; background-color: #0a0a0a !important; color: #ffffff !important; margin: 0; } .font-mono { font-family: 'JetBrains Mono', monospace !important; }`}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
