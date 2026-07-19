import { describe, expect, it } from "vitest";
import { angleDiff, rev } from "./angles.js";
import { bodyPosition, dailyMotion } from "./ephemeris.js";
import { julianDay } from "./julian.js";

const jdOf = (iso: string) => julianDay(new Date(iso));

describe("ephemeris: validation against known astronomical events", () => {
  it("Sun is at 0° Aries at the March 2000 equinox", () => {
    // Equinox 2000-03-20 07:35 UT.
    const sun = bodyPosition("sun", jdOf("2000-03-20T07:35:00Z"));
    expect(Math.abs(angleDiff(sun.lon, 0))).toBeLessThan(0.05);
  });

  it("Sun is at 90° (0° Cancer) at the June 2020 solstice", () => {
    // Solstice 2020-06-20 21:44 UT.
    const sun = bodyPosition("sun", jdOf("2020-06-20T21:44:00Z"));
    expect(Math.abs(angleDiff(sun.lon, 90))).toBeLessThan(0.05);
  });

  it("Sun is at 270° (0° Capricorn) at the December 1999 solstice", () => {
    // Solstice 1999-12-22 07:44 UT.
    const sun = bodyPosition("sun", jdOf("1999-12-22T07:44:00Z"));
    expect(Math.abs(angleDiff(sun.lon, 270))).toBeLessThan(0.05);
  });

  it("Sun and Moon are conjunct during the 1999-08-11 total solar eclipse", () => {
    const jd = jdOf("1999-08-11T11:03:00Z");
    const sun = bodyPosition("sun", jd);
    const moon = bodyPosition("moon", jd);
    expect(Math.abs(angleDiff(sun.lon, moon.lon))).toBeLessThan(0.7);
  });

  it("Moon opposes Sun during the 2000-01-21 total lunar eclipse", () => {
    const jd = jdOf("2000-01-21T04:44:00Z");
    const sun = bodyPosition("sun", jd);
    const moon = bodyPosition("moon", jd);
    expect(Math.abs(angleDiff(rev(sun.lon + 180), moon.lon))).toBeLessThan(0.7);
  });

  it("Jupiter and Saturn meet at ~0.5° Aquarius during the 2020 great conjunction", () => {
    const jd = jdOf("2020-12-21T18:00:00Z");
    const jup = bodyPosition("jupiter", jd);
    const sat = bodyPosition("saturn", jd);
    expect(Math.abs(angleDiff(jup.lon, sat.lon))).toBeLessThan(0.4);
    // Both at the very start of Aquarius (300.49° reference).
    expect(jup.lon).toBeGreaterThan(299.9);
    expect(jup.lon).toBeLessThan(301.1);
    expect(sat.lon).toBeGreaterThan(299.9);
    expect(sat.lon).toBeLessThan(301.1);
  });

  it("detects the May-June 2021 Mercury retrograde", () => {
    expect(dailyMotion("mercury", jdOf("2021-06-05T00:00:00Z"))).toBeLessThan(0);
    expect(dailyMotion("mercury", jdOf("2021-07-15T00:00:00Z"))).toBeGreaterThan(0);
  });

  it("detects the autumn 2020 Mars retrograde", () => {
    expect(dailyMotion("mars", jdOf("2020-10-01T00:00:00Z"))).toBeLessThan(0);
    expect(dailyMotion("mars", jdOf("2020-12-01T00:00:00Z"))).toBeGreaterThan(0);
  });

  it("Sun and Moon always move direct", () => {
    for (const iso of ["1975-04-01T12:00:00Z", "1999-08-11T11:00:00Z", "2024-02-29T06:00:00Z"]) {
      expect(dailyMotion("sun", jdOf(iso))).toBeGreaterThan(0.9);
      expect(dailyMotion("moon", jdOf(iso))).toBeGreaterThan(11);
    }
  });

  it("mean lunar node moves retrograde", () => {
    expect(dailyMotion("node", jdOf("1990-05-15T12:00:00Z"))).toBeLessThan(0);
  });

  it("Moon daily motion stays within the physical 11.7-15.4°/day range", () => {
    for (let k = 0; k < 12; k++) {
      const jd = jdOf("2010-01-05T00:00:00Z") + k * 30.44;
      const v = dailyMotion("moon", jd);
      expect(v).toBeGreaterThan(11.5);
      expect(v).toBeLessThan(15.6);
    }
  });

  it("Pluto is in Sagittarius through 2000 and in Capricorn in 2010", () => {
    // Well-known ingress: Pluto entered Capricorn (270°) in 2008.
    const pluto2000 = bodyPosition("pluto", jdOf("2000-06-01T00:00:00Z"));
    expect(pluto2000.lon).toBeGreaterThan(240);
    expect(pluto2000.lon).toBeLessThan(270);
    const pluto2010 = bodyPosition("pluto", jdOf("2010-06-01T00:00:00Z"));
    expect(pluto2010.lon).toBeGreaterThan(270);
    expect(pluto2010.lon).toBeLessThan(300);
  });
});
