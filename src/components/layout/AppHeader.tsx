import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Download,
  FileJson,
  FileSpreadsheet,
  History,
  Menu,
  Projector,
  RotateCcw,
  Settings2,
} from "lucide-react";
import { FullscreenButton } from "../common/FullscreenButton";

interface AppHeaderProps {
  eventName: string;
  sessionCount: number;
  completedCount: number;
  onOpenSettings: () => void;
  onOpenAudience: () => void;
  onOpenGuide: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onExportCsv: () => void;
  onOpenHistory: () => void;
  onResetAll: () => void;
}

export function AppHeader({
  eventName,
  sessionCount,
  completedCount,
  onOpenSettings,
  onOpenAudience,
  onOpenGuide,
  onExportJson,
  onImportJson,
  onExportCsv,
  onOpenHistory,
  onResetAll,
}: AppHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Tutup menu saat klik di luar / tekan ESC.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const run = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-line bg-gradient-to-b from-[#232327] to-[#1c1c1f] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:px-6 sm:py-3">
      <div className="flex items-center gap-2 sm:gap-4">
        <motion.div
          whileHover={{ rotateY: 14, rotateX: -8 }}
          style={{ transformPerspective: 400 }}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-red-300/40 bg-white p-1 shadow-[inset_0_2px_0_rgba(255,255,255,0.45),inset_0_-4px_8px_rgba(0,0,0,0.4)] sm:size-11 sm:rounded-xl sm:p-1.5"
        >
          <img
            src="/img/LogoBenline.png"
            alt="Logo Benline"
            className="size-full object-contain"
            draggable={false}
          />
        </motion.div>
        <div>
          <h1 className="bg-gradient-to-b from-white to-red-200 bg-clip-text text-base font-black leading-tight tracking-tight text-transparent sm:text-xl">
            {eventName}
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted sm:text-[11px] sm:tracking-[0.3em]">
            {sessionCount} Sesi Pengundian
          </p>
        </div>
        <span className="hidden rounded-full border border-primary/50 bg-gradient-to-b from-[#3d1414] to-[#251010] px-3 py-1 text-xs font-bold text-red-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:inline-block">
          {completedCount}/{sessionCount} sesi selesai
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenAudience}
          title="Tampilan audiens (fullscreen untuk proyektor)"
          className="flex items-center gap-2 rounded-xl border border-red-300/40 bg-gradient-to-b from-[#ef4444] to-[#b91c1c] px-3 py-2 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-3px_0_rgba(0,0,0,0.3)] hover:brightness-110"
        >
          <Projector className="size-4" aria-hidden />
          <span className="hidden sm:inline">Mode Audiens</span>
        </button>

        <div className="hidden sm:block">
          <FullscreenButton />
        </div>

        {/* Menu: semua aksi sekunder dikelompokkan di sini */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-xl border border-line bg-gradient-to-b from-[#333338] to-[#232326] px-3 py-2 text-sm font-semibold text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_0_-3px_0_rgba(0,0,0,0.3)] hover:text-ink"
          >
            <Menu className="size-4" aria-hidden />
            <span>Menu</span>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.14 }}
                role="menu"
                aria-label="Menu utama"
                className="absolute right-0 top-full z-[70] mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
              >
                <div className="px-3 py-2">
                  <p className="px-2 pb-1 pt-1 text-[10px] font-black uppercase tracking-[0.25em] text-muted">
                    Bantuan &amp; Pengaturan
                  </p>
                  <MenuItem icon={BookOpen} label="Panduan Penggunaan" onClick={run(onOpenGuide)} />
                  <MenuItem icon={Settings2} label="Pengaturan" onClick={run(onOpenSettings)} />
                </div>

                <div className="border-t border-line px-3 py-2">
                  <p className="px-2 pb-1 pt-1 text-[10px] font-black uppercase tracking-[0.25em] text-muted">
                    Data &amp; Rekap
                  </p>
                  <MenuItem icon={History} label="Rekap &amp; Histori" onClick={run(onOpenHistory)} />
                  <MenuItem icon={FileJson} label="Backup (simpan data)" onClick={run(onExportJson)} />
                  <MenuItem
                    icon={Download}
                    label="Restore (pulihkan data)"
                    onClick={() => {
                      setMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                  />
                  <MenuItem icon={FileSpreadsheet} label="Rekap CSV (Excel)" onClick={run(onExportCsv)} />
                </div>

                <div className="border-t border-red-900/50 bg-red-950/20 px-3 py-2">
                  <p className="px-2 pb-1 pt-1 text-[10px] font-black uppercase tracking-[0.25em] text-red-300/80">
                    Bahaya
                  </p>
                  <MenuItem
                    icon={RotateCcw}
                    label="Reset Seluruh Acara"
                    onClick={run(onResetAll)}
                    danger
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
      </div>
    </header>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof BookOpen;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-semibold transition-colors ${
        danger
          ? "text-red-300 hover:bg-red-900/25 hover:text-red-200"
          : "text-ink hover:bg-elevated"
      }`}
    >
      <Icon className={`size-4 shrink-0 ${danger ? "text-red-400" : "text-muted"}`} aria-hidden />
      <span>{label}</span>
    </button>
  );
}
