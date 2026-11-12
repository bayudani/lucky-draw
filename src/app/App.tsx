import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Smartphone, TriangleAlert, X } from "lucide-react";
import { AppHeader } from "../components/layout/AppHeader";
import { SessionNavigation } from "../components/layout/SessionNavigation";
import { ParticipantGrid } from "../components/participants/ParticipantGrid";
import { ParticipantInputDialog } from "../components/participants/ParticipantInputDialog";
import { SpinPanel } from "../components/draw/SpinPanel";
import { AudienceView } from "../components/draw/AudienceView";
import { WinnerHistory } from "../components/history/WinnerHistory";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { GuideModal } from "../components/common/GuideModal";
import { SettingsModal } from "../components/common/SettingsModal";
import { useLuckyDraw } from "../hooks/useLuckyDraw";
import { playWinSound, setSoundEnabled, startSpinSound, stopSpinSound } from "../services/sound";
import { ToastProvider, useToast } from "./providers";
import {
  ImportValidationError,
  exportCsvResults,
  exportJsonBackup,
  importJsonBackup,
} from "../services/exportImport";
import {
  getPreviousWinnerNamesForSession,
  findNextDrawableSession,
  normalizeName,
} from "../domain/sessionRules";
import { type LuckyDrawState } from "../domain/types";
type ConfirmKind =
  | { type: "reset-session"; sessionId: number }
  | { type: "redraw"; sessionId: number }
  | { type: "reset-all" }
  | { type: "import"; state: LuckyDrawState }
  | null;

function LuckyDrawApp() {
  const controller = useLuckyDraw();
  const {
    state,
    sessions,
    loadStatus,
    isSpinning,
    spinningSessionId,
    pendingDraw,
    spin,
    stopSpin,
    setParticipants,
    setWinnerCount,
    setSessionName,
    resetSession,
    redrawSession,
    resetAll,
    importState,
    updateSettings,
    discardCorruptData,
  } = controller;
  const { notify } = useToast();

  const [activeSessionId, setActiveSessionId] = useState(1);
  const [editorOpen, setEditorOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [audienceMode, setAudienceMode] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmKind>(null);
  const [showPortraitTip, setShowPortraitTip] = useState(true);

  // ESC di fullscreen menutup fullscreenElement → otomatis keluar mode audiens.
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setAudienceMode(false);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Sinkronkan toggle efek suara ke modul sound.
  useEffect(() => {
    setSoundEnabled(state.settings.soundEnabled);
  }, [state.settings.soundEnabled]);

  // Suara spin: whoosh+gemuruh saat mulai, fanfare saat selesai (termasuk Stop manual).
  const wasSpinning = useRef(false);
  useEffect(() => {
    if (isSpinning && !wasSpinning.current) {
      startSpinSound();
    } else if (!isSpinning && wasSpinning.current) {
      stopSpinSound();
      playWinSound();
    }
    wasSpinning.current = isSpinning;
  }, [isSpinning]);

  // Bersihkan suara spin bila komponen dibongkar.
  useEffect(() => () => stopSpinSound(), []);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? sessions[0],
    [sessions, activeSessionId],
  );
  const session = activeSession;

  const completedCount = useMemo(
    () => sessions.filter((s) => s.status === "completed").length,
    [sessions],
  );

  const previousWinnerNames = useMemo(
    () => getPreviousWinnerNamesForSession(session, state),
    [session, state],
  );

  const nextDrawable = useMemo(
    () => findNextDrawableSession(state, session.id),
    [state, session.id],
  );

  const handleSpin = useCallback(() => {
    spin(session.id, () => {
      notify(
        "Semua peserta di sesi ini sudah pernah menang. Tambahkan peserta lain atau reset sesi.",
        "warning",
      );
    });
  }, [spin, session, notify]);

  const handleImportFile = useCallback(
    async (file: File) => {
      try {
        const imported = await importJsonBackup(file);
        setConfirmState({ type: "import", state: imported });
      } catch (error) {
        if (error instanceof ImportValidationError) {
          notify(error.message, "error");
        } else {
          notify("Gagal membaca file backup.", "error");
        }
      }
    },
    [notify],
  );

  const confirmConfig = useMemo(() => {
    switch (confirmState?.type) {
      case "reset-session": {
        return {
          title: `Reset Sesi ${confirmState.sessionId}?`,
          description:
            "Reset sesi ini? Daftar peserta, pemenang, dan histori pengundian sesi ini akan dihapus permanen. Hasil sesi lain tidak terpengaruh.",
          confirmLabel: "Ya, Reset Sesi",
          danger: true,
          onConfirm: () => {
            resetSession(confirmState.sessionId);
            setConfirmState(null);
            notify(`Sesi ${confirmState.sessionId} direset.`, "success");
          },
        };
      }
      case "redraw": {
        const previousWinners =
          sessions.find((s) => s.id === confirmState.sessionId)?.winners ?? [];
        const previousWinnerText =
          previousWinners.length > 0 ? previousWinners.map((w) => w.name).join(", ") : "tidak ada";
        return {
          title: `Undi Ulang Sesi ${confirmState.sessionId}?`,
          description: `Pemenang sebelumnya (${previousWinnerText}) dan histori undian sesi ini akan dihapus, lalu sesi diundi ulang dengan peserta yang sama. Sesi lain dan pemenang lintas sesi tidak terpengaruh.`,
          confirmLabel: "Ya, Undi Ulang",
          danger: true,
          onConfirm: () => {
            redrawSession(confirmState.sessionId);
            setConfirmState(null);
            notify(
              `Sesi ${confirmState.sessionId} siap diundi ulang. Tekan SPIN untuk mengundi.`,
              "success",
            );
          },
        };
      }
      case "reset-all":
        return {
          title: "Reset Seluruh Acara?",
          description: `Semua peserta, pemenang, dan histori di ${sessions.length} sesi akan dihapus permanen. Pastikan sudah mengunduh backup JSON sebelum melanjutkan.`,
          confirmLabel: "Ya, Reset Semua",
          danger: true,
          onConfirm: () => {
            resetAll();
            setActiveSessionId(1);
            setConfirmState(null);
            notify("Seluruh acara direset.", "success");
          },
        };
      case "import":
        return {
          title: "Impor Backup JSON?",
          description:
            "Seluruh data saat ini akan DITIMPA dengan isi file backup. Pastikan file berasal dari backup yang benar.",
          confirmLabel: "Ya, Timpa Data",
          danger: true,
          onConfirm: () => {
            importState(confirmState.state);
            setConfirmState(null);
            notify("Data backup berhasil dipulihkan.", "success");
          },
        };
      default:
        return null;
    }
  }, [confirmState, sessions, resetSession, redrawSession, resetAll, importState, notify]);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Ambient lighting: glow merah atas/bawah, grid halus, noise film */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(1100px_520px_at_50%_-8%,rgba(220,38,38,0.16),transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_50%_112%,rgba(153,27,27,0.14),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at 50% 40%, black 30%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, black 30%, transparent 78%)",
          }}
        />
        <div className="bg-noise absolute inset-0 opacity-[0.045] mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:h-screen lg:overflow-hidden">
      {loadStatus === "corrupt" && (
        <div className="flex flex-wrap items-center gap-3 border-b border-primary/60 bg-deep/60 px-6 py-3 text-sm">
          <TriangleAlert className="size-5 shrink-0 text-red-300" aria-hidden />
          <p className="flex-1 font-semibold text-ink">
            Data tersimpan di LocalStorage rusak atau tidak valid. Data lama tidak dimuat
            untuk mencegah korupsi lebih lanjut.
          </p>
          <button
            type="button"
            onClick={() => {
              discardCorruptData();
              notify("Data rusak dibersihkan. Aplikasi dimulai dari awal.", "info");
            }}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-deep"
          >
            Bersihkan &amp; Mulai Baru
          </button>
        </div>
      )}

      <AppHeader
        eventName={state.eventName}
        sessionCount={state.settings.sessionCount}
        completedCount={completedCount}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAudience={() => setAudienceMode(true)}
        onOpenGuide={() => setGuideOpen(true)}
        onExportJson={() => {
          exportJsonBackup(state);
          notify("Backup JSON diunduh.", "success");
        }}
        onImportJson={handleImportFile}
        onExportCsv={() => {
          exportCsvResults(state);
          notify("Rekap CSV diunduh.", "success");
        }}
        onOpenHistory={() => setHistoryOpen(true)}
        onResetAll={() => setConfirmState({ type: "reset-all" })}
      />

      <SessionNavigation
        sessions={sessions}
        activeSessionId={session.id}
        onSelect={(id) => setActiveSessionId(id)}
      />

      <main className="grid min-h-0 flex-1 gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden max-lg:grid-rows-[auto_minmax(26rem,1fr)]">
        <ParticipantGrid
          session={session}
          previousWinnerNames={previousWinnerNames}
          globalUniqueWinners={state.settings.globalUniqueWinners}
          canEdit={session.status !== "completed" && !isSpinning}
          onOpenEditor={() => setEditorOpen(true)}
          onRemoveAlreadyWon={() => {
            const kept = session.participants.filter(
              (p) => !previousWinnerNames.includes(normalizeName(p.name)),
            );
            const removed = session.participants.length - kept.length;
            setParticipants(
              session.id,
              kept.map((p) => p.name),
            );
            notify(
              `${removed} peserta yang sudah menang di sesi lain dihapus dari Sesi ${session.id}.`,
              "success",
            );
          }}
        />
        <SpinPanel
          session={session}
          state={state}
          isSpinning={isSpinning}
          isThisSessionSpinning={isSpinning && spinningSessionId === session.id}
          pendingDraw={pendingDraw}
          showWinner={session.status === "completed"}
          hasNextSession={Boolean(nextDrawable)}
          onSpin={handleSpin}
          onStopSpin={stopSpin}
          onRedraw={() => setConfirmState({ type: "redraw", sessionId: session.id })}
          onNextSession={() => {
            if (nextDrawable) setActiveSessionId(nextDrawable.id);
          }}
          onOpenHistory={() => setHistoryOpen(true)}
          onOpenAudience={() => setAudienceMode(true)}
          onResetSession={() => setConfirmState({ type: "reset-session", sessionId: session.id })}
          onSetWinnerCount={(winnerCount) => setWinnerCount(session.id, winnerCount)}
        />
      </main>

      <p className="px-6 pb-4 text-center text-[11px] text-muted/70 max-lg:hidden">
        Total {sessions.length} sesi · Pemenang unik sepanjang acara · Data tersimpan otomatis
        di perangkat ini (LocalStorage)
      </p>

      {/* Tips orientasi untuk layar kecil (DESIGN.md §6) — bisa ditutup */}
      {showPortraitTip && (
        <div className="hidden max-md:portrait:flex items-center gap-2 border-t border-amber-500/40 bg-amber-950/50 px-4 py-2 text-xs text-amber-200">
          <Smartphone className="size-3.5 shrink-0" aria-hidden />
          <span>Untuk pengalaman terbaik, putar ke mode landscape atau gunakan layar lebih besar.</span>
          <button
            type="button"
            onClick={() => setShowPortraitTip(false)}
            className="ml-auto rounded p-1 hover:bg-amber-900/50"
            aria-label="Tutup tips"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      )}

      <ParticipantInputDialog
        open={editorOpen}
        sessionId={session.id}
        maxParticipants={state.settings.maxParticipantsPerSession}
        previousWinnerNames={previousWinnerNames}
        globalUniqueWinners={state.settings.globalUniqueWinners}
        initialText={session.participants.map((p) => p.name).join("\n")}
        onClose={() => setEditorOpen(false)}
        onSave={(names) => {
          setParticipants(session.id, names);
          notify(
            `${names.length} peserta disimpan di Sesi ${session.id}.`,
            "success",
          );
        }}
      />

      <SettingsModal
        open={settingsOpen}
        settings={state.settings}
        sessions={sessions}
        onChange={updateSettings}
        onSetSessionName={setSessionName}
        onClose={() => setSettingsOpen(false)}
      />

      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />

      <AnimatePresence>
        {audienceMode && (
          <AudienceView
            session={session}
            state={state}
            isSpinning={isSpinning}
            pendingDraw={pendingDraw}
            hasNextSession={Boolean(nextDrawable)}
            onSpin={handleSpin}
            onStopSpin={stopSpin}
            onRedraw={() => setConfirmState({ type: "redraw", sessionId: session.id })}
            onNextSession={() => {
              if (nextDrawable) setActiveSessionId(nextDrawable.id);
            }}
            onExit={() => setAudienceMode(false)}
          />
        )}
      </AnimatePresence>

      <WinnerHistory
        open={historyOpen}
        sessions={sessions}
        onClose={() => setHistoryOpen(false)}
      />

      {confirmConfig && (
        <ConfirmDialog
          open
          title={confirmConfig.title}
          description={confirmConfig.description}
          confirmLabel={confirmConfig.confirmLabel}
          danger={confirmConfig.danger}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <LuckyDrawApp />
    </ToastProvider>
  );
}
