import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = (formData.get("token") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password || !confirmPassword) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" },
      { status: 400 },
    );
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "รหัสผ่านไม่ตรงกัน" }, { status: 400 });
  }

  const result = await resetPassword(token, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
