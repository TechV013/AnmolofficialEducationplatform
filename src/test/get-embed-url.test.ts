import { describe, it, expect } from "vitest";
import { getEmbedUrl, getEmbedUrlWithResume, getMediaTypeLabel } from "@/lib/video/getEmbedUrl";

describe("getEmbedUrl", () => {
  it("detects YouTube URLs", () => {
    expect(getEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      type: "youtube",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    });
    expect(getEmbedUrl("https://youtu.be/dQw4w9WgXcQ").type).toBe("youtube");
    expect(getEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ").type).toBe("youtube");
    expect(getEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ").type).toBe("youtube");
  });

  it("detects Vimeo URLs", () => {
    expect(getEmbedUrl("https://vimeo.com/123456789")).toEqual({
      type: "vimeo",
      embedUrl: "https://player.vimeo.com/video/123456789?autoplay=1",
    });
  });

  it("converts Google Drive share links to the preview embed", () => {
    const id = "1v7ea4YB3NHoJljakVWrcq25cABCdef123";
    const cases = [
      `https://drive.google.com/file/d/${id}/view?usp=sharing`,
      `https://drive.google.com/file/d/${id}/preview`,
      `https://drive.google.com/file/d/${id}`,
      `https://drive.google.com/open?id=${id}`,
      `https://drive.google.com/uc?export=download&id=${id}`,
      `https://docs.google.com/file/d/${id}/view`,
      `https://drive.usercontent.google.com/download?id=${id}&export=download`,
    ];
    for (const url of cases) {
      expect(getEmbedUrl(url)).toEqual({
        type: "gdrive",
        embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      });
    }
  });

  it("falls back to html5 for Drive links without a file id", () => {
    expect(getEmbedUrl("https://drive.google.com/drive/folders/abcXYZ123").type).toBe("html5");
  });

  it("falls back to html5 for direct MP4 URLs", () => {
    expect(getEmbedUrl("https://cdn.example.com/videos/lesson-1.mp4")).toEqual({
      type: "html5",
      embedUrl: "https://cdn.example.com/videos/lesson-1.mp4",
    });
  });

  it("returns empty html5 for empty input", () => {
    expect(getEmbedUrl("")).toEqual({ type: "html5", embedUrl: "" });
  });
});

describe("getEmbedUrlWithResume", () => {
  it("appends a start time for YouTube", () => {
    const info = getEmbedUrlWithResume("https://www.youtube.com/watch?v=dQw4w9WgXcQ", 42.7);
    expect(info.embedUrl).toContain("&start=42");
  });

  it("leaves Google Drive embeds unchanged", () => {
    const info = getEmbedUrlWithResume(
      "https://drive.google.com/file/d/1abcDEF123_-/view?usp=sharing",
      42
    );
    expect(info.type).toBe("gdrive");
    expect(info.embedUrl).toBe("https://drive.google.com/file/d/1abcDEF123_-/preview");
  });

  it("ignores non-positive seconds", () => {
    const info = getEmbedUrlWithResume("https://vimeo.com/123456789", 0);
    expect(info.embedUrl).toBe("https://player.vimeo.com/video/123456789?autoplay=1");
  });
});

describe("getMediaTypeLabel", () => {
  it("labels each media type", () => {
    expect(getMediaTypeLabel("youtube")).toBe("YouTube");
    expect(getMediaTypeLabel("vimeo")).toBe("Vimeo");
    expect(getMediaTypeLabel("gdrive")).toBe("Google Drive");
    expect(getMediaTypeLabel("html5")).toBe("Video");
  });
});
