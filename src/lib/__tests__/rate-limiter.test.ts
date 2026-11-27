import { describe, it, expect, beforeEach } from "vitest";
import { rateLimiter } from "../rate-limiter";

describe("rateLimiter", () => {
  beforeEach(() => {
    // Reset the rate limiter state between tests
    rateLimiter.reset("test-endpoint", "client-1");
    rateLimiter.reset("test-endpoint", "client-2");
  });

  it("should allow first request", () => {
    const result = rateLimiter.check("test-endpoint", "client-1");
    expect(result.allowed).toBe(true);
    expect(result.retryAfter).toBe(0);
  });

  it("should use default config for unknown endpoints", () => {
    // Default allows 100 requests per minute
    for (let i = 0; i < 100; i++) {
      const result = rateLimiter.check("unknown-endpoint", "client-1");
      expect(result.allowed).toBe(true);
    }
    // 101st request should be blocked
    const blocked = rateLimiter.check("unknown-endpoint", "client-1");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("should track different clients independently", () => {
    // Client 1 hits the limit
    for (let i = 0; i < 100; i++) {
      rateLimiter.check("unknown-endpoint", "client-1");
    }
    // Client 2 should still be allowed
    const result = rateLimiter.check("unknown-endpoint", "client-2");
    expect(result.allowed).toBe(true);
  });

  it("should track different endpoints independently", () => {
    // Hit limit on endpoint A
    for (let i = 0; i < 100; i++) {
      rateLimiter.check("endpoint-a", "client-1");
    }
    // Endpoint B should still be allowed
    const result = rateLimiter.check("endpoint-b", "client-1");
    expect(result.allowed).toBe(true);
  });

  it("should reset counters", () => {
    for (let i = 0; i < 100; i++) {
      rateLimiter.check("test-endpoint", "client-1");
    }
    rateLimiter.reset("test-endpoint", "client-1");
    const result = rateLimiter.check("test-endpoint", "client-1");
    expect(result.allowed).toBe(true);
  });

  it("should provide stats", () => {
    rateLimiter.check("login", "stats-client");
    const stats = rateLimiter.stats();
    expect(stats.totalEntries).toBeGreaterThanOrEqual(1);
    expect(stats.configs).toContain("login");
    expect(typeof stats.activeEntries).toBe("number");
  });

  it("should apply specific config for login endpoint", () => {
    // Login allows only 5 requests per minute
    for (let i = 0; i < 5; i++) {
      const result = rateLimiter.check("login", "client-1");
      expect(result.allowed).toBe(true);
    }
    // 6th request should be blocked
    const blocked = rateLimiter.check("login", "client-1");
    expect(blocked.allowed).toBe(false);
  });

  it("should apply specific config for stock-movement endpoint", () => {
    for (let i = 0; i < 30; i++) {
      const result = rateLimiter.check("stock-movement", "client-1");
      expect(result.allowed).toBe(true);
    }
    const blocked = rateLimiter.check("stock-movement", "client-1");
    expect(blocked.allowed).toBe(false);
  });

  it("should apply specific config for sale-create endpoint", () => {
    for (let i = 0; i < 20; i++) {
      const result = rateLimiter.check("sale-create", "client-1");
      expect(result.allowed).toBe(true);
    }
    const blocked = rateLimiter.check("sale-create", "client-1");
    expect(blocked.allowed).toBe(false);
  });
});
