import { useRef } from "react";
import { Download, FileJson, FileSpreadsheet, History, RotateCcw, Settings2 } from "lucide-react";
import { FullscreenButton } from "../common/FullscreenButton";

interface AppHeaderProps {
  eventName: string;
  completedCount: number;
  maxParticipants: number;
  onMaxParticipantsChange: (value: number) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onExportCsv: () => void;
  onOpenHistory: () => void;
  onResetAll: () => void;
}

export function AppHeader({
  eventName,
  completedCount,
  maxParticipants,
  onMaxParticipantsChange,
  onExportJson,
  onImportJson,
  onExportCsv,
  onOpenHistory,
  onResetAll,
}: AppHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-surface/60 px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-xl font-black text-white shadow-lg shadow-primary/30">
          ★
        </div>
        <div>
          <h1 className="text-xl font-black leading-tight tracking-tight text-ink">{eventName}</h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            10 Sesi Pengundian
          </p>
        </div>
        <span className="ml-2 rounded-full border border-primary/50 bg-primary/15 px-3 py-1 text-xs font-bold text-red-200">
          {completedCount}/10 sesi selesai
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onOpenHistory}
          className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-elevated hover:text-ink"
        >
          <History className="size-4" aria-hidden />
          <span className="hidden md:inline">Rekap &amp; Histori</span>
        </button>

        <button
          type="button"
          onClick={onExportJson}
          title="Unduh backup JSON"
          className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-elevated hover:text-ink"
        >
          <FileJson className="size-4" aria-hidden />
          <span className="hidden md:inline">Backup</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Impor backup JSON"
          className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-elevated hover:text-ink"
        >
          <Download className="size-4" aria-hidden />
          <span className="hidden md:inline">Restore</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImportJson(file);
            event.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={onExportCsv}
          title="Ekspor rekap CSV"
          className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-elevated hover:text-ink"
        >
          <FileSpreadsheet className="size-4" aria-hidden />
          <span className="hidden md:inline">CSV</span>
        </button>

        <label
          className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-muted"
          title="Batas maksimal peserta per sesi"
        >
          <Settings2 className="size-4" aria-hidden />
          <span className="hidden md:inline">Maks/sesi</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={maxParticipants}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isFinite(value) && value >= 1) onMaxParticipantsChange(value);
            }}
            className="w-16 rounded-lg border border-line bg-background px-2 py-1 text-center text-sm font-bold text-ink outline-none focus:border-primary"
            aria-label="Batas maksimal peserta per sesi"
          />
        </label>

        <button
          type="button"
          onClick={onResetAll}
          title="Reset seluruh acara"
          className="flex items-center gap-2 rounded-xl border border-red-900/60 bg-surface px-3 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-primary/20 hover:text-red-200"
        >
          <RotateCcw className="size-4" aria-hidden />
          <span className="hidden md:inline">Reset Acara</span>
        </button>

        <FullscreenButton />
      </div>
    </header>
  );
}
