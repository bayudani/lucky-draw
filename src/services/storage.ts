import {
  SCHEMA_VERSION,
  SESSION_COUNT,
  type DrawHistory,
  type DrawSession,
  type LuckyDrawState,
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

function parseHistory(value: unknown, sessionId: number): DrawHistory[] | null {
  if (!Array.isArray(value)) return null;
  const history: DrawHistory[] = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    if (typeof item.id !== "string" || item.id.length === 0) return null;
    if (item.sessionId !== sessionId) return null;
    const participants = parseParticipants(item.participants);
    if (!participants) return null;
    const winner = parseParticipant(item.winner);
    if (!winner) return null;
    if (!isIsoDateString(item.drawnAt)) return null;
    history.push({
      id: item.id,
      sessionId,
      participants,
      winner,
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
  let winner: { id: string; name: string } | null = null;
  if (value.winner !== null) {
    const parsedWinner = parseParticipant(value.winner);
    if (!parsedWinner) return null;
    winner = parsedWinner;
  } else if (value.winner === undefined) {
    return null;
  }
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
  return { id: expectedId, participants, winner, history, status, drawnAt };
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
  if (!Array.isArray(raw.sessions) || raw.sessions.length !== SESSION_COUNT) return null;

  const sessions: DrawSession[] = [];
  for (let i = 0; i < SESSION_COUNT; i += 1) {
    const session = parseSession(raw.sessions[i], i + 1);
    if (!session) return null;
    // Status selalu dihitung ulang dari data agar konsisten.
    sessions.push({
      ...session,
      status: computeSessionStatus(session.participants.length, session.winner !== null),
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

  if (!isIsoDateString(raw.updatedAt)) return null;

  return {
    schemaVersion: SCHEMA_VERSION,
    eventName: raw.eventName,
    sessions,
    settings: { maxParticipantsPerSession, globalUniqueWinners },
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
