/**
 * Local birth time -> UTC conversion via IANA time zones.
 * Uses Intl, which ships with historical tz data (DST changes,
 * Soviet decree time, zone redefinitions, etc.).
 */

export class TimezoneError extends Error {}

/** UTC offset of `tz` at a UTC instant, in minutes east of Greenwich. */
export function tzOffsetMinutes(tz: string, utcMs: number): number {
  let parts: Intl.DateTimeFormatPart[];
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "longOffset",
      year: "numeric",
    });
    parts = dtf.formatToParts(new Date(utcMs));
  } catch {
    throw new TimezoneError(`Неизвестная таймзона IANA: "${tz}"`);
  }
  const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  if (name === "GMT" || name === "UTC") {
    return 0;
  }
  const m = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) {
    throw new TimezoneError(`Не удалось разобрать смещение таймзоны: "${name}"`);
  }
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3] ?? "0"));
}

export interface LocalTime {
  year: number;
  month: number; // 1..12
  day: number;
  hour: number;
  minute: number;
}

/**
 * Convert wall-clock local time in an IANA zone to a UTC Date.
 * Iterates because the offset itself depends on the resulting instant.
 */
export function localToUtc(t: LocalTime, tz: string): { utc: Date; offsetMinutes: number } {
  const wallMs = Date.UTC(t.year, t.month - 1, t.day, t.hour, t.minute);
  let offset = tzOffsetMinutes(tz, wallMs);
  for (let i = 0; i < 3; i++) {
    const next = tzOffsetMinutes(tz, wallMs - offset * 60000);
    if (next === offset) {
      break;
    }
    offset = next;
  }
  return { utc: new Date(wallMs - offset * 60000), offsetMinutes: offset };
}

/** Format an offset in minutes as "UTC+03:00" / "UTC-04:30". */
export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const h = String(Math.floor(abs / 60)).padStart(2, "0");
  const m = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${h}:${m}`;
}
