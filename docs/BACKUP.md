# คู่มือการสำรองข้อมูลและการกู้คืน (Backup & Restore Guide)

เอกสารฉบับนี้อธิบายถึงขั้นตอนการสำรองข้อมูล (Backup) และการกู้คืนข้อมูล (Restore) ทั้งในส่วนของฐานข้อมูล PostgreSQL และไฟล์เอกสารแนบในระบบ Pragunpai.com

---

## 1. การสำรองฐานข้อมูล (PostgreSQL Database Backup)

เนื่องจากระบบใช้ PostgreSQL (เช่น Neon หรือ Supabase) เราสามารถใช้โปรแกรมเครื่องมือมาตรฐานอย่าง `pg_dump` ในการสำรองข้อมูลโครงสร้างและตัวข้อมูลทั้งหมดได้

### คำสั่งสำรองข้อมูล (Backup Command)

รันคำสั่งด้านล่างบน Terminal/Command Line (แทนค่า URL ด้วย `DATABASE_URL` จริงจากไฟล์ `.env`):

```bash
pg_dump "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require" -F c -b -v -f pragunpai_db_backup.dump
```

_คำอธิบาย Option:_

- `-F c`: กำหนดรูปแบบไฟล์เป็น Custom format (บีบอัดขนาดไฟล์และเอื้อต่อการกู้คืน)
- `-b`: สำรองข้อมูลประเภท Large Objects ด้วย
- `-v`: แสดงผลขั้นตอนการทำงานแบบละเอียด (Verbose)
- `-f`: ชื่อไฟล์ปลายทางที่ได้

---

## 2. การกู้คืนฐานข้อมูล (PostgreSQL Database Restore)

ในกรณีที่ต้องการกู้คืนระบบกลับไปยังฐานข้อมูลใหม่ หรือกู้คืนค่าย้อนหลัง ให้ใช้โปรแกรม `pg_restore`

### คำสั่งกู้คืนข้อมูล (Restore Command)

```bash
pg_restore -d "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require" -v pragunpai_db_backup.dump
```

_หมายเหตุ: หากต้องการล้างฐานข้อมูลปลายทางก่อนเขียนทับ ให้ใส่ Option `--clean` เพิ่มเติมได้_

---

## 3. การสำรองไฟล์แนบของลูกค้า (Lead Attachments Backup)

ไฟล์แนบที่ลูกค้าอัปโหลดเข้ามา (เช่น เล่มทะเบียนรถ, บัตรประชาชน) จะจัดเก็บอยู่ที่โฟลเดอร์ของโครงการในตำแหน่ง:
`public/uploads/`

### ขั้นตอนการสำรองไฟล์ (Local Development / VPS Storage)

ให้สำรองโฟลเดอร์นี้เก็บไว้เป็นระยะๆ โดยการจัดทำไฟล์ Zip หรือใช้คำสั่ง Sync ไปยังเครื่องมือภายนอก:

**สร้างไฟล์บีบอัด (Zip) บน Windows (PowerShell):**

```powershell
Compress-Archive -Path .\public\uploads\* -DestinationPath .\backups\pragunpai_uploads_backup.zip
```

**สร้างไฟล์บีบอัดบน Linux (VPS):**

```bash
tar -czvf pragunpai_uploads_backup.tar.gz public/uploads/
```

### การกู้คืนไฟล์แนบ (Restore Attachments)

เพียงคลายไฟล์บีบอัด (Unzip / Un-tar) กลับลงไปที่โฟลเดอร์ `public/uploads` ของเซิร์ฟเวอร์ปลายทาง

---

## 4. แผนงานการสำรองข้อมูลที่แนะนำ (Recommended Backup Policy)

1. **Daily Backup**: ตั้ง Cron Job ทำการสำรองฐานข้อมูลและอัปโหลดไปเก็บยัง Object Storage ภายนอกทุกๆ วันเวลา 02:00 น.
2. **Weekly File Sync**: ทำการสำรองไฟล์ในโฟลเดอร์ `public/uploads` ทุกๆ สัปดาห์
3. **PDPA Auto-Purge Verification**: ตรวจสอบผลลัพธ์ของ API Purge `/api/cron/purge` สม่ำเสมอ เพื่อให้แน่ใจว่าไฟล์ที่เกิน 30 วันได้รับการลบจากระบบตามเงื่อนไข PDPA จริง
