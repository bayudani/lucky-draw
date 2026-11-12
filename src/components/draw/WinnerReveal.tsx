import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper } from "lucide-react";
import type { DrawSession } from "../../domain/types";

interface WinnerRevealProps {
  session: DrawSession;
  visible: boolean;
  onNextSession: () => void;
  onOpenHistory: () => void;
  hasNextSession: boolean;
}

const CONFETTI_COLORS = ["#DC2626", "#991B1B", "#F59E0B", "#FBBF24", "#FAFAFA"];

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 44 }, (_, index) => ({
        id: index,
        x: (Math.random() - 0.5) * 420,
        y: -(80 + Math.random() * 240),
        rotate: Math.random() * 540 - 270,
        delay: Math.random() * 0.25,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 7,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: piece.x, y: piece.y + 160, opacity: 0, rotate: piece.rotate }}
          transition={{ duration: 1.6 + Math.random() * 0.6, delay: piece.delay, ease: "easeOut" }}
          className="absolute rounded-[2px]"
          style={{ backgroundColor: piece.color, width: piece.size, height: piece.size * 1.6 }}
        />
      ))}
    </div>
  );
}

export function WinnerReveal({
  session,
  visible,
  onNextSession,
  onOpenHistory,
  hasNextSession,
}: WinnerRevealProps) {
  return (
    <AnimatePresence>
      {visible && session.winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative overflow-hidden rounded-2xl border border-primary bg-gradient-to-b from-deep/70 to-surface px-6 py-6 text-center shadow-xl shadow-primary/20"
        >
          <ConfettiBurst />
          <div className="relative">
            <p className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-red-300">
              <PartyPopper className="size-4" aria-hidden />
              SELAMAT KEPADA PEMENANG!
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted">
              Pemenang Sesi {session.id}
            </p>
            <h3 className="mt-3 break-words text-4xl font-black leading-tight text-ink xl:text-5xl">
              {session.winner.name}
            </h3>
            {session.drawnAt && (
              <p className="mt-2 text-xs font-semibold text-muted">
                Diundi pada {new Date(session.drawnAt).toLocaleString("id-ID")}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {hasNextSession && (
                <button
                  type="button"
                  onClick={onNextSession}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/40 transition-colors hover:bg-deep"
                >
                  Lanjut ke Sesi Berikutnya
                </button>
              )}
              <button
                type="button"
                onClick={onOpenHistory}
                className="rounded-xl border border-line bg-background px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-elevated"
              >
                Lihat Rekap
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
