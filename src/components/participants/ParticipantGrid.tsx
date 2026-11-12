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
      className="flex min-h-0 flex-col rounded-2xl border border-line bg-surface"
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
          <button
            type="button"
            onClick={onOpenEditor}
            className="flex items-center gap-2 rounded-xl border border-line bg-background px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-elevated"
          >
            <Pencil className="size-4" aria-hidden />
            {isEmpty ? "Tambah Peserta" : "Edit Peserta"}
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        {isEmpty ? (
          <div className="flex h-full min-h-40 flex-col items-center justify-center gap-3 text-center">
            <Users className="size-10 text-muted/60" aria-hidden />
            <p className="font-semibold text-muted">Belum ada peserta di sesi ini</p>
            {canEdit && (
              <button
                type="button"
                onClick={onOpenEditor}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/30 transition-colors hover:bg-deep"
              >
                Tambah Peserta
              </button>
            )}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {session.participants.map((participant, index) => {
              const alreadyWon =
                globalUniqueWinners &&
                previousWinnerNames.includes(participant.name.toLowerCase());
              return (
                <li
                  key={participant.id}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                    alreadyWon
                      ? "border-amber-500/50 bg-amber-950/25 text-amber-100"
                      : "border-line bg-background text-ink"
                  }`}
                >
                  <span className="w-6 shrink-0 text-right text-xs font-bold text-muted">
                    {index + 1}.
                  </span>
                  <span className="truncate" title={participant.name}>
                    {participant.name}
                  </span>
                  {alreadyWon && (
                    <span className="ml-auto shrink-0 rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-300">
                      Sudah Menang
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
