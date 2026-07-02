# Pragunpai (ประกันภัย) — แพลตฟอร์มเปรียบเทียบและขอใบเสนอราคาประกันภัยออนไลน์

Pragunpai.com คือเว็บแอปพลิเคชันสำหรับที่ปรึกษาและเปรียบเทียบแผนประกันภัยออนไลน์สำหรับลูกค้าในประเทศไทย รองรับการคำนวณเบี้ย พ.ร.บ. รถยนต์, ประกันอุบัติเหตุส่วนบุคคล (Personal Accident) และประกันอัคคีภัยบ้าน/คอนโด (Property & Fire) พัฒนาด้วย Next.js 16 (App Router), Prisma 7, PostgreSQL และ Tailwind CSS

---

## 🛠️ ฟีเจอร์หลักของระบบ (Features)

* **ระบบขอใบเสนอราคาแยกประเภท (Quote Forms)**: ฟอร์มขอราคา 4 ประเภท พร้อมการตรวจสอบความถูกต้องด้วย Zod + React Hook Form
* **ระบบความปลอดภัย (Security)**: กรองสแปมด้วย Google reCAPTCHA v3 และปกป้องหลังบ้านด้วยระบบ 2FA Email OTP
* **การจัดเก็บเอกสารและแจ้งเตือน (Uploads & Resend)**: อัปโหลดเอกสารประกอบคำขอเข้าเก็บในพื้นที่เซิร์ฟเวอร์แบบ Local และส่งการแจ้งเตือนอีเมลในรูปแบบ HTML Table ไปยังแอดมินทันทีผ่านบริการ Resend
* **ระบบล้างข้อมูลตามกฎหมาย PDPA (PDPA Auto-Purge)**: มี Cron Job ล้างข้อมูลผู้ติดต่อและไฟล์แนบออกจากดิสก์และฐานข้อมูลโดยอัตโนมัติภายใน 30 วัน (`expiresAt`)
* **ระบบจัดการหลังบ้านระดับพรีเมียม (Admin Panel)**:
  * แดชบอร์ดสรุปยอดตัวเลขผู้เข้าชมและ Lead ประจำวัน
  * จัดการข้อมูล Lead, โน้ตภายในของแอดมิน, บันทึกการโทร และระบบส่งออกข้อมูลเป็นไฟล์ Excel/CSV
  * ตัวปรับปรุงตารางเปรียบเทียบแผนประกันภัย (Visual Plan Comparison Table Builder)
  * ตัวเขียนบทความความรู้เพื่อ SEO (SEO Article / Blog Editor) รองรับการสร้าง URL Slug อัตโนมัติและตั้งเวลาเผยแพร่
  * จัดการคีย์เวิร์ด SEO และ Meta tags สำหรับหน้า Static หลัก
  * ควบคุมตั้งค่าไซต์ (ข้อมูลเบอร์ติดต่อ/LINE, เปิด-ปิด ปุ่มติดต่อลอย, ข้อความหน้าแบนเนอร์ Hero)
* **SEO/AEO/GEO/LLMO Optimization**:
  * โครงสร้างหน้าเว็บเป็นแบบ Semantic HTML5 และมี JSON-LD ครบทุกหน้าหลัก
  * Dynamic Sitemap.xml และ robots.txt เจนอัตโนมัติตามข้อมูลจริงในฐานข้อมูล
  * `llms.txt` สำหรับให้ AI Crawlers และบอทคีย์เวิร์ดปัญญาประดิษฐ์อ่านข้อมูลบริการได้สะดวกรวดเร็ว

---

## 📂 โครงสร้างโฟลเดอร์สำคัญ (Folder Structure)

```text
├── docs/                      # คู่มือและการดูแลระบบ (Backup, Admin Guide)
├── prisma/                    # โครงสร้างฐานข้อมูล (Prisma Schema, Seeds)
├── public/                    # ไฟล์ Static และไฟล์อัปโหลด
│   └── uploads/               # โฟลเดอร์เก็บไฟล์แนบลูกค้า (PDPA Purge target)
└── src/
    ├── actions/               # Next.js Server Actions (Auth, Leads, SEO, Settings)
    ├── app/                   # Next.js App Router (Public Pages, Quote Paths, Admin UI, API Cron)
    ├── components/            # UI Components และแผงจัดการแอดมินแยกย่อย
    └── lib/                   # โมดูลฟังก์ชันตัวช่วย (Auth JWT, Uploads, Crypto, Mailer)
```

---

## ⚙️ การตั้งค่าสภาพแวดล้อม (Environment Variables)

คัดลอกไฟล์ `.env.example` ไปเป็น `.env` และกรอกค่าเชื่อมต่อจริง:

```bash
# ฐานข้อมูล PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/pragunpai"

# ระบบยืนยันตัวตนแอดมิน
AUTH_SECRET="long-random-string-here"
AUTH_URL="http://localhost:3000"

# ระบบอีเมล Resend
RESEND_API_KEY="re_xxxxxxxx"
EMAIL_FROM="Pragunpai <no-reply@yourdomain.com>"
LEAD_ALERT_TO="service@yourdomain.com"

# ระบบความปลอดภัย Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"

# Vercel Cron Security Token (ใช้ควบคุมการรัน Purge API)
CRON_SECRET="your-cron-secret-token"
```

---

## 🚀 ขั้นตอนการติดตั้งและรันระบบ (Quick Start)

### 1. ติดตั้ง Package
```bash
npm install
```

### 2. ตั้งค่าระบบฐานข้อมูล (Prisma / Database Setup)
สร้างตาราง, คอมไพล์ client และรันข้อมูลเริ่มต้น (Seed Data):
```bash
# Generate Client
npm run db:generate

# รัน DB Migrations
npm run db:migrate

# เพิ่มข้อมูลแอดมินเริ่มต้นและค่าพื้นฐาน
npm run db:seed
```
*แอดมินเริ่มต้น: `admin@pragunpai.com` / รหัสผ่าน: `ChangeMe123!` (กรุณาไปเปลี่ยนในระบบหลังบ้านทันที)*

### 3. รันโปรเจกต์โหมด Development
```bash
npm run dev
```
เปิดใช้งานระบบที่ [http://localhost:3000](http://localhost:3000)

### 4. รันคำสั่งตรวจสอบประเภท TypeScript และสร้าง Production Build
```bash
# ตรวจสอบ TypeScript ทั้งโปรเจกต์
npm run typecheck

# สร้าง Build สำหรับขึ้นเซิร์ฟเวอร์
npm run build
```

---

## ⏰ ระบบล้างข้อมูลผู้ติดต่อตามกฎหมาย PDPA (Cron Job)

แอปพลิเคชันมี API Endpoint อยู่ที่ `/api/cron/purge` เพื่อใช้ในการล้างข้อมูลและไฟล์แนบที่หมดอายุ (เกิน 30 วัน) ออกจากเซิร์ฟเวอร์

สำหรับการรันแบบอัตโนมัติบนระบบคลาวด์ เช่น Vercel ให้ตั้งค่าไฟล์ `vercel.json` ดังนี้:

```json
{
  "crons": [
    {
      "path": "/api/cron/purge",
      "schedule": "0 2 * * *"
    }
  ]
}
```
*ระบบจะรันสคริปต์นี้ทุกวันเวลา 02:00 น. เพื่อทำการตรวจสอบคีย์ expiresAt ในฐานข้อมูล*

---

## 📄 เอกสารคู่มือระบบเพิ่มเติม (Additional Docs)
* **คู่มือการสำรองข้อมูล**: ดูได้ที่ [BACKUP.md](file:///D:/pragunpai/docs/BACKUP.md)
* **คู่มือแอดมินและการอัปเดตเว็บ**: ดูได้ที่ [ADMIN_GUIDE.md](file:///D:/pragunpai/docs/ADMIN_GUIDE.md)
