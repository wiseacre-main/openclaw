/**
 * Geocentric ecliptic positions of the Sun, Moon and planets.
 *
 * Based on Paul Schlyter's "How to compute planetary positions"
 * (https://stjarnhimlen.se/comp/ppcomp.html). Accuracy is roughly
 * 1-2 arc minutes for the Moon and about 1 arc minute for the planets,
 * which is far below the precision needed for astrological charts.
 * Positions are referred to the ecliptic and equinox of date
 * (tropical zodiac).
 */

import { angleDiff, asinD, atan2D, atanD, cosD, rev, sinD } from "./angles.js";
import { daysSinceEpoch, julianDay } from "./julian.js";

export type PlanetId =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto"
  | "node"
  | "lilith";

export const PLANET_IDS: PlanetId[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "node",
  "lilith",
];

export interface EclipticPosition {
  /** Geocentric ecliptic longitude, degrees [0, 360). */
  lon: number;
  /** Geocentric ecliptic latitude, degrees. */
  lat: number;
  /** Distance (AU for planets, Earth radii for the Moon). */
  r: number;
}

interface OrbitalElements {
  N: number; // longitude of ascending node
  i: number; // inclination
  w: number; // argument of perihelion
  a: number; // semi-major axis
  e: number; // eccentricity
  M: number; // mean anomaly
}

type ElementPlanet =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

function elements(planet: ElementPlanet, d: number): OrbitalElements {
  switch (planet) {
    case "sun":
      return {
        N: 0,
        i: 0,
        w: 282.9404 + 4.70935e-5 * d,
        a: 1.0,
        e: 0.016709 - 1.151e-9 * d,
        M: rev(356.047 + 0.9856002585 * d),
      };
    case "moon":
      return {
        N: 125.1228 - 0.0529538083 * d,
        i: 5.1454,
        w: 318.0634 + 0.1643573223 * d,
        a: 60.2666, // Earth radii
        e: 0.0549,
        M: rev(115.3654 + 13.0649929509 * d),
      };
    case "mercury":
      return {
        N: 48.3313 + 3.24587e-5 * d,
        i: 7.0047 + 5.0e-8 * d,
        w: 29.1241 + 1.01444e-5 * d,
        a: 0.387098,
        e: 0.205635 + 5.59e-10 * d,
        M: rev(168.6562 + 4.0923344368 * d),
      };
    case "venus":
      return {
        N: 76.6799 + 2.4659e-5 * d,
        i: 3.3946 + 2.75e-8 * d,
        w: 54.891 + 1.38374e-5 * d,
        a: 0.72333,
        e: 0.006773 - 1.302e-9 * d,
        M: rev(48.0052 + 1.6021302244 * d),
      };
    case "mars":
      return {
        N: 49.5574 + 2.11081e-5 * d,
        i: 1.8497 - 1.78e-8 * d,
        w: 286.5016 + 2.92961e-5 * d,
        a: 1.523688,
        e: 0.093405 + 2.516e-9 * d,
        M: rev(18.6021 + 0.5240207766 * d),
      };
    case "jupiter":
      return {
        N: 100.4542 + 2.76854e-5 * d,
        i: 1.303 - 1.557e-7 * d,
        w: 273.8777 + 1.64505e-5 * d,
        a: 5.20256,
        e: 0.048498 + 4.469e-9 * d,
        M: rev(19.895 + 0.0830853001 * d),
      };
    case "saturn":
      return {
        N: 113.6634 + 2.3898e-5 * d,
        i: 2.4886 - 1.081e-7 * d,
        w: 339.3939 + 2.97661e-5 * d,
        a: 9.55475,
        e: 0.055546 - 9.499e-9 * d,
        M: rev(316.967 + 0.0334442282 * d),
      };
    case "uranus":
      return {
        N: 74.0005 + 1.3978e-5 * d,
        i: 0.7733 + 1.9e-8 * d,
        w: 96.6612 + 3.0565e-5 * d,
        a: 19.18171 - 1.55e-8 * d,
        e: 0.047318 + 7.45e-9 * d,
        M: rev(142.5905 + 0.011725806 * d),
      };
    case "neptune":
      return {
        N: 131.7806 + 3.0173e-5 * d,
        i: 1.77 - 2.55e-7 * d,
        w: 272.8461 - 6.027e-6 * d,
        a: 30.05826 + 3.313e-8 * d,
        e: 0.008606 + 2.15e-9 * d,
        M: rev(260.2471 + 0.005995147 * d),
      };
  }
}

/** Solve Kepler's equation, all angles in degrees. */
function eccentricAnomaly(M: number, e: number): number {
  let E = M + (180 / Math.PI) * e * sinD(M) * (1 + e * cosD(M));
  for (let k = 0; k < 30; k++) {
    const dE = (E - (180 / Math.PI) * e * sinD(E) - M) / (1 - e * cosD(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) {
      break;
    }
  }
  return E;
}

/** Heliocentric (geocentric for the Moon) ecliptic position from elements. */
function positionFromElements(el: OrbitalElements): EclipticPosition {
  const E = eccentricAnomaly(rev(el.M), el.e);
  const xv = el.a * (cosD(E) - el.e);
  const yv = el.a * Math.sqrt(1 - el.e * el.e) * sinD(E);
  const v = atan2D(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  const u = v + el.w; // angle from ascending node
  const xh = r * (cosD(el.N) * cosD(u) - sinD(el.N) * sinD(u) * cosD(el.i));
  const yh = r * (sinD(el.N) * cosD(u) + cosD(el.N) * sinD(u) * cosD(el.i));
  const zh = r * sinD(u) * sinD(el.i);
  return {
    lon: rev(atan2D(yh, xh)),
    lat: atan2D(zh, Math.sqrt(xh * xh + yh * yh)),
    r,
  };
}

function sunPosition(d: number): EclipticPosition {
  const el = elements("sun", d);
  const E = eccentricAnomaly(el.M, el.e);
  const xv = cosD(E) - el.e;
  const yv = Math.sqrt(1 - el.e * el.e) * sinD(E);
  const v = atan2D(yv, xv);
  return { lon: rev(v + el.w), lat: 0, r: Math.sqrt(xv * xv + yv * yv) };
}

function moonPosition(d: number): EclipticPosition {
  const el = elements("moon", d);
  const base = positionFromElements(el);

  const sunEl = elements("sun", d);
  const Ls = rev(sunEl.M + sunEl.w); // mean longitude of the Sun
  const Lm = rev(el.N + el.w + el.M); // mean longitude of the Moon
  const Ms = sunEl.M;
  const Mm = el.M;
  const D = rev(Lm - Ls); // mean elongation
  const F = rev(Lm - el.N); // argument of latitude

  // Main perturbation terms (evection, variation, annual equation, ...).
  const dLon =
    -1.274 * sinD(Mm - 2 * D) +
    0.658 * sinD(2 * D) -
    0.186 * sinD(Ms) -
    0.059 * sinD(2 * Mm - 2 * D) -
    0.057 * sinD(Mm - 2 * D + Ms) +
    0.053 * sinD(Mm + 2 * D) +
    0.046 * sinD(2 * D - Ms) +
    0.041 * sinD(Mm - Ms) -
    0.035 * sinD(D) -
    0.031 * sinD(Mm + Ms) -
    0.015 * sinD(2 * F - 2 * D) +
    0.011 * sinD(Mm - 4 * D);
  const dLat =
    -0.173 * sinD(F - 2 * D) -
    0.055 * sinD(Mm - F - 2 * D) -
    0.046 * sinD(Mm + F - 2 * D) +
    0.033 * sinD(F + 2 * D) +
    0.017 * sinD(2 * Mm + F);
  const dR = -0.58 * cosD(Mm - 2 * D) - 0.46 * cosD(2 * D);

  return {
    lon: rev(base.lon + dLon),
    lat: base.lat + dLat,
    r: base.r + dR,
  };
}

function plutoHelio(d: number): EclipticPosition {
  // Analytic fit, valid roughly 1900-2100.
  const S = 50.03 + 0.033459652 * d;
  const P = 238.95 + 0.003968789 * d;
  const lon =
    238.9508 +
    0.00400703 * d -
    19.799 * sinD(P) +
    19.848 * cosD(P) +
    0.897 * sinD(2 * P) -
    4.956 * cosD(2 * P) +
    0.61 * sinD(3 * P) +
    1.211 * cosD(3 * P) -
    0.341 * sinD(4 * P) -
    0.19 * cosD(4 * P) +
    0.128 * sinD(5 * P) -
    0.034 * cosD(5 * P) -
    0.038 * sinD(6 * P) +
    0.031 * cosD(6 * P) +
    0.02 * sinD(S - P) -
    0.01 * cosD(S - P);
  const lat =
    -3.9082 -
    5.453 * sinD(P) -
    14.975 * cosD(P) +
    3.527 * sinD(2 * P) +
    1.673 * cosD(2 * P) -
    1.051 * sinD(3 * P) +
    0.328 * cosD(3 * P) +
    0.179 * sinD(4 * P) -
    0.292 * cosD(4 * P) +
    0.019 * sinD(5 * P) +
    0.1 * cosD(5 * P) -
    0.031 * sinD(6 * P) -
    0.026 * cosD(6 * P) +
    0.011 * cosD(S - P);
  const r =
    40.72 +
    6.68 * sinD(P) +
    6.9 * cosD(P) -
    1.18 * sinD(2 * P) -
    0.03 * cosD(2 * P) +
    0.15 * sinD(3 * P) -
    0.14 * cosD(3 * P);
  return { lon: rev(lon), lat, r };
}

/** Convert a heliocentric ecliptic position to a geocentric one. */
function toGeocentric(helio: EclipticPosition, sun: EclipticPosition): EclipticPosition {
  const xh = helio.r * cosD(helio.lon) * cosD(helio.lat);
  const yh = helio.r * sinD(helio.lon) * cosD(helio.lat);
  const zh = helio.r * sinD(helio.lat);
  const xg = xh + sun.r * cosD(sun.lon);
  const yg = yh + sun.r * sinD(sun.lon);
  const zg = zh;
  return {
    lon: rev(atan2D(yg, xg)),
    lat: atanD(zg / Math.sqrt(xg * xg + yg * yg)),
    r: Math.sqrt(xg * xg + yg * yg + zg * zg),
  };
}

function planetHelio(planet: ElementPlanet, d: number): EclipticPosition {
  const pos = positionFromElements(elements(planet, d));

  if (planet === "jupiter" || planet === "saturn" || planet === "uranus") {
    const Mj = elements("jupiter", d).M;
    const Msat = elements("saturn", d).M;
    const Mu = elements("uranus", d).M;
    let dLon = 0;
    let dLat = 0;
    if (planet === "jupiter") {
      dLon =
        -0.332 * sinD(2 * Mj - 5 * Msat - 67.6) -
        0.056 * sinD(2 * Mj - 2 * Msat + 21) +
        0.042 * sinD(3 * Mj - 5 * Msat + 21) -
        0.036 * sinD(Mj - 2 * Msat) +
        0.022 * cosD(Mj - Msat) +
        0.023 * sinD(2 * Mj - 3 * Msat + 52) -
        0.016 * sinD(Mj - 5 * Msat - 69);
    } else if (planet === "saturn") {
      dLon =
        0.812 * sinD(2 * Mj - 5 * Msat - 67.6) -
        0.229 * cosD(2 * Mj - 4 * Msat - 2) +
        0.119 * sinD(Mj - 2 * Msat - 3) +
        0.046 * sinD(2 * Mj - 6 * Msat - 69) +
        0.014 * sinD(Mj - 3 * Msat + 32);
      dLat = -0.02 * cosD(2 * Mj - 4 * Msat - 2) + 0.018 * sinD(2 * Mj - 6 * Msat - 49);
    } else {
      dLon =
        0.04 * sinD(Msat - 2 * Mu + 6) +
        0.035 * sinD(Msat - 3 * Mu + 33) -
        0.015 * sinD(Mj - Mu + 20);
    }
    return { lon: rev(pos.lon + dLon), lat: pos.lat + dLat, r: pos.r };
  }

  return pos;
}

/** Geocentric ecliptic position of a body at the given Julian day (UT). */
export function bodyPosition(planet: PlanetId, jd: number): EclipticPosition {
  const d = daysSinceEpoch(jd);
  switch (planet) {
    case "sun":
      return sunPosition(d);
    case "moon":
      return moonPosition(d);
    case "node":
      // Mean ascending lunar node.
      return { lon: rev(125.1228 - 0.0529538083 * d), lat: 0, r: 60.2666 };
    case "lilith":
      // Mean lunar apogee (Black Moon Lilith): mean perigee (N + w) + 180.
      return { lon: rev(443.1862 + 0.111403514 * d + 180), lat: 0, r: 60.2666 };
    case "pluto":
      return toGeocentric(plutoHelio(d), sunPosition(d));
    default:
      return toGeocentric(planetHelio(planet, d), sunPosition(d));
  }
}

/** Apparent daily motion in longitude, degrees/day (negative = retrograde). */
export function dailyMotion(planet: PlanetId, jd: number): number {
  const before = bodyPosition(planet, jd - 0.5).lon;
  const after = bodyPosition(planet, jd + 0.5).lon;
  return angleDiff(before, after);
}

/** Convenience: position + speed for a UTC date. */
export function bodyState(planet: PlanetId, date: Date): EclipticPosition & { speed: number } {
  const jd = julianDay(date);
  return { ...bodyPosition(planet, jd), speed: dailyMotion(planet, jd) };
}
