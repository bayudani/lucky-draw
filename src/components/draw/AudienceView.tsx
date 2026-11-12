import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Projector, RotateCcw, Square, Trophy, Users } from "lucide-react";
import type { DrawSession, LuckyDrawState } from "../../domain/types";
import { getEligibleParticipants, getSessionDisplayName } from "../../domain/sessionRules";
import type { PendingDraw } from "../../hooks/useLuckyDraw";
import { SpinAnimation } from "./SpinAnimation";
import { SpinButton } from "./SpinButton";
import { WinnerReveal } from "./WinnerReveal";
import { WinnerTakeover } from "./WinnerTakeover";

interface AudienceViewProps {
  session: DrawSession;
  state: LuckyDrawState;
  isSpinning: boolean;
  pendingDraw: PendingDraw | null;
  hasNextSession: boolean;
  onSpin: () => void;
  onStopSpin: () => void;
  onRedraw: () => void;
  onNextSession: () => void;
  onExit: () => void;
}

/**
 * Tampilan untuk audiens/proyektor: HANYA animasi drum, tombol SPIN,
 * dan reveal pemenang. Panel input nama & data operator tidak tampil.
 */
export function AudienceView({
  session,
  state,
  isSpinning,
  pendingDraw,
  hasNextSession,
  onSpin,
  onStopSpin,
  onRedraw,
  onNextSession,
  onExit,
}: AudienceViewProps) {
  const [takeoverDismissed, setTakeoverDismissed] = useState(false);

  // Masuk fullscreen saat overlay dibuka.
  useEffect(() => {
    document.documentElement.requestFullscreen().catch(() => {
      // Browser menolak (mis. tanpa gesture) — mode tetap tampil tanpa OS fullscreen.
    });
  }, []);

  // Popup pemenang kembali aktif saat pindah sesi.
  useEffect(() => {
    setTakeoverDismissed(false);
  }, [session.id]);


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
  const isThisSessionSpinning = pendingDraw?.sessionId === session.id && isSpinning;
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

  const spinTitle =
    session.status === "empty"
      ? "Sesi tanpa peserta tidak dapat diundi"
      : eligible.length === 0
        ? "Semua peserta sudah pernah menang"
        : canSpin
          ? "Mulai pengundian"
          : "Menunggu…";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-background"
    >
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(1400px_700px_at_50%_-10%,rgba(220,38,38,0.22),transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1100px_560px_at_50%_115%,rgba(153,27,27,0.18),transparent_60%)]" />
        <div className="bg-noise absolute inset-0 opacity-[0.045] mix-blend-overlay" />
      </div>

      {/* Bar atas: identitas + keluar */}
      <div className="relative z-30 flex items-center justify-between gap-2 px-4 py-3 sm:px-8 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-red-300/40 bg-white p-1 shadow-[inset_0_2px_0_rgba(255,255,255,0.4)]">
            <img
              src="/img/LogoBenline.png"
              alt="Logo Benline"
              className="size-full object-contain"
              draggable={false}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate bg-gradient-to-b from-white to-red-200 bg-clip-text text-lg font-black leading-tight text-transparent">
              {state.eventName}
            </p>
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
              {getSessionDisplayName(session)} · {session.participants.length} peserta
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ y: 2 }}
          type="button"
          onClick={onExit}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-line bg-gradient-to-b from-[#333338] to-[#232326] px-3 py-2 text-sm font-bold text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_0_-3px_0_rgba(0,0,0,0.3)] hover:text-ink"
          title="Kembali ke panel operator"
        >
          <LogOut className="size-4" aria-hidden />
          <span className="hidden sm:inline">Keluar Tampilan Audiens</span>
          <span className="sm:hidden">Keluar</span>
        </motion.button>
      </div>

      {/* Panggung */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-4 py-6 sm:px-16">
        <div className="w-full max-w-4xl text-center">
          {/* Nama sesi/hadiah — besar, tampil sebelum & saat pengundian */}
          <h2 className="bg-gradient-to-b from-white to-red-200 bg-clip-text text-5xl font-black leading-tight tracking-tight text-transparent drop-shadow-[0_4px_16px_rgba(220,38,38,0.35)] sm:text-6xl">
            {getSessionDisplayName(session)}
          </h2>
          <div className="mt-4">
            <SpinAnimation
              key={session.id}
              isSpinning={isThisSessionSpinning}
              names={drumNames}
              targetIndex={targetIndex}
              revolutions={revolutions}
              durationMs={durationMs}
              idleText={idleText}
              large
            />
          </div>
        </div>

        {isThisSessionSpinning ? (
          <div className="flex flex-col items-center gap-3">
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
        ) : isCompleted ? (
          <div className="flex flex-col items-center gap-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-muted">
              <Users className="size-4" aria-hidden />
              Pengundian sesi ini telah selesai
            </p>
            {takeoverDismissed && (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 2 }}
                  type="button"
                  onClick={onRedraw}
                  className="flex items-center gap-2 rounded-xl border border-red-300/40 bg-gradient-to-b from-[#ef4444] to-[#b91c1c] px-5 py-2.5 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-3px_0_rgba(0,0,0,0.3)] hover:brightness-110"
                  title="Undi ulang sesi ini (pemenang sebelumnya dibatalkan)"
                >
                  <RotateCcw className="size-4" aria-hidden />
                  Spin Ulang
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 2 }}
                  type="button"
                  onClick={() => setTakeoverDismissed(false)}
                  className="flex items-center gap-2 rounded-xl border border-line bg-gradient-to-b from-[#333338] to-[#232326] px-5 py-2.5 text-sm font-bold text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_0_-3px_0_rgba(0,0,0,0.3)] hover:text-ink"
                >
                  <Trophy className="size-4" aria-hidden />
                  Tampilkan Pemenang
                </motion.button>
              </div>
            )}
          </div>
        ) : !canSpin ? (
          <p className="text-sm font-semibold text-amber-300">
            {session.status === "empty"
              ? "Sesi ini belum memiliki peserta."
              : "Semua peserta di sesi ini sudah pernah menang."}
          </p>
        ) : null}

        {!isCompleted && !isThisSessionSpinning && (
          <div className="w-full max-w-2xl">
            <SpinButton canSpin={canSpin} onSpin={onSpin} title={spinTitle} large />
          </div>
        )}

        <div className="w-full max-w-4xl">
          <WinnerReveal
            session={session}
            visible={isCompleted && !isSpinning && takeoverDismissed}
            hasNextSession={hasNextSession}
            onNextSession={onNextSession}
            onOpenHistory={() => {}}
            stage
          />
        </div>
      </div>

      <div className="relative z-10 pb-4 pt-2 text-center text-[11px] text-muted/60">
        <Projector className="mr-1 inline size-3.5" aria-hidden />
        Tekan ESC atau tombol keluar untuk kembali ke panel operator
      </div>

      {/* Popup fullscreen pemenang — momen dramatis saat hasil ditentukan */}
      <WinnerTakeover
        session={session}
        eventName={state.eventName}
        visible={isCompleted && !isSpinning && !takeoverDismissed}
        hasNextSession={hasNextSession}
        onNextSession={onNextSession}
        onRedraw={onRedraw}
        onDismiss={() => setTakeoverDismissed(true)}
      />
    </motion.div>
  );
}
