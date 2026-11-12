import { describe, expect, it } from "vitest";
import { buildDrumDisplay } from "./drumDisplay";

describe("buildDrumDisplay", () => {
  it("menampilkan semua nama bila jumlahnya tidak lebih dari displayCount", () => {
    const result = buildDrumDisplay(["A", "B", "C"], "B", 30);
    expect(result.names).toEqual(["A", "B", "C"]);
    expect(result.winnerIndex).toBe(1);
  });

  it("menampilkan hanya displayCount nama pertama, berurutan", () => {
    const names = Array.from({ length: 200 }, (_, i) => `N${i + 1}`);
    const result = buildDrumDisplay(names, "N3", 30);
    expect(result.names).toHaveLength(30);
    expect(result.names[0]).toBe("N1");
    expect(result.winnerIndex).toBe(2);
  });

  it("menyisipkan pemenang pada slot acak bila di luar jendela tampilan", () => {
    const names = Array.from({ length: 200 }, (_, i) => `N${i + 1}`);
    const result = buildDrumDisplay(names, "N150", 30);
    expect(result.names).toHaveLength(30);
    expect(result.winnerIndex).toBeGreaterThanOrEqual(0);
    expect(result.winnerIndex).toBeLessThan(30);
    expect(result.names[result.winnerIndex]).toBe("N150");
  });

  it("clamp displayCount minimum 1 dan maksimum jumlah eligible", () => {
    const result = buildDrumDisplay(["A", "B"], "B", 0);
    expect(result.names).toHaveLength(1);
    expect(result.winnerIndex).toBe(0);
    expect(result.names[0]).toBe("B");
  });

  it("mengembalikan kosong bila tidak ada nama", () => {
    const result = buildDrumDisplay([], "X", 30);
    expect(result.names).toEqual([]);
    expect(result.winnerIndex).toBe(-1);
  });
});
