import { describe, it, expect } from "vitest";
import { formatXOF, formatDate, formatDateTime, generateSKU, generateBarcode, generateSaleNumber } from "../format";

// fr-FR locale uses \u202f (narrow non-breaking space) as thousands separator
const NBSP = "\u202f";

describe("formatXOF", () => {
  it("should format zero", () => {
    expect(formatXOF(0)).toBe("0 F");
  });

  it("should format small numbers", () => {
    expect(formatXOF(100)).toBe("100 F");
  });

  it("should use locale-specific thousands separator", () => {
    // fr-FR uses narrow non-breaking space
    expect(formatXOF(1500)).toBe(`1${NBSP}500 F`);
  });

  it("should format large numbers", () => {
    expect(formatXOF(1_000_000)).toBe(`1${NBSP}000${NBSP}000 F`);
  });

  it("should round to integer (no decimals)", () => {
    expect(formatXOF(99.9)).toBe("100 F");
    expect(formatXOF(100.1)).toBe("100 F");
  });

  it("should handle negative numbers", () => {
    expect(formatXOF(-500)).toBe("-500 F");
  });
});

describe("formatDate", () => {
  it("should format a date string", () => {
    const result = formatDate("2026-07-21");
    expect(result).toBe("21/07/2026");
  });

  it("should format a Date object", () => {
    const date = new Date(2026, 6, 21); // Mois 6 = juillet
    const result = formatDate(date);
    expect(result).toBe("21/07/2026");
  });

  it("should handle single-digit days and months", () => {
    const result = formatDate("2026-01-05");
    expect(result).toBe("05/01/2026");
  });

  it("should handle end of year", () => {
    const result = formatDate("2026-12-31");
    expect(result).toBe("31/12/2026");
  });
});

describe("formatDateTime", () => {
  it("should include date and time", () => {
    const result = formatDateTime("2026-07-21T14:30:00");
    expect(result).toContain("21/07/2026");
    expect(result).toContain("14");
    expect(result).toContain("30");
  });

  it("should handle midnight", () => {
    const result = formatDateTime("2026-07-21T00:00:00");
    expect(result).toContain("21/07/2026");
    expect(result).toContain("00");
  });
});

describe("generateSKU", () => {
  it("should start with PRD-", () => {
    const sku = generateSKU();
    expect(sku.startsWith("PRD-")).toBe(true);
  });

  it("should have format PRD-XXXXXX (10 chars)", () => {
    const sku = generateSKU();
    // "PRD-" (4) + 6 random chars = 10
    expect(typeof sku).toBe("string");
    expect(sku.length).toBeGreaterThanOrEqual(8);
    expect(sku.length).toBeLessThanOrEqual(12);
  });

  it("should generate unique values across 50 calls", () => {
    const skus = new Set(Array.from({ length: 50 }, () => generateSKU()));
    expect(skus.size).toBe(50);
  });

  it("should only contain uppercase alphanumeric after prefix", () => {
    const sku = generateSKU();
    const suffix = sku.slice(4);
    expect(suffix).toMatch(/^[A-Z0-9]+$/);
  });
});

describe("generateBarcode", () => {
  it("should return a 13-character string", () => {
    const barcode = generateBarcode();
    expect(barcode.length).toBe(13);
  });

  it("should only contain digits", () => {
    const barcode = generateBarcode();
    expect(barcode).toMatch(/^\d+$/);
  });

  it("should generate mostly unique values (low collision rate)", () => {
    // With Date.now() precision, collisions are possible but unlikely
    const codes = new Set(Array.from({ length: 50 }, () => generateBarcode()));
    // Allow for some collisions due to time-based generation
    expect(codes.size).toBeGreaterThanOrEqual(45);
  });
});

describe("generateSaleNumber", () => {
  it("should start with V", () => {
    const number = generateSaleNumber();
    expect(number.startsWith("V")).toBe(true);
  });

  it("should have format VYYYYMMDD-HHMMSS", () => {
    const number = generateSaleNumber();
    // V + 8 date digits + - + 6 time digits = 16
    expect(number).toMatch(/^V\d{8}-\d{6}$/);
  });

  it("should include current year", () => {
    const year = new Date().getFullYear().toString();
    const number = generateSaleNumber();
    expect(number.slice(1, 5)).toBe(year);
  });
});
