import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const putObject = vi.fn();
const deleteObject = vi.fn();
const s3Send = vi.fn((command: unknown) => {
  if ((command as { constructor: { name: string } }).constructor.name === "DeleteObjectCommand") {
    return Promise.resolve(deleteObject(command));
  }
  return Promise.resolve(putObject(command));
});

vi.mock("@aws-sdk/client-s3", () => {
  class PutObjectCommand {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  }
  class DeleteObjectCommand {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  }
  return {
    S3Client: class {
      send = s3Send;
    },
    PutObjectCommand,
    DeleteObjectCommand
  };
});

const fsMocks = vi.hoisted(() => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn()
}));

vi.mock("fs/promises", () => fsMocks);
vi.mock("path", () => ({ join: (...parts: string[]) => parts.join("\\") }));

import {
  putFile,
  removeStoredFile,
  getR2Config,
  INLINE_MAX_BYTES,
  UploadError,
  type PutFileInput
} from "@/lib/storage/uploadFile";

const MB = 1024 * 1024;
const R2_VARS = {
  R2_ACCOUNT_ID: "acct",
  R2_ACCESS_KEY_ID: "akid",
  R2_SECRET_ACCESS_KEY: "secret",
  R2_BUCKET: "bucket",
  R2_PUBLIC_URL: "https://files.example.com/"
};

function pdf(size: number): PutFileInput {
  return {
    filename: "brief.pdf",
    body: Buffer.alloc(size, 0x61),
    contentType: "application/pdf",
    kind: "document"
  };
}

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  fsMocks.mkdir.mockResolvedValue(undefined);
  fsMocks.writeFile.mockResolvedValue(undefined);
  fsMocks.unlink.mockResolvedValue(undefined);
  for (const key of Object.keys(R2_VARS)) delete process.env[key];
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("getR2Config", () => {
  it("is null when no variables are set", () => {
    expect(getR2Config()).toBeNull();
  });

  it("is null when the configuration is incomplete", () => {
    process.env.R2_ACCOUNT_ID = "acct";
    process.env.R2_ACCESS_KEY_ID = "akid";
    // missing the rest
    expect(getR2Config()).toBeNull();
  });

  it("returns a config with a trailing-slash-free public URL", () => {
    Object.assign(process.env, R2_VARS);
    expect(getR2Config()?.publicUrl).toBe("https://files.example.com");
  });
});

describe("putFile driver selection", () => {
  it("prefers R2 and returns a public URL with a driver-prefixed key", async () => {
    Object.assign(process.env, R2_VARS);
    const result = await putFile(pdf(64));

    expect(result.driver).toBe("r2");
    expect(result.inlined).toBe(false);
    expect(result.url.startsWith("https://files.example.com/uploads/")).toBe(true);
    expect(result.url.endsWith(".pdf")).toBe(true);
    expect(result.storageKey).toBe(`r2:uploads/${result.url.split("/uploads/")[1]}`);
    expect(putObject).toHaveBeenCalledTimes(1);
    expect(fsMocks.writeFile).not.toHaveBeenCalled();
  });

  it("falls back to local disk when R2 is not configured", async () => {
    const result = await putFile(pdf(64));

    expect(result.driver).toBe("disk");
    expect(result.url).toMatch(/^\/uploads\/.+\.pdf$/);
    expect(result.storageKey).toMatch(/^disk:/);
    expect(fsMocks.writeFile).toHaveBeenCalledTimes(1);
  });

  it("falls back to the next driver when R2 rejects the upload", async () => {
    Object.assign(process.env, R2_VARS);
    s3Send.mockImplementationOnce(() => Promise.reject(new Error("R2 down")));

    const result = await putFile(pdf(64));

    expect(result.driver).toBe("disk");
    expect(fsMocks.writeFile).toHaveBeenCalledTimes(1);
  });

  it("inlines a document when the filesystem is read-only", async () => {
    fsMocks.writeFile.mockRejectedValueOnce(new Error("EROFS: read-only file system"));

    const result = await putFile(pdf(512));

    expect(result.driver).toBe("inline");
    expect(result.inlined).toBe(true);
    expect(result.url.startsWith("data:application/pdf;base64,")).toBe(true);
    // An inline upload owns no external bytes, so there is nothing to clean up.
    expect(result.storageKey).toBe("");
  });

  it("rejects a document over the inline cap instead of bloating the database", async () => {
    fsMocks.writeFile.mockRejectedValueOnce(new Error("EROFS: read-only file system"));

    await expect(putFile(pdf(INLINE_MAX_BYTES.document + 1))).rejects.toBeInstanceOf(UploadError);
  });

  it("still inlines video past the document cap so existing uploads keep working", async () => {
    fsMocks.writeFile.mockRejectedValueOnce(new Error("EROFS: read-only file system"));

    const result = await putFile({
      filename: "lesson.mp4",
      body: Buffer.alloc(3 * MB, 0x61),
      contentType: "video/mp4",
      kind: "video"
    });

    expect(result.driver).toBe("inline");
    expect(result.inlined).toBe(true);
  });

  it("rejects video beyond the video inline ceiling", async () => {
    fsMocks.writeFile.mockRejectedValueOnce(new Error("EROFS: read-only file system"));

    await expect(
      putFile({
        filename: "lesson.mp4",
        body: Buffer.alloc(INLINE_MAX_BYTES.video + 1, 0x61),
        contentType: "video/mp4",
        kind: "video"
      })
    ).rejects.toBeInstanceOf(UploadError);
  });
});

describe("removeStoredFile", () => {
  it("deletes from R2 when the key is R2-prefixed", async () => {
    Object.assign(process.env, R2_VARS);

    await removeStoredFile("r2:uploads/123-brief.pdf");

    expect(deleteObject).toHaveBeenCalledTimes(1);
    expect(fsMocks.unlink).not.toHaveBeenCalled();
  });

  it("unlinks from disk when the key is disk-prefixed", async () => {
    await removeStoredFile("disk:123-brief.pdf");

    expect(fsMocks.unlink).toHaveBeenCalledTimes(1);
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it("is a no-op for inline uploads", async () => {
    await removeStoredFile("");

    expect(deleteObject).not.toHaveBeenCalled();
    expect(fsMocks.unlink).not.toHaveBeenCalled();
  });

  it("never throws when the object is already gone", async () => {
    fsMocks.unlink.mockRejectedValueOnce(new Error("ENOENT"));

    await expect(removeStoredFile("disk:missing.pdf")).resolves.toBeUndefined();
  });
});
