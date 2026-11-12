import { describe, expect, it } from "vitest";
import {
  drawDistinctWinnerIndices,
  drawWinnerIndex,
  secureRandomIndex,
} from "./drawWinner";

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

describe("drawDistinctWinnerIndices", () => {
  it("melempar error untuk kandidat tidak valid", () => {
    expect(() => drawDistinctWinnerIndices(0, 1)).toThrow();
    expect(() => drawDistinctWinnerIndices(-2, 1)).toThrow();
  });

  it("mengembalikan semua indeks bila count = jumlah kandidat", () => {
    expect(drawDistinctWinnerIndices(3, 3)).toEqual([0, 1, 2]);
  });

  it("mengembalikan semua indeks bila count melebihi kandidat (clamp)", () => {
    const indices = drawDistinctWinnerIndices(2, 10);
    expect(indices).toHaveLength(2);
    expect(new Set(indices).size).toBe(2);
  });

  it("count 0 menghasilkan array kosong", () => {
    expect(drawDistinctWinnerIndices(5, 0)).toEqual([]);
  });

  it("menghasilkan indeks distinct dalam rentang valid", () => {
    const indices = drawDistinctWinnerIndices(100, 30);
    expect(indices).toHaveLength(30);
    expect(new Set(indices).size).toBe(30);
    for (const index of indices) {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(100);
    }
  });

  it("memakai random function yang disuntikkan", () => {
    const fakeRandom = (count: number): number => count - 1; // selalu indeks terakhir
    const indices = drawDistinctWinnerIndices(5, 3, fakeRandom);
    expect(indices).toHaveLength(3);
    // partial Fisher-Yates dengan random konstan tetap distinct
    expect(new Set(indices).size).toBe(3);
    expect(indices.every((i) => i >= 0 && i < 5)).toBe(true);
  });
});
