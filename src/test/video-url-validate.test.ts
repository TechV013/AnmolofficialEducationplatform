import { describe, it, expect } from "vitest";
import { isValidVideoUrl } from "@/lib/video/validateUrl";

describe("isValidVideoUrl", () => {
  it("accepts YouTube URLs", () => {
    expect(isValidVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
    expect(isValidVideoUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(isValidVideoUrl("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe(true);
  });

  it("accepts Vimeo URLs", () => {
    expect(isValidVideoUrl("https://vimeo.com/123456789")).toBe(true);
    expect(isValidVideoUrl("https://player.vimeo.com/video/123456789")).toBe(true);
  });

  it("accepts cloud-hosted direct MP4 URLs", () => {
    expect(isValidVideoUrl("https://res.cloudinary.com/demo/video/upload/dog.mp4")).toBe(true);
    expect(isValidVideoUrl("https://cdn.example.com/videos/lesson-1.mp4?token=abc")).toBe(true);
  });

  it("rejects empty and whitespace-only input", () => {
    expect(isValidVideoUrl("")).toBe(false);
    expect(isValidVideoUrl("   ")).toBe(false);
  });

  it("rejects data: and blob: URIs", () => {
    expect(isValidVideoUrl("data:video/mp4;base64,AAAA")).toBe(false);
    expect(isValidVideoUrl("blob:https://example.com/abc")).toBe(false);
  });

  it("rejects non-http(s) schemes", () => {
    expect(isValidVideoUrl("ftp://example.com/video.mp4")).toBe(false);
    expect(isValidVideoUrl("file:///tmp/video.mp4")).toBe(false);
    expect(isValidVideoUrl("http://")).toBe(false);
  });

  it("rejects garbage strings", () => {
    expect(isValidVideoUrl("not a url")).toBe(false);
    expect(isValidVideoUrl("htps://bad.example.com")).toBe(false);
  });
});