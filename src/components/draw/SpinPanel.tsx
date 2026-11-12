import { motion } from "framer-motion";
import { Projector, RotateCcw, Trophy, Users } from "lucide-react";
import type { DrawSession, LuckyDrawState } from "../../domain/types";
import { getEligibleParticipants } from "../../domain/sessionRules";
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
  onRedraw: () => void;
  onNextSession: () => void;
  onOpenHistory: () => void;
  onOpenAudience: () => void;
  onResetSession: () => void;
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
  onRedraw,
  onNextSession,
  onOpenHistory,
  onOpenAudience,
  onResetSession,
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

  const canSpin = !isSpinning && session.status === "ready" && eligible.length > 0;
  const isCompleted = session.status === "completed";

  const idleText = isCompleted
    ? `Pemenang: ${session.winner?.name ?? "—"}`
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
          <h2 className="text-lg font-black text-ink">Pengundian Sesi {session.id}</h2>
          <p className="flex items-center gap-2 text-sm font-semibold text-muted">
            <Users className="size-4" aria-hidden />
            {session.participants.length} peserta · {eligible.length} eligible
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAudience}
            title="Tampilan audiens (fullscreen untuk proyektor)"
            className="flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-3 py-1.5 text-xs font-bold text-red-200 hover:bg-primary/25"
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
                  : canSpin
                    ? "Mulai pengundian"
                    : "Menunggu…"
            }
          />
        )}

        {isThisSessionSpinning && (
          <div
            className="flex items-center justify-center gap-3 rounded-2xl border border-primary/40 bg-deep/30 px-8 py-6 text-2xl font-black uppercase tracking-wider text-red-200"
            aria-live="polite"
          >
            <span className="size-3 animate-ping rounded-full bg-primary" aria-hidden />
            Sedang Mengundi...
          </div>
        )}

        {isCompleted && (
          <p className="flex items-center justify-center gap-2 rounded-xl border border-line bg-gradient-to-b from-[#2c2c31] to-[#232326] px-4 py-3 text-sm font-semibold text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Trophy className="size-4 text-amber-400" aria-hidden />
            Pengundian sesi ini telah selesai
          </p>
        )}

        <WinnerReveal
          session={session}
          visible={showWinner && !isSpinning}
          hasNextSession={hasNextSession}
          onNextSession={onNextSession}
          onOpenHistory={onOpenHistory}
        />

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
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
      </div>
    </section>
  );
}
