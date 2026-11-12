import { describe, expect, it } from "vitest";
import { createInitialState } from "./factory";
import {
  findNextDrawableSession,
  getEligibleParticipants,
  getWinnerNames,
  isEligible,
  normalizeName,
} from "./sessionRules";
import type { DrawSession, Participant } from "./types";

function participant(id: string, name: string): Participant {
  return { id, name };
}

function makeSession(partial: Partial<DrawSession>): DrawSession {
  return {
    id: 1,
    participants: [],
    winner: null,
    history: [],
    status: "empty",
    drawnAt: null,
    ...partial,
  };
}

describe("normalizeName", () => {
  it("trim + lowercase", () => {
    expect(normalizeName("  Budi Santoso ")).toBe("budi santoso");
  });
});

describe("getWinnerNames", () => {
  it("mengumpulkan nama pemenang lintas sesi", () => {
    const state = createInitialState();
    state.sessions[1].winner = participant("w", "Siti");
    state.sessions[4].winner = participant("w2", " Budi ");
    expect(getWinnerNames(state)).toEqual(["siti", "budi"]);
  });

  it("mengecualikan sesi yang sedang diproses", () => {
    const state = createInitialState();
    state.sessions[0].winner = participant("w", "Siti");
    expect(getWinnerNames(state, 2)).toEqual(["siti"]);
  });
});

describe("isEligible", () => {
  it("false bila nama sudah pernah menang saat globalUniqueWinners aktif", () => {
    expect(isEligible("Siti", ["siti"], true)).toBe(false);
  });

  it("true bila belum menang", () => {
    expect(isEligible("Budi", ["siti"], true)).toBe(true);
  });

  it("tidak memblokir bila globalUniqueWinners false", () => {
    expect(isEligible("Siti", ["siti"], false)).toBe(true);
  });
});

describe("getEligibleParticipants", () => {
  it("mengecualikan peserta yang sudah menang di sesi lain", () => {
    const state = createInitialState();
    state.sessions[0].winner = participant("w", "Siti");
    const session = makeSession({
      id: 2,
      participants: [participant("a", "Siti"), participant("b", "Budi")],
      status: "ready",
    });
    const eligible = getEligibleParticipants(session, state);
    expect(eligible.map((p) => p.name)).toEqual(["Budi"]);
  });

  it("peserta yang menang di sesi yang sama lalu direset tetap eligible", () => {
    const state = createInitialState();
    state.sessions[0].winner = participant("w", "Siti");
    const session = state.sessions[0];
    const eligible = getEligibleParticipants(session, state);
    // excludeSessionId = sesi itu sendiri, jadi pemenang sesinya sendiri tak masuk hitungan
    expect(eligible.map((p) => p.name)).toEqual([]);
    // setelah reset (winner null) semua eligible
    state.sessions[0].winner = null;
    state.sessions[0].participants = [participant("a", "Siti")];
    expect(getEligibleParticipants(state.sessions[0], state).length).toBe(1);
  });
});

describe("findNextDrawableSession", () => {
  it("mencari sesi berikutnya yang belum selesai", () => {
    const state = createInitialState();
    state.sessions[2].status = "ready";
    const next = findNextDrawableSession(state, 9);
    expect(next?.id).toBe(10);
  });

  it("kembali ke awal bila sesi berikutnya sudah selesai", () => {
    const state = createInitialState();
    state.sessions.forEach((s) => {
      s.status = "completed";
    });
    state.sessions[0].status = "empty";
    const next = findNextDrawableSession(state, 10);
    expect(next?.id).toBe(1);
  });
});
