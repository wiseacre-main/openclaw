import { describe, expect, it } from "vitest";
import { CITIES, findCity, suggestCities } from "./cities.js";

describe("cities", () => {
  it("finds cities by Russian name regardless of case", () => {
    expect(findCity("Москва")?.tz).toBe("Europe/Moscow");
    expect(findCity("мОсКвА")?.tz).toBe("Europe/Moscow");
  });

  it("finds cities by English name and aliases", () => {
    expect(findCity("Saint Petersburg")?.name).toBe("Санкт-Петербург");
    expect(findCity("спб")?.name).toBe("Санкт-Петербург");
    expect(findCity("питер")?.name).toBe("Санкт-Петербург");
    expect(findCity("nyc")?.name).toBe("Нью-Йорк");
  });

  it("normalizes ё and hyphens", () => {
    expect(findCity("Кишинёв")?.name).toBe("Кишинев");
    expect(findCity("Ростов на Дону")?.name).toBe("Ростов-на-Дону");
    expect(findCity("нью йорк")?.name).toBe("Нью-Йорк");
  });

  it("returns null for unknown places and offers suggestions", () => {
    expect(findCity("Атлантида")).toBeNull();
    const near = suggestCities("Новос");
    expect(near.map((c) => c.name)).toContain("Новосибирск");
  });

  it("every city has valid coordinates and a resolvable IANA zone", () => {
    for (const c of CITIES) {
      expect(Math.abs(c.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(c.lon)).toBeLessThanOrEqual(180);
      // Throws for unknown zone names.
      expect(() => new Intl.DateTimeFormat("en-US", { timeZone: c.tz })).not.toThrow();
    }
  });
});
