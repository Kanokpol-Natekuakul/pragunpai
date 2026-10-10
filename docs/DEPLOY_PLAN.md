# แผน Deploy — Pragunpai (บันทึกไว้ 10 ต.ค. 2026 · สถานะ: ยังไม่เริ่ม)

> อัปเดต 10 ต.ค. 2026: **DEPLOYED แล้ว** — Railway project `pragunpai` (region Singapore) → https://pragunpai24.up.railway.app

---

## แนวทางที่เลือก: Railway (รัน Docker image เดิม)

**ทำไม:** repo นี้มี `Dockerfile` (standalone) + `docker-entrypoint.sh` (รัน migrate อัตโนมัติ) พร้อมอยู่แล้ว → deploy จาก GitHub ได้เลย **แก้โค้ด 0 บรรทัด** ไม่ต้องใช้ nginx/certbot ใน compose (Railway ออก HTTPS + custom domain ให้)

- **ค่าใช้จ่าย:** Hobby $5/เดือน (รวม $5 usage) → จริงราว **$5-8/เดือน** (app + Postgres)
- **ข้อจำกัดที่ต้องรู้:** Hobby volume รวม ~5GB (uploads + PG) — พอช่วงแรก ไฟล์ลูกค้าถูกลบตาม PDPA ใน 30 วันอยู่แล้ว; ถ้าโตอัป Pro ($20)
- **ข้อดีสำคัญ:** Docker image เป็นมาตรฐาน → ย้าย provider ได้ทุกเมื่อ (Fly.io / VPS / อื่น ๆ) โดยไม่แก้โค้ด

## ทางเลือกสำรอง (เทียบไว้)

| ทาง                  | ต่อเดือน | แก้โค้ด        | หมายเหตุ                                                                                                  |
| -------------------- | -------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| **Railway** (เลือก)  | ~$5-8    | 0              | managed PG + cron + GitHub deploy                                                                         |
| Fly.io               | ~$4-6    | 0              | ถูกกว่า แต่ Managed PG แพง ($38) → ต้องรัน PG เอง                                                         |
| VPS + docker-compose | ~$4-12   | 0              | ถูกสุด/ควบคุมสุด แต่ดูแล OS เอง (สคริปต์ `scripts/setup-hetzner.sh` มีแล้ว)                               |
| Vercel + Supabase    | ~$45     | ต้องแก้ ~3 จุด | Hobby ห้ามใช้เชิงพาณิชย์; Supabase Free pause 7 วัน; uploads ต้องทำ storage adapter + purge + vercel.json |

---

## สิ่งที่ต้องขอจาก Pol ก่อนเริ่ม

1. [ ] สมัคร Railway (railway.com) ด้วย GitHub + ผูกบัตร
2. [ ] ตัดสินใจโดเมน (scripts เผื่อ `pragunpai.online` ไว้) + DNS อยู่ที่ไหน — หรือเริ่มด้วย subdomain ฟรีของ Railway ก่อน
3. [ ] Resend: สมัคร + API key + **verify โดเมนส่งอีเมล (SPF/DKIM 3 records)** — จำเป็นมาก ไม่งั้น OTP แอดมินส่งไม่ได้
4. [ ] Google reCAPTCHA v3: site key + secret key
5. [ ] วิธี deploy: (ก) Railway CLI — Pol รัน `railway login` ครั้งเดียว แล้ว Hermes ขับ CLI ต่อ หรือ (ข) ชี้ตำแหน่งทีละคลิกบน dashboard

## งานฝั่ง Hermes (หลังได้ข้อบน)

- สร้าง project + Postgres + volume (`/app/public/uploads`) + ตั้ง env ทุกตัว + deploy
- ⚠️ Railway volume mount เป็น root — ต้องเช็คสิทธิ์เขียนของ user `nextjs` (มี env `RAILWAY_RUN_UID=0` เป็นทางแก้)
- รัน migrate + seed อัตโนมัติ (entrypoint ทำอยู่แล้ว)
- ตั้ง cron: purge PDPA รายวัน (`/api/cron/purge` + `Bearer CRON_SECRET` — fail-closed แล้ว) + **backup pg_dump รายวัน** (ยังไม่มีสคริปต์ — ต้องเขียนเพิ่ม + offsite เช่น Cloudflare R2 / Backblaze B2)
- ผูก custom domain + SSL + ทดสอบ E2E (ฟอร์มจริง → อีเมลเข้า, ล็อกอินแอดมิน, purge)

## หมายเหตุสำคัญ

- **แอดมินใช้ Gmail จริง** (ตั้งใน DB/seed ของเครื่อง dev แล้ว) — เปลี่ยนรหัสทันทีหลัง login แรกที่ `/admin/account`
- ⚠️ **Repo นี้เป็น public** — ห้าม commit รหัสผ่าน อีเมลจริง หรือคีย์ใด ๆ ลงไฟล์ในโปรเจกต์/เอกสารนี้
- โปรดักชันต้อง verify โดเมนใน Resend ถึงจะส่ง OTP/แจ้งเตือนได้ (ทดสอบเบื้องต้นใช้ `onboarding@resend.dev` ส่งเข้า gmail ตัวเองได้)
- เครื่อง dev ต้องรันด้วย `NODE_ENV=development` (shell ตั้ง production ติดมา — npm จะข้าม devDeps)
- Backup DB ก่อน go-live เสมอ + เก็บ `.env` production แยกจาก repo

---

## สถานะหลัง deploy (10 ต.ค. 2026)

**เสร็จแล้ว:**

- Railway project `pragunpai` + service แอป + Postgres (region Singapore ทั้งคู่)
- Volume `pragunpai-volume` mount `/app/public/uploads` (uploads อยู่รอด redeploy)
- Env vars ครบ (secrets สุ่มใหม่, `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `RAILWAY_RUN_UID=0` สำหรับเขียน volume, `PORT=3000`)
- Domain: https://pragunpai24.up.railway.app (target port 3000 — เปลี่ยนชื่อจาก pragunpai-production เมื่อ 10 ต.ค. 2026)
- Migrate + seed ครบ (แอดมิน Gmail, SEO, settings, insurance pages, FAQ)
- ทดสอบ E2E จริงแล้ว: ล็อกอินแอดมิน (OTP ทาง log ชั่วคราว), ฟอร์มขอใบเสนอราคา + แนบไฟล์ → lead + ไฟล์เข้า volume ✓
- แก้ 2 บั๊กที่เจอตอน deploy: (1) Next 16 standalone ไม่ serve ไฟล์ public ที่เขียนตอน runtime → เพิ่ม route handler `src/app/uploads/[filename]/route.ts` (2) Dockerfile เพิ่ม `ARG` รับ NEXT_PUBLIC_* ตอน build

**งานที่เหลือ — เรียงตามลำดับความสำคัญ (อัปเดต 10 ต.ค. 2026):**

**A. ก่อนเปิดใช้จริง / รับ lead จริง**

- [ ] 1) เปลี่ยนรหัสแอดมินจาก `12345678` ที่หน้า `/admin/account` (1 นาที — ทำได้ทันที)
- [ ] 2) Resend (ฟรี, ไม่มีบัตร): สมัครด้วย Gmail แอดมิน → API key → OTP ล็อกอิน + แจ้งเตือน lead ทางอีเมล (ตอนนี้ OTP โผล่ใน Railway logs — ควรปิดช่องนี้ไว)
- [x] 3) reCAPTCHA v3 — **ใส่คีย์ + deploy แล้ว** (10 ต.ค.) เหลือ E2E ยืนยันรอบสุดท้ายบนฟอร์มจริง
- [x] 4) Backup อัตโนมัติ — **เสร็จ + ทดสอบยิงจริง 2 รอบผ่าน ✓** (10 ต.ค.): service `purge-cron` กลายเป็น maintenance cron รายวัน 03:00 น. (ไทย) → `pg_dump | gzip` → อัปโหลด **Backblaze B2** (bucket `pragunpai-backup`, เก็บ 30 วัน + prune อัตโนมัติ) → เรียก purge endpoint ซ้ำเป็นตัวสำรอง (โค้ด: `scripts/backup-db.sh`, `scripts/cron-maintenance.sh`, `backup/Dockerfile`)
- [ ] 5) โดเมนจริง (whois 10 ต.ค.: `.co.th` / `.in.th` / `thepragunpai.com` / `pragunpai24.net` ว่าง — `.com/.net/.org` ถูกจดตั้งแต่ 2006) → จดแล้วแจ้งเพื่อผูก + SSL + อัปเดต env + rebuild (playbook พร้อม)

**B. ก่อนทำการตลาด / ยิงแอด**

- [ ] 6) GA4 (`NEXT_PUBLIC_GA_ID` รองรับแล้ว) + Google Search Console (หลังมีโดเมน)
- [ ] 7) Google Business Profile (local SEO / Maps / รีวิว) + LINE OA
- [ ] 8) ลบ lead ทดสอบ "ทดสอบระบบ Hermes" (จากหลังบ้าน) + ลบไฟล์ probe (Railway CLI ห้าม agent ลบ — รันเอง): `railway volume files delete --volume pragunpai-volume /app/public/uploads/probe.txt` และ `...probe2.txt`
- [ ] 9) Railway Hobby $5/เดือน เมื่อใกล้ครบ trial (~9 พ.ย. 2026) — ใส่บัตรใน dashboard

**C. ระยะยาว (ทำต่อเนื่อง)**

- [ ] 10) SEO: วิจัยคีย์เวิร์ด long-tail → เขียนบทความ 20–50 ชิ้น (ระบบบทความหลังบ้านพร้อม) + อัดหน้า product + E-E-A-T (เลขใบอนุญาตนายหน้า/รีวิว)
- [ ] 11) Backlinks / รีวิว / Pantip-Facebook presence
- [ ] 12) Uptime monitoring (เช่น UptimeRobot ฟรี) + Railway alerts

**PDPA Purge cron (เสร็จแล้ว):**

- ตัวหลัก: GitHub Actions workflow `.github/workflows/purge-cron.yml` — ทุกวัน 02:00 น. (ไทย), ใช้ secret `CRON_SECRET` ของ repo, มีปุ่ม Run workflow ให้ทดสอบเอง — **ทดสอบยิงจริงแล้ว endpoint ตอบ 200 ✓**
- ตัวสำรอง: Railway service `purge-cron` (image alpine, cron `0 19 * * *` UTC = 02:00 ไทย, เรียก purge ด้วย Bearer secret) — เช็ค/กดรันเองได้จาก dashboard → Run now
- หมายเหตุ: GitHub ปิด scheduled workflow เองถ้า repo ไม่มี activity ~60 วัน — Railway cron สำรองช่วยครอบจุดนี้
