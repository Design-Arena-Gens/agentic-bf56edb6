import { GoogleGenerativeAI } from "@google/generative-ai";

export type GeminiSignal = {
  symbol: string;
  timeframe: string;
  action: "BUY" | "SELL" | "HOLD";
  entry?: number;
  stopLoss?: number;
  takeProfit?: number;
  confidence?: number; // 0..1
  rationale?: string;
};

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-pro";

function safeParseJSON(text: string): any | null {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end >= start) {
      return JSON.parse(text.substring(start, end + 1));
    }
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function generateSignal(params: { symbol: string; timeframe: string }): Promise<GeminiSignal> {
  const { symbol, timeframe } = params;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_API_KEY env var");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `You are an institutional-grade FX trading system. Analyze ${symbol} on timeframe ${timeframe} using broadly-accepted TA (trend, momentum, volatility, S/R, chart patterns) and current macro narratives. Output STRICT JSON only with keys: action (BUY|SELL|HOLD), entry (number), stopLoss (number), takeProfit (number), confidence (0..1), rationale (short). Entry must be a realistic current spot price area for ${symbol}. Ensure stopLoss and takeProfit give R:R >= 1.5 when action is BUY or SELL. If no clear edge, use HOLD and omit entry/SL/TP.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = safeParseJSON(text);

  // Fallback in case model returns non-JSON
  if (!parsed || typeof parsed !== "object") {
    return {
      symbol,
      timeframe,
      action: "HOLD",
      confidence: 0,
      rationale: "Model response unparseable; defaulting to HOLD.",
    };
  }

  const action = (parsed.action || "HOLD").toString().toUpperCase();
  const entry = parsed.entry != null ? Number(parsed.entry) : undefined;
  const stopLoss = parsed.stopLoss != null ? Number(parsed.stopLoss) : undefined;
  const takeProfit = parsed.takeProfit != null ? Number(parsed.takeProfit) : undefined;
  const confidence = parsed.confidence != null ? Math.max(0, Math.min(1, Number(parsed.confidence))) : undefined;
  const rationale = parsed.rationale ? String(parsed.rationale) : undefined;

  const signal: GeminiSignal = {
    symbol,
    timeframe,
    action: action === "BUY" || action === "SELL" ? action : "HOLD",
    entry,
    stopLoss,
    takeProfit,
    confidence,
    rationale,
  };

  return signal;
}
