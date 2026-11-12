import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface SpinButtonProps {
  canSpin: boolean;
  onSpin: () => void;
  title: string;
  large?: boolean;
}

/**
 * Tombol arcade 3D: body gradient + lapisan depth di bawahnya,
 * ditekan = "turun" ke lapisan dasar. Tanpa drop-shadow generik.
 */
export function SpinButton({ canSpin, onSpin, title, large = false }: SpinButtonProps) {
  return (
    <div className="relative select-none">
      <div
        className="absolute inset-x-0 -bottom-1.5 top-1.5 rounded-2xl bg-[linear-gradient(180deg,#7f1d1d,#450a0a)] shadow-[inset_0_-2px_6px_rgba(0,0,0,0.6)]"
        aria-hidden
      />
      <motion.button
        type="button"
        onClick={onSpin}
        disabled={!canSpin}
        whileHover={canSpin ? { y: -2 } : undefined}
        whileTap={canSpin ? { y: 5 } : undefined}
        animate={canSpin ? { scale: [1, 1.012, 1] } : { scale: 1 }}
        transition={
          canSpin ? { scale: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } } : undefined
        }
        className={`relative flex w-full items-center justify-center gap-3 rounded-2xl border font-black uppercase tracking-wider transition-colors ${
          large ? "px-10 py-8 text-3xl" : "px-8 py-6 text-2xl"
        } ${
          canSpin
            ? "border-red-300/40 bg-[linear-gradient(180deg,#f87171_0%,#dc2626_45%,#b91c1c_100%)] text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.45),inset_0_-8px_16px_rgba(0,0,0,0.35)]"
            : "cursor-not-allowed border-line bg-gradient-to-b from-[#35353b] to-[#27272a] text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        }`}
        title={title}
      >
        <Zap className={large ? "size-9" : "size-7"} aria-hidden />
        Spin Sekarang
      </motion.button>
    </div>
  );
}
