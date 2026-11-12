import { useMemo, type PointerEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { PartyPopper } from "lucide-react";
import type { DrawSession } from "../../domain/types";

interface WinnerRevealProps {
  session: DrawSession;
  visible: boolean;
  onNextSession: () => void;
  onOpenHistory: () => void;
  hasNextSession: boolean;
  /** Mode layar audiens: ukuran lebih besar. */
  stage?: boolean;
}

const CONFETTI_COLORS = ["#DC2626", "#991B1B", "#F59E0B", "#FBBF24", "#FAFAFA", "#EF4444"];

/** Ledakan confetti 3D — dipakai WinnerReveal & WinnerTakeover. */
export function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 52 }, (_, index) => ({
        id: index,
        x: (Math.random() - 0.5) * 460,
        fall: 120 + Math.random() * 220,
        rotX: 360 + Math.random() * 720,
        rotZ: Math.random() * 360,
        delay: Math.random() * 0.3,
        duration: 1.7 + Math.random() * 0.8,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        w: 7 + Math.random() * 8,
        h: 12 + Math.random() * 14,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          initial={{ x: 0, y: 20, opacity: 0, rotateX: 0, rotateZ: piece.rotZ }}
          animate={{
            x: piece.x,
            y: piece.fall,
            opacity: [0, 1, 1, 0],
            rotateX: piece.rotX,
            rotateZ: piece.rotZ + 180,
          }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: "easeOut" }}
          className="absolute rounded-[2px]"
          style={{
            backgroundColor: piece.color,
            width: piece.w,
            height: piece.h,
            transformStyle: "preserve-3d",
            boxShadow: "inset 0 -2px 3px rgba(0,0,0,0.35)",
          }}
        />
      ))}
    </div>
  );
}

/** Kartu pemenang 3D: flip masuk + tilt mengikuti pointer (efek holografik). */
export function WinnerReveal({
  session,
  visible,
  onNextSession,
  onOpenHistory,
  hasNextSession,
  stage = false,
}: WinnerRevealProps) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 160, damping: 18 });
  const springY = useSpring(rotateY, { stiffness: 160, damping: 18 });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 12);
    rotateX.set(-py * 10);
  };

  const handlePointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <AnimatePresence>
      {visible && session.winners.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative [perspective:1200px]"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <motion.div
            style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
          >
            <motion.div
              initial={{ rotateX: -72, y: 70, opacity: 0 }}
              animate={{ rotateX: 0, y: 0, opacity: 1 }}
              exit={{ rotateX: -40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 17 }}
              className={`relative overflow-hidden rounded-2xl border border-red-400/40 bg-[linear-gradient(160deg,#7f1d1d_0%,#991b1b_35%,#27272a_100%)] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-18px_40px_rgba(0,0,0,0.45),0_24px_60px_-18px_rgba(220,38,38,0.5)] ${
                stage ? "w-full max-w-4xl px-10 py-12" : "px-5 py-5"
              }`}
            >
              {/* kilau strip melintas */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/12 to-transparent"
                animate={{ left: ["-50%", "130%"] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
              />
              <ConfettiBurst />

              <div className="relative" style={{ transform: "translateZ(40px)" }}>
                <p
                  className={`flex items-center justify-center gap-2 font-black uppercase tracking-[0.3em] text-red-200/90 ${
                    stage ? "text-base" : "text-xs"
                  }`}
                >
                  <PartyPopper className={stage ? "size-6" : "size-4"} aria-hidden />
                  {session.winners.length > 1
                    ? `SELAMAT KEPADA ${session.winners.length} PEMENANG!`
                    : "SELAMAT KEPADA PEMENANG!"}
                </p>
                <p
                  className={`mt-1 font-bold uppercase tracking-[0.25em] text-muted ${
                    stage ? "text-sm" : "text-[11px]"
                  }`}
                >
                  Pemenang Sesi {session.id}
                </p>

                {session.winners.length === 1 ? (
                  <h3
                    className={`mt-3 break-words font-black leading-tight ${
                      stage ? "text-6xl xl:text-7xl" : "text-3xl xl:text-4xl"
                    }`}
                  >
                    <span className="bg-gradient-to-b from-white via-red-50 to-red-300 bg-clip-text text-transparent drop-shadow-[0_2px_18px_rgba(220,38,38,0.45)]">
                      {session.winners[0].name}
                    </span>
                  </h3>
                ) : (
                  <ul className="mx-auto mt-4 grid max-h-64 w-full grid-cols-2 gap-2 overflow-y-auto text-left sm:grid-cols-3">
                    {session.winners.map((winner, index) => (
                      <motion.li
                        key={winner.id}
                        initial={{ opacity: 0, scale: 0.6, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.15 + index * 0.06, type: "spring", stiffness: 220, damping: 18 }}
                        className="flex items-center gap-2 rounded-lg border border-red-400/25 bg-black/25 px-3 py-2"
                      >
                        <span
                          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-black ${
                            index === 0
                              ? "bg-amber-400/90 text-black"
                              : "bg-red-500/30 text-red-200"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="truncate text-sm font-bold text-ink">{winner.name}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
                {session.drawnAt && (
                  <p className={`mt-2 font-semibold text-muted ${stage ? "text-sm" : "text-xs"}`}>
                    Diundi pada {new Date(session.drawnAt).toLocaleString("id-ID")}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  {hasNextSession && (
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 3 }}
                      type="button"
                      onClick={onNextSession}
                      className="relative rounded-xl border border-red-300/30 bg-gradient-to-b from-[#ef4444] to-[#b91c1c] px-6 py-3 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-3px_0_rgba(0,0,0,0.3)]"
                    >
                      Lanjut ke Sesi Berikutnya
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 3 }}
                    type="button"
                    onClick={onOpenHistory}
                    className="relative rounded-xl border border-line bg-gradient-to-b from-[#3f3f46] to-[#27272a] px-6 py-3 text-sm font-bold text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-3px_0_rgba(0,0,0,0.35)]"
                  >
                    Lihat Rekap
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
