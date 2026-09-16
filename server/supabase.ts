import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import { storagePut } from "./storage";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  if (!client) client = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  return client;
}

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY);
}

export function getMessageChannel(userId: number) {
  const secret = process.env.JWT_SECRET || "zedu-realtime-channel";
  return createHmac("sha256", secret).update(`message:${userId}`).digest("hex").slice(0, 40);
}

export async function uploadSubmissionFile(userId: number, fileName: string, data: Buffer, contentType: string) {
  const supabase = getSupabaseAdmin();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120) || "attachment";
  const path = `submissions/${userId}/${crypto.randomUUID()}-${safeName}`;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "submissions";
  if (supabase) {
    const uploaded = await supabase.storage.from(bucket).upload(path, data, { contentType, upsert: false });
    if (uploaded.error) throw new Error(`Supabase upload failed: ${uploaded.error.message}`);
    return { key: path };
  }
  const uploaded = await storagePut(path, data, contentType);
  return { key: uploaded.key };
}

export async function getSubmissionFileUrl(key: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "submissions";
    const signed = await supabase.storage.from(bucket).createSignedUrl(key, 5 * 60);
    if (signed.error || !signed.data?.signedUrl) throw new Error(`Supabase signed URL failed: ${signed.error?.message || "unknown error"}`);
    return signed.data.signedUrl;
  }
  return `/manus-storage/${key.replace(/^\/+/, "")}`;
}

export async function uploadAssignmentFile(fileName: string, data: Buffer, contentType: string) {
  const supabase = getSupabaseAdmin();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120) || "attachment";
  const path = `assignments/${crypto.randomUUID()}-${safeName}`;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "submissions";
  if (supabase) {
    const uploaded = await supabase.storage.from(bucket).upload(path, data, { contentType, upsert: false });
    if (uploaded.error) throw new Error(`Supabase upload failed: ${uploaded.error.message}`);
    return { key: path };
  }
  const uploaded = await storagePut(path, data, contentType);
  return { key: uploaded.key };
}

export async function getAssignmentFileUrl(key: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "submissions";
    const signed = await supabase.storage.from(bucket).createSignedUrl(key, 5 * 60);
    if (signed.error || !signed.data?.signedUrl) throw new Error(`Supabase signed URL failed: ${signed.error?.message || "unknown error"}`);
    return signed.data.signedUrl;
  }
  return `/manus-storage/${key.replace(/^\/+/, "")}`;
}

export async function broadcastMessageEvent(recipientId: number, messageId: number) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const channel = supabase.channel(`message-events:${getMessageChannel(recipientId)}`);
  try {
    await channel.subscribe();
    const result = await channel.send({ type: "broadcast", event: "message:new", payload: { messageId } });
    if (result !== "ok") console.warn("[Supabase] Broadcast did not complete:", result);
  } catch (error) {
    console.warn("[Supabase] Broadcast skipped; message remains stored:", error);
  } finally {
    await supabase.removeChannel(channel);
  }
}
