import { NextRequest, NextResponse } from "next/server";

// Thin server-side proxy for the one backend write a client component makes
// (the batch-creation wizard, lib/api.ts's createBatch). Everything else
// reads/writes the backend directly from server components, where
// HONEYCHAIN_API_KEY is already safe to use — this route exists purely so
// that key never has to be exposed to the browser as a NEXT_PUBLIC_ var.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_KEY = process.env.HONEYCHAIN_API_KEY;

export async function POST(request: NextRequest) {
  const body = await request.text();

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/batches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
      },
      body,
    });
  } catch {
    return NextResponse.json({ detail: "Could not reach the Honey Chain API" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
