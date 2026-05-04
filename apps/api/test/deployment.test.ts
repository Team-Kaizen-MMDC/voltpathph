/* eslint-disable @typescript-eslint/no-explicit-any */

describe("Deployment Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should use DATABASE_URL if provided", async () => {
    process.env.DATABASE_URL = "postgres://user:pass@host:5432/db";

    // Using dynamic import to re-evaluate the module with new env vars
    const { AppDataSource: testDataSource } =
      await import("../src/data-source");

    expect(testDataSource.options.type).toBe("postgres");
    expect((testDataSource.options as any).url).toBe(process.env.DATABASE_URL);
  });

  it("should fallback to individual DB_* variables if DATABASE_URL is not provided", async () => {
    delete process.env.DATABASE_URL;
    process.env.DB_HOST = "custom-host";
    process.env.DB_PORT = "1234";
    process.env.DB_USERNAME = "custom-user";
    process.env.DB_PASSWORD = "custom-password";
    process.env.DB_DATABASE = "custom-db";

    const { AppDataSource: testDataSource } =
      await import("../src/data-source");

    expect(testDataSource.options.type).toBe("postgres");
    expect((testDataSource.options as any).host).toBe("custom-host");
    expect((testDataSource.options as any).port).toBe(1234);
    expect((testDataSource.options as any).username).toBe("custom-user");
    expect((testDataSource.options as any).database).toBe("custom-db");
  });
});
