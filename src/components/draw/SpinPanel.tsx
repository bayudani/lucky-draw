import { RotateCcw, Trophy, Users, Zap } from "lucide-react";
import type { DrawSession, LuckyDrawState } from "../../domain/types";
import { getEligibleParticipants } from "../../domain/sessionRules";
import { STATUS_LABEL } from "../layout/SessionNavigation";
import { SpinAnimation } from "./SpinAnimation";
import { WinnerReveal } from "./WinnerReveal";

interface SpinPanelProps {
  session: DrawSession;
  state: LuckyDrawState;
  isSpinning: boolean;
  /** True hanya pada sesi yang sedang berjalan animasinya. */
  isThisSessionSpinning: boolean;
  /** Reveal pemenang tampil pada sesi yang sudah selesai. */
  showWinner: boolean;
  hasNextSession: boolean;
  onSpin: () => void;
  onNextSession: () => void;
  onOpenHistory: () => void;
  onResetSession: () => void;
}

export function SpinPanel({
  session,
  state,
  isSpinning,
  isThisSessionSpinning,
  showWinner,
  hasNextSession,
  onSpin,
  onNextSession,
  onOpenHistory,
  onResetSession,
}: SpinPanelProps) {
  const eligible = getEligibleParticipants(session, state);
  const spinNames = eligible.map((participant) => participant.name);

  const canSpin =
    !isSpinning && session.status === "ready" && eligible.length > 0;
  const isCompleted = session.status === "completed";

  return (
    <section
      className="flex min-h-0 flex-col gap-4 rounded-2xl border border-line bg-surface"
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

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
        <SpinAnimation isSpinning={isThisSessionSpinning} names={spinNames} />

        {!isCompleted && !isThisSessionSpinning && (
          <button
            type="button"
            onClick={onSpin}
            disabled={!canSpin}
            className={`group relative flex items-center justify-center gap-3 rounded-2xl px-8 py-6 text-2xl font-black uppercase tracking-wider text-white shadow-xl transition-all ${
              canSpin
                ? "bg-primary shadow-primary/40 hover:bg-deep active:scale-[0.98]"
                : "cursor-not-allowed bg-elevated text-muted shadow-none"
            }`}
            title={
              session.status === "empty"
                ? "Sesi tanpa peserta tidak dapat diundi"
                : eligible.length === 0
                  ? "Semua peserta sudah pernah menang"
                  : canSpin
                    ? "Mulai pengundian"
                    : "Menunggu…"
            }
          >
            <Zap className="size-7" aria-hidden />
            {isSpinning ? "Sedang Mengundi..." : "Spin Sekarang"}
          </button>
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
          <p className="flex items-center justify-center gap-2 rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold text-muted">
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

        <div className="mt-auto flex justify-end">
          <button
            type="button"
            onClick={onResetSession}
            disabled={isSpinning}
            className="flex items-center gap-2 rounded-xl border border-red-900/60 px-4 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-primary/15 hover:text-red-200 disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset Sesi {session.id}
          </button>
        </div>
      </div>
    </section>
  );
}
