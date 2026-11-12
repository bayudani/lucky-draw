import type { DrawSession, LuckyDrawState } from "./types";
import { DEFAULT_WINNER_COUNT, SESSION_COUNT } from "./types";

/** Membuat satu sesi kosong dengan id tertentu. */
export function createEmptySession(id: number, winnerCount = DEFAULT_WINNER_COUNT): DrawSession {
  return {
    id,
    participants: [],
    winners: [],
    history: [],
    status: "empty" as const,
    drawnAt: null,
    winnerCount,
  };
}

/** Membuat `count` sesi kosong sesuai jumlah sesi yang dikonfigurasi. */
export function createEmptySessions(count = SESSION_COUNT): DrawSession[] {
  return Array.from({ length: count }, (_, index) => createEmptySession(index + 1));
}

export function createInitialState(): LuckyDrawState {
  return {
    schemaVersion: 1,
    // Jangan mengarang nama acara (AGENTS.md) — label generik.
    eventName: "Lucky Draw",
    sessions: createEmptySessions(),
    settings: {
      maxParticipantsPerSession: 30,
      // update.md: global unique winner wajib aktif.
      globalUniqueWinners: true,
      sessionCount: SESSION_COUNT,
      spinDurationMs: 4000,
      spinRevolutions: 6,
    },
    updatedAt: new Date().toISOString(),
  };
}
