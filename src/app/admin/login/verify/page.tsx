import { Container } from "@/components/ui/Container";

export const metadata = { title: "ยืนยัน OTP", robots: { index: false, follow: false } };

export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-50">
      <Container size="prose">
        <div className="rounded-xl border border-navy-100 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-navy-800">ยืนยนตัวตนด้วย OTP</h1>
            <p className="mt-1 text-sm text-navy-500">
              รหัส OTP ถูกส่งไปที่อีเมลของคุณแล้ว (หมดอายุใน 10 นาที)
            </p>
          </div>
          <form id="otp-form" action="/api/auth/login-step2" method="POST">
            <input type="hidden" name="email" id="email-field" />
            <div className="mb-4">
              <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-navy-700">
                รหัส OTP (6 หลัก)
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                autoFocus
                placeholder="123456"
                className="w-full rounded-lg border border-navy-200 bg-white px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
            >
              ยืนยันรหัส OTP
            </button>
          </form>
          <p className="mt-3 text-center text-sm">
            <a href="/admin/login" className="text-navy-500 hover:text-navy-700">
              กลับหน้าเข้าสู่ระบบ
            </a>
          </p>
        </div>
      </Container>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Fill email from step 1 (stored in sessionStorage)
            const email = sessionStorage.getItem('otp_email');
            if (email) document.getElementById('email-field').value = email;
          `,
        }}
      />
    </div>
  );
}
