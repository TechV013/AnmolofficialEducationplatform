export type StudioResourceType = "PDF" | "DOCUMENT" | "PROJECT_FILE" | "EXTERNAL_LINK";

const UPLOAD_PREFIX = "/uploads/";
const DATA_URI_PREFIX = "data:";

/**
 * Largest inline payload accepted as a stored resource reference. Mirrors the
 * document cap in uploadFile.ts: base64 inflates bytes by ~4/3, so a 2 MB file
 * occupies roughly 2.7 MB of a database row. Anything larger must be uploaded
 * to object storage instead.
 */
export const MAX_INLINE_RESOURCE_BYTES = 2 * 1024 * 1024;

const ALLOWED_EXTENSIONS: Record<Exclude<StudioResourceType, "EXTERNAL_LINK">, string[]> = {
  PDF: [".pdf"],
  DOCUMENT: [".doc", ".docx", ".odt", ".rtf", ".txt", ".md"],
  PROJECT_FILE: [".zip", ".rar", ".7z", ".tar", ".gz", ".jar", ".java", ".sql", ".json"]
};

/** MIME types an inline resource may declare, keyed by resource type. */
const INLINE_MIME_TYPES: Record<Exclude<StudioResourceType, "EXTERNAL_LINK">, string[]> = {
  PDF: ["application/pdf"],
  DOCUMENT: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.oasis.opendocument.text",
    "application/rtf",
    "text/plain",
    "text/markdown"
  ],
  PROJECT_FILE: ["application/zip", "application/x-zip-compressed"]
};

export function isUploadedFilePath(url: string): boolean {
  return url.trim().startsWith(UPLOAD_PREFIX);
}

export function isInlineDataUrl(url: string): boolean {
  return url.trim().startsWith(DATA_URI_PREFIX);
}

interface InlineDataUrl {
  mimeType: string;
  byteLength: number;
}

/**
 * Parses a base64 data URI and returns its declared MIME type and decoded size,
 * or null when the reference is not a well-formed inline payload. Size is
 * computed from the base64 length so oversized values are rejected without
 * allocating a buffer for them.
 */
function parseInlineDataUrl(url: string): InlineDataUrl | null {
  const trimmed = url.trim();
  const comma = trimmed.indexOf(",");
  if (comma === -1) return null;

  const header = trimmed.slice(DATA_URI_PREFIX.length, comma);
  const base64 = trimmed.slice(comma + 1);
  if (!base64) return null;

  const [rawMime, ...params] = header.split(";");
  const mimeType = rawMime.trim().toLowerCase();
  if (!mimeType) return null;
  if (!params.some((p) => p.trim().toLowerCase() === "base64")) return null;

  // base64 -> bytes: 3 bytes per 4 chars, less one group per padding sign.
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const byteLength = Math.max(0, Math.floor((base64.length * 3) / 4) - padding);

  return { mimeType, byteLength };
}

/** True when the reference is a base64 data URI within the inline size cap. */
export function isValidInlineResourceUrl(url: string): boolean {
  const parsed = parseInlineDataUrl(url);
  if (!parsed) return false;
  if (parsed.byteLength > MAX_INLINE_RESOURCE_BYTES) return false;
  return Object.values(INLINE_MIME_TYPES).some((types) => types.includes(parsed.mimeType));
}

/**
 * Accepts an absolute http(s) URL, a site-relative path produced by
 * /api/upload, or a size-capped base64 data URI produced when object storage is
 * unavailable. Rejects traversal and whitespace in stored upload references.
 */
export function isValidResourceUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  const trimmed = url.trim();

  if (trimmed.startsWith(UPLOAD_PREFIX)) {
    const fileName = trimmed.slice(UPLOAD_PREFIX.length);
    return fileName.length > 0 && !fileName.includes("..") && !/\s/.test(fileName);
  }

  if (isInlineDataUrl(trimmed)) {
    return isValidInlineResourceUrl(trimmed);
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    return Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export function isAllowedResourceExtension(type: StudioResourceType, url: string): boolean {
  if (type === "EXTERNAL_LINK") return true;

  // An inline reference carries no filename, so its declared MIME type is the
  // only thing that can be checked. Validate it against this resource type
  // rather than letting it through unchecked.
  if (isInlineDataUrl(url)) {
    const parsed = parseInlineDataUrl(url);
    return parsed ? INLINE_MIME_TYPES[type].includes(parsed.mimeType) : false;
  }

  if (!isUploadedFilePath(url)) return true;
  const path = url.trim().toLowerCase().split("?")[0];
  return ALLOWED_EXTENSIONS[type].some((ext) => path.endsWith(ext));
}
