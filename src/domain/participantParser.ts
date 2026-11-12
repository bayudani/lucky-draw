import { MAX_NAME_LENGTH } from "./types";

export interface ParseIssue {
  type: "duplicate" | "too_long";
  name: string;
}

export interface ParseResult {
  /** Nama valid, sudah trim, urut sesuai input. */
  names: string[];
  /** Baris kosong yang diabaikan. */
  blankLines: number;
  /** Nama duplikat (dalam batch) — memblokir simpan. */
  duplicates: string[];
  /** Nama melebihi batas panjang — memblokir simpan. */
  tooLong: string[];
  issues: ParseIssue[];
}

/**
 * Parsing input massal: satu nama per baris.
 * - Trim spasi awal/akhir.
 * - Baris kosong diabaikan.
 * - Duplikat dideteksi setelah normalisasi trim + lowercase.
 * - Nama lebih dari MAX_NAME_LENGTH karakter ditandai tidak valid.
 */
export function parseParticipantInput(text: string): ParseResult {
  const rawLines = text.split(/\r?\n/);
  const names: string[] = [];
  const duplicates: string[] = [];
  const tooLong: string[] = [];
  const seen = new Set<string>();
  let blankLines = 0;

  for (const rawLine of rawLines) {
    const name = rawLine.trim();
    if (name.length === 0) {
      blankLines += 1;
      continue;
    }
    if (name.length > MAX_NAME_LENGTH) {
      tooLong.push(name);
      continue;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      if (!duplicates.includes(name)) duplicates.push(name);
      continue;
    }
    seen.add(key);
    names.push(name);
  }

  const issues: ParseIssue[] = [
    ...duplicates.map((name) => ({ type: "duplicate" as const, name })),
    ...tooLong.map((name) => ({ type: "too_long" as const, name })),
  ];

  return { names, blankLines, duplicates, tooLong, issues };
}
