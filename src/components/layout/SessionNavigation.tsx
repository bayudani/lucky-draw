import { CheckCircle2, Circle, ListChecks } from "lucide-react";
import type { DrawSession } from "../../domain/types";

interface SessionNavigationProps {
  sessions: DrawSession[];
  activeSessionId: number;
  onSelect: (sessionId: number) => void;
}

const STATUS_LABEL: Record<DrawSession["status"], string> = {
  empty: "Belum diisi",
  ready: "Siap diundi",
  completed: "Selesai",
};

export function SessionNavigation({
  sessions,
  activeSessionId,
  onSelect,
}: SessionNavigationProps) {
  const ordered = [...sessions].sort((a, b) => a.id - b.id);

  return (
    <nav
      aria-label="Navigasi sesi"
      className="grid grid-cols-5 gap-2 px-6 py-4 xl:grid-cols-10"
    >
      {ordered.map((session) => {
        const isActive = session.id === activeSessionId;
        const Icon =
          session.status === "completed" ? CheckCircle2 : session.status === "ready" ? ListChecks : Circle;

        const base =
          "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-colors";
        const state =
          session.status === "completed"
            ? "border-emerald-600/60 bg-emerald-950/40 text-emerald-200"
            : session.status === "ready"
              ? "border-amber-500/60 bg-amber-950/30 text-amber-200"
              : "border-line bg-surface text-muted";
        const active = isActive
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "";

        return (
          <button
            key={session.id}
            type="button"
            onClick={() => onSelect(session.id)}
            aria-current={isActive ? "true" : undefined}
            title={`Sesi ${session.id} — ${STATUS_LABEL[session.status]}${
              session.winner ? ` — Pemenang: ${session.winner.name}` : ""
            }`}
            className={`${base} ${state} ${active} hover:brightness-110`}
          >
            <span className="text-sm font-black">SESI {session.id}</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold leading-tight">
              <Icon className="size-3.5 shrink-0" aria-hidden />
              {session.status === "completed"
                ? session.winner?.name
                : `${session.participants.length} peserta`}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export { STATUS_LABEL };
