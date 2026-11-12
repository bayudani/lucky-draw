import { ArrowRightLeft, Gauge, Gift, List, Timer, Users, Volume2 } from "lucide-react";
import {
  MAX_SESSION_COUNT,
  MAX_SESSION_NAME_LENGTH,
  MAX_SPIN_DURATION_MS,
  MAX_SPIN_REVOLUTIONS,
  MIN_SESSION_COUNT,
  MIN_SPIN_DURATION_MS,
  MIN_SPIN_REVOLUTIONS,
  type DrawSession,
  type Settings,
} from "../../domain/types";
import { Modal } from "./Modal";

interface SettingsModalProps {
  open: boolean;
  settings: Settings;
  sessions: DrawSession[];
  onChange: (settings: Partial<Settings>) => void;
  onSetSessionName: (sessionId: number, name: string) => void;
  onClose: () => void;
}

const inputClass =
  "w-24 rounded-lg border border-line bg-background px-2 py-1.5 text-center text-sm font-bold text-ink outline-none focus:border-primary";

export function SettingsModal({
  open,
  settings,
  sessions,
  onChange,
  onSetSessionName,
  onClose,
}: SettingsModalProps) {
  return (
    <Modal open={open} title="Pengaturan Acara" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-muted">
          Perubahan langsung tersimpan otomatis di perangkat ini.
        </p>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-line bg-background px-4 py-3">
          <span className="flex items-center gap-3">
            <Users className="size-5 text-muted" aria-hidden />
            <span>
              <span className="block text-sm font-bold text-ink">Maksimal peserta per sesi</span>
              <span className="block text-xs text-muted">Default 30 (1–1000)</span>
            </span>
          </span>
          <input
            type="number"
            min={1}
            max={1000}
            value={settings.maxParticipantsPerSession}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isFinite(value) && value >= 1) {
                onChange({ maxParticipantsPerSession: value });
              }
            }}
            className={inputClass}
            aria-label="Maksimal peserta per sesi"
          />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-line bg-background px-4 py-3">
          <span className="flex items-center gap-3">
            <List className="size-5 text-muted" aria-hidden />
            <span>
              <span className="block text-sm font-bold text-ink">Jumlah sesi pengundian</span>
              <span className="block text-xs text-muted">
                Default 10 ({MIN_SESSION_COUNT}–{MAX_SESSION_COUNT})
              </span>
            </span>
          </span>
          <input
            type="number"
            min={MIN_SESSION_COUNT}
            max={MAX_SESSION_COUNT}
            value={settings.sessionCount}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isFinite(value) && value >= MIN_SESSION_COUNT) {
                onChange({ sessionCount: Math.round(value) });
              }
            }}
            className={inputClass}
            aria-label="Jumlah sesi pengundian"
          />
        </label>

        <div className="rounded-xl border border-line bg-background px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <Gift className="size-5 text-muted" aria-hidden />
            Nama sesi / hadiah
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Nama tampil besar di mode audiens &amp; kartu pemenang. Contoh: KULKAS, TV 50&quot;, Mesin
            Cuci. Kosongkan untuk &quot;Sesi 1&quot;.
          </p>
          <div className="mt-2 grid max-h-56 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {sessions.map((session) => (
              <label
                key={session.id}
                className="flex items-center gap-2 rounded-lg border border-line/70 bg-background px-2 py-1.5"
              >
                <span className="w-14 shrink-0 text-xs font-bold uppercase text-muted">
                  Sesi {session.id}
                </span>
                <input
                  type="text"
                  value={session.name}
                  maxLength={MAX_SESSION_NAME_LENGTH}
                  onChange={(event) => onSetSessionName(session.id, event.target.value)}
                  placeholder={`Sesi ${session.id}`}
                  className="w-full rounded-md border border-line bg-background px-2 py-1 text-sm font-semibold text-ink outline-none placeholder:text-muted/50 focus:border-primary"
                  aria-label={`Nama sesi ${session.id}`}
                />
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-line bg-background px-4 py-3">
          <span className="flex items-center gap-3">
            <Timer className="size-5 text-muted" aria-hidden />
            <span>
              <span className="block text-sm font-bold text-ink">Durasi pengundian</span>
              <span className="block text-xs text-muted">
                Lama drum berputar ({MIN_SPIN_DURATION_MS / 1000}–{MAX_SPIN_DURATION_MS / 1000} detik)
              </span>
            </span>
          </span>
          <span className="flex items-center gap-2">
            <input
              type="number"
              min={MIN_SPIN_DURATION_MS / 1000}
              max={MAX_SPIN_DURATION_MS / 1000}
              step={0.5}
              value={settings.spinDurationMs / 1000}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (Number.isFinite(value) && value >= MIN_SPIN_DURATION_MS / 1000) {
                  onChange({ spinDurationMs: Math.round(value * 1000) });
                }
              }}
              className={inputClass}
              aria-label="Durasi pengundian dalam detik"
            />
            <span className="text-sm font-bold text-muted">detik</span>
          </span>
        </label>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-line bg-background px-4 py-3">
          <span className="flex items-center gap-3">
            <Gauge className="size-5 text-muted" aria-hidden />
            <span>
              <span className="block text-sm font-bold text-ink">Kecepatan drum</span>
              <span className="block text-xs text-muted">
                Jumlah putaran penuh selama durasi ({MIN_SPIN_REVOLUTIONS}–{MAX_SPIN_REVOLUTIONS})
              </span>
            </span>
          </span>
          <input
            type="number"
            min={MIN_SPIN_REVOLUTIONS}
            max={MAX_SPIN_REVOLUTIONS}
            value={settings.spinRevolutions}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isFinite(value) && value >= MIN_SPIN_REVOLUTIONS) {
                onChange({ spinRevolutions: Math.round(value) });
              }
            }}
            className={inputClass}
            aria-label="Kecepatan drum dalam putaran"
          />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-line bg-background px-4 py-3">
          <span className="flex items-center gap-3">
            <ArrowRightLeft className="size-5 text-muted" aria-hidden />
            <span>
              <span className="block text-sm font-bold text-ink">
                Sisa peserta otomatis pindah ke sesi berikutnya
              </span>
              <span className="block text-xs text-muted">
                Setelah sesi selesai, nama yang belum menang langsung masuk ke sesi
                berikutnya — tidak perlu input ulang. Tetap bisa diedit/ditambah manual.
              </span>
            </span>
          </span>
          <input
            type="checkbox"
            checked={settings.autoCarryOverParticipants}
            onChange={(event) =>
              onChange({ autoCarryOverParticipants: event.target.checked })
            }
            className="size-5 accent-primary"
            aria-label="Sisa peserta otomatis pindah ke sesi berikutnya"
          />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-line bg-background px-4 py-3">
          <span className="flex items-center gap-3">
            <Volume2 className="size-5 text-muted" aria-hidden />
            <span>
              <span className="block text-sm font-bold text-ink">Efek suara</span>
              <span className="block text-xs text-muted">
                Suara mesin saat spin &amp; fanfare saat pemenang keluar. Dibangkitkan
                langsung, tanpa file — tetap jalan offline.
              </span>
            </span>
          </span>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(event) => onChange({ soundEnabled: event.target.checked })}
            className="size-5 accent-primary"
            aria-label="Efek suara"
          />
        </label>

        <div className="rounded-xl border border-primary/50 bg-deep/30 px-4 py-3 text-sm">
          <p className="font-bold text-red-200">Pemenang unik sepanjang acara: AKTIF (wajib)</p>
          <p className="mt-1 text-red-100/80">
            Peserta yang sudah pernah menang tidak dapat terpilih lagi di sesi mana pun.
          </p>
          <p className="mt-3 border-t border-primary/30 pt-2 text-xs text-muted">
            Catatan: mengurangi jumlah sesi akan menghapus sesi dari urutan terakhir
            beserta peserta, pemenang, dan historinya. Backup JSON disarankan sebelum
            mengubah.
          </p>
        </div>
      </div>
    </Modal>
  );
}
