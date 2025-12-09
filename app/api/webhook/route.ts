import { NextResponse } from "next/server";
import type { Update } from "telegraf/types";
import { handleUpdate } from "@/bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const update = (await request.json()) as Update;
    await handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
