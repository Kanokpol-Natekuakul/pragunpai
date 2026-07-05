import { NextRequest, NextResponse } from "next/server";
import { loginStep2 } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = (formData.get("email") as string)?.trim();
  const otp = (formData.get("otp") as string)?.trim();

  if (!email || !otp) {
    return NextResponse.json({ error: "กรุณากรอกรหัส OTP" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1";

  const result = await loginStep2(email, otp, ip);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
