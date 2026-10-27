// File types for admin uploads, shared by the upload form and the server that signs uploads.
// Browsers and operating systems label the same file differently (an MP3 can arrive as
// audio/mp3, audio/x-mpeg or with no type at all, and Windows calls .mpeg files video/mpeg),
// so audio types are normalised before checking, and the file is stored under that type.

export const uploadKinds = {
  image: { types: ["image/jpeg", "image/png", "image/webp", "image/avif"], maxBytes: 10 * 1024 * 1024 },
  audio: {
    types: ["audio/mpeg", "audio/mp4", "audio/aac", "audio/wav", "audio/ogg", "audio/webm"],
    maxBytes: 30 * 1024 * 1024,
  },
} as const;

export type UploadKind = keyof typeof uploadKinds;

// For the file picker, so files with unusual extensions can still be chosen.
export const audioAccept = "audio/*,.mp3,.mpeg,.mpga,.mpg,.mp2,.m4a,.aac,.wav,.ogg,.oga,.opus,.webm";

const audioAliases: Record<string, string> = {
  "audio/mp3": "audio/mpeg",
  "audio/mpeg3": "audio/mpeg",
  "audio/mpg": "audio/mpeg",
  "audio/x-mpeg": "audio/mpeg",
  "audio/x-mp3": "audio/mpeg",
  "audio/x-mpeg-3": "audio/mpeg",
  "audio/x-mpg": "audio/mpeg",
  "audio/x-m4a": "audio/mp4",
  "audio/m4a": "audio/mp4",
  "audio/x-aac": "audio/aac",
  "audio/x-wav": "audio/wav",
  "audio/wave": "audio/wav",
  "audio/vnd.wave": "audio/wav",
  "audio/opus": "audio/ogg",
};

const audioExtensions: Record<string, string> = {
  mp3: "audio/mpeg",
  mpeg: "audio/mpeg",
  mpga: "audio/mpeg",
  mpg: "audio/mpeg",
  mp2: "audio/mpeg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  wav: "audio/wav",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  opus: "audio/ogg",
  webm: "audio/webm",
};

// The type to check and store a file under.
export function uploadContentType(kind: UploadKind, fileName: string, type: string) {
  const given = type.toLowerCase().split(";")[0].trim();
  if (kind !== "audio") return given;
  if (audioAliases[given]) return audioAliases[given];
  if (given === "" || given === "application/octet-stream" || given === "video/mpeg") {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    return audioExtensions[ext] ?? given;
  }
  return given;
}
