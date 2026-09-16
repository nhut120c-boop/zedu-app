import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");

const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const { data, error } = await supabase.storage.createBucket("submissions", {
  public: false,
  fileSizeLimit: "10485760",
});
if (error && !/already exists|duplicate/i.test(error.message)) {
  throw new Error(`Could not create submissions bucket: ${error.message}`);
}
console.log(data ? "Created private submissions bucket." : "Private submissions bucket already exists.");
