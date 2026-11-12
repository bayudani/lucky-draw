import type { LuckyDrawState } from "../domain/types";
import { validateLuckyDrawState } from "./storage";

export class ImportValidationError extends Error {}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function exportJsonBackup(state: LuckyDrawState): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadBlob(
    JSON.stringify(state, null, 2),
    `lucky-draw-backup-${timestamp}.json`,
    "application/json",
  );
}

/** Parse + validasi file backup JSON. Lempar ImportValidationError bila tidak valid. */
export async function importJsonBackup(file: File): Promise<LuckyDrawState> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ImportValidationError("File bukan JSON yang valid.");
  }
  const state = validateLuckyDrawState(parsed);
  if (!state) {
    throw new ImportValidationError(
      "Struktur data backup tidak valid (schema version, jumlah sesi, atau tipe data tidak sesuai).",
    );
  }
  return state;
}

/** Escaping CSV: kutip ganda, koma, newline. */
export function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(state: LuckyDrawState): string {
  const header = [
    "session_number",
    "session_name",
    "winner_names",
    "winner_count",
    "drawn_at",
    "participant_count",
  ];
  const rows = [...state.sessions]
    .sort((a, b) => a.id - b.id)
    .map((session) =>
      [
        String(session.id),
        session.name.trim() !== "" ? session.name : `Sesi ${session.id}`,
        session.winners.length > 0 ? session.winners.map((w) => w.name).join("; ") : "",
        String(session.winners.length),
        session.drawnAt ?? "",
        String(session.participants.length),
      ].map(escapeCsvField),
    );
  return [header, ...rows].map((row) => row.join(",")).join("\r\n");
}

export function exportCsvResults(state: LuckyDrawState): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadBlob(buildCsv(state), `lucky-draw-rekap-${timestamp}.csv`, "text/csv");
}
