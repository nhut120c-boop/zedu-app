import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anonKey || !serviceRoleKey) throw new Error("Supabase realtime smoke test requires URL, anon key, and service role key");

const suffix = crypto.randomUUID();
const topic = `zedu-smoke-${suffix}`;
const receiver = createClient(url, anonKey, { auth: { persistSession: false } });
const sender = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

const received = new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("Realtime event was not received within 5 seconds")), 5000);
  receiver.channel(topic).on("broadcast", { event: "smoke" }, (payload) => {
    clearTimeout(timer);
    resolve(payload.payload?.ok === true);
  }).subscribe(async (status) => {
    if (status !== "SUBSCRIBED") return;
    const channel = sender.channel(topic);
    await channel.subscribe();
    await channel.send({ type: "broadcast", event: "smoke", payload: { ok: true } });
    await sender.removeChannel(channel);
  });
});

if (!(await received)) throw new Error("Realtime payload mismatch");
await receiver.removeAllChannels();
console.log("Supabase Broadcast realtime verified");
