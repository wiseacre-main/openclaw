/** Natal chart computation: from birth data to a structured chart object. */

import { findAspects, type AspectHit, type ChartPoint } from "./astro/aspects.js";
import { bodyPosition, dailyMotion, PLANET_IDS, type PlanetId } from "./astro/ephemeris.js";
import { computeHouses, houseOf, type HousesResult, type HouseSystem } from "./astro/houses.js";
import { julianDay } from "./astro/julian.js";
import { degreeInSign, signOf, type SignId } from "./format.js";
import { CITIES, findCity, suggestCities, type City } from "./geo/cities.js";
import { formatOffset, localToUtc } from "./geo/timezone.js";

export interface NatalInput {
  /** Дата рождения в формате YYYY-MM-DD (местная). */
  date: string;
  /** Местное время рождения HH:MM (24 часа). */
  time: string;
  /** Название города из встроенной базы (русское или английское). */
  place?: string;
  /** Широта в градусах (север положительный) — если место не задано. */
  latitude?: number;
  /** Долгота в градусах (восток положительный) — если место не задано. */
  longitude?: number;
  /** IANA-таймзона, например Europe/Moscow — если место не задано. */
  timezone?: string;
  /** Явное смещение UTC в минутах (переопределяет таймзону). */
  utcOffsetMinutes?: number;
  /** Система домов; по умолчанию Плацидус. */
  houseSystem?: HouseSystem;
}

export interface PlanetPlacement {
  id: PlanetId;
  /** Эклиптическая долгота, градусы. */
  lon: number;
  /** Эклиптическая широта, градусы. */
  lat: number;
  sign: SignId;
  /** Градус внутри знака, [0, 30). */
  degInSign: number;
  house: number;
  /** Скорость, градусы/сутки; отрицательная — ретроградность. */
  speed: number;
  retrograde: boolean;
}

export type Element = "fire" | "earth" | "air" | "water";
export type Modality = "cardinal" | "fixed" | "mutable";

export const SIGN_ELEMENT: Record<SignId, Element> = {
  aries: "fire",
  taurus: "earth",
  gemini: "air",
  cancer: "water",
  leo: "fire",
  virgo: "earth",
  libra: "air",
  scorpio: "water",
  sagittarius: "fire",
  capricorn: "earth",
  aquarius: "air",
  pisces: "water",
};

export const SIGN_MODALITY: Record<SignId, Modality> = {
  aries: "cardinal",
  taurus: "fixed",
  gemini: "mutable",
  cancer: "cardinal",
  leo: "fixed",
  virgo: "mutable",
  libra: "cardinal",
  scorpio: "fixed",
  sagittarius: "mutable",
  capricorn: "cardinal",
  aquarius: "fixed",
  pisces: "mutable",
};

/** Управители знаков (современные). */
export const SIGN_RULER: Record<SignId, PlanetId> = {
  aries: "mars",
  taurus: "venus",
  gemini: "mercury",
  cancer: "moon",
  leo: "sun",
  virgo: "mercury",
  libra: "venus",
  scorpio: "pluto",
  sagittarius: "jupiter",
  capricorn: "saturn",
  aquarius: "uranus",
  pisces: "neptune",
};

export interface NatalChart {
  input: NatalInput;
  place: { name: string; lat: number; lon: number; tz?: string };
  utc: string;
  offsetLabel: string;
  jd: number;
  planets: PlanetPlacement[];
  houses: HousesResult;
  ascendant: { lon: number; sign: SignId; degInSign: number };
  midheaven: { lon: number; sign: SignId; degInSign: number };
  aspects: AspectHit[];
  elements: Record<Element, number>;
  modalities: Record<Modality, number>;
  chartRuler: { planet: PlanetId; placement: PlanetPlacement };
}

export class InputError extends Error {}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{1,2}):(\d{2})$/;

function parseDateTime(input: NatalInput): { y: number; mo: number; d: number; h: number; mi: number } {
  const dm = DATE_RE.exec(input.date.trim());
  if (!dm) {
    throw new InputError(`Неверный формат даты: "${input.date}". Ожидается ГГГГ-ММ-ДД, например 1990-05-15.`);
  }
  const tm = TIME_RE.exec(input.time.trim());
  if (!tm) {
    throw new InputError(`Неверный формат времени: "${input.time}". Ожидается ЧЧ:ММ, например 14:30.`);
  }
  const y = Number(dm[1]);
  const mo = Number(dm[2]);
  const d = Number(dm[3]);
  const h = Number(tm[1]);
  const mi = Number(tm[2]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) {
    throw new InputError(`Дата вне допустимого диапазона: "${input.date}".`);
  }
  if (h > 23 || mi > 59) {
    throw new InputError(`Время вне допустимого диапазона: "${input.time}".`);
  }
  if (y < 1800 || y > 2100) {
    throw new InputError("Поддерживаются даты рождения между 1800 и 2100 годами.");
  }
  return { y, mo, d, h, mi };
}

function resolvePlace(input: NatalInput): { name: string; lat: number; lon: number; tz?: string; city?: City } {
  if (input.place) {
    const city = findCity(input.place);
    if (!city) {
      const near = suggestCities(input.place)
        .map((c) => c.name)
        .join(", ");
      throw new InputError(
        `Город "${input.place}" не найден во встроенной базе (${CITIES.length} городов).` +
          (near ? ` Похожие: ${near}.` : "") +
          " Укажите координаты и таймзону вручную (latitude/longitude/timezone).",
      );
    }
    return { name: `${city.name} (${city.country})`, lat: city.lat, lon: city.lon, tz: city.tz, city };
  }
  if (input.latitude === undefined || input.longitude === undefined) {
    throw new InputError("Укажите либо место рождения (place), либо координаты latitude и longitude.");
  }
  if (Math.abs(input.latitude) > 90 || Math.abs(input.longitude) > 180) {
    throw new InputError("Координаты вне диапазона: широта ±90, долгота ±180.");
  }
  if (input.timezone === undefined && input.utcOffsetMinutes === undefined) {
    throw new InputError("Для координат укажите таймзону (timezone, IANA) или смещение UTC (utcOffsetMinutes).");
  }
  return {
    name: `${input.latitude.toFixed(4)}, ${input.longitude.toFixed(4)}`,
    lat: input.latitude,
    lon: input.longitude,
    tz: input.timezone,
  };
}

/** Главная точка входа: рассчитать натальную карту. */
export function computeNatalChart(input: NatalInput): NatalChart {
  const { y, mo, d, h, mi } = parseDateTime(input);
  const place = resolvePlace(input);

  let utc: Date;
  let offsetMinutes: number;
  if (input.utcOffsetMinutes !== undefined) {
    offsetMinutes = input.utcOffsetMinutes;
    utc = new Date(Date.UTC(y, mo - 1, d, h, mi) - offsetMinutes * 60000);
  } else {
    const res = localToUtc({ year: y, month: mo, day: d, hour: h, minute: mi }, place.tz!);
    utc = res.utc;
    offsetMinutes = res.offsetMinutes;
  }

  const jd = julianDay(utc);
  const houses = computeHouses(jd, place.lat, place.lon, input.houseSystem ?? "placidus");

  const planets: PlanetPlacement[] = PLANET_IDS.map((id) => {
    const pos = bodyPosition(id, jd);
    const speed = dailyMotion(id, jd);
    return {
      id,
      lon: pos.lon,
      lat: pos.lat,
      sign: signOf(pos.lon),
      degInSign: degreeInSign(pos.lon),
      house: houseOf(pos.lon, houses.cusps),
      speed,
      retrograde: id !== "sun" && id !== "moon" && speed < 0,
    };
  });

  const points: ChartPoint[] = [
    ...planets.map((p) => ({ id: p.id, lon: p.lon, speed: p.speed })),
    { id: "asc" as const, lon: houses.asc },
    { id: "mc" as const, lon: houses.mc },
  ];
  const aspects = findAspects(points);

  // Баланс стихий и крестов: 10 планет + Асцендент.
  const elements: Record<Element, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalities: Record<Modality, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  const counted = planets.filter((p) => p.id !== "node" && p.id !== "lilith");
  for (const p of counted) {
    elements[SIGN_ELEMENT[p.sign]] += 1;
    modalities[SIGN_MODALITY[p.sign]] += 1;
  }
  const ascSign = signOf(houses.asc);
  elements[SIGN_ELEMENT[ascSign]] += 1;
  modalities[SIGN_MODALITY[ascSign]] += 1;

  const rulerId = SIGN_RULER[ascSign];
  const rulerPlacement = planets.find((p) => p.id === rulerId)!;

  return {
    input,
    place: { name: place.name, lat: place.lat, lon: place.lon, tz: place.tz },
    utc: utc.toISOString(),
    offsetLabel: formatOffset(offsetMinutes),
    jd,
    planets,
    houses,
    ascendant: { lon: houses.asc, sign: ascSign, degInSign: degreeInSign(houses.asc) },
    midheaven: { lon: houses.mc, sign: signOf(houses.mc), degInSign: degreeInSign(houses.mc) },
    aspects,
    elements,
    modalities,
    chartRuler: { planet: rulerId, placement: rulerPlacement },
  };
}
