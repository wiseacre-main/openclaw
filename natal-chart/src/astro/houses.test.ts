import { describe, expect, it } from "vitest";
import { angleDiff, rev } from "./angles.js";
import { bodyPosition } from "./ephemeris.js";
import { computeHouses, houseOf } from "./houses.js";
import { julianDay } from "./julian.js";

const jdOf = (iso: string) => julianDay(new Date(iso));

describe("houses", () => {
  it("MC is close to the Sun at local solar noon in Greenwich", () => {
    // 2000-04-16: equation of time is near zero.
    const jd = jdOf("2000-04-16T12:00:00Z");
    const sun = bodyPosition("sun", jd);
    const houses = computeHouses(jd, 51.48, 0);
    expect(Math.abs(angleDiff(houses.mc, sun.lon))).toBeLessThan(2);
  });

  it("cusp 1 equals the Ascendant and cusp 10 equals the MC (Placidus)", () => {
    const jd = jdOf("1990-05-15T10:30:00Z");
    const h = computeHouses(jd, 55.7558, 37.6173);
    expect(h.system).toBe("placidus");
    expect(h.cusps[0]).toBeCloseTo(h.asc, 6);
    expect(h.cusps[9]).toBeCloseTo(h.mc, 6);
  });

  it("opposite Placidus cusps differ by exactly 180°", () => {
    const jd = jdOf("1985-11-02T03:45:00Z");
    const h = computeHouses(jd, 48.8566, 2.3522);
    for (let i = 0; i < 6; i++) {
      expect(rev(h.cusps[i + 6]! - h.cusps[i]!)).toBeCloseTo(180, 5);
    }
  });

  it("Placidus cusps are ordered counterclockwise (each span < 180°)", () => {
    const jd = jdOf("2001-02-03T21:10:00Z");
    const h = computeHouses(jd, 40.7128, -74.006);
    for (let i = 0; i < 12; i++) {
      const span = rev(h.cusps[(i + 1) % 12]! - h.cusps[i]!);
      expect(span).toBeGreaterThan(0);
      expect(span).toBeLessThan(180);
    }
  });

  it("Ascendant stays in the eastern half relative to the MC", () => {
    for (const iso of ["1975-04-01T05:00:00Z", "1999-12-31T23:59:00Z", "2020-06-20T21:44:00Z"]) {
      const jd = jdOf(iso);
      const h = computeHouses(jd, 55.75, 37.62);
      const d = rev(h.asc - h.mc);
      expect(d).toBeGreaterThan(0);
      expect(d).toBeLessThan(180);
    }
  });

  it("falls back to whole-sign houses at polar latitudes", () => {
    const jd = jdOf("1990-01-15T12:00:00Z");
    const h = computeHouses(jd, 68.9585, 33.0827); // Murmansk
    expect(h.requestedSystem).toBe("placidus");
    expect(h.system).toBe("whole-sign");
    expect(h.cusps[0]! % 30).toBeCloseTo(0, 6);
  });

  it("whole-sign cusps start at the Ascendant sign boundary", () => {
    const jd = jdOf("1990-05-15T10:30:00Z");
    const h = computeHouses(jd, 55.7558, 37.6173, "whole-sign");
    expect(h.system).toBe("whole-sign");
    expect(h.cusps[0]).toBe(Math.floor(h.asc / 30) * 30);
    for (let i = 0; i < 12; i++) {
      expect(rev(h.cusps[(i + 1) % 12]! - h.cusps[i]!)).toBeCloseTo(30, 6);
    }
  });

  it("houseOf places longitudes into the correct houses", () => {
    const cusps = Array.from({ length: 12 }, (_, i) => rev(i * 30 + 15));
    expect(houseOf(15, cusps)).toBe(1);
    expect(houseOf(44.9, cusps)).toBe(1);
    expect(houseOf(45.1, cusps)).toBe(2);
    expect(houseOf(14.9, cusps)).toBe(12);
    expect(houseOf(359, cusps)).toBe(12);
  });
});
