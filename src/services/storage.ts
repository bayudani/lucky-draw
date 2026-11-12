import {
  DEFAULT_SPIN_DURATION_MS,
  DEFAULT_SPIN_REVOLUTIONS,
  DEFAULT_WINNER_COUNT,
  MAX_SESSION_COUNT,
  MAX_SPIN_DURATION_MS,
  MAX_SPIN_REVOLUTIONS,
  MAX_WINNER_COUNT,
  MIN_SESSION_COUNT,
  MIN_SPIN_DURATION_MS,
  MIN_SPIN_REVOLUTIONS,
  MIN_WINNER_COUNT,
  SCHEMA_VERSION,
  type DrawHistory,
  type DrawSession,
  type LuckyDrawState,
  type Participant,
  type SessionStatus,
} from "../domain/types";
import { computeSessionStatus } from "../domain/sessionRules";

export const STORAGE_KEY = "lucky-draw:v1";

export type LoadResult =
  | { status: "ok"; state: LuckyDrawState }
  | { status: "empty" }
  | { status: "corrupt" };

const STATUSES: SessionStatus[] = ["empty", "ready", "completed"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoDateString(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function parseParticipant(value: unknown): { id: string; name: string } | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || value.id.length === 0) return null;
  if (typeof value.name !== "string") return null;
  return { id: value.id, name: value.name };
}

function parseParticipants(value: unknown): { id: string; name: string }[] | null {
  if (!Array.isArray(value)) return null;
  const participants: { id: string; name: string }[] = [];
  for (const item of value) {
    const participant = parseParticipant(item);
    if (!participant) return null;
    participants.push(participant);
  }
  return participants;
}

/**
 * Parsing daftar pemenang. Mendukung schema baru (`winners: [...]`) dan
 * backup lama (`winner: {..} | null`) — lama otomatis dimigrasi.
 */
function parseWinners(value: unknown, legacyWinner: unknown): Participant[] | null {
  if (value !== undefined) {
    if (!Array.isArray(value)) return null;
    const winners: Participant[] = [];
    for (const item of value) {
      const winner = parseParticipant(item);
      if (!winner) return null;
      if (winners.some((w) => w.id === winner.id)) return null; // pemenang duplikat
      winners.push(winner);
    }
    return winners;
  }
  // Backup lama: field tunggal `winner`.
  if (legacyWinner === null) return [];
  if (legacyWinner === undefined) return null;
  const winner = parseParticipant(legacyWinner);
  return winner ? [winner] : null;
}

function parseHistory(value: unknown, sessionId: number): DrawHistory[] | null {
  if (!Array.isArray(value)) return null;
  const history: DrawHistory[] = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    if (typeof item.id !== "string" || item.id.length === 0) return null;
    if (item.sessionId !== sessionId) return null;
    const participants = parseParticipants(item.participants);
    if (!participants) return null;
    const winners = parseWinners(item.winners, item.winner);
    if (!winners || winners.length === 0) return null;
    if (!isIsoDateString(item.drawnAt)) return null;
    history.push({
      id: item.id,
      sessionId,
      participants,
      winners,
      drawnAt: item.drawnAt,
    });
  }
  return history;
}

function parseSession(value: unknown, expectedId: number): DrawSession | null {
  if (!isRecord(value)) return null;
  if (value.id !== expectedId) return null;
  const participants = parseParticipants(value.participants);
  if (!participants) return null;
  const winners = parseWinners(value.winners, value.winner);
  if (!winners) return null;
  const history = parseHistory(value.history, expectedId);
  if (!history) return null;
  if (
    value.status !== STATUSES[0] &&
    value.status !== STATUSES[1] &&
    value.status !== STATUSES[2]
  ) {
    return null;
  }
  const status = value.status as SessionStatus;
  let drawnAt: string | null = null;
  if (value.drawnAt === null) {
    drawnAt = null;
  } else if (isIsoDateString(value.drawnAt)) {
    drawnAt = value.drawnAt;
  } else {
    return null;
  }
  // winnerCount opsional (backup lama) — default 1 bila tidak ada / tidak valid.
  let winnerCount = DEFAULT_WINNER_COUNT;
  if (value.winnerCount !== undefined) {
    const raw = value.winnerCount;
    if (
      typeof raw !== "number" ||
      !Number.isInteger(raw) ||
      raw < MIN_WINNER_COUNT ||
      raw > MAX_WINNER_COUNT
    ) {
      return null;
    }
    winnerCount = raw;
  }
  return { id: expectedId, participants, winners, history, status, drawnAt, winnerCount };
}

/**
 * Validasi schema state (dipakai saat load LocalStorage dan saat import JSON).
 * Mengembalikan state yang sudah dinormalisasi (status dihitung ulang)
 * atau null bila struktur tidak valid.
 */
export function validateLuckyDrawState(raw: unknown): LuckyDrawState | null {
  if (!isRecord(raw)) return null;
  if (raw.schemaVersion !== SCHEMA_VERSION) return null;
  if (typeof raw.eventName !== "string") return null;
  if (
    !Array.isArray(raw.sessions) ||
    raw.sessions.length < MIN_SESSION_COUNT ||
    raw.sessions.length > MAX_SESSION_COUNT
  ) {
    return null;
  }
  const sessionCount = raw.sessions.length;

  const sessions: DrawSession[] = [];
  for (let i = 0; i < sessionCount; i += 1) {
    const session = parseSession(raw.sessions[i], i + 1);
    if (!session) return null;
    // Status selalu dihitung ulang dari data agar konsisten.
    sessions.push({
      ...session,
      status: computeSessionStatus(session.participants.length, session.winners.length > 0),
    });
  }

  if (!isRecord(raw.settings)) return null;
  const { maxParticipantsPerSession, globalUniqueWinners } = raw.settings;
  if (
    typeof maxParticipantsPerSession !== "number" ||
    !Number.isInteger(maxParticipantsPerSession) ||
    maxParticipantsPerSession < 1 ||
    maxParticipantsPerSession > 1000
  ) {
    return null;
  }
  if (typeof globalUniqueWinners !== "boolean") return null;

  // Field pengaturan spin/sesi bersifat opsional agar backup lama tetap valid;
  // bila ada nilainya wajib berada dalam rentang wajar.
  let spinDurationMs = DEFAULT_SPIN_DURATION_MS;
  if (raw.settings.spinDurationMs !== undefined) {
    const value = raw.settings.spinDurationMs;
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < MIN_SPIN_DURATION_MS ||
      value > MAX_SPIN_DURATION_MS
    ) {
      return null;
    }
    spinDurationMs = value;
  }
  let spinRevolutions = DEFAULT_SPIN_REVOLUTIONS;
  if (raw.settings.spinRevolutions !== undefined) {
    const value = raw.settings.spinRevolutions;
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < MIN_SPIN_REVOLUTIONS ||
      value > MAX_SPIN_REVOLUTIONS
    ) {
      return null;
    }
    spinRevolutions = value;
  }
  let sessionCountSetting = sessionCount;
  if (raw.settings.sessionCount !== undefined) {
    const value = raw.settings.sessionCount;
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < MIN_SESSION_COUNT ||
      value > MAX_SESSION_COUNT
    ) {
      return null;
    }
    // Konsistensi: jumlah sesi mengikuti array sesi yang ada.
    sessionCountSetting = value === sessionCount ? value : sessionCount;
  }
  // Field opsional (backup lama) — default ON.
  let autoCarryOverParticipants = true;
  if (raw.settings.autoCarryOverParticipants !== undefined) {
    if (typeof raw.settings.autoCarryOverParticipants !== "boolean") return null;
    autoCarryOverParticipants = raw.settings.autoCarryOverParticipants;
  }

  if (!isIsoDateString(raw.updatedAt)) return null;

  // Rebranding: nama acara default lama ("Lucky Draw") otomatis jadi "Benline".
  // Nama lain yang sengaja diisi panitia tetap dipertahankan.
  const eventName = raw.eventName === "Lucky Draw" ? "Benline" : raw.eventName;

  return {
    schemaVersion: SCHEMA_VERSION,
    eventName,
    sessions,
    settings: {
      maxParticipantsPerSession,
      globalUniqueWinners,
      sessionCount: sessionCountSetting,
      autoCarryOverParticipants,
      spinDurationMs,
      spinRevolutions,
    },
    updatedAt: raw.updatedAt,
  };
}

export function saveState(state: LuckyDrawState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Kuota penuh / storage diblokir: jangan hancurkan aplikasi saat acara.
  }
}

export function loadState(): LoadResult {
  let rawText: string | null = null;
  try {
    rawText = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { status: "empty" };
  }
  if (rawText === null) return { status: "empty" };

  try {
    const parsed: unknown = JSON.parse(rawText);
    const state = validateLuckyDrawState(parsed);
    if (!state) return { status: "corrupt" };
    return { status: "ok", state };
  } catch {
    return { status: "corrupt" };
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // abaikan
  }
}
