import { motion } from "framer-motion";
import { Pencil, Users } from "lucide-react";
import type { DrawSession } from "../../domain/types";

interface ParticipantGridProps {
  session: DrawSession;
  /** Nama (ternormalisasi) yang sudah menang di sesi lain. */
  previousWinnerNames: string[];
  globalUniqueWinners: boolean;
  canEdit: boolean;
  onOpenEditor: () => void;
}

export function ParticipantGrid({
  session,
  previousWinnerNames,
  globalUniqueWinners,
  canEdit,
  onOpenEditor,
}: ParticipantGridProps) {
  const isEmpty = session.participants.length === 0;

  return (
    <section
      className="flex min-h-0 flex-col rounded-2xl border border-line bg-gradient-to-b from-[#2e2e33] to-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_20px_50px_-30px_rgba(0,0,0,0.8)]"
      aria-label="Daftar peserta"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
        <div>
          <h2 className="text-lg font-black text-ink">Peserta Sesi {session.id}</h2>
          <p className="text-sm font-semibold text-muted">
            {session.participants.length} peserta
          </p>
        </div>
        {canEdit && (
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 2 }}
            type="button"
            onClick={onOpenEditor}
            className="relative flex items-center gap-2 rounded-xl border border-line bg-gradient-to-b from-[#3f3f46] to-[#27272a] px-4 py-2 text-sm font-bold text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-3px_0_rgba(0,0,0,0.35)]"
          >
            <Pencil className="size-4" aria-hidden />
            {isEmpty ? "Tambah Peserta" : "Edit Peserta"}
          </motion.button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        {isEmpty ? (
          <div className="flex h-full min-h-40 flex-col items-center justify-center gap-3 text-center">
            <Users className="size-10 text-muted/50" aria-hidden />
            <p className="font-semibold text-muted">Belum ada peserta di sesi ini</p>
            {canEdit && (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 3 }}
                type="button"
                onClick={onOpenEditor}
                className="relative rounded-xl border border-red-300/30 bg-gradient-to-b from-[#ef4444] to-[#b91c1c] px-5 py-2.5 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-3px_0_rgba(0,0,0,0.3)]"
              >
                Tambah Peserta
              </motion.button>
            )}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {session.participants.map((participant, index) => {
              const alreadyWon =
                globalUniqueWinners &&
                previousWinnerNames.includes(participant.name.toLowerCase());
              return (
                <motion.li
                  key={participant.id}
                  initial={{ opacity: 0, y: 10, rotateX: -18 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.9) }}
                  className={`relative flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-6px_10px_rgba(0,0,0,0.25)] ${
                    alreadyWon
                      ? "border-amber-500/50 bg-gradient-to-b from-[#453411] to-[#292524] text-amber-100"
                      : "border-line bg-gradient-to-b from-[#333338] to-[#232326] text-ink"
                  }`}
                >
                  <span className="w-6 shrink-0 text-right text-xs font-bold text-muted">
                    {index + 1}.
                  </span>
                  <span className="truncate" title={participant.name}>
                    {participant.name}
                  </span>
                  {alreadyWon && (
                    <span className="ml-auto shrink-0 rounded-md border border-amber-400/40 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-300">
                      Sudah Menang
                    </span>
                  )}
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
