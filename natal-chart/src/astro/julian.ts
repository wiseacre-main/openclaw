import { rev } from "./angles.js";

/** Julian day number for a UTC instant. */
export function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Days since the Schlyter epoch (1999-12-31 00:00 UT, i.e. "day 0.0"
 * of the orbital element series used in ephemeris.ts).
 */
export function daysSinceEpoch(jd: number): number {
  return jd - 2451543.5;
}

/** Greenwich mean sidereal time in degrees. */
export function gmstDeg(jd: number): number {
  return rev(280.46061837 + 360.98564736629 * (jd - 2451545.0));
}

/** Local sidereal time in degrees (east longitude positive). */
export function lstDeg(jd: number, lonEastDeg: number): number {
  return rev(gmstDeg(jd) + lonEastDeg);
}

/** Mean obliquity of the ecliptic, degrees. */
export function obliquityDeg(jd: number): number {
  return 23.4393 - 3.563e-7 * daysSinceEpoch(jd);
}
