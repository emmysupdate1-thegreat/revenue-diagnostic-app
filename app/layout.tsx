export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Inject Tailwind CSS Compiler */}
        <script src="https://cdn.tailwindcss.com" async></script>
        
        {/* Safe Vector Green-Dot Favicon (Zero-File Bypass) */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2235%22 fill=%22%2322c55e%22/></svg>" />
        
        {/* Inject Premium Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
        
        <title>Revenue Signal Intelligence — Diagnostic</title>
        
        {/* Global Styles Fallback */}
        <style>{`
          body {
            font-family: 'Inter', sans-serif !important;
            background-color: #0a0a0a !important;
            color: #ffffff !important;
            margin: 0;
          }
          .font-mono {
            font-family: 'JetBrains Mono', monospace !important;
          }
        `}</style>
      </head>
      <body className="bg-[#0a0a0a] text-white font-sans">{children}</body>
    </html>
  )
}
