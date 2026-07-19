/**
 * Astrological houses: Ascendant, Midheaven and house cusps.
 * Supported systems: Placidus (default) and whole-sign.
 * For polar latitudes where Placidus is undefined the computation
 * automatically falls back to whole-sign houses.
 */

import { asinD, atan2D, atanD, cosD, rev, sinD, tanD } from "./angles.js";
import { lstDeg, obliquityDeg } from "./julian.js";

export type HouseSystem = "placidus" | "whole-sign";

export interface HousesResult {
  /** System actually used (may differ from the requested one near the poles). */
  system: HouseSystem;
  /** Requested system. */
  requestedSystem: HouseSystem;
  /** Ecliptic longitudes of cusps 1..12, degrees. */
  cusps: number[];
  asc: number;
  mc: number;
  /** Right ascension of the MC (local sidereal time), degrees. */
  armc: number;
}

/** Ecliptic longitude of the Midheaven from ARMC. */
export function midheaven(armc: number, eps: number): number {
  return rev(atan2D(sinD(armc), cosD(armc) * cosD(eps)));
}

/** Ecliptic longitude of the Ascendant. */
export function ascendant(armc: number, eps: number, latDeg: number): number {
  return rev(atan2D(cosD(armc), -(sinD(armc) * cosD(eps) + tanD(latDeg) * sinD(eps))));
}

/**
 * Iterative Placidus cusp: offset is the equatorial "nominal" distance from
 * the ARMC (30/60 for cusps 11/12, 120/150 for cusps 2/3).
 * Returns null when the cusp is undefined (circumpolar ecliptic degrees).
 */
function placidusCusp(armc: number, eps: number, latDeg: number, offset: 30 | 60 | 120 | 150): number | null {
  let ra = armc + offset;
  for (let k = 0; k < 40; k++) {
    // Declination of the ecliptic point with right ascension `ra`.
    const dec = atanD(tanD(eps) * sinD(ra));
    const x = tanD(latDeg) * tanD(dec);
    if (Math.abs(x) >= 1) {
      return null;
    }
    const ad = asinD(x); // ascensional difference
    const saDay = 90 + ad; // diurnal semi-arc
    const saNight = 90 - ad; // nocturnal semi-arc
    let next: number;
    if (offset === 30) {
      next = armc + saDay / 3;
    } else if (offset === 60) {
      next = armc + (2 * saDay) / 3;
    } else if (offset === 120) {
      next = armc + 180 - (2 * saNight) / 3;
    } else {
      next = armc + 180 - saNight / 3;
    }
    if (Math.abs(rev(next - ra + 180) - 180) < 1e-7) {
      ra = next;
      break;
    }
    ra = next;
  }
  return rev(atan2D(sinD(ra), cosD(ra) * cosD(eps)));
}

function wholeSignCusps(asc: number): number[] {
  const first = Math.floor(asc / 30) * 30;
  return Array.from({ length: 12 }, (_, i) => rev(first + 30 * i));
}

/** Compute houses for a UT instant and geographic position. */
export function computeHouses(
  jd: number,
  latDeg: number,
  lonEastDeg: number,
  system: HouseSystem = "placidus",
): HousesResult {
  const eps = obliquityDeg(jd);
  const armc = lstDeg(jd, lonEastDeg);
  const mc = midheaven(armc, eps);
  const asc = ascendant(armc, eps, latDeg);

  if (system === "placidus" && Math.abs(latDeg) < 66) {
    const c11 = placidusCusp(armc, eps, latDeg, 30);
    const c12 = placidusCusp(armc, eps, latDeg, 60);
    const c2 = placidusCusp(armc, eps, latDeg, 120);
    const c3 = placidusCusp(armc, eps, latDeg, 150);
    if (c11 !== null && c12 !== null && c2 !== null && c3 !== null) {
      const cusps = [
        asc,
        c2,
        c3,
        rev(mc + 180),
        rev(c11 + 180),
        rev(c12 + 180),
        rev(asc + 180),
        rev(c2 + 180),
        rev(c3 + 180),
        mc,
        c11,
        c12,
      ];
      return { system: "placidus", requestedSystem: system, cusps, asc, mc, armc };
    }
  }

  return {
    system: "whole-sign",
    requestedSystem: system,
    cusps: wholeSignCusps(asc),
    asc,
    mc,
    armc,
  };
}

/** House number (1..12) that contains the given ecliptic longitude. */
export function houseOf(lon: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const a = cusps[i]!;
    const b = cusps[(i + 1) % 12]!;
    const span = rev(b - a);
    if (rev(lon - a) < (span === 0 ? 360 : span)) {
      return i + 1;
    }
  }
  return 12;
}
