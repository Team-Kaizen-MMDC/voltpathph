import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Web Deployment Configuration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should use VITE_API_URL from environment if provided", async () => {
    // Mock import.meta.env
    vi.stubEnv("VITE_API_URL", "https://api.voltph.com");

    const { API_URL } = await import("../src/config");
    expect(API_URL).toBe("https://api.voltph.com");
  });

  it("should fallback to localhost:3001 if VITE_API_URL is not provided", async () => {
    vi.stubEnv("VITE_API_URL", "");

    const { API_URL } = await import("../src/config");
    expect(API_URL).toBe("http://localhost:3001");
  });
});
