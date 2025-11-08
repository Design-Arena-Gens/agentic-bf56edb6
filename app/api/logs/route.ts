import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Minimal in-memory buffer (ephemeral on serverless). For production use a DB.
const MAX_LOGS = 200;
let logs: any[] = [];

export async function GET() {
  return NextResponse.json({ logs }, { status: 200, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = { ...body, receivedAt: new Date().toISOString() };
    logs.unshift(record);
    if (logs.length > MAX_LOGS) logs = logs.slice(0, MAX_LOGS);
    return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Invalid payload" }, { status: 400, headers: corsHeaders() });
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
