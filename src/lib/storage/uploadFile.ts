import { mkdir, writeFile, unlink } from "fs/promises";
import { join } from "path";

/**
 * Single entry point for persisting uploaded bytes.
 *
 * The driver is intentionally hidden behind `putFile()` so a real object store
 * (Cloudflare R2 is S3-compatible) can replace the local-disk driver without any
 * call site changing. Callers only ever store the returned `url`.
 */

export type UploadKind = "video" | "document" | "image" | "archive";

export interface PutFileInput {
  filename: string;
  body: Buffer;
  contentType?: string | null;
  kind: UploadKind;
}

export interface PutFileResult {
  /** Stored reference, safe to persist in Resource.url / Lesson.videoUrl. */
  url: string;
  /** Driver-specific key, used for cleanup when a later DB write fails. */
  storageKey: string;
  size: number;
  /** True when the bytes could not be persisted and were inlined as a data URI. */
  inlined: boolean;
}

interface Category {
  extensions: string[];
  mimeTypes: string[];
  maxBytes: number;
}

const MB = 1024 * 1024;

const CATEGORIES: Record<UploadKind, Category> = {
  video: {
    extensions: ["mp4", "webm", "mov", "m4v", "ogv", "avi"],
    mimeTypes: ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v", "video/ogg", "video/x-msvideo"],
    maxBytes: 1024 * MB
  },
  document: {
    extensions: ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "csv", "txt", "md", "rtf"],
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "text/plain",
      "text/markdown",
      "application/rtf"
    ],
    maxBytes: 10 * MB
  },
  image: {
    extensions: ["png", "jpg", "jpeg", "webp", "gif", "svg"],
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"],
    maxBytes: 5 * MB
  },
  archive: {
    extensions: ["zip"],
    mimeTypes: ["application/zip", "application/x-zip-compressed"],
    maxBytes: 25 * MB
  }
};

export class UploadError extends Error {
  constructor(
    message: string,
    readonly status: number = 400
  ) {
    super(message);
    this.name = "UploadError";
  }
}

/** Infers the upload category from the file extension. */
export function detectKind(filename: string): UploadKind | null {
  const ext = extensionOf(filename);
  if (!ext) return null;
  for (const kind of Object.keys(CATEGORIES) as UploadKind[]) {
    if (CATEGORIES[kind].extensions.includes(ext)) return kind;
  }
  return null;
}

function extensionOf(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return "";
  return base.slice(dot + 1).toLowerCase();
}

/**
 * Reduces a client-supplied filename to a safe basename: strips any directory
 * component, rejects traversal and double-extension tricks, and strips
 * characters that are unsafe in a URL or on disk.
 */
export function sanitizeFilename(raw: string): string {
  const base = (raw.split(/[\\/]/).pop() ?? "").trim();
  if (!base) throw new UploadError("Missing filename", 400);
  if (base === "." || base === "..") throw new UploadError("Invalid filename", 400);

  const cleaned = base
    .replace(/[^\w.\- ]+/g, "_")
    .replace(/_{2,}/g, "_")
    .trim();

  // "report.pdf.exe" -> only the trailing extension is meaningful; a leading
  // extension that looks like another allowed one is a spoofing attempt.
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    const leading = parts.slice(0, -1).map((p) => p.toLowerCase());
    const knownLeading = leading.some((p) =>
      Object.values(CATEGORIES).some((c) => c.extensions.includes(p))
    );
    if (knownLeading) {
      throw new UploadError(`Blocked suspicious filename "${base}"`, 400);
    }
  }

  if (!cleaned || cleaned.startsWith(".")) throw new UploadError("Invalid filename", 400);
  return cleaned;
}

/**
 * Validates extension and content type agree, and that the size fits the
 * category cap. The extension is authoritative: a caller-supplied `kind` can
 * never widen the allowance. Both checks matter because extension alone can be
 * spoofed and browsers report an empty or generic type for some formats.
 */
export function validateUpload(input: PutFileInput): { kind: UploadKind; ext: string; maxBytes: number } {
  const kind = detectKind(input.filename);
  if (!kind) {
    throw new UploadError(`Unsupported file type: "${input.filename}".`, 415);
  }

  const category = CATEGORIES[kind];
  const ext = extensionOf(input.filename);

  const declared = (input.contentType ?? "").split(";")[0].trim().toLowerCase();
  if (declared && declared !== "application/octet-stream" && !category.mimeTypes.includes(declared)) {
    throw new UploadError(`File type "${declared}" does not match .${ext} files.`, 415);
  }
  if (input.body.byteLength === 0) {
    throw new UploadError("File is empty.", 400);
  }
  if (input.body.byteLength > category.maxBytes) {
    throw new UploadError(
      `File exceeds the ${Math.round(category.maxBytes / MB)} MB limit for .${ext} files.`,
      413
    );
  }

  return { kind, ext, maxBytes: category.maxBytes };
}

function uniqueName(safeName: string): string {
  const ext = extensionOf(safeName);
  const stem = ext ? safeName.slice(0, -(ext.length + 1)) : safeName;
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return ext ? `${stamp}-${stem}.${ext}` : `${stamp}-${safeName}`;
}

/**
 * Persists bytes. Local disk is the only driver until object storage is wired
 * in; when the filesystem is read-only (serverless) only video may fall back to
 * an inlined data URI, because documents would otherwise store raw bytes in
 * PostgreSQL.
 */
export async function putFile(input: PutFileInput): Promise<PutFileResult> {
  const safeName = sanitizeFilename(input.filename);
  const { kind } = validateUpload({ ...input, filename: safeName });
  const fileName = uniqueName(safeName);
  const url = `/uploads/${fileName}`;
  const uploadDir = join(process.cwd(), "public/uploads");

  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, fileName), input.body);
    return { url, storageKey: fileName, size: input.body.byteLength, inlined: false };
  } catch (fsErr) {
    console.warn("Filesystem write failed (read-only environment?):", fsErr);
    if (kind === "video") {
      const type = input.contentType || "application/octet-stream";
      const dataUri = `data:${type};base64,${input.body.toString("base64")}`;
      return { url: dataUri, storageKey: "", size: input.body.byteLength, inlined: true };
    }
    throw new UploadError(
      "File storage is not available for documents on this host. Configure object storage (R2) to enable document uploads.",
      503
    );
  }
}

/** Best-effort removal after a failed DB write. No-op for inlined uploads. */
export async function removeStoredFile(storageKey: string): Promise<void> {
  if (!storageKey) return;
  try {
    await unlink(join(process.cwd(), "public/uploads", storageKey));
  } catch {
    // Nothing actionable: the file was never persisted or is already gone.
  }
}

export const UPLOAD_CATEGORY_LIMITS = Object.fromEntries(
  (Object.keys(CATEGORIES) as UploadKind[]).map((k) => [k, CATEGORIES[k].maxBytes])
);
