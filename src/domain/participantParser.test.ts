import { describe, expect, it } from "vitest";
import { parseParticipantInput } from "./participantParser";

describe("parseParticipantInput", () => {
  it("mem-parsing satu nama per baris", () => {
    const result = parseParticipantInput("Budi\nSiti\nAndi");
    expect(result.names).toEqual(["Budi", "Siti", "Andi"]);
    expect(result.blankLines).toBe(0);
  });

  it("trim spasi di awal/akhir nama", () => {
    const result = parseParticipantInput("  Budi Santoso  \n\tSiti  ");
    expect(result.names).toEqual(["Budi Santoso", "Siti"]);
  });

  it("mengabaikan baris kosong", () => {
    const result = parseParticipantInput("\nBudi\n\n  \nSiti\n\n");
    expect(result.names).toEqual(["Budi", "Siti"]);
    expect(result.blankLines).toBe(5);
  });

  it("menandai duplikat dalam batch (case-insensitive)", () => {
    const result = parseParticipantInput("Budi\nbudi\nBUDI\nSiti");
    expect(result.names).toEqual(["Budi", "Siti"]);
    expect(result.duplicates).toEqual(["budi", "BUDI"]);
  });

  it("menandai nama terlalu panjang", () => {
    const longName = "a".repeat(101);
    const result = parseParticipantInput(`Budi\n${longName}`);
    expect(result.names).toEqual(["Budi"]);
    expect(result.tooLong).toEqual([longName]);
  });

  it("menerima nama tepat 100 karakter", () => {
    const name = "a".repeat(100);
    const result = parseParticipantInput(name);
    expect(result.names).toEqual([name]);
  });

  it("tidak mengubah kapitalisasi nama", () => {
    const result = parseParticipantInput("bUdI SaNtOsO");
    expect(result.names).toEqual(["bUdI SaNtOsO"]);
  });
});
