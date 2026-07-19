import { describe, expect, it } from "vitest";
import { computeNatalChart, InputError } from "./chart.js";

describe("computeNatalChart (end-to-end)", () => {
  const sample = { date: "1990-05-15", time: "14:30", place: "Москва" };

  it("computes a full chart for a Moscow birth", () => {
    const chart = computeNatalChart(sample);
    // Moscow summer 1990 = UTC+4.
    expect(chart.offsetLabel).toBe("UTC+04:00");
    expect(chart.utc).toBe("1990-05-15T10:30:00.000Z");
    // Sun in mid-Taurus in mid-May.
    const sun = chart.planets.find((p) => p.id === "sun")!;
    expect(sun.sign).toBe("taurus");
    expect(sun.degInSign).toBeGreaterThan(20);
    expect(sun.degInSign).toBeLessThan(26);
    expect(chart.houses.cusps).toHaveLength(12);
    expect(chart.planets).toHaveLength(12);
    for (const p of chart.planets) {
      expect(p.house).toBeGreaterThanOrEqual(1);
      expect(p.house).toBeLessThanOrEqual(12);
    }
    expect(chart.aspects.length).toBeGreaterThan(3);
  });

  it("element and modality counts cover 10 planets + Ascendant", () => {
    const chart = computeNatalChart(sample);
    const elemTotal = Object.values(chart.elements).reduce((a, b) => a + b, 0);
    const modTotal = Object.values(chart.modalities).reduce((a, b) => a + b, 0);
    expect(elemTotal).toBe(11);
    expect(modTotal).toBe(11);
  });

  it("chart ruler is the ruler of the Ascendant sign", () => {
    const chart = computeNatalChart(sample);
    expect(chart.planets.map((p) => p.id)).toContain(chart.chartRuler.planet);
    expect(chart.chartRuler.placement.id).toBe(chart.chartRuler.planet);
  });

  it("accepts explicit coordinates + IANA timezone", () => {
    const chart = computeNatalChart({
      date: "1985-11-02",
      time: "06:45",
      latitude: 59.93,
      longitude: 30.34,
      timezone: "Europe/Moscow",
    });
    const sun = chart.planets.find((p) => p.id === "sun")!;
    expect(sun.sign).toBe("scorpio");
  });

  it("accepts an explicit UTC offset override", () => {
    const chart = computeNatalChart({
      date: "2000-01-01",
      time: "12:00",
      latitude: 51.48,
      longitude: 0,
      utcOffsetMinutes: 0,
    });
    expect(chart.utc).toBe("2000-01-01T12:00:00.000Z");
    const sun = chart.planets.find((p) => p.id === "sun")!;
    expect(sun.sign).toBe("capricorn");
  });

  it("falls back to whole-sign houses for polar birthplaces", () => {
    const chart = computeNatalChart({ date: "1990-01-15", time: "12:00", place: "Мурманск" });
    expect(chart.houses.system).toBe("whole-sign");
  });

  it("rejects bad input with clear Russian errors", () => {
    expect(() => computeNatalChart({ date: "15.05.1990", time: "14:30", place: "Москва" })).toThrow(
      InputError,
    );
    expect(() => computeNatalChart({ date: "1990-05-15", time: "25:00", place: "Москва" })).toThrow(
      InputError,
    );
    expect(() => computeNatalChart({ date: "1990-05-15", time: "14:30", place: "Атлантида" })).toThrow(
      /не найден/,
    );
    expect(() => computeNatalChart({ date: "1990-05-15", time: "14:30" })).toThrow(InputError);
    expect(() =>
      computeNatalChart({ date: "1990-05-15", time: "14:30", latitude: 55, longitude: 37 }),
    ).toThrow(/таймзон/);
  });
});
