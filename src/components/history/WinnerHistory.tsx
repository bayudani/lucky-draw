import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Circle, ListChecks, Users } from "lucide-react";
import type { DrawSession } from "../../domain/types";
import { Modal } from "../common/Modal";
import { STATUS_LABEL } from "../layout/SessionNavigation";

interface WinnerHistoryProps {
  open: boolean;
  sessions: DrawSession[];
  onClose: () => void;
}

function StatusBadge({ status }: { status: DrawSession["status"] }) {
  const Icon = status === "completed" ? CheckCircle2 : status === "ready" ? ListChecks : Circle;
  const style =
    status === "completed"
      ? "border-emerald-500/60 text-emerald-200"
      : status === "ready"
        ? "border-amber-500/60 text-amber-200"
        : "border-line text-muted";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide ${style}`}
    >
      <Icon className="size-3" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function WinnerHistory({ open, sessions, onClose }: WinnerHistoryProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const ordered = [...sessions].sort((a, b) => a.id - b.id);

  return (
    <Modal open={open} title="Rekap & Histori Pengundian" onClose={onClose} wide>
      <div className="flex flex-col gap-2">
        {ordered.map((session) => {
          const expanded = expandedId === session.id;
          return (
            <div
              key={session.id}
              className="overflow-hidden rounded-xl border border-line bg-background"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : session.id)}
                className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-elevated/40"
                aria-expanded={expanded}
              >
                {expanded ? (
                  <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden />
                ) : (
                  <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                )}
                <span className="text-sm font-black text-ink">Sesi {session.id}</span>
                <StatusBadge status={session.status} />
                <span className="ml-auto text-right">
                  {session.winners.length > 0 ? (
                    <span className="block max-w-72 truncate text-sm font-bold text-ink">
                      🏆 {session.winners.map((w) => w.name).join(", ")}
                    </span>
                  ) : (
                    <span className="block text-sm text-muted">Belum ada pemenang</span>
                  )}
                  {session.drawnAt && (
                    <span className="block text-[11px] text-muted">
                      {new Date(session.drawnAt).toLocaleString("id-ID")}
                    </span>
                  )}
                </span>
              </button>

              {expanded && (
                <div className="border-t border-line px-4 py-3">
                  {session.history.length === 0 ? (
                    <p className="text-sm text-muted">
                      Belum ada histori pengundian untuk sesi ini.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {session.history.map((entry) => (
                        <li
                          key={entry.id}
                          className="rounded-lg border border-line bg-surface px-4 py-3"
                        >
                          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
                            <span>Pengundian #{entry.id.slice(0, 6)}</span>
                            <span>·</span>
                            <span>
                              {new Date(entry.drawnAt).toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm font-bold text-ink">
                            Pemenang:{" "}
                            <span className="text-red-300">
                              {entry.winners.map((w) => w.name).join(", ")}
                            </span>
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                            <Users className="size-3.5" aria-hidden />
                            {entry.participants.length} peserta saat pengundian:
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted/90">
                            {entry.participants.map((p) => p.name).join(", ") || "—"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
