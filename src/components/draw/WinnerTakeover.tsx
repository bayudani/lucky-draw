import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, PartyPopper, Undo2 } from "lucide-react";
import type { DrawSession } from "../../domain/types";
import { ConfettiBurst } from "./WinnerReveal";

interface WinnerTakeoverProps {
  session: DrawSession;
  visible: boolean;
  hasNextSession: boolean;
  onNextSession: () => void;
  onRedraw: () => void;
  onDismiss: () => void;
}

const CONFETTI_COLORS = ["#DC2626", "#F87171", "#FBBF24", "#FDE68A", "#FAFAFA", "#EF4444"];

/**
 * Popup fullscreen pemenang (mode audiens): momen "wah" saat pemenang ditentukan —
 * sorotan berputar, gelombang ledakan, nama besar animasi 3D, confetti 3D + hujan.
 */
export function WinnerTakeover({
  session,
  visible,
  hasNextSession,
  onNextSession,
  onRedraw,
  onDismiss,
}: WinnerTakeoverProps) {
  const winner = session.winner;

  // Hujan confetti: posisi/durasi acak-tetap per render takeover.
  const rain = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: (i * 37 + 11) % 100,
        delay: ((i * 13) % 40) / 10,
        duration: 2.6 + ((i * 7) % 18) / 10,
        size: 5 + ((i * 5) % 7),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        drift: ((i % 5) - 2) * 24,
      })),
    [],
  );

  return (
    <AnimatePresence>
      {visible && winner && (
        <motion.div
          key={`takeover-${session.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="fixed inset-0 z-[85] flex flex-col items-center justify-center overflow-hidden bg-[#120406]"
          role="dialog"
          aria-label={`Pemenang Sesi ${session.id}: ${winner.name}`}
        >
          {/* Latar: glow merah + sorotan berputar + noise */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-[radial-gradient(1200px_640px_at_50%_45%,rgba(220,38,38,0.4),transparent_65%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_120%,rgba(153,27,27,0.45),transparent_60%)]" />
            <motion.div
              className="absolute left-1/2 top-1/2 h-[240vmax] w-[240vmax] -translate-x-1/2 -translate-y-1/2 opacity-25"
              style={{
                backgroundImage:
                  "repeating-conic-gradient(from 0deg, rgba(248,113,113,0.5) 0deg 9deg, transparent 9deg 22deg)",
                maskImage: "radial-gradient(circle, black 12%, transparent 62%)",
                WebkitMaskImage: "radial-gradient(circle, black 12%, transparent 62%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 46, ease: "linear", repeat: Infinity }}
            />
            <div className="bg-noise absolute inset-0 opacity-[0.05] mix-blend-overlay" />
          </div>

          {/* Gelombang ledakan saat muncul */}
          <motion.span
            aria-hidden
            className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/70"
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 9, opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
          <motion.span
            aria-hidden
            className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/50"
            initial={{ scale: 0.2, opacity: 0.7 }}
            animate={{ scale: 7, opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeOut", delay: 0.25 }}
          />

          {/* Hujan confetti */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {rain.map((p) => (
              <motion.span
                key={p.id}
                className="absolute top-0"
                style={{
                  left: `${p.left}%`,
                  width: p.size,
                  height: p.size * 0.6,
                  backgroundColor: p.color,
                  borderRadius: 2,
                }}
                initial={{ y: "-8vh", opacity: 0, rotateX: 0 }}
                animate={{ y: "112vh", x: p.drift, opacity: [0, 1, 1, 0.6], rotateX: 720 + p.drift * 4 }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "linear",
                  opacity: { duration: p.duration, repeat: Infinity },
                }}
              />
            ))}
          </div>

          {/* Konten utama */}
          <motion.div
            initial={{ scale: 0.35, rotateX: -85, opacity: 0, filter: "blur(14px)" }}
            animate={{ scale: 1, rotateX: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 110, damping: 15, delay: 0.15 }}
            style={{ transformPerspective: 1200 }}
            className="relative z-10 flex flex-col items-center px-5 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.5 }}
              className="mb-4 flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-400/15 px-5 py-2 text-xs font-black uppercase tracking-[0.35em] text-amber-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
            >
              <PartyPopper className="size-4" aria-hidden />
              Selamat kepada Pemenang!
            </motion.div>

            <p className="mb-2 text-sm font-bold uppercase tracking-[0.4em] text-red-200/80">
              Pemenang Sesi {session.id}
            </p>

            <motion.h1
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="max-w-[92vw] break-words bg-gradient-to-b from-white via-amber-100 to-amber-400 bg-clip-text text-5xl font-black leading-[1.05] text-transparent drop-shadow-[0_6px_24px_rgba(220,38,38,0.55)] sm:text-7xl xl:text-8xl"
              style={{ textShadow: "0 0 60px rgba(220,38,38,0.35)" }}
            >
              {winner.name}
            </motion.h1>

            <ConfettiBurst />
          </motion.div>

          {/* Aksi */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3 px-5"
          >
            {hasNextSession && (
              <motion.button
                whileHover={{ y: -3 }}
                whileTap={{ y: 3 }}
                type="button"
                onClick={onNextSession}
                className="flex items-center gap-2 rounded-xl border border-amber-300/40 bg-gradient-to-b from-[#ef4444] to-[#991b1b] px-8 py-4 text-base font-black uppercase tracking-wider text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-5px_0_rgba(0,0,0,0.35)] hover:brightness-110"
              >
                Lanjut ke Sesi Berikutnya
                <ArrowRight className="size-5" aria-hidden />
              </motion.button>
            )}
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 2 }}
              type="button"
              onClick={onRedraw}
              className="flex items-center gap-2 rounded-xl border border-red-300/40 bg-gradient-to-b from-[#333338] to-[#232326] px-5 py-4 text-sm font-bold text-red-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_0_-3px_0_rgba(0,0,0,0.3)] hover:text-white"
              title="Undi ulang sesi ini (pemenang sebelumnya dibatalkan)"
            >
              <Undo2 className="size-4" aria-hidden />
              Spin Ulang
            </motion.button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted/70 underline-offset-4 hover:text-muted hover:underline"
            >
              Kembali ke panggung
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
