import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ income: 0, expense: 0, net: 0, trend: [] });
}
