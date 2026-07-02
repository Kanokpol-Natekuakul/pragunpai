"use client";

import { useState, useTransition } from "react";
import { actionUpdateProfile, actionChangePassword } from "@/actions/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface AccountSettingsEditorProps {
  initialName: string;
  initialEmail: string;
}

export function AccountSettingsEditor({
  initialName,
  initialEmail,
}: AccountSettingsEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile Form States
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);

      const res = await actionUpdateProfile(null, formData);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.success) {
        setSuccessMsg("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว");
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      const res = await actionChangePassword(null, formData);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.success) {
        setSuccessMsg("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Messages */}
      {successMsg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium px-4 py-3 shadow-sm transition-all duration-300 animate-fadeIn">
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 font-medium px-4 py-3 shadow-sm transition-all duration-300 animate-fadeIn">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="p-6 bg-white border border-gray-200 flex flex-col justify-between">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h2 className="text-base font-bold text-navy-800 border-b border-gray-100 pb-3 mb-2 flex items-center justify-between">
              <span>👤 ข้อมูลส่วนตัว (Profile Info)</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
                  ชื่อผู้ใช้งาน
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อ-นามสกุล หรือชื่อเรียก"
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-medium text-navy-800 placeholder:text-navy-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
                  อีเมล (ใช้เป็นบัญชีเข้าสู่ระบบ)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pragunpai.com"
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-medium text-navy-800 placeholder:text-navy-300"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-50">
              <Button
                type="submit"
                disabled={isPending}
                variant="primary"
                className="text-xs py-2 px-6 font-semibold cursor-pointer"
              >
                {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูลส่วนตัว"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card className="p-6 bg-white border border-gray-200 flex flex-col justify-between">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <h2 className="text-base font-bold text-navy-800 border-b border-gray-100 pb-3 mb-2 flex items-center justify-between">
              <span>🔑 เปลี่ยนรหัสผ่าน (Change Password)</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
                  รหัสผ่านปัจจุบัน
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-medium text-navy-800 placeholder:text-navy-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
                  รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-medium text-navy-800 placeholder:text-navy-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-medium text-navy-800 placeholder:text-navy-300"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-50">
              <Button
                type="submit"
                disabled={isPending}
                variant="accent"
                className="text-xs py-2 px-6 font-semibold cursor-pointer"
              >
                {isPending ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
