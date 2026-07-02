import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "หลังบ้าน",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Admin top bar */}
      <header className="border-b border-gray-200 bg-white">
        <Container size="wide" className="flex h-14 items-center justify-between">
          <a href="/admin/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-600 text-white text-sm font-bold">
              P
            </span>
            <span className="font-semibold text-navy-800">
              {siteConfig.name} Admin
            </span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href="/admin/account"
              className="text-sm text-navy-600 hover:text-navy-800"
            >
              บัญชี
            </a>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-red-600 hover:text-red-700"
              >
                ออกจากระบบ
              </button>
            </form>
          </div>
        </Container>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
