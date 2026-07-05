"use client";

import { useState, useTransition } from "react";
import { updateSiteSettingAction } from "@/actions/settings";
import { uploadImageAction } from "@/actions/uploads";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface ContactVal {
  phone?: string;
  phoneDisplay?: string;
  line?: string;
  lineUrl?: string;
  email?: string;
}

export interface NapVal {
  name?: string;
  phone?: string;
  email?: string;
  addressRegion?: string;
  addressCountry?: string;
}

export interface HeroVal {
  headline?: string;
  subheadline?: string;
  ctaPrimary?: { label?: string; href?: string };
  ctaSecondary?: { label?: string; href?: string };
}

export interface FloatingButtonsVal {
  phone?: boolean;
  line?: boolean;
  quote?: boolean;
}

interface SiteSettingsEditorProps {
  contactVal: ContactVal | null;
  napVal: NapVal | null;
  heroVal: HeroVal | null;
  floatingButtonsVal: FloatingButtonsVal | null;
  logoConfigVal: { logoUrl?: string; faviconUrl?: string } | null;
}

export function SiteSettingsEditor({
  contactVal,
  napVal,
  heroVal,
  floatingButtonsVal,
  logoConfigVal,
}: SiteSettingsEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Logo and Favicon Settings State
  const [logoUrl, setLogoUrl] = useState(logoConfigVal?.logoUrl || "");
  const [faviconUrl, setFaviconUrl] = useState(logoConfigVal?.faviconUrl || "");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await uploadImageAction(formData);
      if (res.success && res.url) {
        setLogoUrl(res.url);
        setSuccessMsg("อัปโหลดโลโก้สำเร็จแล้ว (อย่าลืมกดบันทึกข้อมูล)");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(res.error || "เกิดข้อผิดพลาดในการอัปโหลด");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFavicon(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await uploadImageAction(formData);
      if (res.success && res.url) {
        setFaviconUrl(res.url);
        setSuccessMsg("อัปโหลด Favicon สำเร็จแล้ว (อย่าลืมกดบันทึกข้อมูล)");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(res.error || "เกิดข้อผิดพลาดในการอัปโหลด");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploadingFavicon(false);
    }
  };

  // 1. Contact Settings State
  const [phone, setPhone] = useState(contactVal?.phone || "");
  const [phoneDisplay, setPhoneDisplay] = useState(contactVal?.phoneDisplay || "");
  const [line, setLine] = useState(contactVal?.line || "");
  const [lineUrl, setLineUrl] = useState(contactVal?.lineUrl || "");
  const [email, setEmail] = useState(contactVal?.email || "");

  // 2. NAP Settings State
  const [napName, setNapName] = useState(napVal?.name || "");
  const [napPhone, setNapPhone] = useState(napVal?.phone || "");
  const [napEmail, setNapEmail] = useState(napVal?.email || "");
  const [napRegion, setNapRegion] = useState(napVal?.addressRegion || "");
  const [napCountry, setNapCountry] = useState(napVal?.addressCountry || "TH");

  // 3. Hero Copy Settings State
  const [heroHeadline, setHeroHeadline] = useState(heroVal?.headline || "");
  const [heroSubheadline, setHeroSubheadline] = useState(heroVal?.subheadline || "");
  const [heroCta1Label, setHeroCta1Label] = useState(heroVal?.ctaPrimary?.label || "");
  const [heroCta1Href, setHeroCta1Href] = useState(heroVal?.ctaPrimary?.href || "");
  const [heroCta2Label, setHeroCta2Label] = useState(heroVal?.ctaSecondary?.label || "");
  const [heroCta2Href, setHeroCta2Href] = useState(heroVal?.ctaSecondary?.href || "");

  // 4. Floating Buttons State
  const [floatPhone, setFloatPhone] = useState(!!floatingButtonsVal?.phone);
  const [floatLine, setFloatLine] = useState(!!floatingButtonsVal?.line);
  const [floatQuote, setFloatQuote] = useState(!!floatingButtonsVal?.quote);

  const saveSetting = (key: string, payload: unknown) => {
    setActiveSection(key);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await updateSiteSettingAction(key, payload);
      if (res.success) {
        setSuccessMsg(`บันทึกข้อมูลส่วน "${key}" สำเร็จแล้ว`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
      setActiveSection(null);
    });
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold px-4 py-3 shadow-lg">
          ✓ {successMsg}
        </div>
      )}

      {/* Card 0: Logo & Favicon Settings */}
      <Card className="p-6 bg-white border border-gray-200 space-y-4">
        <h2 className="text-base font-bold text-navy-800 border-b border-gray-100 pb-3 mb-2 flex items-center justify-between">
          <span>🖼️ โลโก้และไอคอนของเว็บไซต์ (Web Logo & Favicon)</span>
          {activeSection === "siteLogoConfig" && <span className="text-xs text-orange-500 font-semibold">กำลังบันทึก...</span>}
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Logo Field */}
          <div className="space-y-3">
            <div>
              <span className="block text-xs font-bold text-navy-600 uppercase mb-1">
                โลโก้เว็บไซต์ (Header / Footer Logo)
              </span>
              <p className="text-[11px] text-navy-400 mb-2 leading-relaxed">
                <strong className="text-orange-500">ขนาดแนะนำ: 200px x 48px</strong> (แนวนอน อัตราส่วนประมาณ 4:1) แนะนำใช้ไฟล์ภาพ PNG โปร่งใส (Transparent) หรือ SVG เพื่อให้กลมกลืนกับแถบเมนูและพื้นหลัง
              </p>
            </div>

            {/* Logo Preview */}
            <div className="h-16 w-full max-w-62.5 overflow-hidden rounded-lg bg-navy-50 border border-gray-200 flex items-center justify-center p-2 relative">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="โลโก้เว็บไซต์" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-xs text-navy-400 font-semibold">ยังไม่มีรูปโลโก้ (ใช้ชื่อข้อความแทน)</span>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="file"
                onChange={handleLogoUpload}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                disabled={uploadingLogo}
                className="w-full text-xs text-navy-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100 cursor-pointer disabled:opacity-50"
              />
              {uploadingLogo && <span className="text-[10px] text-orange-500 font-bold animate-pulse">กำลังอัปโหลดโลโก้...</span>}
              <div>
                <label className="block text-[10px] font-bold text-navy-500 uppercase mb-1">หรือป้อนลิงก์โลโก้โดยตรง</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="เช่น /images/logo.png หรือ https://..."
                  className="w-full rounded-lg border border-navy-200 px-3 py-1.5 text-xs focus:outline-none focus:border-orange-400 font-mono text-navy-700"
                />
              </div>
            </div>
          </div>

          {/* Favicon Field */}
          <div className="space-y-3">
            <div>
              <span className="block text-xs font-bold text-navy-600 uppercase mb-1">
                ไอคอนเว็บสำหรับแท็บเบราว์เซอร์ (Favicon / Site Icon)
              </span>
              <p className="text-[11px] text-navy-400 mb-2 leading-relaxed">
                <strong className="text-orange-500">ขนาดแนะนำ: 32px x 32px หรือ 48px x 48px</strong> (สี่เหลี่ยมจัตุรัส 1:1) คมชัดสัดส่วนจัตุรัส แนะนำไฟล์ประเภท ICO หรือ PNG
              </p>
            </div>

            {/* Favicon Preview */}
            <div className="h-16 w-16 overflow-hidden rounded-lg bg-navy-50 border border-gray-200 flex items-center justify-center p-2 relative">
              {faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
              ) : (
                <span className="text-[10px] text-navy-400 font-semibold text-center leading-none">ไม่มีไอคอน</span>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="file"
                onChange={handleFaviconUpload}
                accept="image/x-icon,image/png,image/jpeg,image/webp,image/svg+xml"
                disabled={uploadingFavicon}
                className="w-full text-xs text-navy-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100 cursor-pointer disabled:opacity-50"
              />
              {uploadingFavicon && <span className="text-[10px] text-orange-500 font-bold animate-pulse">กำลังอัปโหลดไอคอน...</span>}
              <div>
                <label className="block text-[10px] font-bold text-navy-500 uppercase mb-1">หรือป้อนลิงก์ไอคอนโดยตรง</label>
                <input
                  type="text"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="เช่น /favicon.ico หรือ https://..."
                  className="w-full rounded-lg border border-navy-200 px-3 py-1.5 text-xs focus:outline-none focus:border-orange-400 font-mono text-navy-700"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-50">
          <Button
            onClick={() => saveSetting("siteLogoConfig", { logoUrl, faviconUrl })}
            disabled={isPending || uploadingLogo || uploadingFavicon}
            variant="secondary"
            className="text-xs py-1.5 px-6 font-semibold cursor-pointer"
          >
            บันทึกโลโก้และไอคอน
          </Button>
        </div>
      </Card>

      {/* Card 1: Brand Contact */}
      <Card className="p-6 bg-white border border-gray-200 space-y-4">
        <h2 className="text-base font-bold text-navy-800 border-b border-gray-100 pb-3 mb-2 flex items-center justify-between">
          <span>📞 ข้อมูลการติดต่อหลัก (Brand Contact)</span>
          {activeSection === "contact" && <span className="text-xs text-orange-500 font-semibold">กำลังบันทึก...</span>}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
              เบอร์โทรศัพท์ (ระบบสายส่งลิงก์ เช่น 0819416620)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
              เบอร์โทรศัพท์สำหรับแสดงผลหน้าเว็บ (เช่น 081 941 6620)
            </label>
            <input
              type="text"
              value={phoneDisplay}
              onChange={(e) => setPhoneDisplay(e.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
              LINE ID
            </label>
            <input
              type="text"
              value={line}
              onChange={(e) => setLine(e.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
              ลิงก์แอด LINE (LINE URL)
            </label>
            <input
              type="text"
              value={lineUrl}
              onChange={(e) => setLineUrl(e.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
              อีเมลของแบรนด์ (Email)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-50">
          <Button
            onClick={() => saveSetting("contact", { phone, phoneDisplay, line, lineUrl, email })}
            disabled={isPending}
            variant="secondary"
            className="text-xs py-1.5 px-6 font-semibold cursor-pointer"
          >
            บันทึกข้อมูลติดต่อ
          </Button>
        </div>
      </Card>

      {/* Card 2: Homepage Hero */}
      <Card className="p-6 bg-white border border-gray-200 space-y-4">
        <h2 className="text-base font-bold text-navy-800 border-b border-gray-100 pb-3 mb-2 flex items-center justify-between">
          <span>🎨 แบนเนอร์ต้อนรับหน้าแรก (Homepage Hero Copy)</span>
          {activeSection === "hero" && <span className="text-xs text-orange-500 font-semibold">กำลังบันทึก...</span>}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
              หัวข้อหลัก (Headline)
            </label>
            <input
              type="text"
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold text-navy-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
              หัวข้อย่อย (Subheadline)
            </label>
            <textarea
              rows={2}
              value={heroSubheadline}
              onChange={(e) => setHeroSubheadline(e.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
                ปุ่มดำเนินการหลัก 1 (Label)
              </label>
              <input
                type="text"
                value={heroCta1Label}
                onChange={(e) => setHeroCta1Label(e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
                ปุ่มดำเนินการหลัก 1 (Link URL)
              </label>
              <input
                type="text"
                value={heroCta1Href}
                onChange={(e) => setHeroCta1Href(e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
                ปุ่มรอง 2 (Label)
              </label>
              <input
                type="text"
                value={heroCta2Label}
                onChange={(e) => setHeroCta2Label(e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
                ปุ่มรอง 2 (Link URL)
              </label>
              <input
                type="text"
                value={heroCta2Href}
                onChange={(e) => setHeroCta2Href(e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-50">
          <Button
            onClick={() =>
              saveSetting("hero", {
                headline: heroHeadline,
                subheadline: heroSubheadline,
                ctaPrimary: { label: heroCta1Label, href: heroCta1Href },
                ctaSecondary: { label: heroCta2Label, href: heroCta2Href },
              })
            }
            disabled={isPending}
            variant="secondary"
            className="text-xs py-1.5 px-6 font-semibold cursor-pointer"
          >
            บันทึกข้อมูลหน้าแรก
          </Button>
        </div>
      </Card>

      {/* Card 3: Local SEO NAP */}
      <Card className="p-6 bg-white border border-gray-200 space-y-4">
        <h2 className="text-base font-bold text-navy-800 border-b border-gray-100 pb-3 mb-2 flex items-center justify-between">
          <span>🏢 ข้อมูลสถานที่ตั้ง Local SEO (NAP Consistency)</span>
          {activeSection === "nap" && <span className="text-xs text-orange-500 font-semibold">กำลังบันทึก...</span>}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
              ชื่อธุรกิจของแบรนด์ (เช่น Pragunpai)
            </label>
            <input
              type="text"
              value={napName}
              onChange={(e) => setNapName(e.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
              เบอร์โทรศัพท์สำหรับ NAP
            </label>
            <input
              type="text"
              value={napPhone}
              onChange={(e) => setNapPhone(e.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
              อีเมลผู้ให้บริการสำหรับ NAP
            </label>
            <input
              type="text"
              value={napEmail}
              onChange={(e) => setNapEmail(e.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
                พื้นที่ให้บริการ (Region)
              </label>
              <input
                type="text"
                value={napRegion}
                onChange={(e) => setNapRegion(e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
                รหัสประเทศ (Country Code)
              </label>
              <input
                type="text"
                value={napCountry}
                onChange={(e) => setNapCountry(e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-50">
          <Button
            onClick={() =>
              saveSetting("nap", {
                name: napName,
                phone: napPhone,
                email: napEmail,
                addressRegion: napRegion,
                addressCountry: napCountry,
              })
            }
            disabled={isPending}
            variant="secondary"
            className="text-xs py-1.5 px-6 font-semibold cursor-pointer"
          >
            บันทึกข้อมูล NAP
          </Button>
        </div>
      </Card>

      {/* Card 4: Floating Contact Buttons */}
      <Card className="p-6 bg-white border border-gray-200 space-y-4">
        <h2 className="text-base font-bold text-navy-800 border-b border-gray-100 pb-3 mb-2 flex items-center justify-between">
          <span>📱 ปุ่มติดต่อลอยบนมือถือ (Floating Contact Buttons)</span>
          {activeSection === "floatingButtons" && <span className="text-xs text-orange-500 font-semibold">กำลังบันทึก...</span>}
        </h2>

        <div className="space-y-3 mt-2">
          <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-navy-750">
            <input
              type="checkbox"
              checked={floatPhone}
              onChange={(e) => setFloatPhone(e.target.checked)}
              className="accent-orange-500 rounded focus:ring-0 focus:ring-offset-0 h-4 w-4"
            />
            <span>เปิดใช้งานปุ่ม โทรสายด่วน (Phone Call)</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-navy-750">
            <input
              type="checkbox"
              checked={floatLine}
              onChange={(e) => setFloatLine(e.target.checked)}
              className="accent-orange-500 rounded focus:ring-0 focus:ring-offset-0 h-4 w-4"
            />
            <span>เปิดใช้งานปุ่ม ติดต่อทางแชท LINE</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-navy-750">
            <input
              type="checkbox"
              checked={floatQuote}
              onChange={(e) => setFloatQuote(e.target.checked)}
              className="accent-orange-500 rounded focus:ring-0 focus:ring-offset-0 h-4 w-4"
            />
            <span>เปิดใช้งานปุ่ม ขอใบเสนอราคาด่วน (Quote Form)</span>
          </label>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-50">
          <Button
            onClick={() => saveSetting("floatingButtons", { phone: floatPhone, line: floatLine, quote: floatQuote })}
            disabled={isPending}
            variant="secondary"
            className="text-xs py-1.5 px-6 font-semibold cursor-pointer"
          >
            บันทึกปุ่มติดต่อลอย
          </Button>
        </div>
      </Card>
    </div>
  );
}
