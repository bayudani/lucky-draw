import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface SpinAnimationProps {
  isSpinning: boolean;
  /** Nama-nama kandidat untuk visualisasi (hanya eligible). */
  names: string[];
}

/** Animasi hanya memvisualisasikan hasil random yang sudah ditentukan. */
export function SpinAnimation({ isSpinning, names }: SpinAnimationProps) {
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    if (!isSpinning || names.length === 0) return;
    const interval = window.setInterval(() => {
      setDisplayIndex((prev) => (prev + 1) % names.length);
    }, 90);
    return () => window.clearInterval(interval);
  }, [isSpinning, names.length]);

  const currentName = names.length > 0 ? names[displayIndex % names.length] : "—";

  return (
    <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-2xl border border-primary/40 bg-deep/30">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent"
        aria-hidden
      />
      <div className="h-14 w-full px-10 text-center">
        {isSpinning ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={displayIndex}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.08, ease: "linear" }}
              className="truncate text-2xl font-black text-ink"
            >
              {currentName}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-base font-semibold text-muted">
            Semua siap? Saatnya menentukan pemenang!
          </div>
        )}
      </div>
    </div>
  );
}
