/** Aspect detection between chart points. */

import { rev } from "./angles.js";
import type { PlanetId } from "./ephemeris.js";

export type AspectKey =
  | "conjunction"
  | "sextile"
  | "square"
  | "trine"
  | "opposition"
  | "semisextile"
  | "quincunx";

export type AspectNature = "harmonious" | "tense" | "neutral";

export interface AspectDef {
  key: AspectKey;
  nameRu: string;
  angle: number;
  orb: number;
  kind: "major" | "minor";
  nature: AspectNature;
}

export const ASPECT_DEFS: AspectDef[] = [
  { key: "conjunction", nameRu: "Соединение", angle: 0, orb: 8, kind: "major", nature: "neutral" },
  { key: "sextile", nameRu: "Секстиль", angle: 60, orb: 5, kind: "major", nature: "harmonious" },
  { key: "square", nameRu: "Квадрат", angle: 90, orb: 7, kind: "major", nature: "tense" },
  { key: "trine", nameRu: "Тригон", angle: 120, orb: 7, kind: "major", nature: "harmonious" },
  { key: "opposition", nameRu: "Оппозиция", angle: 180, orb: 8, kind: "major", nature: "tense" },
  { key: "semisextile", nameRu: "Полусекстиль", angle: 30, orb: 2, kind: "minor", nature: "harmonious" },
  { key: "quincunx", nameRu: "Квиконс", angle: 150, orb: 2.5, kind: "minor", nature: "tense" },
];

export type ChartPointId = PlanetId | "asc" | "mc";

export interface ChartPoint {
  id: ChartPointId;
  lon: number;
  /** Degrees/day; undefined for angles (Asc/MC). */
  speed?: number;
}

export interface AspectHit {
  a: ChartPointId;
  b: ChartPointId;
  aspect: AspectKey;
  nameRu: string;
  angle: number;
  /** Actual deviation from the exact aspect, degrees. */
  orb: number;
  nature: AspectNature;
  /** True when the aspect is still forming (orb shrinking). */
  applying?: boolean;
}

const LUMINARIES = new Set<ChartPointId>(["sun", "moon"]);
/** Points that only form conjunctions/oppositions in this model. */
const AXIS_POINTS = new Set<ChartPointId>(["node", "lilith"]);
/** Angles: no minor aspects. */
const ANGLES = new Set<ChartPointId>(["asc", "mc"]);

function separation(a: number, b: number): number {
  const d = rev(b - a);
  return d > 180 ? 360 - d : d;
}

function allowedAspect(a: ChartPointId, b: ChartPointId, def: AspectDef): boolean {
  if (AXIS_POINTS.has(a) || AXIS_POINTS.has(b)) {
    return def.key === "conjunction" || def.key === "opposition";
  }
  if (ANGLES.has(a) || ANGLES.has(b)) {
    return def.kind === "major";
  }
  return true;
}

function effectiveOrb(a: ChartPointId, b: ChartPointId, def: AspectDef): number {
  // Slightly wider orbs when a luminary participates.
  return def.orb + (LUMINARIES.has(a) || LUMINARIES.has(b) ? 1 : 0);
}

/** Find all aspects between the given chart points (pairs are unordered). */
export function findAspects(points: ChartPoint[]): AspectHit[] {
  const hits: AspectHit[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const p = points[i]!;
      const q = points[j]!;
      // Skip pairs of derived axis points and angle-to-angle aspects.
      if (
        (AXIS_POINTS.has(p.id) && AXIS_POINTS.has(q.id)) ||
        (ANGLES.has(p.id) && ANGLES.has(q.id))
      ) {
        continue;
      }
      const sep = separation(p.lon, q.lon);
      let best: AspectHit | null = null;
      for (const def of ASPECT_DEFS) {
        if (!allowedAspect(p.id, q.id, def)) {
          continue;
        }
        const orb = Math.abs(sep - def.angle);
        if (orb <= effectiveOrb(p.id, q.id, def) && (best === null || orb < best.orb)) {
          best = {
            a: p.id,
            b: q.id,
            aspect: def.key,
            nameRu: def.nameRu,
            angle: def.angle,
            orb,
            nature: def.nature,
          };
        }
      }
      if (best) {
        if (p.speed !== undefined && q.speed !== undefined) {
          // Applying if the separation moves toward the exact angle.
          const dt = 0.1;
          const sepFuture = separation(p.lon + p.speed * dt, q.lon + q.speed * dt);
          best.applying = Math.abs(sepFuture - best.angle) < Math.abs(sep - best.angle);
        }
        hits.push(best);
      }
    }
  }
  return hits.sort((x, y) => x.orb - y.orb);
}
