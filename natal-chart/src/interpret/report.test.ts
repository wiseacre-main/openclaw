import { describe, expect, it } from "vitest";
import { computeNatalChart } from "../chart.js";
import { PLANET_NAMES } from "../format.js";
import { renderReport } from "./report.js";

describe("renderReport", () => {
  const chart = computeNatalChart({ date: "1990-05-15", time: "14:30", place: "Москва" });
  const report = renderReport(chart);

  it("contains all main sections", () => {
    for (const section of [
      "# Натальная карта",
      "## Положения планет",
      "## Углы карты и дома",
      "## Баланс стихий и крестов",
      "## Подробная расшифровка",
      "## Аспекты",
    ]) {
      expect(report).toContain(section);
    }
  });

  it("includes an interpretation heading for every body", () => {
    for (const p of chart.planets) {
      expect(report).toContain(`${PLANET_NAMES[p.id].ru} `);
    }
    expect(report).toContain("### Асцендент");
    expect(report).toContain("Середина неба");
    expect(report).toContain("Управитель карты");
  });

  it("includes the detailed Sun-in-Taurus text for the sample chart", () => {
    expect(report).toContain("потребность в устойчивости");
  });

  it("mentions aspects with orbs", () => {
    expect(report).toMatch(/\*\*(Соединение|Секстиль|Квадрат|Тригон|Оппозиция) .+ — .+\*\* \(орб \d+°\d{2}′/u);
  });

  it("renders whole-sign fallback note for polar charts", () => {
    const polar = computeNatalChart({ date: "1990-01-15", time: "12:00", place: "Мурманск" });
    const polarReport = renderReport(polar);
    expect(polarReport).toContain("цельнознаковая");
    expect(polarReport).toContain("полярных широтах");
  });
});
