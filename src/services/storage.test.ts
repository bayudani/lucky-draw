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

  it("menolak jumlah sesi bukan 10", () => {
    const state = createInitialState();
    state.sessions = state.sessions.slice(0, 9);
    expect(validateLuckyDrawState(JSON.parse(JSON.stringify(state)))).toBeNull();
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
    ];
    expect(validateLuckyDrawState(JSON.parse(JSON.stringify(state)))).toBeNull();
  });

  it("menerima state dengan histori lengkap", () => {
    const state = createInitialState();
    state.sessions[0].winner = { id: "w", name: "Siti" };
    state.sessions[0].drawnAt = "2026-11-12T00:00:00.000Z";
    state.sessions[0].history = [
      {
        id: "h1",
        sessionId: 1,
        participants: [{ id: "p", name: "Siti" }],
        winner: { id: "w", name: "Siti" },
        drawnAt: "2026-11-12T00:00:00.000Z",
      },
    ];
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
