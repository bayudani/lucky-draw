import { describe, expect, it } from "vitest";
import { createInitialState } from "../domain/factory";
import type { LuckyDrawState } from "../domain/types";
import { reducer } from "./useLuckyDraw";

function withParticipants(state: LuckyDrawState, sessionId: number, names: string[]): LuckyDrawState {
  return reducer(state, { type: "SET_PARTICIPANTS", sessionId, names });
}

describe("reducer — SET_PARTICIPANTS", () => {
  it("mengisi peserta dan mengubah status ke ready", () => {
    let state = createInitialState();
    state = withParticipants(state, 1, ["Budi", "Siti"]);
    expect(state.sessions[0].participants).toHaveLength(2);
    expect(state.sessions[0].status).toBe("ready");
  });

  it("menolak mengubah peserta pada sesi yang sudah selesai", () => {
    let state = createInitialState();
    state = withParticipants(state, 1, ["Budi"]);
    state = reducer(state, {
      type: "COMPLETE_DRAW",
      sessionId: 1,
      winnerId: state.sessions[0].participants[0].id,
      drawnAt: "2026-11-12T00:00:00.000Z",
    });
    state = withParticipants(state, 1, ["Orang Baru"]);
    expect(state.sessions[0].participants).toHaveLength(1);
    expect(state.sessions[0].status).toBe("completed");
  });
});

describe("reducer — COMPLETE_DRAW (global unique winner)", () => {
  it("membuat history entry dan mengubah status jadi completed", () => {
    let state = createInitialState();
    state = withParticipants(state, 1, ["Budi", "Siti"]);
    const winnerId = state.sessions[0].participants[0].id;
    state = reducer(state, {
      type: "COMPLETE_DRAW",
      sessionId: 1,
      winnerId,
      drawnAt: "2026-11-12T00:00:00.000Z",
    });
    expect(state.sessions[0].status).toBe("completed");
    expect(state.sessions[0].winner?.id).toBe(winnerId);
    expect(state.sessions[0].history).toHaveLength(1);
    expect(state.sessions[0].history[0].participants).toHaveLength(2);
    expect(state.sessions[0].history[0].winner.name).toBe("Budi");
    expect(state.sessions[0].drawnAt).toBe("2026-11-12T00:00:00.000Z");
  });

  it("menolak pemenang yang sudah menang di sesi lain (double winner prevention)", () => {
    let state = createInitialState();
    // Sesi 1: Budi menang
    state = withParticipants(state, 1, ["Budi", "Siti"]);
    const budiId = state.sessions[0].participants[0].id;
    state = reducer(state, {
      type: "COMPLETE_DRAW",
      sessionId: 1,
      winnerId: budiId,
      drawnAt: "2026-11-12T00:00:00.000Z",
    });
    // Sesi 2: nama yang sama dimasukkan lagi, dipaksa jadi pemenang
    state = withParticipants(state, 2, ["Budi"]);
    const budiId2 = state.sessions[1].participants[0].id;
    const rejected = reducer(state, {
      type: "COMPLETE_DRAW",
      sessionId: 2,
      winnerId: budiId2,
      drawnAt: "2026-11-12T01:00:00.000Z",
    });
    expect(rejected).toBe(state);
    expect(state.sessions[1].status).toBe("ready");
  });

  it("tidak mengundi dua kali pada sesi yang sama (double spin prevention)", () => {
    let state = createInitialState();
    state = withParticipants(state, 1, ["Budi", "Siti"]);
    const winnerId = state.sessions[0].participants[0].id;
    state = reducer(state, {
      type: "COMPLETE_DRAW",
      sessionId: 1,
      winnerId,
      drawnAt: "2026-11-12T00:00:00.000Z",
    });
    const again = reducer(state, {
      type: "COMPLETE_DRAW",
      sessionId: 1,
      winnerId,
      drawnAt: "2026-11-12T02:00:00.000Z",
    });
    expect(again).toBe(state);
    expect(state.sessions[0].history).toHaveLength(1);
  });
});

describe("reducer — RESET", () => {
  it("reset session menghapus peserta, pemenang, dan histori", () => {
    let state = createInitialState();
    state = withParticipants(state, 1, ["Budi"]);
    const winnerId = state.sessions[0].participants[0].id;
    state = reducer(state, {
      type: "COMPLETE_DRAW",
      sessionId: 1,
      winnerId,
      drawnAt: "2026-11-12T00:00:00.000Z",
    });
    state = reducer(state, { type: "RESET_SESSION", sessionId: 1 });
    expect(state.sessions[0].status).toBe("empty");
    expect(state.sessions[0].winner).toBeNull();
    expect(state.sessions[0].history).toHaveLength(0);
    expect(state.sessions[0].participants).toHaveLength(0);
  });

  it("reset all hanya menghapus data, pengaturan dipertahankan", () => {
    let state = createInitialState();
    state = withParticipants(state, 1, ["Budi"]);
    state = reducer(state, { type: "UPDATE_SETTINGS", settings: { maxParticipantsPerSession: 50 } });
    state = reducer(state, { type: "RESET_ALL" });
    expect(state.sessions.every((s) => s.status === "empty")).toBe(true);
    expect(state.settings.maxParticipantsPerSession).toBe(50);
  });
});

describe("reducer — UPDATE_SETTINGS", () => {
  it("clamp nilai maksimal peserta", () => {
    let state = createInitialState();
    state = reducer(state, { type: "UPDATE_SETTINGS", settings: { maxParticipantsPerSession: -5 } });
    expect(state.settings.maxParticipantsPerSession).toBe(1);
    state = reducer(state, { type: "UPDATE_SETTINGS", settings: { maxParticipantsPerSession: 9999 } });
    expect(state.settings.maxParticipantsPerSession).toBe(1000);
  });
});

describe("reducer � REDRAW_SESSION", () => {
  function completedState(): { state: LuckyDrawState; winnerId: string } {
    let state = createInitialState();
    state = withParticipants(state, 1, ["Budi", "Siti", "Ani"]);
    const winnerId = state.sessions[0].participants[0].id;
    state = reducer(state, {
      type: "COMPLETE_DRAW",
      sessionId: 1,
      winnerId,
      drawnAt: "2026-11-12T00:00:00.000Z",
    });
    return { state, winnerId };
  }

  it("membatalkan pemenang & histori, mempertahankan peserta, status kembali ready", () => {
    const { state } = completedState();
    const redrawn = reducer(state, { type: "REDRAW_SESSION", sessionId: 1 });
    const session = redrawn.sessions[0];
    expect(session.status).toBe("ready");
    expect(session.winner).toBeNull();
    expect(session.drawnAt).toBeNull();
    expect(session.history).toHaveLength(0);
    expect(session.participants).toHaveLength(3);
  });

  it("menolak redraw pada sesi yang belum selesai", () => {
    let state = createInitialState();
    state = withParticipants(state, 1, ["Budi"]);
    const rejected = reducer(state, { type: "REDRAW_SESSION", sessionId: 1 });
    expect(rejected).toBe(state);
  });

  it("sesi lain tidak terpengaruh", () => {
    const { state } = completedState();
    const withSecond = withParticipants(state, 2, ["Rudi"]);
    const redrawn = reducer(withSecond, { type: "REDRAW_SESSION", sessionId: 1 });
    expect(redrawn.sessions[1].participants).toHaveLength(1);
    expect(redrawn.sessions[1].status).toBe("ready");
  });

  it("setelah redraw, peserta lama bisa diundi lagi di sesi yang sama", () => {
    const { state, winnerId } = completedState();
    const redrawn = reducer(state, { type: "REDRAW_SESSION", sessionId: 1 });
    const redo = reducer(redrawn, {
      type: "COMPLETE_DRAW",
      sessionId: 1,
      winnerId,
      drawnAt: "2026-11-12T01:00:00.000Z",
    });
    expect(redo.sessions[0].status).toBe("completed");
    expect(redo.sessions[0].winner?.id).toBe(winnerId);
    expect(redo.sessions[0].history).toHaveLength(1);
  });
});
