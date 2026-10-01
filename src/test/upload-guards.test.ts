import { describe, it, expect } from "vitest";
import {
  detectKind,
  validateUpload,
  sanitizeFilename,
  UploadError,
  UPLOAD_CATEGORY_LIMITS,
  type PutFileInput
} from "@/lib/storage/uploadFile";

const MB = 1024 * 1024;

function body(size: number): Buffer {
  return Buffer.alloc(size, 0x61);
}

function input(filename: string, contentType: string, size: number): PutFileInput {
  return { filename, body: body(size), contentType, kind: "document" };
}

describe("upload kind detection", () => {
  it("maps allowed extensions to a storage kind", () => {
    expect(detectKind("lecture.pdf")).toBe("document");
    expect(detectKind("slides.pptx")).toBe("document");
    expect(detectKind("dataset.CSV")).toBe("document");
    expect(detectKind("project.zip")).toBe("archive");
    expect(detectKind("clip.webm")).toBe("video");
    expect(detectKind("photo.png")).toBe("image");
  });

  it("rejects executable, unknown, and extensionless filenames", () => {
    for (const name of ["payload.exe", "script.sh", "notes.pdf.exe", "noextension", "archive.tar", ""]) {
      expect(detectKind(name), name).toBeNull();
    }
  });
});

describe("filename sanitisation", () => {
  it("strips directory traversal", () => {
    expect(sanitizeFilename("../../etc/passwd.pdf")).toBe("passwd.pdf");
    expect(sanitizeFilename("..\\..\\windows\\evil.pdf")).toBe("evil.pdf");
  });

  it("blocks double-extension spoofing", () => {
    expect(() => sanitizeFilename("report.pdf.exe")).toThrowError(UploadError);
    expect(() => sanitizeFilename("invoice.pdf.sh")).toThrowError(UploadError);
  });

  it("rejects dotfiles and bare traversal", () => {
    expect(() => sanitizeFilename(".env")).toThrowError(UploadError);
    expect(() => sanitizeFilename("..")).toThrowError(UploadError);
  });
});

describe("upload validation", () => {
  it("accepts a document within the category cap", () => {
    const result = validateUpload(input("brief.pdf", "application/pdf", 1024));
    expect(result).toEqual({ kind: "document", ext: "pdf", maxBytes: UPLOAD_CATEGORY_LIMITS.document });
  });

  it("rejects a MIME type that disagrees with the extension", () => {
    expect(() => validateUpload(input("brief.pdf", "image/png", 512))).toThrowError(/does not match/i);
    try {
      validateUpload(input("brief.pdf", "image/png", 512));
    } catch (e) {
      expect((e as UploadError).status).toBe(415);
    }
  });

  it("rejects an empty file", () => {
    expect(() => validateUpload(input("empty.pdf", "application/pdf", 0))).toThrowError(/empty/i);
  });

  it("rejects a missing filename as unsupported", () => {
    expect(() => validateUpload(input("", "application/pdf", 10))).toThrowError(/Unsupported file type/i);
  });

  it("allows a generic octet-stream content type", () => {
    // Some clients send no useful type for Office formats; the extension governs.
    expect(validateUpload(input("report.docx", "application/octet-stream", 2048)).ext).toBe("docx");
  });

  it("trims MIME parameters", () => {
    expect(validateUpload(input("brief.pdf", "application/pdf; charset=binary", 64)).ext).toBe("pdf");
  });

  it("enforces the per-category size cap with 413", () => {
    const over = UPLOAD_CATEGORY_LIMITS.image + 1;
    expect(() => validateUpload({ filename: "logo.png", body: body(over), contentType: "image/png", kind: "image" })).toThrowError(
      UploadError
    );
    try {
      validateUpload({ filename: "logo.png", body: body(over), contentType: "image/png", kind: "image" });
    } catch (e) {
      expect((e as UploadError).status).toBe(413);
    }
  });

  it("applies a tighter cap for video than for the shared document category", () => {
    // A caller cannot borrow the document budget by declaring a video kind.
    expect(UPLOAD_CATEGORY_LIMITS.video).toBeGreaterThan(0);
    const video = validateUpload({ filename: "lesson.mp4", body: body(2 * MB), contentType: "video/mp4", kind: "video" });
    expect(video.maxBytes).toBe(UPLOAD_CATEGORY_LIMITS.video);
    const doc = validateUpload(input("brief.pdf", "application/pdf", 2 * MB));
    expect(doc.maxBytes).toBe(UPLOAD_CATEGORY_LIMITS.document);
  });

  it("treats the extension as authoritative over a caller-supplied kind", () => {
    // Claiming "video" must not turn an executable into an accepted upload.
    expect(() =>
      validateUpload({ filename: "payload.exe", body: body(16), contentType: "application/octet-stream", kind: "video" })
    ).toThrowError(/Unsupported file type/i);
    // Claiming "document" must not bypass the video MIME allowlist.
    expect(() =>
      validateUpload({ filename: "clip.mp4", body: body(16), contentType: "text/html", kind: "document" })
    ).toThrowError(/does not match/i);
  });
});
