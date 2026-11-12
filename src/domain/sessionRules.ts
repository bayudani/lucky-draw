import type { DrawSession, LuckyDrawState, Participant } from "./types";

/** Normalisasi nama untuk perbandingan: trim + lowercase (kapitalisasi asli dipertahankan untuk tampilan). */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Kumpulan nama (ternormalisasi) semua pemenang lintas sesi,
 * tidak termasuk sesi yang sedang diproses (excludeSessionId).
 */
export function getWinnerNames(
  state: Pick<LuckyDrawState, "sessions">,
  excludeSessionId?: number,
): string[] {
  const names: string[] = [];
  for (const session of state.sessions) {
    if (excludeSessionId !== undefined && session.id === excludeSessionId) continue;
    for (const winner of session.winners) names.push(normalizeName(winner.name));
  }
  return names;
}

/** Apakah peserta eligible untuk diundi (belum pernah menang di sesi mana pun). */
export function isEligible(
  name: string,
  winnerNames: string[],
  globalUniqueWinners: boolean,
): boolean {
  if (!globalUniqueWinners) return true;
  const key = normalizeName(name);
  return !winnerNames.includes(key);
}

/**
 * Peserta yang boleh diundi pada sesi ini.
 * Business logic di sini, bukan di UI: peserta yang sudah menang tetap
 * ditampilkan (dengan badge "Sudah Menang") tapi tidak bisa terpilih.
 */
export function getEligibleParticipants(
  session: DrawSession,
  state: Pick<LuckyDrawState, "sessions" | "settings">,
): Participant[] {
  const winnerNames = getWinnerNames(state, session.id);
  return session.participants.filter((p) =>
    isEligible(p.name, winnerNames, state.settings.globalUniqueWinners),
  );
}

/** Peserta yang sudah menang di sesi lain (untuk badge di grid). */
export function getPreviousWinnerNamesForSession(
  session: DrawSession,
  state: Pick<LuckyDrawState, "sessions" | "settings">,
): string[] {
  if (!state.settings.globalUniqueWinners) return [];
  return getWinnerNames(state, session.id);
}

export function computeSessionStatus(
  participantCount: number,
  hasWinner: boolean,
): "empty" | "ready" | "completed" {
  if (hasWinner) return "completed";
  return participantCount > 0 ? "ready" : "empty";
}

export function findSession(
  state: Pick<LuckyDrawState, "sessions">,
  sessionId: number,
): DrawSession | undefined {
  return state.sessions.find((s) => s.id === sessionId);
}

/** Sesi berikutnya yang masih bisa diundi (empty/ready), mulai dari urutan 1..10. */
export function findNextDrawableSession(
  state: Pick<LuckyDrawState, "sessions">,
  fromSessionId: number,
): DrawSession | undefined {
  const ordered = [...state.sessions].sort((a, b) => a.id - b.id);
  const startIndex = ordered.findIndex((s) => s.id === fromSessionId);
  for (let offset = 1; offset <= ordered.length; offset += 1) {
    const candidate = ordered[(startIndex + offset) % ordered.length];
    if (candidate && candidate.status !== "completed") return candidate;
  }
  return undefined;
}
