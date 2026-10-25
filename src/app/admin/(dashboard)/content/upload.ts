import type { UploadKind } from "@/lib/r2";
import { getUploadUrl } from "./actions";

// Gets a signed URL from the server, then sends the file straight to R2, reporting progress.
export async function uploadFile(kind: UploadKind, file: File, onProgress?: (fraction: number) => void): Promise<string> {
  const signed = await getUploadUrl(kind, file.name, file.type, file.size);
  if ("error" in signed) throw new Error(signed.error);

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signed.uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status}).`)));
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and the bucket's CORS settings."));
    xhr.send(file);
  });
  return signed.publicUrl;
}
