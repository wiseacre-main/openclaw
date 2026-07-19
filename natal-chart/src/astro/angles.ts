/** Degree-based trigonometry helpers used across the ephemeris code. */

export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;

/** Normalize an angle to the [0, 360) range. */
export function rev(deg: number): number {
  const x = deg % 360;
  return x < 0 ? x + 360 : x;
}

/** Signed shortest angular distance from `a` to `b`, in (-180, 180]. */
export function angleDiff(a: number, b: number): number {
  const d = rev(b - a);
  return d > 180 ? d - 360 : d;
}

export function sinD(deg: number): number {
  return Math.sin(deg * DEG);
}

export function cosD(deg: number): number {
  return Math.cos(deg * DEG);
}

export function tanD(deg: number): number {
  return Math.tan(deg * DEG);
}

export function asinD(x: number): number {
  return Math.asin(x) * RAD;
}

export function atanD(x: number): number {
  return Math.atan(x) * RAD;
}

export function atan2D(y: number, x: number): number {
  return Math.atan2(y, x) * RAD;
}
