import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  console.log(session.user)

  return NextResponse.json({ ok: true });
}