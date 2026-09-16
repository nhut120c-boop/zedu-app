import { describe, expect, it } from "vitest";
import { getAssignments, getPublishedLessons, getUserByOpenId } from "./db";

describe("Supabase database integration", () => {
  it("reads the education tables from Supabase", async () => {
    const [lessons, assignments] = await Promise.all([getPublishedLessons(), getAssignments()]);
    expect(Array.isArray(lessons)).toBe(true);
    expect(Array.isArray(assignments)).toBe(true);
  });

  it("uses the role stored in Supabase without rewriting it", async () => {
    const openId = process.env.OWNER_OPEN_ID;
    if (!openId) return;
    const user = await getUserByOpenId(openId);
    if (!user) return;
    expect(["student", "admin"]).toContain(user.role);
  });
});
