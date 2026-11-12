export type SessionStatus = "empty" | "ready" | "completed";

export interface Participant {
  id: string;
  name: string;
}

export interface DrawHistory {
  id: string;
  sessionId: number;
  /** Snapshot seluruh peserta pada saat pengundian dilakukan. */
  participants: Participant[];
  winner: Participant;
  /** ISO timestamp saat pengundian selesai. */
  drawnAt: string;
}

export interface DrawSession {
  id: number; // 1..10
  participants: Participant[];
  winner: Participant | null;
  history: DrawHistory[];
  status: SessionStatus;
  drawnAt: string | null;
}

export interface Settings {
  maxParticipantsPerSession: number; // default 30
  globalUniqueWinners: boolean; // wajib true sesuai update requirement
  /** Lama animasi pengundian (ms). */
  spinDurationMs: number; // 1000..15000
  /** Jumlah putaran penuh drum selama durasi — menentukan kecepatan. */
  spinRevolutions: number; // 2..20
}

export const DEFAULT_MAX_PARTICIPANTS = 30;
export const DEFAULT_SPIN_DURATION_MS = 4000;
export const DEFAULT_SPIN_REVOLUTIONS = 6;

export const MIN_SPIN_DURATION_MS = 1000;
export const MAX_SPIN_DURATION_MS = 15000;
export const MIN_SPIN_REVOLUTIONS = 2;
export const MAX_SPIN_REVOLUTIONS = 20;

export interface LuckyDrawState {
  schemaVersion: 1;
  eventName: string;
  sessions: DrawSession[];
  settings: Settings;
  updatedAt: string;
}

export const SESSION_COUNT = 10;
export const SCHEMA_VERSION = 1;
export const MAX_NAME_LENGTH = 100;
