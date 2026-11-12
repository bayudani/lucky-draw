import { describe, expect, it } from "vitest";
import { createInitialState } from "../domain/factory";
import type { LuckyDrawState } from "../domain/types";
import { reducer } from "./useLuckyDraw";

function withParticipants(state: LuckyDrawState, sessionId: number, names: string[]): LuckyDrawState {
  return reducer(state, { type: "SET_PARTICIPANTS", sessionId, names });
}

function completeDraw(
  state: LuckyDrawState,
  sessionId: number,
  winnerIds: string[],
  drawnAt = "2026-11-12T00:00:00.000Z",
): LuckyDrawState {
  return reducer(state, { type: "COMPLETE_DRAW", sessionId, winnerIds, drawnAt });
}

function winnerId(state: LuckyDrawState, sessionId: number, index = 0): string {
  return state.sessions[sessionId - 1].participants[index].id;
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
    state = completeDraw(state, 1, [winnerId(state, 1)]);
    state = withParticipants(state, 1, ["Orang Baru"]);
    expect(state.sessions[0].participants).toHaveLength(1);
    expect(state.sessions[0].status).toBe("completed");
  });
});

describe("reducer — COMPLETE_DRAW (global unique winner)", () => {
  it("membuat history entry dan mengubah status jadi completed", () => {
    let state = createInitialState();
    state = withParticipants(state, 1, ["Budi", "Siti"]);
    const id = winnerId(state, 1);
    state = completeDraw(state, 1, [id]);
    expect(state.sessions[0].status).toBe("completed");
    expect(state.sessions[0].winners.map((w) => w.id)).toEqual([id]);
    expect(state.sessions[0].history).toHaveLength(1);
    expect(state.sessions[0].history[0].participants).toHaveLength(2);
    expect(state.sessions[0].history[0].winners.map((w) => w.name)).toEqual(["Budi"]);
    expect(state.sessions[0].drawnAt).toBe("2026-11-12T00:00:00.000Z");
  });

  it("mendukung banyak pemenang dalam satu undian (winnerCount)", () => {
    let state = createInitialState();
    state = reducer(state, { type: "SET_WINNER_COUNT", sessionId: 1, winnerCount: 3 });
    state = withParticipants(state, 1, ["Budi", "Siti", "Ani", "Rudi", "Zul"]);
    const ids = [0, 1, 2].map((i) => winnerId(state, 1, i));
    state = completeDraw(state, 1, ids);
    expect(state.sessions[0].winners).toHaveLength(3);
    expect(state.sessions[0].winners.map((w) => w.name)).toEqual(["Budi", "Siti", "Ani"]);
    expect(state.sessions[0].history[0].winners).toHaveLength(3);
  });

  it("menolak pemenang duplikat dalam satu sesi", () => {
    let state = createInitialState();
    state = withParticipants(state, 1, ["Budi", "Siti"]);
    const id = winnerId(state, 1);
    const rejected = completeDraw(state, 1, [id, id]);
    expect(rejected).toBe(state);
  });

  it("menolak pemenang yang sudah menang di sesi lain (double winner prevention)", () => {
    let state = createInitialState();
    // Sesi 1: Budi menang
    state = withParticipants(state, 1, ["Budi", "Siti"]);
    state = completeDraw(state, 1, [winnerId(state, 1)]);
    // Sesi 2: nama yang sama dimasukkan lagi, dipaksa jadi pemenang
    state = withParticipants(state, 2, ["Budi"]);
    const rejected = completeDraw(state, 2, [winnerId(state, 2)], "2026-11-12T01:00:00.000Z");
    expect(rejected).toBe(state);
    expect(state.sessions[1].status).toBe("ready");
  });

  it("tidak mengundi dua kali pada sesi yang sama (double spin prevention)", () => {
    let state = createInitialState();
    state = withParticipants(state, 1, ["Budi", "Siti"]);
    state = completeDraw(state, 1, [winnerId(state, 1)]);
    const again = completeDraw(state, 1, [winnerId(state, 1)], "2026-11-12T02:00:00.000Z");
    expect(again).toBe(state);
    expect(state.sessions[0].history).toHaveLength(1);
  });
});

describe("reducer — RESET", () => {
  it("reset session menghapus peserta, pemenang, dan histori", () => {
    let state = createInitialState();
    state = withParticipants(state, 1, ["Budi"]);
    state = completeDraw(state, 1, [winnerId(state, 1)]);
    state = reducer(state, { type: "RESET_SESSION", sessionId: 1 });
    expect(state.sessions[0].status).toBe("empty");
    expect(state.sessions[0].winners).toHaveLength(0);
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

describe("reducer — REDRAW_SESSION", () => {
  function completedState(): { state: LuckyDrawState; winnerIds: string[] } {
    let state = createInitialState();
    state = reducer(state, { type: "SET_WINNER_COUNT", sessionId: 1, winnerCount: 2 });
    state = withParticipants(state, 1, ["Budi", "Siti", "Ani"]);
    const winnerIds = [0, 1].map((i) => winnerId(state, 1, i));
    state = completeDraw(state, 1, winnerIds);
    return { state, winnerIds };
  }

  it("membatalkan pemenang & histori, mempertahankan peserta, status kembali ready", () => {
    const { state } = completedState();
    const redrawn = reducer(state, { type: "REDRAW_SESSION", sessionId: 1 });
    const session = redrawn.sessions[0];
    expect(session.status).toBe("ready");
    expect(session.winners).toHaveLength(0);
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
    const { state, winnerIds } = completedState();
    const redrawn = reducer(state, { type: "REDRAW_SESSION", sessionId: 1 });
    const redo = completeDraw(redrawn, 1, winnerIds, "2026-11-12T01:00:00.000Z");
    expect(redo.sessions[0].status).toBe("completed");
    expect(redo.sessions[0].winners).toHaveLength(2);
    expect(redo.sessions[0].history).toHaveLength(1);
  });
});

describe("reducer — UPDATE_SETTINGS sessionCount", () => {
  it("menambah sesi kosong bila jumlah dinaikkan", () => {
    let state = createInitialState();
    state = reducer(state, { type: "UPDATE_SETTINGS", settings: { sessionCount: 12 } });
    expect(state.sessions).toHaveLength(12);
    expect(state.settings.sessionCount).toBe(12);
    expect(state.sessions[11].id).toBe(12);
    expect(state.sessions[11].participants).toHaveLength(0);
  });

  it("memangkas sesi dari akhir bila jumlah diturunkan (data sesi yang dipotong hilang)", () => {
    let state = createInitialState();
    state = withParticipants(state, 10, ["Zul"]);
    state = reducer(state, { type: "UPDATE_SETTINGS", settings: { sessionCount: 5 } });
    expect(state.sessions).toHaveLength(5);
    expect(state.settings.sessionCount).toBe(5);
    expect(state.sessions[4].id).toBe(5);
  });

  it("menjaga sesi yang ada tetap utuh saat jumlah sesi tidak berubah", () => {
    let state = createInitialState();
    state = withParticipants(state, 2, ["Budi"]);
    state = reducer(state, { type: "UPDATE_SETTINGS", settings: { spinDurationMs: 6000 } });
    expect(state.sessions).toHaveLength(10);
    expect(state.sessions[1].participants).toHaveLength(1);
  });

  it("clamp jumlah sesi ke rentang 1..30", () => {
    let state = createInitialState();
    state = reducer(state, { type: "UPDATE_SETTINGS", settings: { sessionCount: 999 } });
    expect(state.settings.sessionCount).toBe(30);
    state = reducer(state, { type: "UPDATE_SETTINGS", settings: { sessionCount: -5 } });
    expect(state.settings.sessionCount).toBe(1);
  });
});

describe("reducer — SET_WINNER_COUNT", () => {
  it("mengubah jumlah pemenang per sesi dan clamp ke 1..100", () => {
    let state = createInitialState();
    state = reducer(state, { type: "SET_WINNER_COUNT", sessionId: 1, winnerCount: 30 });
    expect(state.sessions[0].winnerCount).toBe(30);
    state = reducer(state, { type: "SET_WINNER_COUNT", sessionId: 1, winnerCount: 0 });
    expect(state.sessions[0].winnerCount).toBe(1);
    state = reducer(state, { type: "SET_WINNER_COUNT", sessionId: 1, winnerCount: 500 });
    expect(state.sessions[0].winnerCount).toBe(100);
  });

  it("sesi lain tidak berubah", () => {
    let state = createInitialState();
    state = reducer(state, { type: "SET_WINNER_COUNT", sessionId: 1, winnerCount: 5 });
    expect(state.sessions[1].winnerCount).toBe(1);
  });

  it("menolak sesi yang tidak ada", () => {
    let state = createInitialState();
    const before = state;
    state = reducer(state, { type: "SET_WINNER_COUNT", sessionId: 99, winnerCount: 5 });
    expect(state).toBe(before);
  });
});

describe("reducer — carry sisa peserta ke sesi berikutnya", () => {
  it("sisa peserta (belum menang) otomatis pindah ke sesi berikutnya", () => {
    let state = createInitialState();
    state = reducer(state, { type: "SET_WINNER_COUNT", sessionId: 1, winnerCount: 2 });
    state = withParticipants(state, 1, ["Budi", "Siti", "Ani", "Rudi", "Zul"]);
    state = completeDraw(state, 1, [0, 1].map((i) => winnerId(state, 1, i)));
    expect(state.sessions[0].status).toBe("completed");
    expect(state.sessions[1].participants.map((p) => p.name)).toEqual(["Ani", "Rudi", "Zul"]);
    expect(state.sessions[1].status).toBe("ready");
  });

  it("pemenang sesi ini tidak ikut dipindahkan", () => {
    let state = createInitialState();
    state = withParticipants(state, 1, ["Budi", "Siti", "Ani"]);
    state = completeDraw(state, 1, [winnerId(state, 1)]);
    const names = state.sessions[1].participants.map((p) => p.name);
    expect(names).not.toContain("Budi");
    expect(names).toEqual(["Siti", "Ani"]);
  });

  it("tidak menduplikasi nama yang sudah ada di sesi berikutnya", () => {
    let state = createInitialState();
    state = withParticipants(state, 2, ["Ani", "Orang Baru"]);
    state = withParticipants(state, 1, ["Budi", "Siti", "Ani", "Rudi", "Zul"]);
    state = completeDraw(state, 1, [winnerId(state, 1)]);
    expect(state.sessions[1].participants.map((p) => p.name)).toEqual([
      "Ani",
      "Orang Baru",
      "Siti",
      "Rudi",
      "Zul",
    ]);
  });

  it("tidak memindahkan saat toggle off", () => {
    let state = createInitialState();
    state = reducer(state, {
      type: "UPDATE_SETTINGS",
      settings: { autoCarryOverParticipants: false },
    });
    state = withParticipants(state, 1, ["Budi", "Siti", "Ani"]);
    state = completeDraw(state, 1, [winnerId(state, 1)]);
    expect(state.sessions[1].participants).toHaveLength(0);
    expect(state.sessions[1].status).toBe("empty");
  });

  it("sesi terakhir tidak memindahkan ke mana pun", () => {
    let state = createInitialState();
    state = withParticipants(state, 10, ["Budi", "Siti"]);
    state = completeDraw(state, 10, [winnerId(state, 10)]);
    expect(state.sessions[9].status).toBe("completed");
    expect(state.sessions).toHaveLength(10);
  });

  it("rantai: sisa sesi 2 ikut pindah ke sesi 3", () => {
    let state = createInitialState();
    state = reducer(state, { type: "SET_WINNER_COUNT", sessionId: 1, winnerCount: 2 });
    state = withParticipants(state, 1, ["Budi", "Siti", "Ani", "Rudi", "Zul"]);
    state = completeDraw(state, 1, [0, 1].map((i) => winnerId(state, 1, i)));
    // Sesi 2 terisi [Ani, Rudi, Zul]; undi 1 pemenang → Rudi
    state = completeDraw(state, 2, [winnerId(state, 2, 1)]);
    expect(state.sessions[1].status).toBe("completed");
    expect(state.sessions[2].participants.map((p) => p.name)).toEqual(["Ani", "Zul"]);
  });
});

describe("reducer — RESET_ALL dengan jumlah sesi dinamis", () => {
  it("menjaga pengaturan (termasuk jumlah sesi) saat reset seluruh acara", () => {
    let state = createInitialState();
    state = reducer(state, { type: "UPDATE_SETTINGS", settings: { sessionCount: 7 } });
    state = withParticipants(state, 1, ["Budi"]);
    state = reducer(state, { type: "RESET_ALL" });
    expect(state.sessions).toHaveLength(7);
    expect(state.settings.sessionCount).toBe(7);
    expect(state.sessions[0].participants).toHaveLength(0);
  });
});
