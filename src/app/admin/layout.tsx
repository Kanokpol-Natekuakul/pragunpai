import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: `ระบบหลังบ้าน | ${siteConfig.name}`,
    template: `%s | ระบบหลังบ้าน | ${siteConfig.name}`,
  },
  robots: { index: false, follow: false },
};

const navItems = [
  { label: "แดชบอร์ด", href: "/admin/dashboard", icon: "📊" },
  { label: "จัดการ Lead", href: "/admin/leads", icon: "👥" },
  { label: "จัดการหน้าประกัน", href: "/admin/insurance-pages", icon: "📋" },
  { label: "คุ้มครอง พ.ร.บ.", href: "/admin/car-act-coverage", icon: "🛡️" },
  { label: "จัดการบทความ", href: "/admin/articles", icon: "✍️" },
  { label: "จัดการ SEO", href: "/admin/seo", icon: "🔍" },
  { label: "ตั้งค่าเว็บไซต์", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-navy-800">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-navy-950 bg-navy-900 text-white md:flex z-20">
        {/* Sidebar Header */}
        <div className="flex h-16 items-center gap-2 border-b border-navy-800 px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-base shadow-sm">
            P
          </span>
          <div className="flex flex-col">
            <span className="font-bold tracking-wide leading-none">{siteConfig.name}</span>
            <span className="text-[10px] text-navy-300 font-semibold tracking-wider uppercase mt-0.5">Admin Control</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-navy-100 transition-colors hover:bg-navy-800 hover:text-white"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-navy-800 p-4">
          <a
            href="/admin/account"
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-navy-200 hover:bg-navy-800 hover:text-white"
          >
            <span>👤</span>
            <span>ตั้งค่าบัญชี</span>
          </a>
          <form action="/api/auth/logout" method="POST" className="mt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm font-medium text-red-400 hover:bg-navy-800 hover:text-red-300 cursor-pointer"
            >
              <span>🚪</span>
              <span>ออกจากระบบ</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 md:hidden">
          <a href="/admin/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-600 text-white font-bold text-sm">
              P
            </span>
            <span className="font-bold text-navy-800">{siteConfig.name} Admin</span>
          </a>
          
          <div className="flex items-center gap-4">
            <a href="/admin/account" className="text-sm font-medium text-navy-600">
              บัญชี
            </a>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-sm font-medium text-red-600 cursor-pointer">
                ออก
              </button>
            </form>
          </div>
        </header>

        {/* Mobile Navigation Bar */}
        <nav className="flex items-center overflow-x-auto bg-navy-800 text-white px-4 py-2.5 md:hidden border-b border-navy-950 scrollbar-none">
          <div className="flex gap-2 whitespace-nowrap">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-full bg-navy-750 px-3.5 py-1 text-xs font-semibold text-navy-100 hover:bg-navy-700 hover:text-white"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
