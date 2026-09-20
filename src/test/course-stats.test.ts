import { describe, it, expect } from "vitest";
import {
  parseMinutes,
  sumDurations,
  formatMinutes,
  discountPercent,
  formatPrice
} from "@/lib/course-stats";

describe("course-stats", () => {
  describe("parseMinutes", () => {
    it("parses plain minutes", () => {
      expect(parseMinutes("15 min")).toBe(15);
      expect(parseMinutes("30 mins")).toBe(30);
      expect(parseMinutes("45min")).toBe(45);
    });

    it("parses hour-only strings", () => {
      expect(parseMinutes("1 hr")).toBe(60);
      expect(parseMinutes("2 hrs")).toBe(120);
      expect(parseMinutes("1 hour")).toBe(60);
    });

    it("parses hours + minutes combos and decimals", () => {
      expect(parseMinutes("1 hr 30 min")).toBe(90);
      expect(parseMinutes("2.5 hrs")).toBe(150);
      expect(parseMinutes("3 hrs 15 min")).toBe(195);
    });

    it("handles empty, null, and garbage input", () => {
      expect(parseMinutes("")).toBe(0);
      expect(parseMinutes(undefined)).toBe(0);
      expect(parseMinutes(null)).toBe(0);
      expect(parseMinutes("—")).toBe(0);
      expect(parseMinutes("not a duration")).toBe(0);
    });
  });

  describe("sumDurations", () => {
    it("sums lesson durations", () => {
      expect(sumDurations(["15 min", "1 hr 30 min", "45 min", ""])).toBe(150);
    });

    it("returns 0 for empty list", () => {
      expect(sumDurations([])).toBe(0);
    });
  });

  describe("formatMinutes", () => {
    it("formats sub-hour and full hours", () => {
      expect(formatMinutes(45)).toBe("45 min");
      expect(formatMinutes(60)).toBe("1 hr");
      expect(formatMinutes(120)).toBe("2 hrs");
    });

    it("formats mixed hours + minutes", () => {
      expect(formatMinutes(90)).toBe("1 hr 30 min");
      expect(formatMinutes(195)).toBe("3 hrs 15 min");
    });

    it("returns dash for zero", () => {
      expect(formatMinutes(0)).toBe("–");
    });
  });

  describe("discountPercent", () => {
    it("computes discount when priceOld > price", () => {
      expect(discountPercent(1999, 2999)).toBe(33);
      expect(discountPercent(750, 1000)).toBe(25);
    });

    it("returns null when no discount or invalid values", () => {
      expect(discountPercent(2999, 2999)).toBeNull();
      expect(discountPercent(undefined, 2999)).toBeNull();
      expect(discountPercent(1999, undefined)).toBeNull();
      expect(discountPercent(1999, 0)).toBeNull();
    });
  });

  describe("formatPrice", () => {
    it("formats INR with thousands separator", () => {
      expect(formatPrice(1999)).toBe("₹1,999");
      expect(formatPrice(100000)).toBe("₹1,00,000");
    });

    it("returns empty string for null/undefined", () => {
      expect(formatPrice(undefined)).toBe("");
      expect(formatPrice(null as unknown as number)).toBe("");
    });
  });
});