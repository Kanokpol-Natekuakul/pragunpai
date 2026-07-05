import { describe, it, expect } from "vitest";
import {
  formatThaiDate,
  formatThaiDateTime,
  formatBytes,
  slugify,
  truncate,
  formatThaiCurrency, // This will be imported but doesn't exist yet, or we'll define it as undefined/not exported
} from "./format";

describe("formatThaiDate", () => {
  it("formats date object to Thai Buddhist calendar format", () => {
    const date = new Date("2026-07-02");
    expect(formatThaiDate(date)).toBe("2 ก.ค. 2569");
  });

  it("formats ISO string to Thai Buddhist calendar format", () => {
    expect(formatThaiDate("2026-07-02T00:00:00.000Z")).toBe("2 ก.ค. 2569");
  });

  it("returns empty string for invalid date", () => {
    expect(formatThaiDate("invalid-date")).toBe("");
  });
});

describe("formatThaiDateTime", () => {
  it("formats date and time with Thai Buddhist era and suffix", () => {
    const date = new Date("2026-07-02T15:30:00");
    expect(formatThaiDateTime(date)).toBe("2 ก.ค. 2569 15:30 น.");
  });
});

describe("formatBytes", () => {
  it("formats 0 bytes correctly", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats KB correctly", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("formats MB correctly", () => {
    expect(formatBytes(1048576 * 2.5)).toBe("2.5 MB");
  });
});

describe("slugify", () => {
  it("converts spaces and symbols to hyphens and keeps lowercase", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });

  it("preserves Thai characters", () => {
    expect(slugify("ประกันภัย รถยนต์")).toBe("ประกันภัย-รถยนต์");
  });

  it("collapses multiple hyphens and trims edges", () => {
    expect(slugify("---hello---world---")).toBe("hello-world");
  });
});

describe("truncate", () => {
  it("returns original text if under limit", () => {
    expect(truncate("Short text", 20)).toBe("Short text");
  });

  it("truncates text and appends ellipsis", () => {
    expect(
      truncate("This is a much longer text that should be truncated", 20)
    ).toBe("This is a much long…");
  });
});

describe("formatThaiCurrency", () => {
  it("formats numeric premium into Thai Baht string with 2 decimal places", () => {
    expect(formatThaiCurrency(645)).toBe("645.00 บาท");
    expect(formatThaiCurrency(12500.5)).toBe("12,500.50 บาท");
  });

  it("formats with custom decimal places", () => {
    expect(formatThaiCurrency(645, 0)).toBe("645 บาท");
  });

  it("returns default text for invalid input", () => {
    expect(formatThaiCurrency(NaN)).toBe("ติดต่อเจ้าหน้าที่");
  });
});
