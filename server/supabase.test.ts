import { describe, expect, it } from "vitest";
import { getMessageChannel, getSupabaseAdmin } from "./supabase";

describe("Supabase integration safety", () => {
  it("validates the configured project endpoint with the service key", async () => {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(url).toBeTruthy();
    expect(serviceRoleKey).toBeTruthy();
    const response = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: serviceRoleKey as string, Authorization: `Bearer ${serviceRoleKey}` } });
    expect(response.ok).toBe(true);
  });

  it("does not create a privileged client when server secrets are absent", () => {
    const originalUrl = process.env.SUPABASE_URL;
    const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(getSupabaseAdmin()).toBeNull();
    if (originalUrl) process.env.SUPABASE_URL = originalUrl;
    if (originalKey) process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  });

  it("creates a non-identifying channel name", () => {
    const channel = getMessageChannel(12345);
    expect(channel).toMatch(/^[a-f0-9]{40}$/);
    expect(channel).not.toContain("12345");
  });
});
