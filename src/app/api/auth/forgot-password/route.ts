import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return NextResponse.json({ error: "กรุณากรอกอีเมล" }, { status: 400 });
  }

  const result = await requestPasswordReset(email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
