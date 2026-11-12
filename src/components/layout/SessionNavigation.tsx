import { motion } from "framer-motion";
import { CheckCircle2, Circle, ListChecks } from "lucide-react";
import { getSessionDisplayName } from "../../domain/sessionRules";
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
    <nav aria-label="Navigasi sesi" className="px-4 py-4 sm:px-6">
      <div
        className="flex gap-2 overflow-x-auto pb-1 xl:grid xl:overflow-visible xl:pb-0"
        style={{ gridTemplateColumns: `repeat(${ordered.length}, minmax(0, 1fr))` }}
      >
      {ordered.map((session) => {
        const isActive = session.id === activeSessionId;
        const Icon =
          session.status === "completed" ? CheckCircle2 : session.status === "ready" ? ListChecks : Circle;

        const base =
          "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center [transform-style:preserve-3d]";
        const state =
          session.status === "completed"
            ? "border-emerald-600/60 bg-gradient-to-b from-[#123326] to-[#0f1f18] text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            : session.status === "ready"
              ? "border-amber-500/60 bg-gradient-to-b from-[#3a2c0c] to-[#26221a] text-amber-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              : "border-line bg-gradient-to-b from-[#2c2c31] to-[#202023] text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";
        const active = isActive
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "";

        return (
          <motion.button
            key={session.id}
            whileHover={{ y: -3, rotateX: 7 }}
            whileTap={{ y: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            style={{ transformPerspective: 600 }}
            type="button"
            onClick={() => onSelect(session.id)}
            aria-current={isActive ? "true" : undefined}
            title={`${getSessionDisplayName(session)} · ${STATUS_LABEL[session.status]}${
              session.winners.length > 0
                ? ` · Pemenang: ${session.winners.slice(0, 2).map((w) => w.name).join(", ")}`
                : ""
            }`}
            className={`${base} ${state} ${active} min-w-[7.5rem] shrink-0 xl:min-w-0`}
          >
            <span className="max-w-full truncate text-sm font-black uppercase">
              {session.name.trim() !== "" ? session.name : `SESI ${session.id}`}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold leading-tight">
              <Icon className="size-3.5 shrink-0" aria-hidden />
              {session.status === "completed"
                ? session.winners.length > 0
                  ? `${session.winners.length} pemenang`
                  : "Selesai"
                : `${session.participants.length} peserta`}
            </span>
          </motion.button>
        );
      })}
      </div>
    </nav>
  );
}

export { STATUS_LABEL };
