import { describe, expect, it } from "vitest";
import { validateLuckyDrawState } from "./storage";
import { createInitialState } from "../domain/factory";

describe("validateLuckyDrawState", () => {
  it("menerima state yang valid dan menormalisasi status", () => {
    const state = createInitialState();
    state.sessions[0].participants = [{ id: "p1", name: "Budi" }];
    state.sessions[0].status = "completed"; // status salah sengaja
    const result = validateLuckyDrawState(JSON.parse(JSON.stringify(state)));
    expect(result).not.toBeNull();
    expect(result?.sessions[0].status).toBe("ready");
  });

  it("menolak struktur tidak valid", () => {
    expect(validateLuckyDrawState(null)).toBeNull();
    expect(validateLuckyDrawState("string")).toBeNull();
    expect(validateLuckyDrawState({})).toBeNull();
    expect(validateLuckyDrawState({ schemaVersion: 2 })).toBeNull();
  });

  it("menolak jumlah sesi di luar rentang (0 atau > 30)", () => {
    const state = createInitialState();
    state.sessions = [];
    expect(validateLuckyDrawState(JSON.parse(JSON.stringify(state)))).toBeNull();
    state.sessions = createInitialState().sessions.concat(
      Array.from({ length: 21 }, (_, i) => ({
        id: 11 + i,
        participants: [],
        winners: [],
        history: [],
        status: "empty",
        drawnAt: null,
        winnerCount: 1,
      })),
    );
    expect(validateLuckyDrawState(JSON.parse(JSON.stringify(state)))).toBeNull();
  });

  it("menerima jumlah sesi dinamis (mis. 3) dan menyesuaikan sessionCount", () => {
    const state = createInitialState();
    state.sessions = state.sessions.slice(0, 3);
    state.settings.sessionCount = 3;
    const result = validateLuckyDrawState(JSON.parse(JSON.stringify(state)));
    expect(result).not.toBeNull();
    expect(result?.sessions).toHaveLength(3);
    expect(result?.settings.sessionCount).toBe(3);
  });

  it("backup lama tanpa sessionCount/winnerCount tetap valid (default diterapkan)", () => {
    const state = createInitialState();
    const raw = JSON.parse(JSON.stringify(state)) as Record<string, unknown>;
    delete (raw.settings as Record<string, unknown>).sessionCount;
    // Bentuk lama: field tunggal `winner: null`, tanpa `winners` & `winnerCount`.
    const legacySession = (raw.sessions as Record<string, unknown>[])[0];
    delete legacySession.winners;
    delete legacySession.winnerCount;
    legacySession.winner = null;
    const result = validateLuckyDrawState(raw);
    expect(result).not.toBeNull();
    expect(result?.settings.sessionCount).toBe(10);
    expect(result?.sessions[0].winners).toEqual([]);
    expect(result?.sessions[0].winnerCount).toBe(1);
  });

  it("menolak winnerCount di luar rentang", () => {
    const state = createInitialState();
    state.sessions[0].winnerCount = 0;
    expect(validateLuckyDrawState(JSON.parse(JSON.stringify(state)))).toBeNull();
  });

  it("memigrasi backup lama dengan pemenang tunggal ke winners[]", () => {
    const state = createInitialState();
    const raw = JSON.parse(JSON.stringify(state)) as Record<string, unknown>;
    const legacySession = (raw.sessions as Record<string, unknown>[])[0];
    delete legacySession.winners;
    delete legacySession.winnerCount;
    legacySession.winner = { id: "w", name: "Siti" };
    legacySession.drawnAt = "2026-11-12T00:00:00.000Z";
    const result = validateLuckyDrawState(raw);
    expect(result).not.toBeNull();
    expect(result?.sessions[0].winners.map((w) => w.name)).toEqual(["Siti"]);
    expect(result?.sessions[0].status).toBe("completed");
  });

  it("menolak peserta dengan tipe data salah", () => {
    const state = createInitialState();
    state.sessions[0].participants = [{ id: "p1", name: 42 }] as never;
    expect(validateLuckyDrawState(JSON.parse(JSON.stringify(state)))).toBeNull();
  });

  it("menolak history dengan sessionId tidak cocok", () => {
    const state = createInitialState();
    state.sessions[0].history = [
      {
        id: "h1",
        sessionId: 5,
        participants: [],
        winner: { id: "w", name: "X" },
        drawnAt: "2026-11-12T00:00:00.000Z",
      },
    ] as never;
    expect(validateLuckyDrawState(JSON.parse(JSON.stringify(state)))).toBeNull();
  });

  it("menerima state dengan histori lengkap", () => {
    const state = createInitialState();
    state.sessions[0].winners = [{ id: "w", name: "Siti" }];
    state.sessions[0].drawnAt = "2026-11-12T00:00:00.000Z";
    state.sessions[0].history = [
      {
        id: "h1",
        sessionId: 1,
        participants: [{ id: "p", name: "Siti" }],
        winner: { id: "w", name: "Siti" },
        drawnAt: "2026-11-12T00:00:00.000Z",
      },
    ] as never;
    const result = validateLuckyDrawState(JSON.parse(JSON.stringify(state)));
    expect(result).not.toBeNull();
    expect(result?.sessions[0].history).toHaveLength(1);
    expect(result?.sessions[0].status).toBe("completed");
  });

  it("menolak settings tidak valid", () => {
    const state = createInitialState();
    state.settings.maxParticipantsPerSession = 0;
    expect(validateLuckyDrawState(JSON.parse(JSON.stringify(state)))).toBeNull();
  });
});
