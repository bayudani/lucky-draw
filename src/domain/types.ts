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
  winners: Participant[];
  /** ISO timestamp saat pengundian selesai. */
  drawnAt: string;
}

export interface DrawSession {
  id: number; // 1..sessionCount
  /** Nama sesi/hadiah (mis. "KULKAS"). Kosong = tampil "Sesi {id}". */
  name: string;
  participants: Participant[];
  winners: Participant[];
  history: DrawHistory[];
  status: SessionStatus;
  drawnAt: string | null;
  /** Berapa orang pemenang yang keluar pada sesi ini (dinamis per sesi). */
  winnerCount: number;
}

export interface Settings {
  maxParticipantsPerSession: number; // default 30
  globalUniqueWinners: boolean; // wajib true sesuai update requirement
  /** Jumlah sesi pengundian (dinamis, default 10). */
  sessionCount: number;
  /** Setelah sesi selesai, sisa peserta (yang belum menang) otomatis pindah ke sesi berikutnya. */
  autoCarryOverParticipants: boolean;
  /** Lama animasi pengundian (ms). */
  spinDurationMs: number; // 1000..15000
  /** Jumlah putaran penuh drum selama durasi — menentukan kecepatan. */
  spinRevolutions: number; // 2..20
  /** Efek suara saat spin & pemenang (Web Audio, tanpa file asset). */
  soundEnabled: boolean;
}

export const DEFAULT_MAX_PARTICIPANTS = 30;
export const DEFAULT_SESSION_COUNT = 10;
export const DEFAULT_WINNER_COUNT = 1;
export const DEFAULT_SPIN_DURATION_MS = 4000;
export const DEFAULT_SPIN_REVOLUTIONS = 6;

export const MIN_SESSION_COUNT = 1;
export const MAX_SESSION_COUNT = 30;
export const MIN_WINNER_COUNT = 1;
export const MAX_WINNER_COUNT = 100;

export const MIN_SPIN_DURATION_MS = 1000;
export const MAX_SPIN_DURATION_MS = 15000;
export const MIN_SPIN_REVOLUTIONS = 2;
export const MAX_SPIN_REVOLUTIONS = 20;
export const MAX_SESSION_NAME_LENGTH = 40;

export interface LuckyDrawState {
  schemaVersion: 1;
  eventName: string;
  sessions: DrawSession[];
  settings: Settings;
  updatedAt: string;
}

export const SESSION_COUNT = DEFAULT_SESSION_COUNT;
export const SCHEMA_VERSION = 1;
export const MAX_NAME_LENGTH = 100;
