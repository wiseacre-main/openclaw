import { describe, expect, it } from "vitest";
import { runCli } from "./cli.js";

describe("CLI", () => {
  it("prints a report for valid arguments", () => {
    const { code, out } = runCli(["--date", "1990-05-15", "--time", "14:30", "--place", "Москва"]);
    expect(code).toBe(0);
    expect(out).toContain("# Натальная карта");
    expect(out).toContain("Тельца"); // Sun position
  });

  it("prints JSON with --json", () => {
    const { code, out } = runCli([
      "--date",
      "1990-05-15",
      "--time",
      "14:30",
      "--place",
      "spb",
      "--json",
    ]);
    expect(code).toBe(0);
    const parsed = JSON.parse(out);
    expect(parsed.place.name).toContain("Санкт-Петербург");
    expect(parsed.planets).toHaveLength(12);
  });

  it("shows help", () => {
    const { code, out } = runCli(["--help"]);
    expect(code).toBe(0);
    expect(out).toContain("Использование");
  });

  it("lists cities", () => {
    const { code, out } = runCli(["--list-cities"]);
    expect(code).toBe(0);
    expect(out).toContain("Москва");
  });

  it("fails with a clear message when required args are missing", () => {
    const { code, out } = runCli([]);
    expect(code).toBe(2);
    expect(out).toContain("--date");
  });

  it("fails gracefully for unknown city", () => {
    const { code, out } = runCli(["--date", "1990-05-15", "--time", "14:30", "--place", "Атлантида"]);
    expect(code).toBe(1);
    expect(out).toContain("не найден");
  });
});
