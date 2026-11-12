import {
  DEFAULT_MAX_PARTICIPANTS,
  DEFAULT_SPIN_DURATION_MS,
  DEFAULT_SPIN_REVOLUTIONS,
  SCHEMA_VERSION,
  SESSION_COUNT,
  type DrawSession,
  type LuckyDrawState,
} from "./types";

/** Membuat 10 sesi kosong sesuai BR-01. */
export function createEmptySessions(): DrawSession[] {
  return Array.from({ length: SESSION_COUNT }, (_, index) => ({
    id: index + 1,
    participants: [],
    winner: null,
    history: [],
    status: "empty" as const,
    drawnAt: null,
  }));
}

export function createInitialState(): LuckyDrawState {
  return {
    schemaVersion: SCHEMA_VERSION,
    // Jangan mengarang nama acara (AGENTS.md) — label generik.
    eventName: "Lucky Draw",
    sessions: createEmptySessions(),
    settings: {
      maxParticipantsPerSession: DEFAULT_MAX_PARTICIPANTS,
      // update.md: global unique winner wajib aktif.
      globalUniqueWinners: true,
      spinDurationMs: DEFAULT_SPIN_DURATION_MS,
      spinRevolutions: DEFAULT_SPIN_REVOLUTIONS,
    },
    updatedAt: new Date().toISOString(),
  };
}
