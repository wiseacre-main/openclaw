import { describe, expect, it } from "vitest";
import { formatOffset, localToUtc, tzOffsetMinutes, TimezoneError } from "./timezone.js";

describe("timezone", () => {
  it("Moscow is UTC+3 in 2016 (no DST)", () => {
    const { utc, offsetMinutes } = localToUtc(
      { year: 2016, month: 6, day: 15, hour: 12, minute: 0 },
      "Europe/Moscow",
    );
    expect(offsetMinutes).toBe(180);
    expect(utc.toISOString()).toBe("2016-06-15T09:00:00.000Z");
  });

  it("Moscow used UTC+4 in summer 1990 (Soviet daylight time)", () => {
    const { offsetMinutes } = localToUtc(
      { year: 1990, month: 5, day: 15, hour: 14, minute: 30 },
      "Europe/Moscow",
    );
    expect(offsetMinutes).toBe(240);
  });

  it("New York switches between EST (-5) and EDT (-4)", () => {
    const summer = localToUtc({ year: 1990, month: 7, day: 1, hour: 12, minute: 0 }, "America/New_York");
    expect(summer.offsetMinutes).toBe(-240);
    const winter = localToUtc({ year: 1990, month: 1, day: 15, hour: 12, minute: 0 }, "America/New_York");
    expect(winter.offsetMinutes).toBe(-300);
  });

  it("handles half-hour zones (Asia/Kolkata +05:30)", () => {
    const { offsetMinutes } = localToUtc(
      { year: 2000, month: 3, day: 1, hour: 10, minute: 0 },
      "Asia/Kolkata",
    );
    expect(offsetMinutes).toBe(330);
  });

  it("throws a helpful error for unknown zones", () => {
    expect(() => tzOffsetMinutes("Mars/Olympus", Date.UTC(2020, 0, 1))).toThrow(TimezoneError);
  });

  it("formats offsets in both directions", () => {
    expect(formatOffset(180)).toBe("UTC+03:00");
    expect(formatOffset(-270)).toBe("UTC-04:30");
    expect(formatOffset(0)).toBe("UTC+00:00");
  });
});
