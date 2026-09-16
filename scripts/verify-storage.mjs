import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: buckets, error } = await supabase.storage.listBuckets();
if (error) throw error;
const bucket = buckets.find((item) => item.id === "submissions");
if (!bucket || bucket.public !== false) throw new Error("The submissions bucket is missing or public");
console.log("Supabase private submissions bucket verified");
