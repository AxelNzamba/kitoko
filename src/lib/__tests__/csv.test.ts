import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toCsv } from "../csv";

describe("toCsv", () => {
  it("should generate header line from headers", () => {
    const csv = toCsv(
      [
        { key: "name", label: "Nom" },
        { key: "age", label: "Âge" },
      ],
      [],
    );
    expect(csv).toContain("Nom,Âge");
  });

  it("should include BOM at the start", () => {
    const csv = toCsv([{ key: "name", label: "Nom" }], []);
    expect(csv.startsWith("\uFEFF")).toBe(true);
  });

  it("should convert rows to CSV lines", () => {
    const csv = toCsv(
      [
        { key: "name", label: "Nom" },
        { key: "age", label: "Âge" },
      ],
      [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ],
    );
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe("\uFEFFNom,Âge");
    expect(lines[1]).toBe("Alice,30");
    expect(lines[2]).toBe("Bob,25");
  });

  it("should escape fields containing commas", () => {
    const csv = toCsv(
      [{ key: "name", label: "Nom" }],
      [{ name: "Smith, John" }],
    );
    expect(csv).toContain('"Smith, John"');
  });

  it("should escape fields containing double quotes", () => {
    const csv = toCsv(
      [{ key: "desc", label: "Description" }],
      [{ desc: 'Say "Hello"' }],
    );
    expect(csv).toContain('"Say ""Hello"""');
  });

  it("should handle null and undefined values as empty", () => {
    const csv = toCsv(
      [
        { key: "name", label: "Nom" },
        { key: "email", label: "Email" },
      ],
      [{ name: "Alice", email: null }] as any,
    );
    expect(csv).toContain("Alice,");
  });

  it("should handle numeric values", () => {
    const csv = toCsv(
      [
        { key: "price", label: "Prix" },
        { key: "qty", label: "Qté" },
      ],
      [{ price: 19.99, qty: 3 }],
    );
    expect(csv).toContain("19.99,3");
  });

  it("should handle special characters and accents", () => {
    const csv = toCsv(
      [{ key: "name", label: "Nom" }],
      [{ name: "François Léonard" }],
    );
    expect(csv).toContain("François Léonard");
  });

  it("should escape multiline text", () => {
    const csv = toCsv(
      [{ key: "notes", label: "Notes" }],
      [{ notes: "Line 1\nLine 2" }],
    );
    expect(csv).toContain('"Line 1\nLine 2"');
  });
});
