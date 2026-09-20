import { describe, it, expect } from "vitest";
import {
  parseFilters,
  filterCourses,
  getCategories,
  CourseFiltersState
} from "@/lib/course-filters";
import type { Course } from "@/types/lms";

const makeCourse = (overrides: Partial<Course>): Course =>
  ({
    id: "c",
    title: "Course",
    description: "",
    category: "3D & Animation",
    level: "Beginner",
    duration: "1 hr",
    durationMinutes: 60,
    totalLessons: 3,
    rating: 4.5,
    reviewsCount: 10,
    students: 100,
    price: 1999,
    priceOld: 2999,
    isFree: false,
    thumbnail: "",
    whatYouWillLearn: [],
    requirements: [],
    status: "PUBLISHED",
    modules: [],
    ...overrides
  }) as Course;

describe("course-filters", () => {
  describe("parseFilters", () => {
    it("parses valid and invalid URL values", () => {
      expect(parseFilters({ tab: "inprogress", free: "1" })).toEqual({
        tab: "inprogress",
        category: null,
        freeOnly: true,
        duration: null
      });
      expect(parseFilters({ tab: "bogus", duration: "u3", category: "Rigging" })).toEqual({
        tab: "all",
        category: "Rigging",
        freeOnly: false,
        duration: "u3"
      });
    });

    it("ignores unknown duration presets", () => {
      expect(parseFilters({ duration: "99" }).duration).toBeNull();
    });
  });

  describe("getCategories", () => {
    it("returns unique sorted categories", () => {
      const courses = [
        makeCourse({ id: "1", category: "Rigging" }),
        makeCourse({ id: "2", category: "3D & Animation" }),
        makeCourse({ id: "3", category: "Rigging" })
      ];
      expect(getCategories(courses)).toEqual(["3D & Animation", "Rigging"]);
    });
  });

  describe("filterCourses", () => {
    const base: CourseFiltersState = { tab: "all", category: null, freeOnly: false, duration: null };
    const courses = [
      makeCourse({ id: "free", isFree: true, durationMinutes: 60 }),
      makeCourse({ id: "paid", isFree: false, durationMinutes: 240 }),
      makeCourse({ id: "long", isFree: false, durationMinutes: 800 })
    ];

    it("returns all with default filters", () => {
      expect(filterCourses(courses, base, null).map((c) => c.id)).toEqual(["free", "paid", "long"]);
    });

    it("filters free only", () => {
      expect(filterCourses(courses, { ...base, freeOnly: true }, null).map((c) => c.id)).toEqual(["free"]);
    });

    it("filters by category", () => {
      const rigged = makeCourse({ id: "rig", category: "Rigging" });
      expect(filterCourses([...courses, rigged], { ...base, category: "Rigging" }, null).map((c) => c.id)).toEqual(["rig"]);
    });

    it("filters by duration preset", () => {
      expect(filterCourses(courses, { ...base, duration: "u3" }, null).map((c) => c.id)).toEqual(["free"]);
      expect(filterCourses(courses, { ...base, duration: "3-6" }, null).map((c) => c.id)).toEqual(["paid"]);
      expect(filterCourses(courses, { ...base, duration: "12+" }, null).map((c) => c.id)).toEqual(["long"]);
    });

    it("respects student progress tabs", () => {
      const progress = new Map<string, "IN_PROGRESS" | "COMPLETED">([
        ["free", "COMPLETED"],
        ["paid", "IN_PROGRESS"]
      ]);
      expect(filterCourses(courses, { ...base, tab: "completed" }, progress).map((c) => c.id)).toEqual(["free"]);
      expect(filterCourses(courses, { ...base, tab: "inprogress" }, progress).map((c) => c.id)).toEqual(["paid"]);
    });

    it("returns empty for student tabs when progress unknown (guest)", () => {
      expect(filterCourses(courses, { ...base, tab: "inprogress" }, null)).toEqual([]);
    });

    it("combines filters together", () => {
      const progress = new Map([["paid", "IN_PROGRESS" as const]]);
      expect(filterCourses(courses, { ...base, tab: "inprogress", duration: "3-6" }, progress).map((c) => c.id)).toEqual(["paid"]);
    });
  });
});