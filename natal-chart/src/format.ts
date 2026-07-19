/** Zodiac signs, Russian names and degree formatting. */

import type { PlanetId } from "./astro/ephemeris.js";

export type SignId =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export const SIGN_IDS: SignId[] = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

export interface SignNames {
  /** Именительный: Овен */
  nom: string;
  /** Родительный: Овна (для «15° Овна») */
  gen: string;
  /** Предложный с предлогом: «в Овне» */
  loc: string;
  symbol: string;
}

export const SIGN_NAMES: Record<SignId, SignNames> = {
  aries: { nom: "Овен", gen: "Овна", loc: "в Овне", symbol: "♈" },
  taurus: { nom: "Телец", gen: "Тельца", loc: "в Тельце", symbol: "♉" },
  gemini: { nom: "Близнецы", gen: "Близнецов", loc: "в Близнецах", symbol: "♊" },
  cancer: { nom: "Рак", gen: "Рака", loc: "в Раке", symbol: "♋" },
  leo: { nom: "Лев", gen: "Льва", loc: "во Льве", symbol: "♌" },
  virgo: { nom: "Дева", gen: "Девы", loc: "в Деве", symbol: "♍" },
  libra: { nom: "Весы", gen: "Весов", loc: "в Весах", symbol: "♎" },
  scorpio: { nom: "Скорпион", gen: "Скорпиона", loc: "в Скорпионе", symbol: "♏" },
  sagittarius: { nom: "Стрелец", gen: "Стрельца", loc: "в Стрельце", symbol: "♐" },
  capricorn: { nom: "Козерог", gen: "Козерога", loc: "в Козероге", symbol: "♑" },
  aquarius: { nom: "Водолей", gen: "Водолея", loc: "в Водолее", symbol: "♒" },
  pisces: { nom: "Рыбы", gen: "Рыб", loc: "в Рыбах", symbol: "♓" },
};

export const PLANET_NAMES: Record<PlanetId, { ru: string; symbol: string }> = {
  sun: { ru: "Солнце", symbol: "☉" },
  moon: { ru: "Луна", symbol: "☽" },
  mercury: { ru: "Меркурий", symbol: "☿" },
  venus: { ru: "Венера", symbol: "♀" },
  mars: { ru: "Марс", symbol: "♂" },
  jupiter: { ru: "Юпитер", symbol: "♃" },
  saturn: { ru: "Сатурн", symbol: "♄" },
  uranus: { ru: "Уран", symbol: "♅" },
  neptune: { ru: "Нептун", symbol: "♆" },
  pluto: { ru: "Плутон", symbol: "♇" },
  node: { ru: "Северный узел", symbol: "☊" },
  lilith: { ru: "Лилит", symbol: "⚸" },
};

/** Sign that contains the given ecliptic longitude. */
export function signOf(lon: number): SignId {
  return SIGN_IDS[Math.floor(((lon % 360) + 360) % 360 / 30)]!;
}

/** Degree within the sign, [0, 30). */
export function degreeInSign(lon: number): number {
  return (((lon % 360) + 360) % 360) % 30;
}

/** 15.505 -> «15°30′» */
export function formatDegMin(deg: number): string {
  let d = Math.floor(deg);
  let m = Math.round((deg - d) * 60);
  if (m === 60) {
    d += 1;
    m = 0;
  }
  return `${d}°${String(m).padStart(2, "0")}′`;
}

/** Full zodiacal position: «15°30′ Тельца». */
export function formatZodiac(lon: number): string {
  return `${formatDegMin(degreeInSign(lon))} ${SIGN_NAMES[signOf(lon)].gen}`;
}
