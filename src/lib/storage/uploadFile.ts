import { mkdir, writeFile, unlink } from "fs/promises";
import { join } from "path";

/**
 * Single entry point for persisting uploaded bytes.
 *
 * The driver is intentionally hidden behind `putFile()` so the backing store can
 * change without any call site changing. Callers only ever store the returned
 * `url`, which may be an object-store URL, a local path, or an inline data URI.
 */

export type UploadKind = "video" | "document" | "image" | "archive";

/** Which backend actually persisted the bytes. */
export type UploadDriver = "r2" | "disk" | "inline";

export interface PutFileInput {
  filename: string;
  body: Buffer;
  contentType?: string | null;
  kind: UploadKind;
}

export interface PutFileResult {
  /** Stored reference, safe to persist in Resource.url / Lesson.videoUrl. */
  url: string;
  /** Driver-prefixed key (e.g. "r2:uploads/x.pdf"), used to undo the write. */
  storageKey: string;
  size: number;
  /** True when the bytes could not be persisted and were inlined as a data URI. */
  inlined: boolean;
  driver: UploadDriver;
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
 * Inline safety net. Base64 inflates bytes by ~4/3, so an inline payload costs
 * roughly a third more than the file. Documents are capped tightly because they
 * live in PostgreSQL; video keeps a much higher ceiling so existing uploads keep
 * working on hosts with no object storage. Once R2 is configured neither cap
 * applies, since bytes never touch the database.
 */
export const INLINE_MAX_BYTES: Record<UploadKind, number> = {
  video: 64 * MB,
  document: 2 * MB,
  image: 2 * MB,
  archive: 2 * MB
};

/** Bytes above this are logged when inlined, since they are a DB-bloat risk. */
const INLINE_WARN_BYTES = 25 * MB;

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
}

/**
 * R2 is treated as configured only when every required variable is present, so
 * a half-filled environment degrades to the next driver instead of failing at
 * the S3 call with a confusing signature error.
 */
export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) return null;
  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicUrl: publicUrl.replace(/\/+$/, "")
  };
}

/**
 * Imported lazily so the S3 SDK is only pulled into serverless bundles that
 * actually upload, and never into a client component.
 */
async function r2Client() {
  const cfg = getR2Config();
  if (!cfg) return null;
  const { S3Client } = await import("@aws-sdk/client-s3");
  return {
    cfg,
    client: new S3Client({
      region: "auto",
      endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey }
    })
  };
}

async function putToR2(
  input: PutFileInput,
  key: string
): Promise<PutFileResult | null> {
  const session = await r2Client();
  if (!session) return null;
  const { cfg, client } = session;
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");

  await client.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: input.body,
      ContentType: input.contentType || "application/octet-stream"
    })
  );

  return {
    url: `${cfg.publicUrl}/${key}`,
    storageKey: `r2:${key}`,
    size: input.body.byteLength,
    inlined: false,
    driver: "r2"
  };
}

async function putToDisk(
  input: PutFileInput,
  fileName: string
): Promise<PutFileResult> {
  const uploadDir = join(process.cwd(), "public/uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, fileName), input.body);
  return {
    url: `/uploads/${fileName}`,
    storageKey: `disk:${fileName}`,
    size: input.body.byteLength,
    inlined: false,
    driver: "disk"
  };
}

function inlineAsDataUri(
  input: PutFileInput,
  kind: UploadKind
): PutFileResult {
  const cap = INLINE_MAX_BYTES[kind];
  if (input.body.byteLength > cap) {
    throw new UploadError(
      `File is too large to store on this host (limit ${Math.round(
        cap / MB
      )} MB without object storage). Configure R2 storage to enable larger uploads.`,
      413
    );
  }
  if (input.body.byteLength > INLINE_WARN_BYTES) {
    console.warn(
      `Inlining a ${(input.body.byteLength / MB).toFixed(1)} MB ${kind} into the database. Configure R2 to avoid this.`
    );
  }
  const type = input.contentType || "application/octet-stream";
  return {
    url: `data:${type};base64,${input.body.toString("base64")}`,
    storageKey: "",
    size: input.body.byteLength,
    inlined: true,
    driver: "inline"
  };
}

/**
 * Persists bytes through the first driver that succeeds:
 *   1. Cloudflare R2, when configured (survives serverless restarts)
 *   2. local disk (development)
 *   3. an inline data URI (last resort on read-only hosts such as Vercel)
 *
 * A failure in an earlier driver falls through to the next rather than
 * aborting, so a misconfigured or unreachable object store degrades instead of
 * taking uploads offline.
 */
export async function putFile(input: PutFileInput): Promise<PutFileResult> {
  const safeName = sanitizeFilename(input.filename);
  const { kind } = validateUpload({ ...input, filename: safeName });
  const fileName = uniqueName(safeName);

  if (getR2Config()) {
    try {
      const stored = await putToR2(input, `uploads/${fileName}`);
      if (stored) return stored;
    } catch (r2Err) {
      console.error("R2 upload failed, falling back:", r2Err);
    }
  }

  try {
    return await putToDisk(input, fileName);
  } catch (fsErr) {
    console.warn("Filesystem write failed (read-only environment?):", fsErr);
    return inlineAsDataUri(input, kind);
  }
}

/**
 * Best-effort removal after a failed DB write. The driver is encoded in the key
 * so cleanup targets the backend that actually holds the bytes. Inline uploads
 * own no external bytes and are a no-op.
 */
export async function removeStoredFile(storageKey: string): Promise<void> {
  if (!storageKey) return;

  const sep = storageKey.indexOf(":");
  const driver = sep === -1 ? "disk" : storageKey.slice(0, sep);
  const key = sep === -1 ? storageKey : storageKey.slice(sep + 1);

  try {
    if (driver === "r2") {
      const session = await r2Client();
      if (!session) return;
      const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
      await session.client.send(
        new DeleteObjectCommand({ Bucket: session.cfg.bucket, Key: key })
      );
      return;
    }
    if (driver === "disk") {
      await unlink(join(process.cwd(), "public/uploads", key));
    }
  } catch {
    // Nothing actionable: the file was never persisted or is already gone.
  }
}

export const UPLOAD_CATEGORY_LIMITS = Object.fromEntries(
  (Object.keys(CATEGORIES) as UploadKind[]).map((k) => [k, CATEGORIES[k].maxBytes])
);
