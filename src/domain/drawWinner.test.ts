import { describe, expect, it } from "vitest";
import { drawWinnerIndex, secureRandomIndex } from "./drawWinner";

describe("secureRandomIndex", () => {
  it("melempar error untuk input tidak valid", () => {
    expect(() => secureRandomIndex(0)).toThrow();
    expect(() => secureRandomIndex(-1)).toThrow();
    expect(() => secureRandomIndex(2.5)).toThrow();
  });

  it("selalu mengembalikan indeks dalam rentang [0, length)", () => {
    for (let i = 0; i < 200; i += 1) {
      const index = secureRandomIndex(7);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(7);
      expect(Number.isInteger(index)).toBe(true);
    }
  });

  it("menangani 1 kandidat", () => {
    for (let i = 0; i < 10; i += 1) {
      expect(secureRandomIndex(1)).toBe(0);
    }
  });
});

describe("drawWinnerIndex", () => {
  it("memakai random function yang disuntikkan (pure & testable)", () => {
    expect(drawWinnerIndex(5, () => 3)).toBe(3);
    expect(drawWinnerIndex(5, () => 0)).toBe(0);
  });
});
