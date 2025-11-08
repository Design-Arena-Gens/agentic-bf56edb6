import { NextRequest, NextResponse } from "next/server";
import { generateSignal } from "@lib/gemini";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = (searchParams.get("symbol") || "EURUSD").toUpperCase();
    const timeframe = searchParams.get("timeframe") || "H1";

    const signal = await generateSignal({ symbol, timeframe });

    return NextResponse.json({
      ...signal,
      timestamp: new Date().toISOString(),
    }, { status: 200, headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const symbol = (body.symbol || "EURUSD").toUpperCase();
    const timeframe = body.timeframe || "H1";

    const signal = await generateSignal({ symbol, timeframe });

    return NextResponse.json({
      ...signal,
      timestamp: new Date().toISOString(),
    }, { status: 200, headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500, headers: corsHeaders() });
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
