import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createInitialState } from "../domain/factory";
import { drawWinnerIndex } from "../domain/drawWinner";
import {
  findSession,
  getEligibleParticipants,
  getWinnerNames,
  computeSessionStatus,
} from "../domain/sessionRules";
import type {
  DrawSession,
  LuckyDrawState,
  Participant,
  Settings,
} from "../domain/types";
import { clearState, loadState, saveState, type LoadResult } from "../services/storage";

// import type {
//   DrawSession,
//   LuckyDrawState,
//   Participant,
//   Settings,
// } from "../domain/types";
import {
  MAX_SPIN_DURATION_MS,
  MAX_SPIN_REVOLUTIONS,
  MIN_SPIN_DURATION_MS,
  MIN_SPIN_REVOLUTIONS,
} from "../domain/types";
// import { clearState, loadState, saveState, type LoadResult } from "../services/storage";

/**
 * Data undian yang sedang berjalan: dipakai animasi 3D untuk mendarat di pemenang.
 * `durationMs` & `revolutions` diambil dari pengaturan saat tombol ditekan.
 */
export interface PendingDraw {
  sessionId: number;
  /** Nama-nama kandidat (hanya eligible), urutan tetap. */
  names: string[];
  /** Indeks pemenang pada `names`. */
  winnerIndex: number;
  durationMs: number;
  revolutions: number;
}

type Action =
  | { type: "SET_PARTICIPANTS"; sessionId: number; names: string[] }
  | { type: "COMPLETE_DRAW"; sessionId: number; winnerId: string; drawnAt: string }
  | { type: "RESET_SESSION"; sessionId: number }
  | { type: "RESET_ALL" }
  | { type: "IMPORT_STATE"; state: LuckyDrawState }
  | { type: "UPDATE_SETTINGS"; settings: Partial<Settings> };

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
      const winner = session.participants.find((p) => p.id === action.winnerId);
      if (!winner) return state;
      // Verifikasi eligibility di business logic (bukan hanya UI).
      const winnerNames = getWinnerNames(state, session.id);
      if (state.settings.globalUniqueWinners && winnerNames.includes(winner.name.toLowerCase())) {
        return state;
      }
      return mapSession(state, action.sessionId, (s) => ({
        ...s,
        winner,
        status: "completed",
        drawnAt: action.drawnAt,
        history: [
          ...s.history,
          {
            id: makeHistoryId(),
            sessionId: s.id,
            participants: [...s.participants],
            winner,
            drawnAt: action.drawnAt,
          },
        ],
      }));
    }

    case "RESET_SESSION": {
      return mapSession(state, action.sessionId, (s) => ({
        ...s,
        participants: [],
        winner: null,
        history: [],
        status: "empty",
        drawnAt: null,
      }));
    }

    case "RESET_ALL": {
      return { ...createInitialState(), settings: state.settings };
    }

    case "IMPORT_STATE":
      return { ...action.state, updatedAt: new Date().toISOString() };

    case "UPDATE_SETTINGS": {
      const nextMax = action.settings.maxParticipantsPerSession;
      const nextDuration = action.settings.spinDurationMs;
      const nextRevolutions = action.settings.spinRevolutions;
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings,
          maxParticipantsPerSession:
            nextMax !== undefined
              ? Math.min(1000, Math.max(1, Math.round(nextMax)))
              : state.settings.maxParticipantsPerSession,
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

  const resetSession = useCallback((sessionId: number) => {
    dispatch({ type: "RESET_SESSION", sessionId });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: "RESET_ALL" });
  }, []);

  const importState = useCallback((imported: LuckyDrawState) => {
    dispatch({ type: "IMPORT_STATE", state: imported });
  }, []);

  const updateSettings = useCallback((settings: Partial<Settings>) => {
    dispatch({ type: "UPDATE_SETTINGS", settings });
  }, []);

  const discardCorruptData = useCallback(() => {
    clearState();
    resetAll();
  }, [resetAll]);

  /**
   * Jalankan pengundian. Pemenang dipilih SEKALI dengan Web Crypto di sini,
   * lalu animasi hanya memvisualisasikan hasil. Selama animasi, spin
   * terkunci (BR-09). Sesi selesai tidak dapat diundi ulang (BR-07).
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
      const winnerIndex = drawWinnerIndex(eligible.length);
      const winner = eligible[winnerIndex];

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
      setPendingDraw({
        sessionId,
        names: eligible.map((participant) => participant.name),
        winnerIndex,
        durationMs,
        revolutions,
      });

      timerRef.current = window.setTimeout(() => {
        dispatch({
          type: "COMPLETE_DRAW",
          sessionId,
          winnerId: winner.id,
          drawnAt: new Date().toISOString(),
        });
        setIsSpinning(false);
        setSpinningSessionId(null);
        setPendingDraw(null);
        spinningRef.current = false;
        timerRef.current = null;
      }, durationMs);

      return true;
    },
    [],
  );

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
    setParticipants,
    resetSession,
    resetAll,
    importState,
    updateSettings,
    discardCorruptData,
    getSession,
  };
}

export type LuckyDrawController = ReturnType<typeof useLuckyDraw>;
