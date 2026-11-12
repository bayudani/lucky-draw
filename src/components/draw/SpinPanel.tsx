import { motion } from "framer-motion";
import { Projector, RotateCcw, Square, Trophy, TrophyIcon, Users } from "lucide-react";
import {
  MAX_WINNER_COUNT,
  MIN_WINNER_COUNT,
  type DrawSession,
  type LuckyDrawState,
} from "../../domain/types";
import { getEligibleParticipants, getSessionDisplayName } from "../../domain/sessionRules";
import type { PendingDraw } from "../../hooks/useLuckyDraw";
import { STATUS_LABEL } from "../layout/SessionNavigation";
import { SpinAnimation } from "./SpinAnimation";
import { SpinButton } from "./SpinButton";
import { WinnerReveal } from "./WinnerReveal";

interface SpinPanelProps {
  session: DrawSession;
  state: LuckyDrawState;
  isSpinning: boolean;
  /** True hanya pada sesi yang sedang berjalan animasinya. */
  isThisSessionSpinning: boolean;
  pendingDraw: PendingDraw | null;
  /** Reveal pemenang tampil pada sesi yang sudah selesai. */
  showWinner: boolean;
  hasNextSession: boolean;
  onSpin: () => void;
  onStopSpin: () => void;
  onRedraw: () => void;
  onNextSession: () => void;
  onOpenHistory: () => void;
  onOpenAudience: () => void;
  onResetSession: () => void;
  onSetWinnerCount: (winnerCount: number) => void;
}

export function SpinPanel({
  session,
  state,
  isSpinning,
  isThisSessionSpinning,
  pendingDraw,
  showWinner,
  hasNextSession,
  onSpin,
  onStopSpin,
  onRedraw,
  onNextSession,
  onOpenHistory,
  onOpenAudience,
  onResetSession,
  onSetWinnerCount,
}: SpinPanelProps) {
  const eligible = getEligibleParticipants(session, state);
  const drumNames =
    pendingDraw && pendingDraw.sessionId === session.id ? pendingDraw.names : [];
  const targetIndex =
    pendingDraw && pendingDraw.sessionId === session.id ? pendingDraw.winnerIndex : null;
  const revolutions =
    pendingDraw && pendingDraw.sessionId === session.id
      ? pendingDraw.revolutions
      : state.settings.spinRevolutions;
  const durationMs =
    pendingDraw && pendingDraw.sessionId === session.id
      ? pendingDraw.durationMs
      : state.settings.spinDurationMs;

  const canSpin =
    !isSpinning &&
    session.status === "ready" &&
    eligible.length > 0 &&
    session.winnerCount <= eligible.length;
  // Batas pemenang: tidak boleh melebihi nama yang tersedia (peserta belum menang).
  const maxWinnerCount =
    eligible.length > 0 ? Math.min(MAX_WINNER_COUNT, eligible.length) : MAX_WINNER_COUNT;
  const isCompleted = session.status === "completed";

  const idleText = isCompleted
    ? `Pemenang: ${
        session.winners.length > 0
          ? session.winners.slice(0, 2).map((w) => w.name).join(", ") +
            (session.winners.length > 2 ? ` +${session.winners.length - 2} lagi` : "")
          : "—"
      }`
    : session.status === "ready"
      ? "Semua siap? Saatnya menentukan pemenang!"
      : "Belum ada peserta di sesi ini";

  return (
    <section
      className="flex min-h-0 flex-col gap-4 rounded-2xl border border-line bg-gradient-to-b from-[#2e2e33] to-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_20px_50px_-30px_rgba(0,0,0,0.8)]"
      aria-label="Panel pengundian"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
        <div>
          <h2 className="bg-gradient-to-b from-white to-red-200 bg-clip-text text-2xl font-black leading-tight text-transparent sm:text-3xl">
            {getSessionDisplayName(session)}
          </h2>
          <p className="flex items-center gap-2 text-sm font-semibold text-muted">
            {session.name.trim() !== "" && (
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                Sesi {session.id} ·
              </span>
            )}
            <Users className="size-4" aria-hidden />
            {session.participants.length} peserta · {session.winners.length} pemenang
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div
            className="flex items-center gap-1 rounded-lg border border-line bg-background px-2 py-1"
            title="Berapa orang yang menang/keluar namanya pada sesi ini (pemenang tetap diundi dari semua peserta)"
          >
            <TrophyIcon className="size-3.5 text-muted" aria-hidden />
            <span className="px-1 text-[11px] font-bold uppercase tracking-wide text-muted">
              Pemenang
            </span>
            <button
              type="button"
              onClick={() => onSetWinnerCount(session.winnerCount - 1)}
              disabled={isThisSessionSpinning || session.winnerCount <= MIN_WINNER_COUNT}
              className="flex size-6 items-center justify-center rounded-md border border-line text-sm font-black text-muted hover:text-ink disabled:opacity-30"
              aria-label="Kurangi jumlah pemenang"
            >
              −
            </button>
            <input
              type="number"
              min={MIN_WINNER_COUNT}
              max={maxWinnerCount}
              value={session.winnerCount}
              disabled={isThisSessionSpinning}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (Number.isFinite(value) && value >= MIN_WINNER_COUNT) {
                  onSetWinnerCount(Math.min(Math.round(value), maxWinnerCount));
                }
              }}
              className="w-12 bg-transparent text-center text-sm font-bold text-ink outline-none focus:border-primary disabled:opacity-40"
              aria-label="Jumlah pemenang sesi ini"
            />
            <button
              type="button"
              onClick={() => onSetWinnerCount(session.winnerCount + 1)}
              disabled={isThisSessionSpinning || session.winnerCount >= maxWinnerCount}
              className="flex size-6 items-center justify-center rounded-md border border-line text-sm font-black text-muted hover:text-ink disabled:opacity-30"
              aria-label="Tambah jumlah pemenang"
            >
              +
            </button>
          </div>
          {eligible.length > 0 && session.winnerCount > eligible.length && (
            <p className="w-full text-right text-[11px] font-bold text-red-300">
              Jumlah pemenang ({session.winnerCount}) melebihi nama tersedia ({eligible.length}) —
              tambah peserta atau kurangi jumlah pemenang
            </p>
          )}
          <button
            type="button"
            onClick={onOpenAudience}
            title="Tampilan audiens (fullscreen untuk proyektor)"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-primary/50 bg-primary/15 px-3 py-1.5 text-xs font-bold text-red-200 hover:bg-primary/25"
          >
            <Projector className="size-3.5" aria-hidden />
            Mode Audiens
          </button>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${
              isCompleted
                ? "border-emerald-500/60 bg-emerald-950/40 text-emerald-200"
                : session.status === "ready"
                  ? "border-amber-500/60 bg-amber-950/30 text-amber-200"
                  : "border-line bg-background text-muted"
            }`}
          >
            {STATUS_LABEL[session.status]}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6">
        <SpinAnimation
          key={session.id}
          isSpinning={isThisSessionSpinning}
          names={drumNames}
          targetIndex={targetIndex}
          revolutions={revolutions}
          durationMs={durationMs}
          idleText={idleText}
        />

        {!isCompleted && !isThisSessionSpinning && (
          <SpinButton
            canSpin={canSpin}
            onSpin={onSpin}
            title={
              session.status === "empty"
                ? "Sesi tanpa peserta tidak dapat diundi"
                : eligible.length === 0
                  ? "Semua peserta sudah pernah menang"
                  : session.winnerCount > eligible.length
                    ? "Jumlah pemenang melebihi jumlah nama yang tersedia"
                    : canSpin
                      ? "Mulai pengundian"
                      : "Menunggu…"
            }
          />
        )}

        {isThisSessionSpinning && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-primary/40 bg-deep/30 px-8 py-6">
            <div
              className="flex items-center gap-3 text-2xl font-black uppercase tracking-wider text-red-200"
              aria-live="polite"
            >
              <span className="size-3 animate-ping rounded-full bg-primary" aria-hidden />
              Sedang Mengundi...
            </div>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 3 }}
              type="button"
              onClick={onStopSpin}
              className="flex items-center gap-2 rounded-xl border border-white/25 bg-gradient-to-b from-[#52525b] to-[#3f3f46] px-6 py-3 text-base font-black uppercase tracking-wider text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-3px_0_rgba(0,0,0,0.35)] hover:brightness-110"
              title="Hentikan animasi sekarang dan langsung tampilkan pemenang (hasil undian tidak berubah)"
            >
              <Square className="size-5 fill-current" aria-hidden />
              Stop & Tampilkan Pemenang
            </motion.button>
          </div>
        )}

        {isCompleted && (
          <p className="flex items-center justify-center gap-2 rounded-xl border border-line bg-gradient-to-b from-[#2c2c31] to-[#232326] px-4 py-3 text-sm font-semibold text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Trophy className="size-4 text-amber-400" aria-hidden />
            Pengundian sesi ini telah selesai
            {hasNextSession &&
              state.settings.autoCarryOverParticipants &&
              session.participants.length - session.winners.length > 0 && (
                <span className="text-muted/80">
                  · Sisa {session.participants.length - session.winners.length} peserta
                  otomatis dipindahkan ke Sesi {session.id + 1}
                </span>
              )}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          {isCompleted && (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 3 }}
              type="button"
              onClick={onRedraw}
              disabled={isSpinning}
              className="flex items-center gap-2 rounded-xl border border-red-300/40 bg-gradient-to-b from-[#ef4444] to-[#b91c1c] px-5 py-2.5 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-3px_0_rgba(0,0,0,0.3)] hover:brightness-110 disabled:opacity-40"
              title="Undi ulang sesi ini (pemenang sebelumnya dibatalkan)"
            >
              <RotateCcw className="size-4" aria-hidden />
              Spin Ulang
            </motion.button>
          )}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 2 }}
            type="button"
            onClick={onResetSession}
            disabled={isSpinning}
            className="flex items-center gap-2 rounded-lg border border-red-900/60 bg-gradient-to-b from-[#2c2c31] to-[#1f1f22] px-4 py-2 text-xs font-bold text-red-300 transition-colors hover:border-red-700 hover:text-red-200 disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset Sesi {session.id}
          </motion.button>
        </div>

        <WinnerReveal
          session={session}
          visible={showWinner && !isSpinning}
          hasNextSession={hasNextSession}
          onNextSession={onNextSession}
          onOpenHistory={onOpenHistory}
        />
      </div>
    </section>
  );
}
