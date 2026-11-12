import { useRef } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileJson,
  FileSpreadsheet,
  History,
  Projector,
  RotateCcw,
  Settings2,
} from "lucide-react";
import { FullscreenButton } from "../common/FullscreenButton";

interface AppHeaderProps {
  eventName: string;
  completedCount: number;
  onOpenSettings: () => void;
  onOpenAudience: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onExportCsv: () => void;
  onOpenHistory: () => void;
  onResetAll: () => void;
}

export function AppHeader({
  eventName,
  completedCount,
  onOpenSettings,
  onOpenAudience,
  onExportJson,
  onImportJson,
  onExportCsv,
  onOpenHistory,
  onResetAll,
}: AppHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-gradient-to-b from-[#232327] to-[#1c1c1f] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:px-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <motion.div
          whileHover={{ rotateY: 14, rotateX: -8 }}
          style={{ transformPerspective: 400 }}
          className="flex size-11 items-center justify-center rounded-xl border border-red-300/40 bg-[linear-gradient(160deg,#f87171_0%,#dc2626_55%,#7f1d1d_100%)] text-xl font-black text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.45),inset_0_-4px_8px_rgba(0,0,0,0.4)]"
        >
          ★
        </motion.div>
        <div>
          <h1 className="bg-gradient-to-b from-white to-red-200 bg-clip-text text-xl font-black leading-tight tracking-tight text-transparent">
            {eventName}
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
            10 Sesi Pengundian
          </p>
        </div>
        <span className="rounded-full border border-primary/50 bg-gradient-to-b from-[#3d1414] to-[#251010] px-3 py-1 text-xs font-bold text-red-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          {completedCount}/10 sesi selesai
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onOpenAudience}
          title="Tampilan audiens (fullscreen untuk proyektor)"
          className="flex items-center gap-2 rounded-xl border border-red-300/40 bg-gradient-to-b from-[#ef4444] to-[#b91c1c] px-3 py-2 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-3px_0_rgba(0,0,0,0.3)] hover:brightness-110"
        >
          <Projector className="size-4" aria-hidden />
          <span className="hidden md:inline">Mode Audiens</span>
        </button>

        <button
          type="button"
          onClick={onOpenHistory}
          className="flex items-center gap-2 rounded-xl border border-line bg-gradient-to-b from-[#333338] to-[#232326] px-2.5 py-2 text-sm font-semibold text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_0_-3px_0_rgba(0,0,0,0.3)] hover:text-ink"
        >
          <History className="size-4" aria-hidden />
          <span className="hidden md:inline">Rekap &amp; Histori</span>
        </button>

        <button
          type="button"
          onClick={onExportJson}
          title="Unduh backup JSON"
          className="flex items-center gap-2 rounded-xl border border-line bg-gradient-to-b from-[#333338] to-[#232326] px-2.5 py-2 text-sm font-semibold text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_0_-3px_0_rgba(0,0,0,0.3)] hover:text-ink"
        >
          <FileJson className="size-4" aria-hidden />
          <span className="hidden md:inline">Backup</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Impor backup JSON"
          className="flex items-center gap-2 rounded-xl border border-line bg-gradient-to-b from-[#333338] to-[#232326] px-2.5 py-2 text-sm font-semibold text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_0_-3px_0_rgba(0,0,0,0.3)] hover:text-ink"
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
          className="flex items-center gap-2 rounded-xl border border-line bg-gradient-to-b from-[#333338] to-[#232326] px-2.5 py-2 text-sm font-semibold text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_0_-3px_0_rgba(0,0,0,0.3)] hover:text-ink"
        >
          <FileSpreadsheet className="size-4" aria-hidden />
          <span className="hidden md:inline">CSV</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          title="Pengaturan acara"
          className="flex items-center gap-2 rounded-xl border border-line bg-gradient-to-b from-[#333338] to-[#232326] px-2.5 py-2 text-sm font-semibold text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_0_-3px_0_rgba(0,0,0,0.3)] hover:text-ink"
        >
          <Settings2 className="size-4" aria-hidden />
          <span className="hidden md:inline">Pengaturan</span>
        </button>

        <button
          type="button"
          onClick={onResetAll}
          title="Reset seluruh acara"
          className="flex items-center gap-2 rounded-xl border border-red-900/60 bg-gradient-to-b from-[#321414] to-[#201010] px-3 py-2 text-sm font-semibold text-red-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-3px_0_rgba(0,0,0,0.35)] hover:text-red-200"
        >
          <RotateCcw className="size-4" aria-hidden />
          <span className="hidden md:inline">Reset Acara</span>
        </button>

        <div className="hidden sm:block">
          <FullscreenButton />
        </div>
      </div>
    </header>
  );
}
