export const metadata = {
  title: "Agentic FX Trader",
  description: "Autonomous FX signals powered by Gemini",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
        background: '#0b1220',
        color: '#e6edf3'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
          <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 24 }}>Agentic FX Trader</h1>
            <a href="/" style={{ color:'#9ecbff', textDecoration:'none' }}>Dashboard</a>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
