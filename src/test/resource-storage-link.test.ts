import { describe, it, expect, afterEach } from "vitest";
import {
  isValidResourceUrl,
  isAllowedResourceExtension,
  isValidInlineResourceUrl,
  isInlineDataUrl,
  MAX_INLINE_RESOURCE_BYTES
} from "@/lib/resource/validateResourceUrl";
import { isDownloadableResourceUrl } from "@/lib/resource/resourceLink";

function dataUri(mimeType: string, byteLength: number): string {
  // base64 expands 3 bytes into 4 characters.
  const chars = Math.ceil((byteLength / 3) * 4);
  const b64 = "A".repeat(chars);
  return `data:${mimeType};base64,${b64}`;
}

describe("inline data URI detection", () => {
  it("recognises inline references", () => {
    expect(isInlineDataUrl("data:application/pdf;base64,AAA")).toBe(true);
    expect(isInlineDataUrl("/uploads/x.pdf")).toBe(false);
    expect(isInlineDataUrl("https://example.com/x.pdf")).toBe(false);
  });

  it("requires the base64 marker and a non-empty payload", () => {
    expect(isValidInlineResourceUrl("data:application/pdf,AAA")).toBe(false);
    expect(isValidInlineResourceUrl("data:application/pdf;base64,")).toBe(false);
  });

  it("rejects a payload over the inline cap", () => {
    const over = dataUri("application/pdf", MAX_INLINE_RESOURCE_BYTES + 1);
    expect(isValidInlineResourceUrl(over)).toBe(false);
  });

  it("accepts a payload at the cap", () => {
    const at = dataUri("application/pdf", MAX_INLINE_RESOURCE_BYTES);
    expect(isValidInlineResourceUrl(at)).toBe(true);
  });

  it("rejects a MIME type that is not an allowed document", () => {
    expect(isValidInlineResourceUrl(dataUri("application/x-msdownload", 64))).toBe(false);
    expect(isValidInlineResourceUrl(dataUri("text/html", 64))).toBe(false);
  });
});

describe("isValidResourceUrl", () => {
  it("still accepts uploaded paths and http(s) links", () => {
    expect(isValidResourceUrl("/uploads/1700000000-brief.pdf")).toBe(true);
    expect(isValidResourceUrl("https://example.com/brief.pdf")).toBe(true);
  });

  it("rejects traversal and whitespace in upload paths", () => {
    expect(isValidResourceUrl("/uploads/../secret.pdf")).toBe(false);
    expect(isValidResourceUrl("/uploads/two words.pdf")).toBe(false);
    expect(isValidResourceUrl("/uploads/")).toBe(false);
  });

  it("rejects non-http schemes other than data", () => {
    expect(isValidResourceUrl("javascript:alert(1)")).toBe(false);
    expect(isValidResourceUrl("file:///etc/passwd")).toBe(false);
  });

  it("accepts a size-capped inline document so a fallback upload can be stored", () => {
    expect(isValidResourceUrl(dataUri("application/pdf", 1024))).toBe(true);
    expect(isValidResourceUrl(dataUri("text/plain", 1024))).toBe(true);
  });

  it("rejects an oversized inline document", () => {
    expect(isValidResourceUrl(dataUri("application/pdf", MAX_INLINE_RESOURCE_BYTES + 1))).toBe(false);
  });
});

describe("isAllowedResourceExtension", () => {
  it("checks the declared MIME type for inline references", () => {
    // A data URI carries no filename, so the MIME type is the only signal.
    expect(isAllowedResourceExtension("PDF", dataUri("application/pdf", 512))).toBe(true);
    expect(isAllowedResourceExtension("DOCUMENT", dataUri("application/pdf", 512))).toBe(false);
    expect(isAllowedResourceExtension("PROJECT_FILE", dataUri("application/zip", 512))).toBe(true);
    expect(isAllowedResourceExtension("PROJECT_FILE", dataUri("application/pdf", 512))).toBe(false);
  });

  it("rejects a malformed inline reference rather than passing it through", () => {
    expect(isAllowedResourceExtension("PDF", "data:application/pdf;base64,")).toBe(false);
    expect(isAllowedResourceExtension("PDF", "data:,plain")).toBe(false);
  });

  it("still checks extensions for upload paths", () => {
    expect(isAllowedResourceExtension("PDF", "/uploads/a.pdf")).toBe(true);
    expect(isAllowedResourceExtension("PDF", "/uploads/a.zip")).toBe(false);
  });

  it("accepts any URL for an external link", () => {
    expect(isAllowedResourceExtension("EXTERNAL_LINK", "https://example.com")).toBe(true);
  });
});

describe("isDownloadableResourceUrl", () => {
  const originalEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("treats local upload paths as downloads", () => {
    expect(isDownloadableResourceUrl("/uploads/brief.pdf")).toBe(true);
  });

  it("treats object-store upload paths as downloads even on another origin", () => {
    expect(isDownloadableResourceUrl("https://cdn.example.com/uploads/brief.pdf")).toBe(true);
  });

  it("treats inline bytes as a download", () => {
    expect(isDownloadableResourceUrl("data:application/pdf;base64,AAA")).toBe(true);
  });

  it("does not treat third-party links or unrelated paths as downloads", () => {
    expect(isDownloadableResourceUrl("https://example.com/brief.pdf")).toBe(false);
    expect(isDownloadableResourceUrl("/avatars/me.png")).toBe(false);
    expect(isDownloadableResourceUrl("")).toBe(false);
  });
});
