import { describe, expect, it } from "vitest";
import { buildCsv, escapeCsvField } from "./exportImport";
import { createInitialState } from "../domain/factory";
import type { Participant } from "../domain/types";

describe("escapeCsvField", () => {
  it("mengutip field dengan koma", () => {
    expect(escapeCsvField("Santoso, Budi")).toBe('"Santoso, Budi"');
  });

  it("menggandakan tanda kutip", () => {
    expect(escapeCsvField('Nama "Budi"')).toBe('"Nama ""Budi"""');
  });

  it("mengutip field dengan newline", () => {
    expect(escapeCsvField("Baris1\nBaris2")).toBe('"Baris1\nBaris2"');
  });

  it("tidak mengutip field biasa", () => {
    expect(escapeCsvField("Budi")).toBe("Budi");
  });
});

describe("buildCsv", () => {
  it("berisi header dan satu baris per sesi", () => {
    const state = createInitialState();
    const p: Participant = { id: "w1", name: "Siti Rahma" };
    state.sessions[0].winner = p;
    state.sessions[0].drawnAt = "2026-11-12T10:00:00.000Z";
    state.sessions[0].participants = [p, { id: "p2", name: "Budi" }];

    const csv = buildCsv(state);
    const lines = csv.split("\r\n");
    expect(lines).toHaveLength(11);
    expect(lines[0]).toBe(
      "session_number,session_name,winner_name,drawn_at,participant_count",
    );
    expect(lines[1]).toBe("1,Sesi 1,Siti Rahma,2026-11-12T10:00:00.000Z,2");
    expect(lines[2]).toBe("2,Sesi 2,,,0");
  });

  it("melakukan escaping untuk pemenang dengan koma", () => {
    const state = createInitialState();
    state.sessions[3].winner = { id: "w", name: "Santoso, Budi" };
    const csv = buildCsv(state);
    expect(csv).toContain('4,Sesi 4,"Santoso, Budi",,0');
  });
});
