import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getMessageChannel } from "./supabase";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: "student" | "admin"): TrpcContext {
  const user: AuthenticatedUser = {
    id: role === "admin" ? 99 : 100,
    openId: `security-${role}`,
    email: `${role}@example.com`,
    name: role === "admin" ? "Admin" : "Student",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("ZEdu security boundaries", () => {
  it("does not expose role through auth.me", async () => {
    const result = await appRouter.createCaller(createContext("admin")).auth.me();
    expect(result).toMatchObject({ id: 99, name: "Admin", email: "admin@example.com" });
    expect(result).not.toHaveProperty("role");
    expect(result?.messageChannel).toMatch(/^[a-f0-9]{40}$/);
    expect(result?.messageChannel).not.toContain("99");
  });

  it("derives a stable opaque channel that differs per user", () => {
    expect(getMessageChannel(99)).toMatch(/^[a-f0-9]{40}$/);
    expect(getMessageChannel(99)).toBe(getMessageChannel(99));
    expect(getMessageChannel(99)).not.toBe(getMessageChannel(100));
  });

  it("blocks student access to admin overview on the server", async () => {
    const caller = appRouter.createCaller(createContext("student"));
    await expect(caller.learning.adminOverview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
