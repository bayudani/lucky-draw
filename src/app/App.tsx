import { useCallback, useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { AppHeader } from "../components/layout/AppHeader";
import { SessionNavigation } from "../components/layout/SessionNavigation";
import { ParticipantGrid } from "../components/participants/ParticipantGrid";
import { ParticipantInputDialog } from "../components/participants/ParticipantInputDialog";
import { SpinPanel } from "../components/draw/SpinPanel";
import { WinnerHistory } from "../components/history/WinnerHistory";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { useLuckyDraw } from "../hooks/useLuckyDraw";
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
} from "../domain/sessionRules";
import { SESSION_COUNT, type LuckyDrawState } from "../domain/types";

type ConfirmKind =
  | { type: "reset-session"; sessionId: number }
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
    spin,
    setParticipants,
    resetSession,
    resetAll,
    importState,
    updateSettings,
    discardCorruptData,
  } = controller;
  const { notify } = useToast();

  const [activeSessionId, setActiveSessionId] = useState(1);
  const [editorOpen, setEditorOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmKind>(null);

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
      case "reset-all":
        return {
          title: "Reset Seluruh Acara?",
          description:
            "Semua peserta, pemenang, dan histori di 10 sesi akan dihapus permanen. Pastikan sudah mengunduh backup JSON sebelum melanjutkan.",
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
  }, [confirmState, sessions, resetSession, resetAll, importState, notify]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
        completedCount={completedCount}
        maxParticipants={state.settings.maxParticipantsPerSession}
        onMaxParticipantsChange={(value) => updateSettings({ maxParticipantsPerSession: value })}
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

      <main className="grid min-h-0 flex-1 gap-4 px-6 pb-6 lg:grid-cols-[1.8fr_1fr] max-lg:grid-rows-[auto_minmax(24rem,1fr)]">
        <ParticipantGrid
          session={session}
          previousWinnerNames={previousWinnerNames}
          globalUniqueWinners={state.settings.globalUniqueWinners}
          canEdit={session.status !== "completed" && !isSpinning}
          onOpenEditor={() => setEditorOpen(true)}
        />
        <SpinPanel
          session={session}
          state={state}
          isSpinning={isSpinning}
          isThisSessionSpinning={isSpinning && spinningSessionId === session.id}
          showWinner={session.status === "completed"}
          hasNextSession={Boolean(nextDrawable)}
          onSpin={handleSpin}
          onNextSession={() => {
            if (nextDrawable) setActiveSessionId(nextDrawable.id);
          }}
          onOpenHistory={() => setHistoryOpen(true)}
          onResetSession={() => setConfirmState({ type: "reset-session", sessionId: session.id })}
        />
      </main>

      <p className="px-6 pb-4 text-center text-[11px] text-muted/70 max-lg:hidden">
        Total {SESSION_COUNT} sesi · Pemenang unik sepanjang acara · Data tersimpan otomatis
        di perangkat ini (LocalStorage)
      </p>

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
  );
}

export default function App() {
  return (
    <ToastProvider>
      <LuckyDrawApp />
    </ToastProvider>
  );
}
