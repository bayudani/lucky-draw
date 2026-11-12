import { useEffect, useMemo, useState } from "react";
import { CircleAlert } from "lucide-react";
import { parseParticipantInput } from "../../domain/participantParser";
import { normalizeName } from "../../domain/sessionRules";
import { MAX_NAME_LENGTH } from "../../domain/types";
import { Modal } from "../common/Modal";

interface ParticipantInputDialogProps {
  open: boolean;
  sessionId: number;
  maxParticipants: number;
  /** Nama (ternormalisasi) yang sudah pernah menang di sesi lain. */
  previousWinnerNames: string[];
  globalUniqueWinners: boolean;
  initialText: string;
  onClose: () => void;
  onSave: (names: string[]) => void;
}

export function ParticipantInputDialog({
  open,
  sessionId,
  maxParticipants,
  previousWinnerNames,
  globalUniqueWinners,
  initialText,
  onClose,
  onSave,
}: ParticipantInputDialogProps) {
  const [text, setText] = useState(initialText);

  // Saat dialog dibuka (atau berganti sesi), isi ulang textarea dari data sesi.
  useEffect(() => {
    if (open) setText(initialText);
  }, [open, initialText]);

  const parsed = useMemo(() => parseParticipantInput(text), [text]);
  const overLimit = parsed.names.length > maxParticipants;
  const hasBlockingIssues =
    overLimit || parsed.duplicates.length > 0 || parsed.tooLong.length > 0;

  const alreadyWonInBatch = useMemo(() => {
    if (!globalUniqueWinners) return [] as string[];
    return parsed.names.filter((name) => previousWinnerNames.includes(normalizeName(name)));
  }, [parsed.names, previousWinnerNames, globalUniqueWinners]);

  const handleSave = () => {
    if (hasBlockingIssues) return;
    onSave(parsed.names);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={`Peserta Sesi ${sessionId}`}
      onClose={onClose}
      wide
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          Tempel nama peserta, satu nama per baris. Spasi di awal/akhir dibersihkan
          otomatis dan baris kosong diabaikan.
        </p>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={"Masukkan satu nama per baris\nContoh:\nBudi Santoso\nSiti Rahma"}
          rows={12}
          className="w-full resize-y rounded-xl border border-line bg-background px-4 py-3 font-mono text-sm leading-relaxed text-ink outline-none placeholder:text-muted/50 focus:border-primary"
          aria-label="Daftar nama peserta"
        />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm font-semibold">
          <span className={overLimit ? "text-red-400" : "text-ink"}>
            {parsed.names.length} nama valid / maksimal {maxParticipants}
          </span>
          {parsed.blankLines > 0 && (
            <span className="text-muted">{parsed.blankLines} baris kosong diabaikan</span>
          )}
        </div>

        {(parsed.duplicates.length > 0 || parsed.tooLong.length > 0) && (
          <div className="rounded-xl border border-primary/60 bg-deep/40 px-4 py-3 text-sm">
            <p className="flex items-center gap-2 font-bold text-red-200">
              <CircleAlert className="size-4" aria-hidden />
              Perbaiki masalah berikut sebelum menyimpan:
            </p>
            {parsed.duplicates.length > 0 && (
              <p className="mt-1.5 text-red-100/90">
                <strong>Duplikat di sesi ini (ditolak):</strong> {parsed.duplicates.join(", ")}
              </p>
            )}
            {parsed.tooLong.length > 0 && (
              <p className="mt-1.5 text-red-100/90">
                <strong>Nama lebih dari {MAX_NAME_LENGTH} karakter (ditolak):</strong>{" "}
                {parsed.tooLong.length} baris
              </p>
            )}
          </div>
        )}

        {alreadyWonInBatch.length > 0 && (
          <div className="rounded-xl border border-amber-500/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
            <p className="font-bold">Sudah pernah menang di sesi lain:</p>
            <p className="mt-1 text-amber-200/90">
              {alreadyWonInBatch.join(", ")} — namanya tetap bisa disimpan dan akan
              ditandai &quot;Sudah Menang&quot;, tetapi tidak bisa terpilih saat pengundian.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-elevated hover:text-ink"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={hasBlockingIssues || parsed.names.length === 0}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/30 transition-colors enabled:hover:bg-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            Simpan Peserta
          </button>
        </div>
      </div>
    </Modal>
  );
}
