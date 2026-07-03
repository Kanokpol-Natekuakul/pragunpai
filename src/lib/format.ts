/** Formatting helpers (Thai locale). */

const thaiMonths = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

/** Format an ISO/date as "dd เดือน พ.ศ." using Buddhist era. */
export function formatThaiDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDate();
  const month = thaiMonths[d.getMonth()];
  const beYear = d.getFullYear() + 543;
  return `${day} ${month} ${beYear}`;
}

/** Format an ISO/date + time as "dd เดือน พ.ศ. HH:mm". */
export function formatThaiDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
  return `${formatThaiDate(d)} ${time} น.`;
}

/** Thai label maps for enums. */
export const leadStatusLabel: Record<string, string> = {
  NEW: "ใหม่",
  CONTACTED: "ติดต่อแล้ว",
  AWAITING_DOCS: "รอเอกสาร",
  QUOTED: "เสนอราคาแล้ว",
  CLOSED: "ปิดการขาย",
  NOT_INTERESTED: "ไม่สนใจ",
  SPAM: "สแปม",
};

export const leadFormTypeLabel: Record<string, string> = {
  CAR_ACT: "พ.ร.บ. รถยนต์",
  ACCIDENT: "ประกันอุบัติเหตุ",
  PROPERTY: "ประกันบ้าน/คอนโด/หอพัก",
  OTHER: "ประกันภัยอื่นๆ",
};

export const articleCategoryLabel: Record<string, string> = {
  CAR_ACT: "พ.ร.บ. รถยนต์",
  ACCIDENT: "ประกันอุบัติเหตุ",
  PROPERTY: "ประกันบ้าน/คอนโด/หอพัก",
  GENERAL: "ความรู้ประกันภัย",
  FAQ: "คำถามที่พบบ่อย",
};

/** Convert bytes to human-readable size. */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Build a URL-friendly slug from Thai/English text. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\u0e00-\u0e7fa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Truncate text to a max length with ellipsis. */
export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

/** Format a numeric premium into Thai Baht string. */
export function formatThaiCurrency(amount: number, decimals = 2): string {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "ติดต่อเจ้าหน้าที่";
  }
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatted} บาท`;
}

