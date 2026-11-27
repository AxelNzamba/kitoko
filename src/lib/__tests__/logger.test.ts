import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "../logger";

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Ensure debug logs are not filtered out
    process.env.LOG_LEVEL = "debug";
  });

  it("should log info messages", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("Test message");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("INFO");
    expect(spy.mock.calls[0][0]).toContain("Test message");
  });

  it("should log error messages via console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("Error occurred");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("ERROR");
    expect(spy.mock.calls[0][0]).toContain("Error occurred");
  });

  it("should log warn messages via console.warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("Warning message");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("WARN");
    expect(spy.mock.calls[0][0]).toContain("Warning message");
  });

  it("should log debug messages", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.debug("Debug message");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("DEBUG");
  });

  it("should include metadata in JSON format", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("User action", { userId: "123", action: "login" });
    const output = spy.mock.calls[0][0];
    expect(output).toContain('"userId":"123"');
    expect(output).toContain('"action":"login"');
  });

  it("should support withContext to add context prefix", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const ctxLogger = logger.withContext("stock");
    ctxLogger.info("Movement created");
    const output = spy.mock.calls[0][0];
    expect(output).toContain("[stock]");
    expect(output).toContain("Movement created");
  });

  it("should include timestamp in ISO format", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("Timed log");
    const output = spy.mock.calls[0][0];
    // Should start with [YYYY-MM-DD
    expect(output).toMatch(/^\[\d{4}-\d{2}-\d{2}T/);
  });

  it("should handle fatal level as console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.fatal("Fatal error");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("FATAL");
  });
});
