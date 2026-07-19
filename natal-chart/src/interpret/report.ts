/** Detailed natal chart report (Russian, Markdown). */

import type { AspectHit } from "../astro/aspects.js";
import type { PlanetId } from "../astro/ephemeris.js";
import type { Element, Modality, NatalChart, PlanetPlacement } from "../chart.js";
import {
  formatDegMin,
  formatZodiac,
  PLANET_NAMES,
  SIGN_NAMES,
  type SignId,
} from "../format.js";
import {
  ASC_IN_SIGN,
  ASPECT_TEMPLATES,
  ELEMENT_DOMINANT,
  ELEMENT_LACKING,
  ELEMENT_NAMES,
  HOUSE_INFO,
  MARS_IN_SIGN,
  MERCURY_IN_SIGN,
  MODALITY_DOMINANT,
  MODALITY_NAMES,
  MOON_IN_SIGN,
  NODE_IN_SIGN,
  PLANET_PRINCIPLES,
  SIGN_PROFILES,
  SUN_IN_SIGN,
  VENUS_IN_SIGN,
} from "./texts.js";

const CURATED_IN_SIGN: Partial<Record<PlanetId, Record<SignId, string>>> = {
  sun: SUN_IN_SIGN,
  moon: MOON_IN_SIGN,
  mercury: MERCURY_IN_SIGN,
  venus: VENUS_IN_SIGN,
  mars: MARS_IN_SIGN,
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function planetLabel(id: PlanetId | "asc" | "mc"): string {
  if (id === "asc") {
    return "Асцендент";
  }
  if (id === "mc") {
    return "MC (Середина неба)";
  }
  return PLANET_NAMES[id].ru;
}

/** «Юпитер в Весах» — составная расшифровка для планет без curated-текста. */
function composedSignText(id: PlanetId, sign: SignId): string {
  const planet = PLANET_PRINCIPLES[id];
  const profile = SIGN_PROFILES[sign];
  const names = SIGN_NAMES[sign];
  let text =
    `${PLANET_NAMES[id].ru} отвечает за ${planet.principle} (${planet.sphere}). ` +
    `${capitalize(names.loc)} эта сфера проявляется ${profile.style}. ` +
    `Ключевые слова: ${profile.keywords.join(", ")}.`;
  if (planet.generational) {
    text +=
      " Это медленная планета: знак описывает скорее почерк поколения, а вот дом и аспекты — ваш личный акцент.";
  }
  return text;
}

function signText(p: PlanetPlacement): string {
  const curated = CURATED_IN_SIGN[p.id];
  if (curated) {
    return curated[p.sign];
  }
  if (p.id === "node") {
    return `Северный узел показывает направление развития души. ${capitalize(SIGN_NAMES[p.sign].loc)} это ${NODE_IN_SIGN[p.sign]}. Противоположная точка (Южный узел ${SIGN_NAMES[opposite(p.sign)].loc}) — привычный, но исчерпанный опыт, на который не стоит опираться слишком сильно.`;
  }
  if (p.id === "lilith") {
    return `Лилит (Черная Луна) отмечает зону вытесненных желаний и обостренных реакций. ${capitalize(SIGN_NAMES[p.sign].loc)} темы знака (${SIGN_PROFILES[p.sign].keywords.join(", ")}) могут проживаться с перегибами — от полного отрицания до навязчивости; осознанность возвращает этой зоне здоровую меру.`;
  }
  return composedSignText(p.id, p.sign);
}

function opposite(sign: SignId): SignId {
  const order: SignId[] = [
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
  return order[(order.indexOf(sign) + 6) % 12]!;
}

function houseText(p: PlanetPlacement): string {
  const house = HOUSE_INFO[p.house]!;
  const planet = PLANET_PRINCIPLES[p.id];
  return (
    `В ${p.house}-м доме (${house.title.toLowerCase()}) ${planet.houseFocus} ` +
    `сосредоточены в сфере ${house.sphere}: ${house.desc}.`
  );
}

function retroText(p: PlanetPlacement): string {
  if (!p.retrograde || p.id === "node" || p.id === "lilith") {
    return "";
  }
  return (
    ` Планета ретроградна: ее темы проживаются углубленно и «вовнутрь» — ` +
    `внешние результаты приходят позже, зато опыт усваивается основательнее.`
  );
}

function aspectLine(a: AspectHit): string {
  const template = ASPECT_TEMPLATES[a.aspect]!;
  const pa = a.a === "asc" || a.a === "mc" ? null : PLANET_PRINCIPLES[a.a as PlanetId];
  const pb = a.b === "asc" || a.b === "mc" ? null : PLANET_PRINCIPLES[a.b as PlanetId];
  const descA = pa ? pa.principle : a.a === "asc" ? "образ и подача себя" : "призвание и статус";
  const descB = pb ? pb.principle : a.b === "asc" ? "образ и подача себя" : "призвание и статус";
  const applying =
    a.applying === undefined ? "" : a.applying ? ", сходящийся" : ", расходящийся";
  return (
    `**${a.nameRu} ${planetLabel(a.a)} — ${planetLabel(a.b)}** ` +
    `(орб ${formatDegMin(a.orb)}${applying}). ${template(descA, descB)}`
  );
}

function balanceSection(chart: NatalChart): string[] {
  const lines: string[] = [];
  const elems = Object.entries(chart.elements) as [Element, number][];
  const mods = Object.entries(chart.modalities) as [Modality, number][];
  lines.push(
    elems.map(([e, n]) => `${ELEMENT_NAMES[e]}: ${n}`).join(" · ") +
      "  \n" +
      mods.map(([m, n]) => `${MODALITY_NAMES[m]}: ${n}`).join(" · "),
  );
  lines.push("");
  const sortedE = [...elems].sort((x, y) => y[1] - x[1]);
  const [topE, topN] = sortedE[0]!;
  if (topN >= 4) {
    lines.push(ELEMENT_DOMINANT[topE]);
  }
  for (const [e, n] of sortedE) {
    if (n <= 1) {
      lines.push(ELEMENT_LACKING[e]);
    }
  }
  const sortedM = [...mods].sort((x, y) => y[1] - x[1]);
  const [topM, topMN] = sortedM[0]!;
  if (topMN >= 5) {
    lines.push(MODALITY_DOMINANT[topM]);
  }
  return lines;
}

/** Полный отчет в Markdown. */
export function renderReport(chart: NatalChart): string {
  const L: string[] = [];
  const asc = chart.ascendant;
  const mc = chart.midheaven;

  L.push(`# Натальная карта`);
  L.push("");
  L.push(`**Дата и время рождения:** ${chart.input.date} ${chart.input.time} (${chart.offsetLabel})`);
  L.push(`**Место:** ${chart.place.name} — ${chart.place.lat.toFixed(4)}°, ${chart.place.lon.toFixed(4)}°`);
  L.push(`**Всемирное время (UT):** ${chart.utc.replace("T", " ").slice(0, 16)}`);
  const sysName = chart.houses.system === "placidus" ? "Плацидус" : "цельнознаковая";
  L.push(
    `**Система домов:** ${sysName}` +
      (chart.houses.system !== chart.houses.requestedSystem
        ? " (автоматический переход: на полярных широтах Плацидус не определен)"
        : ""),
  );
  L.push("");

  L.push(`## Положения планет`);
  L.push("");
  L.push(`| Планета | Положение | Дом | Движение |`);
  L.push(`|---|---|---|---|`);
  for (const p of chart.planets) {
    const name = `${PLANET_NAMES[p.id].symbol} ${PLANET_NAMES[p.id].ru}`;
    const motion =
      p.id === "node" || p.id === "lilith"
        ? "—"
        : p.retrograde
          ? "R (ретро)"
          : "директное";
    L.push(`| ${name} | ${formatZodiac(p.lon)} | ${p.house} | ${motion} |`);
  }
  L.push("");

  L.push(`## Углы карты и дома`);
  L.push("");
  L.push(`**Асцендент (ASC):** ${formatZodiac(asc.lon)} · **Середина неба (MC):** ${formatZodiac(mc.lon)}`);
  L.push("");
  L.push(`| Дом | Куспид | Дом | Куспид |`);
  L.push(`|---|---|---|---|`);
  for (let i = 0; i < 6; i++) {
    const a = chart.houses.cusps[i]!;
    const b = chart.houses.cusps[i + 6]!;
    L.push(`| ${i + 1} | ${formatZodiac(a)} | ${i + 7} | ${formatZodiac(b)} |`);
  }
  L.push("");

  L.push(`## Баланс стихий и крестов`);
  L.push("");
  L.push(...balanceSection(chart));
  L.push("");

  L.push(`## Подробная расшифровка`);
  L.push("");

  L.push(`### Асцендент ${SIGN_NAMES[asc.sign].loc} (${formatZodiac(asc.lon)})`);
  L.push("");
  L.push(ASC_IN_SIGN[asc.sign]);
  const ruler = chart.chartRuler;
  L.push(
    `Управитель карты — ${PLANET_NAMES[ruler.planet].ru} (управитель знака Асцендента): ` +
      `${PLANET_NAMES[ruler.planet].ru} ${SIGN_NAMES[ruler.placement.sign].loc} в ${ruler.placement.house}-м доме ` +
      `задает сквозной сюжет судьбы — обратите особое внимание на эту планету ниже.`,
  );
  L.push("");

  L.push(
    `### Середина неба ${SIGN_NAMES[mc.sign].loc}: призвание`,
  );
  L.push("");
  L.push(
    `MC описывает вершину социального пути. ${capitalize(SIGN_NAMES[mc.sign].loc)} карьера строится ${SIGN_PROFILES[mc.sign].style}. В профессии востребованы качества: ${SIGN_PROFILES[mc.sign].keywords.join(", ")}.`,
  );
  L.push("");

  for (const p of chart.planets) {
    const title = `${PLANET_NAMES[p.id].symbol} ${PLANET_NAMES[p.id].ru} ${SIGN_NAMES[p.sign].loc} — ${p.house}-й дом`;
    L.push(`### ${title}`);
    L.push("");
    L.push(signText(p) + retroText(p));
    L.push("");
    L.push(houseText(p));
    L.push("");
  }

  L.push(`## Аспекты`);
  L.push("");
  const majors = chart.aspects.filter((a) => a.aspect !== "semisextile" && a.aspect !== "quincunx");
  const minors = chart.aspects.filter((a) => a.aspect === "semisextile" || a.aspect === "quincunx");
  if (majors.length === 0) {
    L.push("Мажорных аспектов в пределах орбисов не обнаружено.");
  }
  for (const a of majors) {
    L.push(`- ${aspectLine(a)}`);
  }
  if (minors.length > 0) {
    L.push("");
    L.push(`**Минорные аспекты:**`);
    for (const a of minors) {
      L.push(`- ${aspectLine(a)}`);
    }
  }
  L.push("");

  L.push(`---`);
  L.push("");
  L.push(
    `*Расчет: тропический зодиак, геоцентрические позиции (точность ~1–2′), ` +
      `дома — ${sysName}. Расшифровки носят обзорный характер: целостная картина складывается ` +
      `из сочетания всех факторов карты, а не из отдельных положений.*`,
  );
  L.push("");
  return L.join("\n");
}
