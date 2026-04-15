import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://btiyedvlrrioyctopflp.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const BUCKET = "archivos-gipch";

export function getPublicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export function detectTipo(mimeType: string, filename: string): string {
  if (mimeType.startsWith("image/")) return "imagen";
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    filename.endsWith(".xlsx") ||
    filename.endsWith(".xls") ||
    filename.endsWith(".csv")
  )
    return "excel";
  if (
    mimeType.includes("word") ||
    mimeType === "application/msword" ||
    filename.endsWith(".doc") ||
    filename.endsWith(".docx")
  )
    return "word";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  return "otro";
}

export async function uploadFile(
  file: File | Blob,
  path: string,
  contentType: string
): Promise<string> {
  // Usamos Uint8Array en lugar de Buffer para compatibilidad con edge runtime
  const arrayBuffer = await (file as Blob).arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType, upsert: false });
  if (error) throw new Error(error.message);
  return getPublicUrl(path);
}

export async function deleteFile(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path]);
}
