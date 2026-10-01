export type StudioResourceType = "PDF" | "DOCUMENT" | "PROJECT_FILE" | "EXTERNAL_LINK";

const UPLOAD_PREFIX = "/uploads/";

const ALLOWED_EXTENSIONS: Record<Exclude<StudioResourceType, "EXTERNAL_LINK">, string[]> = {
  PDF: [".pdf"],
  DOCUMENT: [".doc", ".docx", ".odt", ".rtf", ".txt", ".md"],
  PROJECT_FILE: [".zip", ".rar", ".7z", ".tar", ".gz", ".jar", ".java", ".sql", ".json"]
};

export function isUploadedFilePath(url: string): boolean {
  return url.trim().startsWith(UPLOAD_PREFIX);
}

/**
 * Accepts either an absolute http(s) URL or a site-relative path produced by
 * /api/upload. Rejects traversal and whitespace in stored upload references.
 */
export function isValidResourceUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  const trimmed = url.trim();

  if (trimmed.startsWith(UPLOAD_PREFIX)) {
    const fileName = trimmed.slice(UPLOAD_PREFIX.length);
    return fileName.length > 0 && !fileName.includes("..") && !/\s/.test(fileName);
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
  if (!isUploadedFilePath(url)) return true;
  const path = url.trim().toLowerCase().split("?")[0];
  return ALLOWED_EXTENSIONS[type].some((ext) => path.endsWith(ext));
}
