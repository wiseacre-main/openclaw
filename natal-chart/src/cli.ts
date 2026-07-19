#!/usr/bin/env node
/**
 * CLI: расчет натальной карты.
 *
 * Примеры:
 *   natal-chart --date 1990-05-15 --time 14:30 --place "Москва"
 *   natal-chart --date 1985-11-02 --time 06:45 --lat 59.93 --lon 30.34 --tz Europe/Moscow
 *   natal-chart --date 1990-05-15 --time 14:30 --place spb --json
 */

import { parseArgs } from "node:util";
import { computeNatalChart, InputError, type NatalInput } from "./chart.js";
import { CITIES } from "./geo/cities.js";
import { TimezoneError } from "./geo/timezone.js";
import { renderReport } from "./interpret/report.js";

const HELP = `natal-chart — автоматический расчет натальной карты с подробной расшифровкой

Использование:
  natal-chart --date ГГГГ-ММ-ДД --time ЧЧ:ММ --place "Город" [опции]
  natal-chart --date ГГГГ-ММ-ДД --time ЧЧ:ММ --lat Ш --lon Д --tz Зона [опции]

Опции:
  --date        Дата рождения (местная), например 1990-05-15   [обязательно]
  --time        Время рождения (местное, 24 ч), например 14:30 [обязательно]
  --place       Город из встроенной базы (рус./англ. название)
  --lat         Широта в градусах (север +), например 55.7558
  --lon         Долгота в градусах (восток +), например 37.6173
  --tz          IANA-таймзона, например Europe/Moscow
  --offset      Смещение UTC в минутах (вместо --tz), например 180
  --houses      Система домов: placidus (по умолчанию) | whole-sign
  --json        Вывести данные карты в JSON вместо отчета
  --list-cities Показать встроенную базу городов
  --help        Эта справка

Примеры:
  natal-chart --date 1990-05-15 --time 14:30 --place "Москва"
  natal-chart --date 2001-01-01 --time 09:15 --place spb --houses whole-sign
  natal-chart --date 1985-11-02 --time 06:45 --lat 59.93 --lon 30.34 --tz Europe/Moscow --json
`;

export function runCli(argv: string[]): { code: number; out: string } {
  let values: Record<string, string | boolean | undefined>;
  try {
    ({ values } = parseArgs({
      args: argv,
      options: {
        date: { type: "string" },
        time: { type: "string" },
        place: { type: "string" },
        lat: { type: "string" },
        lon: { type: "string" },
        tz: { type: "string" },
        offset: { type: "string" },
        houses: { type: "string" },
        json: { type: "boolean" },
        "list-cities": { type: "boolean" },
        help: { type: "boolean" },
      },
    }));
  } catch (err) {
    return { code: 2, out: `Ошибка аргументов: ${(err as Error).message}\n\n${HELP}` };
  }

  if (values.help) {
    return { code: 0, out: HELP };
  }
  if (values["list-cities"]) {
    const lines = CITIES.map((c) => `${c.name} (${c.nameEn}, ${c.country}) — ${c.tz}`);
    return { code: 0, out: `Встроенная база городов (${CITIES.length}):\n${lines.join("\n")}\n` };
  }
  if (!values.date || !values.time) {
    return { code: 2, out: `Не заданы обязательные параметры --date и --time.\n\n${HELP}` };
  }

  const num = (v: string | boolean | undefined): number | undefined => {
    if (typeof v !== "string" || v.trim() === "") {
      return undefined;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const houseSystem = values.houses as NatalInput["houseSystem"] | undefined;
  if (houseSystem !== undefined && houseSystem !== "placidus" && houseSystem !== "whole-sign") {
    return { code: 2, out: `Неизвестная система домов: "${String(values.houses)}". Доступны: placidus, whole-sign.` };
  }

  const input: NatalInput = {
    date: String(values.date),
    time: String(values.time),
    place: typeof values.place === "string" ? values.place : undefined,
    latitude: num(values.lat),
    longitude: num(values.lon),
    timezone: typeof values.tz === "string" ? values.tz : undefined,
    utcOffsetMinutes: num(values.offset),
    houseSystem,
  };

  try {
    const chart = computeNatalChart(input);
    if (values.json) {
      return { code: 0, out: JSON.stringify(chart, null, 2) };
    }
    return { code: 0, out: renderReport(chart) };
  } catch (err) {
    if (err instanceof InputError || err instanceof TimezoneError) {
      return { code: 1, out: `Ошибка: ${err.message}` };
    }
    throw err;
  }
}

// Run only when executed directly (not when imported by tests).
const isMain = process.argv[1]?.endsWith("cli.ts") || process.argv[1]?.endsWith("cli.js");
if (isMain) {
  const { code, out } = runCli(process.argv.slice(2));
  console.log(out);
  process.exit(code);
}
