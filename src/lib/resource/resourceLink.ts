/**
 * Decides whether a stored file reference should offer a real download or open
 * as a third-party link.
 *
 * Both storage drivers write under an `uploads/` path segment — the local disk
 * driver produces `/uploads/<name>` and R2 produces `<publicUrl>/uploads/<name>`
 * — so the path identifies our own files without needing the storage config.
 * That matters because these checks run in client components, where non-public
 * environment variables are not available.
 */
export function isDownloadableResourceUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Inlined bytes when object storage is unavailable.
  if (trimmed.startsWith("data:")) return true;

  // Site-relative reference from the local disk driver.
  if (trimmed.startsWith("/")) return trimmed.startsWith("/uploads/");

  try {
    const { pathname } = new URL(trimmed);
    return pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
}
