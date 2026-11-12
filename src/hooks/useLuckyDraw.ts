import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createEmptySession, createEmptySessions, createInitialState } from "../domain/factory";
import { drawDistinctWinnerIndices } from "../domain/drawWinner";
import { buildDrumDisplay, DRUM_VISUAL_CAP } from "../domain/drumDisplay";
import {
  findSession,
  getEligibleParticipants,
  getWinnerNames,
  computeSessionStatus,
  normalizeName,
} from "../domain/sessionRules";
import type {
  DrawSession,
  LuckyDrawState,
  Participant,
  Settings,
} from "../domain/types";
import {
  MAX_SESSION_COUNT,
  MAX_SESSION_NAME_LENGTH,
  MAX_SPIN_DURATION_MS,
  MAX_SPIN_REVOLUTIONS,
  MAX_WINNER_COUNT,
  MIN_SESSION_COUNT,
  MIN_SPIN_DURATION_MS,
  MIN_SPIN_REVOLUTIONS,
  MIN_WINNER_COUNT,
} from "../domain/types";
import { clearState, loadState, saveState, type LoadResult } from "../services/storage";

/**
 * Data undian yang sedang berjalan: dipakai animasi 3D untuk mendarat di
 * pemenang pertama. `durationMs` & `revolutions` diambil dari pengaturan
 * saat tombol ditekan.
 */
export interface PendingDraw {
  sessionId: number;
  /** Nama-nama yang tampil di drum (jendela visual, pemenang pertama wajib ada). */
  names: string[];
  /** Indeks pemenang pertama pada `names`. */
  winnerIndex: number;
  durationMs: number;
  revolutions: number;
}

type Action =
  | { type: "SET_PARTICIPANTS"; sessionId: number; names: string[] }
  | { type: "COMPLETE_DRAW"; sessionId: number; winnerIds: string[]; drawnAt: string }
  | { type: "REDRAW_SESSION"; sessionId: number }
  | { type: "RESET_SESSION"; sessionId: number }
  | { type: "RESET_ALL" }
  | { type: "IMPORT_STATE"; state: LuckyDrawState }
  | { type: "UPDATE_SETTINGS"; settings: Partial<Settings> }
  | { type: "SET_WINNER_COUNT"; sessionId: number; winnerCount: number }
  | { type: "SET_SESSION_NAME"; sessionId: number; name: string };

function mapSession(
  state: LuckyDrawState,
  sessionId: number,
  updater: (session: DrawSession) => DrawSession,
): LuckyDrawState {
  return {
    ...state,
    sessions: state.sessions.map((session) =>
      session.id === sessionId ? updater(session) : session,
    ),
    updatedAt: new Date().toISOString(),
  };
}

function makeParticipantId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback (perangkat sangat lama) — bukan untuk pemilihan pemenang.
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function makeHistoryId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `h-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function reducer(state: LuckyDrawState, action: Action): LuckyDrawState {
  switch (action.type) {
    case "SET_PARTICIPANTS": {
      const session = findSession(state, action.sessionId);
      if (!session || session.status === "completed") return state;
      const participants: Participant[] = action.names.map((name) => ({
        id: makeParticipantId(),
        name,
      }));
      return mapSession(state, action.sessionId, (s) => ({
        ...s,
        participants,
        winner: null,
        drawnAt: null,
        status: computeSessionStatus(participants.length, false),
      }));
    }

    case "COMPLETE_DRAW": {
      const session = findSession(state, action.sessionId);
      // Guard keras: hanya sesi yang belum selesai dan punya peserta bisa diundi.
      if (!session || session.status === "completed" || session.participants.length === 0) {
        return state;
      }
      // Tolak ID duplikat — satu orang tidak boleh menang dua kali di undian yang sama.
      if (new Set(action.winnerIds).size !== action.winnerIds.length) return state;
      const winners = action.winnerIds
        .map((id) => session.participants.find((p) => p.id === id))
        .filter((p): p is Participant => p !== undefined);
      // Semua ID harus valid dan jumlahnya sesuai target sesi.
      if (winners.length === 0 || winners.length !== action.winnerIds.length) return state;
      const expected = Math.min(session.winnerCount, session.participants.length);
      if (winners.length !== expected) return state;
      // Verifikasi eligibility di business logic (bukan hanya UI) untuk SEMUA pemenang.
      const winnerNames = getWinnerNames(state, session.id);
      const violatesGlobalUnique = winners.some((w) =>
        state.settings.globalUniqueWinners
          ? winnerNames.includes(w.name.toLowerCase())
          : false,
      );
      if (violatesGlobalUnique) return state;
      const updated = mapSession(state, action.sessionId, (s) => ({
        ...s,
        winners,
        status: "completed",
        drawnAt: action.drawnAt,
        history: [
          ...s.history,
          {
            id: makeHistoryId(),
            sessionId: s.id,
            participants: [...s.participants],
            winners,
            drawnAt: action.drawnAt,
          },
        ],
      }));

      // Alur otomatis: sisa peserta (yang BELUM menang) pindah ke sesi berikutnya,
      // jadi panitia tidak perlu input nama ulang. Nama yang sudah menang
      // (termasuk pemenang sesi ini) TIDAK ikut dibawa.
      if (!state.settings.autoCarryOverParticipants) return updated;
      const completed = findSession(updated, action.sessionId);
      const next = findSession(updated, action.sessionId + 1);
      if (!completed || !next || next.status === "completed") return updated;
      const allWinnerNames = new Set(getWinnerNames(updated));
      const carried = completed.participants.filter(
        (p) => !allWinnerNames.has(normalizeName(p.name)),
      );
      if (carried.length === 0) return updated;
      const nextKeys = new Set(next.participants.map((p) => normalizeName(p.name)));
      const merged = [
        ...next.participants,
        ...carried.filter((p) => !nextKeys.has(normalizeName(p.name))),
      ];
      return mapSession(updated, next.id, (s) => ({
        ...s,
        participants: merged,
        status: computeSessionStatus(merged.length, s.winners.length > 0),
      }));
    }

    case "REDRAW_SESSION": {
      // Batalkan hasil undian sesi ini: para pemenang & histori sesi dihapus,
      // peserta dipertahankan, sesi kembali "ready" untuk diundi ulang.
      // Hanya berlaku pada sesi yang sudah selesai (aksi eksplisit, bukan spin biasa).
      const session = findSession(state, action.sessionId);
      if (!session || session.status !== "completed") return state;
      return mapSession(state, action.sessionId, (s) => ({
        ...s,
        winners: [],
        drawnAt: null,
        history: [],
        status: computeSessionStatus(s.participants.length, false),
      }));
    }

    case "RESET_SESSION": {
      return mapSession(state, action.sessionId, (s) => ({
        ...s,
        participants: [],
        winners: [],
        history: [],
        status: "empty",
        drawnAt: null,
      }));
    }

    case "RESET_ALL": {
      const base = createInitialState();
      // Pertahankan pengaturan (termasuk jumlah sesi dinamis).
      return {
        ...base,
        settings: state.settings,
        sessions: createEmptySessions(state.settings.sessionCount),
        updatedAt: new Date().toISOString(),
      };
    }

    case "SET_WINNER_COUNT": {
      const session = findSession(state, action.sessionId);
      if (!session) return state;
      const clamped = Math.min(
        MAX_WINNER_COUNT,
        Math.max(MIN_WINNER_COUNT, Math.round(action.winnerCount)),
      );
      if (clamped === session.winnerCount) return state;
      return mapSession(state, action.sessionId, (s) => ({ ...s, winnerCount: clamped }));
    }

    case "SET_SESSION_NAME": {
      const session = findSession(state, action.sessionId);
      if (!session) return state;
      const name = action.name.trim().slice(0, MAX_SESSION_NAME_LENGTH);
      if (name === session.name) return state;
      return mapSession(state, action.sessionId, (s) => ({ ...s, name }));
    }

    case "IMPORT_STATE":
      return { ...action.state, updatedAt: new Date().toISOString() };

    case "UPDATE_SETTINGS": {
      const nextMax = action.settings.maxParticipantsPerSession;
      const nextSessionCount = action.settings.sessionCount;
      const nextDuration = action.settings.spinDurationMs;
      const nextRevolutions = action.settings.spinRevolutions;

      let sessions = state.sessions;
      if (nextSessionCount !== undefined) {
        const clampedCount = Math.min(
          MAX_SESSION_COUNT,
          Math.max(MIN_SESSION_COUNT, Math.round(nextSessionCount)),
        );
        if (clampedCount < sessions.length) {
          // Memperkecil: sesi dari akhir dibuang (beserta datanya).
          sessions = sessions.slice(0, clampedCount);
        } else if (clampedCount > sessions.length) {
          const extra = Array.from({ length: clampedCount - sessions.length }, (_, i) =>
            createEmptySession(sessions.length + i + 1),
          );
          sessions = [...sessions, ...extra];
        }
      }

      return {
        ...state,
        sessions,
        settings: {
          ...state.settings,
          ...action.settings,
          maxParticipantsPerSession:
            nextMax !== undefined
              ? Math.min(1000, Math.max(1, Math.round(nextMax)))
              : state.settings.maxParticipantsPerSession,
          sessionCount: sessions.length,
          spinDurationMs:
            nextDuration !== undefined
              ? Math.min(MAX_SPIN_DURATION_MS, Math.max(MIN_SPIN_DURATION_MS, Math.round(nextDuration)))
              : state.settings.spinDurationMs,
          spinRevolutions:
            nextRevolutions !== undefined
              ? Math.min(MAX_SPIN_REVOLUTIONS, Math.max(MIN_SPIN_REVOLUTIONS, Math.round(nextRevolutions)))
              : state.settings.spinRevolutions,
        },
        updatedAt: new Date().toISOString(),
      };
    }

    default:
      return state;
  }
}

function initState(): { state: LuckyDrawState; loadStatus: LoadResult["status"] } {
  const result = loadState();
  if (result.status === "ok") return { state: result.state, loadStatus: "ok" };
  if (result.status === "corrupt") {
    return { state: createInitialState(), loadStatus: "corrupt" };
  }
  return { state: createInitialState(), loadStatus: "empty" };
}

export function useLuckyDraw() {
  const [init] = useState(initState);
  const [state, dispatch] = useReducer(reducer, init.state);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningSessionId, setSpinningSessionId] = useState<number | null>(null);
  const [pendingDraw, setPendingDraw] = useState<PendingDraw | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;
  const spinningRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  /** Hasil undian yang sudah dipilih (untuk tombol stop manual). */
  const pendingWinnersRef = useRef<{ sessionId: number; winnerIds: string[] } | null>(null);

  // Autosave setiap perubahan state yang valid.
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Bersihkan timer saat unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const setParticipants = useCallback((sessionId: number, names: string[]) => {
    dispatch({ type: "SET_PARTICIPANTS", sessionId, names });
  }, []);

  const setWinnerCount = useCallback((sessionId: number, winnerCount: number) => {
    dispatch({ type: "SET_WINNER_COUNT", sessionId, winnerCount });
  }, []);

  const setSessionName = useCallback((sessionId: number, name: string) => {
    dispatch({ type: "SET_SESSION_NAME", sessionId, name });
  }, []);

  const resetSession = useCallback((sessionId: number) => {
    dispatch({ type: "RESET_SESSION", sessionId });
  }, []);

  const redrawSession = useCallback((sessionId: number) => {
    dispatch({ type: "REDRAW_SESSION", sessionId });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: "RESET_ALL" });
  }, []);

  const importState = useCallback((imported: LuckyDrawState) => {
    dispatch({ type: "IMPORT_STATE", state: imported });
  }, []);

  const updateSettings = useCallback((settings: Partial<Settings>) => {
    // Jangan ubah jumlah sesi saat animasi berjalan — pendingDraw merujuk sesi
    // yang bisa terbuang bila array sesi menyusut.
    if (spinningRef.current && settings.sessionCount !== undefined) {
      const { sessionCount: _ignored, ...rest } = settings;
      if (Object.keys(rest).length === 0) return;
      dispatch({ type: "UPDATE_SETTINGS", settings: rest });
      return;
    }
    dispatch({ type: "UPDATE_SETTINGS", settings });
  }, []);

  const discardCorruptData = useCallback(() => {
    clearState();
    resetAll();
  }, [resetAll]);

  /**
   * Jalankan pengundian. Para pemenang (sesuai `winnerCount` sesi) dipilih
   * SEKALI dengan Web Crypto di sini, lalu animasi hanya memvisualisasikan
   * hasil. Selama animasi, spin terkunci (BR-09). Sesi selesai tidak dapat
   * diundi ulang (BR-07).
   */
  const spin = useCallback(
    (sessionId: number, onNoEligible: () => void): boolean => {
      if (spinningRef.current) return false;
      const current = stateRef.current;
      const session = findSession(current, sessionId);
      if (!session || session.status === "completed" || session.participants.length === 0) {
        return false;
      }
      const eligible = getEligibleParticipants(session, current);
      if (eligible.length === 0) {
        onNoEligible();
        return false;
      }
      const winnerCount = Math.min(session.winnerCount, eligible.length);
      const winnerIndices = drawDistinctWinnerIndices(eligible.length, winnerCount);
      const winners = winnerIndices.map((index) => eligible[index]);

      spinningRef.current = true;
      setIsSpinning(true);
      setSpinningSessionId(sessionId);
      const durationMs = Math.min(
        MAX_SPIN_DURATION_MS,
        Math.max(MIN_SPIN_DURATION_MS, current.settings.spinDurationMs),
      );
      const revolutions = Math.min(
        MAX_SPIN_REVOLUTIONS,
        Math.max(MIN_SPIN_REVOLUTIONS, current.settings.spinRevolutions),
      );
      // Jendela visual drum (bukan jumlah pemenang): pemenang pertama wajib mendarat.
      const display = buildDrumDisplay(
        eligible.map((participant) => participant.name),
        winners[0].name,
        DRUM_VISUAL_CAP,
      );
      // Simpan hasil undian agar bisa di-"stop" manual oleh panitia:
      // tombol stop = hentikan animasi & langsung tetapkan pemenang.
      pendingWinnersRef.current = {
        sessionId,
        winnerIds: winners.map((w) => w.id),
      };
      setPendingDraw({
        sessionId,
        names: display.names,
        winnerIndex: display.winnerIndex,
        durationMs,
        revolutions,
      });

      timerRef.current = window.setTimeout(() => {
        dispatch({
          type: "COMPLETE_DRAW",
          sessionId,
          winnerIds: winners.map((w) => w.id),
          drawnAt: new Date().toISOString(),
        });
        setIsSpinning(false);
        setSpinningSessionId(null);
        setPendingDraw(null);
        spinningRef.current = false;
        pendingWinnersRef.current = null;
        timerRef.current = null;
      }, durationMs);

      return true;
    },
    [],
  );

  /**
   * Stop manual: hentikan animasi drum dan langsung umumkan pemenang.
   * Pemenang sudah ditentukan sejak tombol spin ditekan (Web Crypto),
   * jadi menghentikan lebih awal TIDAK mengubah hasil undian.
   */
  const stopSpin = useCallback(() => {
    if (!spinningRef.current) return;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const pending = pendingWinnersRef.current;
    spinningRef.current = false;
    setIsSpinning(false);
    setSpinningSessionId(null);
    setPendingDraw(null);
    pendingWinnersRef.current = null;
    if (pending) {
      dispatch({
        type: "COMPLETE_DRAW",
        sessionId: pending.sessionId,
        winnerIds: pending.winnerIds,
        drawnAt: new Date().toISOString(),
      });
    }
  }, []);

  const getSession = useCallback(
    (sessionId: number): DrawSession | undefined => findSession(state, sessionId),
    [state],
  );

  const sessions = useMemo(() => state.sessions, [state]);

  return {
    state,
    sessions,
    loadStatus: init.loadStatus,
    isSpinning,
    spinningSessionId,
    pendingDraw,
    spin,
    stopSpin,
    setParticipants,
    setWinnerCount,
    setSessionName,
    resetSession,
    redrawSession,
    resetAll,
    importState,
    updateSettings,
    discardCorruptData,
    getSession,
  };
}

export type LuckyDrawController = ReturnType<typeof useLuckyDraw>;
