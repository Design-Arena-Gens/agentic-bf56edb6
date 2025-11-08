"use client";

import { useEffect, useState } from "react";

type Signal = {
  symbol: string;
  timeframe: string;
  action: "BUY" | "SELL" | "HOLD";
  entry?: number;
  stopLoss?: number;
  takeProfit?: number;
  confidence?: number;
  rationale?: string;
  timestamp: string;
};

export default function HomePage() {
  const [symbol, setSymbol] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("H1");
  const [loading, setLoading] = useState(false);
  const [signal, setSignal] = useState<Signal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSignal = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/signal?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to get signal");
      setSignal(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main>
      <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <div style={{ background: '#121a2b', border: '1px solid #263042', borderRadius: 8, padding: 16 }}>
          <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom: 12 }}>
            <input value={symbol} onChange={e=>setSymbol(e.target.value)} placeholder="Symbol (e.g. EURUSD)" style={{ background:'#0b1220', color:'#e6edf3', border:'1px solid #263042', borderRadius:6, padding:'8px 12px' }} />
            <select value={timeframe} onChange={e=>setTimeframe(e.target.value)} style={{ background:'#0b1220', color:'#e6edf3', border:'1px solid #263042', borderRadius:6, padding:'8px 12px' }}>
              {['M15','M30','H1','H4','D1'].map(tf => <option key={tf} value={tf}>{tf}</option>)}
            </select>
            <button onClick={fetchSignal} disabled={loading} style={{ background:'#1976d2', color:'#fff', border:'none', borderRadius:6, padding:'10px 14px', cursor:'pointer' }}>{loading ? 'Analyzing?' : 'Analyze with Gemini'}</button>
          </div>
          {error && <p style={{ color:'#ff8080' }}>{error}</p>}
          {signal && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
              <div style={{ background:'#0b1220', padding:12, border:'1px solid #263042', borderRadius:6 }}>
                <div style={{ opacity:0.7, fontSize:12 }}>Action</div>
                <div style={{ fontSize:18, fontWeight:600 }}>{signal.action}</div>
              </div>
              <div style={{ background:'#0b1220', padding:12, border:'1px solid #263042', borderRadius:6 }}>
                <div style={{ opacity:0.7, fontSize:12 }}>Confidence</div>
                <div style={{ fontSize:18, fontWeight:600 }}>{Math.round((signal.confidence ?? 0) * 100)}%</div>
              </div>
              <div style={{ background:'#0b1220', padding:12, border:'1px solid #263042', borderRadius:6 }}>
                <div style={{ opacity:0.7, fontSize:12 }}>Time</div>
                <div style={{ fontSize:18, fontWeight:600 }}>{new Date(signal.timestamp).toLocaleString()}</div>
              </div>
              <div style={{ background:'#0b1220', padding:12, border:'1px solid #263042', borderRadius:6 }}>
                <div style={{ opacity:0.7, fontSize:12 }}>Entry</div>
                <div style={{ fontSize:18, fontWeight:600 }}>{signal.entry ?? '-'}</div>
              </div>
              <div style={{ background:'#0b1220', padding:12, border:'1px solid #263042', borderRadius:6 }}>
                <div style={{ opacity:0.7, fontSize:12 }}>Stop Loss</div>
                <div style={{ fontSize:18, fontWeight:600 }}>{signal.stopLoss ?? '-'}</div>
              </div>
              <div style={{ background:'#0b1220', padding:12, border:'1px solid #263042', borderRadius:6 }}>
                <div style={{ opacity:0.7, fontSize:12 }}>Take Profit</div>
                <div style={{ fontSize:18, fontWeight:600 }}>{signal.takeProfit ?? '-'}</div>
              </div>
            </div>
          )}
          {signal?.rationale && (
            <div style={{ marginTop: 16, background:'#0b1220', padding:12, border:'1px solid #263042', borderRadius:6 }}>
              <div style={{ opacity:0.7, fontSize:12, marginBottom:6 }}>Rationale</div>
              <div style={{ whiteSpace:'pre-wrap' }}>{signal.rationale}</div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
