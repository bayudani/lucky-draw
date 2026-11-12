import { drawWinnerIndex } from "./drawWinner";

export interface DrumDisplay {
  /** Nama-nama yang tampil berputar di drum. */
  names: string[];
  /** Indeks pemenang pada `names`. */
  winnerIndex: number;
}

/**
 * Batas visual pelat drum (performa & tampilan). Bukan pengaturan pengguna —
 * hanya seberapa banyak nama yang dirender berputar di silinder 3D.
 */
export const DRUM_VISUAL_CAP = 30;

/**
 * Susun nama yang tampil di drum: jendela `displayCount` nama pertama
 * (berurutan) dari kumpulan eligible. Pemenang pertama — yang dipilih dari
 * SEMUA peserta — wajib tampil: bila ia tidak termasuk N nama pertama,
 * ia menggantikan satu slot. Pemilihan pemenang itu sendiri TIDAK
 * terpengaruh tampilan drum.
 */
export function buildDrumDisplay(
  eligibleNames: string[],
  winnerName: string,
  displayCount: number,
): DrumDisplay {
  if (eligibleNames.length === 0) return { names: [], winnerIndex: -1 };
  const count = Math.max(1, Math.min(displayCount, eligibleNames.length));
  const names = eligibleNames.slice(0, count);
  const winnerIndex = names.indexOf(winnerName);
  if (winnerIndex !== -1) return { names, winnerIndex };
  // Pemenang di luar jendela tampilan: sisipkan pada slot acak (crypto).
  const slot = drawWinnerIndex(count);
  names[slot] = winnerName;
  return { names, winnerIndex: slot };
}
