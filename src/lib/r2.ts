import "server-only";
import { AwsClient } from "aws4fetch";

// Uploads go straight from the admin's browser to Cloudflare R2 with a short-lived signed
// URL, so large photos and recordings never pass through (or hit the body limit of) our
// server functions. The bucket needs a CORS rule allowing PUT from the site's origin.

export const uploadKinds = {
  image: { types: ["image/jpeg", "image/png", "image/webp", "image/avif"], maxBytes: 10 * 1024 * 1024 },
  audio: { types: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/wav", "audio/x-wav", "audio/ogg", "audio/webm"], maxBytes: 30 * 1024 * 1024 },
} as const;

export type UploadKind = keyof typeof uploadKinds;

function config() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_URL) return null;
  return {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET,
    publicUrl: R2_PUBLIC_URL.replace(/\/+$/, ""),
  };
}

export function r2Configured() {
  return config() !== null;
}

// "My Photo (1).JPG" -> "my-photo-1.jpg"
function slug(fileName: string) {
  const dot = fileName.lastIndexOf(".");
  const base = (dot > 0 ? fileName.slice(0, dot) : fileName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const ext = dot > 0 ? fileName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  return `${base.slice(0, 60) || "file"}${ext ? `.${ext}` : ""}`;
}

export async function createUploadUrl(kind: UploadKind, fileName: string, contentType: string) {
  const r2 = config();
  if (!r2) throw new Error("R2 is not configured.");
  const key = `${kind}s/${new Date().getFullYear()}/${crypto.randomUUID().slice(0, 8)}-${slug(fileName)}`;
  const client = new AwsClient({ accessKeyId: r2.accessKeyId, secretAccessKey: r2.secretAccessKey, service: "s3", region: "auto" });
  const url = new URL(`https://${r2.accountId}.r2.cloudflarestorage.com/${r2.bucket}/${key}`);
  url.searchParams.set("X-Amz-Expires", "600");
  const signed = await client.sign(new Request(url, { method: "PUT", headers: { "Content-Type": contentType } }), {
    aws: { signQuery: true },
  });
  return { uploadUrl: signed.url, publicUrl: `${r2.publicUrl}/${key}` };
}
