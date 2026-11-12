import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dices } from "lucide-react";

interface SpinAnimationProps {
  isSpinning: boolean;
  /** Nama-nama kandidat untuk drum 3D (hanya saat spinning). */
  names: string[];
  /** Indeks pemenang pada `names` — drum mendarat di sini. */
  targetIndex: number | null;
  /** Jumlah putaran penuh drum (kecepatan, dari pengaturan). */
  revolutions: number;
  /** Lama animasi (ms, dari pengaturan). */
  durationMs: number;
  /** Teks saat drum tidak berputar. */
  idleText: string;
  /** Mode layar audiens: lebih besar. */
  large?: boolean;
}

const ITEM_HEIGHT = 56;

/**
 * Drum slot 3D: nama-nama tersusun pada silinder (rotateX + translateZ).
 * Hasil random SUDAH ditentukan sebelumnya; animasi hanya mendarat ke sana.
 */
export function SpinAnimation({
  isSpinning,
  names,
  targetIndex,
  revolutions,
  durationMs,
  idleText,
  large = false,
}: SpinAnimationProps) {
  const [rotation, setRotation] = useState(0);
  const [resting, setResting] = useState<{ names: string[]; targetIndex: number } | null>(null);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (isSpinning && targetIndex !== null && names.length > 0) {
      const step = 360 / names.length;
      setResting({ names, targetIndex });
      setRolling(true);
      setRotation((prev) => {
        const current = ((prev % 360) + 360) % 360;
        const destination = ((-targetIndex * step) % 360 + 360) % 360;
        let delta = destination - current;
        if (delta < 0) delta += 360;
        return prev + 360 * revolutions + delta;
      });
    }
    if (!isSpinning) {
      setRolling(false);
    }
  }, [isSpinning, targetIndex, names, revolutions]);

  const itemHeight = large ? 88 : ITEM_HEIGHT;
  const drumNames = resting?.names ?? [];
  const count = drumNames.length;
  const step = count > 0 ? 360 / count : 0;
  const radius = count > 1 ? itemHeight / 2 / Math.tan(Math.PI / count) : 120;
  const durationS = Math.max(0.5, (durationMs - 150) / 1000);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl border border-primary/30 bg-[radial-gradient(ellipse_at_center,rgba(153,27,27,0.35),rgba(24,24,27,0.9)_75%)] shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)] ${
        large ? "h-64 sm:h-80" : "h-44"
      }`}
      aria-label="Area animasi pengundian"
    >
      {/* garis panggung atas/bawah */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
        aria-hidden
      />

      {count > 0 ? (
        <div className="flex w-full justify-center [perspective:900px]">
          <motion.div
            className="relative"
            style={{
              width: large ? "min(100%, 640px)" : "min(100%, 380px)",
              height: itemHeight,
              transformStyle: "preserve-3d",
            }}
            animate={{ rotateX: rotation }}
            transition={{ duration: durationS, ease: [0.12, 0.86, 0.22, 1] }}
          >
            {drumNames.map((name, index) => (
              <div
                key={`${index}-${name}`}
                className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden]"
                style={{
                  transform: `rotateX(${index * step}deg) translateZ(${radius}px)`,
                }}
              >
                <span
                  className={`max-w-full truncate font-black tracking-tight transition-colors ${
                    large ? "text-3xl sm:text-4xl" : "text-2xl"
                  } ${
                    rolling ? "text-ink/85" : "text-ink drop-shadow-[0_0_18px_rgba(220,38,38,0.55)]"
                  }`}
                >
                  {name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
          <Dices className={`text-muted/60 ${large ? "size-9" : "size-6"}`} aria-hidden />
          <p className={`font-semibold text-muted ${large ? "text-xl" : "text-base"}`}>
            {idleText}
          </p>
        </div>
      )}

      {/* bingkai pemenang di tengah */}
      <div
        className={`pointer-events-none absolute top-1/2 h-16 -translate-y-1/2 rounded-xl border-y-2 transition-opacity ${
          large ? "left-16 right-16" : "left-6 right-6"
        } ${count > 0 ? "opacity-100" : "opacity-0"} ${
          rolling ? "border-primary/25" : "border-primary shadow-[0_0_24px_rgba(220,38,38,0.35)]"
        }`}
        aria-hidden
      />

      {/* fade atas & bawah */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background/90 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/90 to-transparent"
        aria-hidden
      />
    </div>
  );
}
