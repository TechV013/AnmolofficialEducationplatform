import { describe, it, expect } from "vitest";
import { deriveLessonKind, type LessonKindInput } from "@/lib/course-studio";

/**
 * Mirrors the projection in ClassroomClient: a video player may only render when
 * the lesson actually resolves to the video kind.
 */
function rendersVideoPlayer(input: LessonKindInput): boolean {
  return deriveLessonKind(input) === "video" && Boolean(input.videoUrl);
}

const resource = { id: "r1", title: "Slides", type: "PDF", url: "/uploads/1-slides.pdf" };

describe("lesson kind derivation with assignment attachments", () => {
  it("keeps an assignment lesson classified as an assignment once it has attachments", () => {
    // Regression: assignment attachments are Resources on the same lesson, and
    // resources outrank video but must not outrank assignment.
    expect(
      deriveLessonKind({
        videoUrl: null,
        assignment: { id: "a1" },
        resources: [resource]
      })
    ).toBe("assignment");
  });

  it("does not render a video player for an assignment lesson that also has a videoUrl", () => {
    expect(
      rendersVideoPlayer({
        videoUrl: "/uploads/1-intro.mp4",
        assignment: { id: "a1" },
        resources: [resource]
      })
    ).toBe(false);
  });

  it("does not render a video player for a resource-only lesson", () => {
    expect(rendersVideoPlayer({ videoUrl: null, resources: [resource] })).toBe(false);
  });

  it("does not render a video player for a quiz lesson", () => {
    expect(rendersVideoPlayer({ videoUrl: "/uploads/1-intro.mp4", quiz: { id: "q1" } })).toBe(false);
  });

  it("does not render a video player for a text lesson with no video", () => {
    expect(rendersVideoPlayer({ videoUrl: null })).toBe(false);
  });

  it("still renders the video player for a genuine video lesson", () => {
    expect(rendersVideoPlayer({ videoUrl: "/uploads/1-intro.mp4" })).toBe(true);
  });

  it("classifies a standalone resource lesson as a resource", () => {
    expect(deriveLessonKind({ videoUrl: null, resources: [resource] })).toBe("resource");
  });

  it("treats an empty resource list as no resources", () => {
    expect(deriveLessonKind({ videoUrl: "/uploads/1-intro.mp4", resources: [] })).toBe("video");
  });

  it("prefers quiz over assignment when both relations somehow exist", () => {
    expect(deriveLessonKind({ quiz: { id: "q1" }, assignment: { id: "a1" } })).toBe("quiz");
  });
});
