import { describe, it, expect } from "vitest";
import { mapCourse } from "@/services/courses/dtos";

const baseCourse = {
  id: "c1",
  title: "Test Course",
  slug: "test-course",
  description: "A test course.",
  category: "3D & Animation",
  level: "Beginner",
  thumbnail: "/thumb.jpg",
  price: { toString: () => "1999" },
  priceOld: null,
  currency: "INR",
  status: "PUBLISHED",
  whatYouWillLearn: ["Skill one", "Skill two"],
  requirements: ["Requirement one"],
  promoVideoUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  instructors: [],
  modules: [
    {
      id: "m1",
      title: "Module One",
      position: 0,
      courseId: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
      lessons: [
        { id: "l1", title: "Lesson A", description: "", position: 0, duration: "15 min", type: "VIDEO", videoUrl: "https://example.com/a.mp4", published: true, moduleId: "m1", createdAt: new Date(), updatedAt: new Date(), resources: [], assignment: null, quiz: null, progress: [], notes: [] },
        { id: "l2", title: "Lesson B", description: "", position: 1, duration: "45 min", type: "VIDEO", videoUrl: null, published: true, moduleId: "m1", createdAt: new Date(), updatedAt: new Date(), resources: [], assignment: null, quiz: null, progress: [], notes: [] }
      ]
    }
  ]
} as any;

describe("mapCourse", () => {
  it("maps new sales fields and computed stats", () => {
    const course = mapCourse(baseCourse, { rating: 4.6, reviewsCount: 42, students: 7 });
    expect(course.whatYouWillLearn).toEqual(["Skill one", "Skill two"]);
    expect(course.requirements).toEqual(["Requirement one"]);
    expect(course.price).toBe(1999);
    expect(course.rating).toBe(4.6);
    expect(course.reviewsCount).toBe(42);
    expect(course.students).toBe(7);
    expect(course.instructorName).toBe("Anmolofficial Team");
  });

  it("computes duration from lesson durations", () => {
    const course = mapCourse(baseCourse);
    expect(course.durationMinutes).toBe(60);
    expect(course.duration).toBe("1 hr");
    expect(course.totalLessons).toBe(2);
  });

  it("maps priceOld when present", () => {
    const course = mapCourse({ ...baseCourse, priceOld: { toString: () => "2999" } });
    expect(course.priceOld).toBe(2999);
  });

  it("uses instructor name when provided", () => {
    const withInstructors = {
      ...baseCourse,
      instructors: [{ user: { name: "Anmol Deep" } }]
    };
    expect(mapCourse(withInstructors).instructorName).toBe("Anmol Deep");
  });

  it("defaults stats to zero when not supplied", () => {
    const course = mapCourse(baseCourse);
    expect(course.rating).toBe(0);
    expect(course.reviewsCount).toBe(0);
    expect(course.students).toBe(0);
  });
});