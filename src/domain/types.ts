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
}

export interface LuckyDrawState {
  schemaVersion: 1;
  eventName: string;
  sessions: DrawSession[];
  settings: Settings;
  updatedAt: string;
}

export const SESSION_COUNT = 10;
export const SCHEMA_VERSION = 1;
export const DEFAULT_MAX_PARTICIPANTS = 30;
export const MAX_NAME_LENGTH = 100;
