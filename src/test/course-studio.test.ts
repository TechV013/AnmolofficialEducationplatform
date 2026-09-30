import { describe, it, expect } from "vitest";
import {
  deriveLessonKind,
  sumDurations,
  padNumber,
  parseDurationToSeconds,
  formatSeconds,
  type LessonKindInput
} from "@/lib/course-studio";

describe("deriveLessonKind", () => {
  const base: LessonKindInput = { videoUrl: null };

  it("returns quiz when a quiz exists", () => {
    expect(deriveLessonKind({ ...base, quiz: { id: "q1" } })).toBe("quiz");
  });

  it("returns assignment when an assignment exists", () => {
    expect(deriveLessonKind({ ...base, assignment: { id: "a1" } })).toBe("assignment");
  });

  it("returns resource when resources exist", () => {
    expect(deriveLessonKind({ ...base, resources: [{ id: "r1" }] })).toBe("resource");
  });

  it("returns video when a videoUrl exists", () => {
    expect(deriveLessonKind({ ...base, videoUrl: "https://youtube.com/watch?v=abc" })).toBe("video");
  });

  it("returns text for a lesson with no content", () => {
    expect(deriveLessonKind({ videoUrl: null, quiz: null, assignment: null, resources: [] })).toBe("text");
  });

  it("gives quiz precedence over the other kinds", () => {
    expect(
      deriveLessonKind({
        videoUrl: "https://mp4.example.com/a.mp4",
        quiz: { id: "q1" },
        assignment: { id: "a1" },
        resources: [{ id: "r1" }]
      })
    ).toBe("quiz");
  });
});

describe("padNumber", () => {
  it("pads single digits", () => {
    expect(padNumber(1)).toBe("01");
    expect(padNumber(9)).toBe("09");
  });

  it("does not pad double digits", () => {
    expect(padNumber(12)).toBe("12");
    expect(padNumber(105)).toBe("105");
  });
});

describe("parseDurationToSeconds", () => {
  it("parses MM:SS", () => {
    expect(parseDurationToSeconds("15:00")).toBe(900);
  });

  it("parses H:MM:SS", () => {
    expect(parseDurationToSeconds("1:05:30")).toBe(3930);
  });

  it("parses a raw seconds count", () => {
    expect(parseDurationToSeconds("90")).toBe(90);
  });

  it("returns null for empty or invalid input", () => {
    expect(parseDurationToSeconds("")).toBe(null);
    expect(parseDurationToSeconds("abc")).toBe(null);
    expect(parseDurationToSeconds("   ")).toBe(null);
  });
});

describe("formatSeconds", () => {
  it("formats minutes and seconds", () => {
    expect(formatSeconds(90)).toBe("1:30");
    expect(formatSeconds(45)).toBe("45s");
  });

  it("formats hours and minutes", () => {
    expect(formatSeconds(7200)).toBe("2:00");
    expect(formatSeconds(3930)).toBe("1:05");
  });
});

describe("sumDurations", () => {
  it("sums multiple durations", () => {
    expect(sumDurations(["15:00", "5:00"])).toBe("20:00");
  });

  it("formats an hour-long total", () => {
    expect(sumDurations(["1:00:00"])).toBe("1:00");
  });

  it("returns null when nothing is parseable", () => {
    expect(sumDurations([])).toBe(null);
    expect(sumDurations(["abc"])).toBe(null);
  });

  it("skips unparseable entries", () => {
    expect(sumDurations(["15:00", "abc"])).toBe("15:00");
  });
});