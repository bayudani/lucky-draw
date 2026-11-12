import {
  CheckCircle2,
  ChevronRight,
  Download,
  FileSpreadsheet,
  ListPlus,
  MousePointerClick,
  PlayCircle,
  Projector,
  Save,
  Trophy,
  Users,
  Volume2,
  Wifi,
} from "lucide-react";
import { Modal } from "./Modal";

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
}

interface Step {
  icon: typeof Users;
  title: string;
  body: string[];
  accent?: string;
}

const STEPS: Step[] = [
  {
    icon: ListPlus,
    title: "Atur jumlah sesi & nama hadiah",
    body: [
      "Klik tombol “Pengaturan” di kanan atas.",
      "Atur “Jumlah sesi pengundian” (misal 10).",
      "Isi “Nama sesi / hadiah”, contoh: KULKAS, TV, Mesin Cuci. Kosong = otomatis “Sesi 1”, “Sesi 2”, dst.",
      "Nama ini yang tampil besar di layar audiens, di atas kotak undian.",
    ],
  },
  {
    icon: Users,
    title: "Masukkan peserta",
    body: [
      "Pilih sesi di bagian atas, lalu klik “Tambah Peserta”.",
      "Tulis nama peserta: SATU NAMA PER BARIS, lalu klik Simpan.",
      "Peserta yang SUDAH PERNAH MENANG di sesi lain otomatis tidak ikut diundi. Bisa langsung dihapus lewat tombol “Hapus N Sudah Menang”.",
      "Peserta juga bisa ditambah ke sesi mana pun kapan saja.",
    ],
  },
  {
    icon: Trophy,
    title: "Atur berapa pemenang per sesi",
    body: [
      "Di panel sesi, gunakan tombol − / + di samping tulisan “Pemenang” (1–100).",
      "Jumlah pemenang TIDAK BOLEH melebihi jumlah nama yang tersedia. Kalau lebih, muncul peringatan merah dan tombol SPIN otomatis nonaktif.",
      "Contoh: sisa 5 nama → maksimal 5 pemenang.",
    ],
  },
  {
    icon: PlayCircle,
    title: "Mulai pengundian (SPIN)",
    body: [
      "Pastikan sesi berstatus “Siap diundi”, lalu klik tombol merah SPIN.",
      "Saat animasi berjalan, bisa klik “Stop & Tampilkan Pemenang”. Hasil undian TIDAK berubah, pemenang langsung muncul.",
      "Setelah selesai, sisa nama yang belum menang OTOMATIS pindah ke sesi berikutnya. Tidak perlu input ulang.",
      "Pemenang yang sudah keluar TIDAK BISA menang lagi di sesi mana pun (aturan pemenang unik).",
    ],
  },
  {
    icon: Projector,
    title: "Tampilkan ke layar / proyektor",
    body: [
      "Klik “Mode Audiens” untuk tampilan besar: nama hadiah di atas, kotak undian di tengah, pemenang tampil fullscreen.",
      "Pakai tombol Fullscreen agar layar penuh. Tekan ESC untuk keluar.",
      "Suara pemenang (fanfare) otomatis berbunyi. Bisa dimatikan di Pengaturan.",
    ],
  },
  {
    icon: Save,
    title: "Backup data (simpan cadangan)",
    body: [
      "Klik tombol “Menu” di kanan atas, lalu pilih “Backup (simpan data)”.",
      "Satu file cadangan (.json) otomatis terunduh ke komputer/HP.",
      "Simpan file itu di tempat aman: Flashdisk, Google Drive, atau kirim ke diri sendiri lewat WhatsApp/email.",
      "Lakukan backup sebelum acara dimulai dan setiap selesai mengundi, supaya data tidak hilang.",
      "Backup juga WAJIB dilakukan sebelum “Reset Seluruh Acara”.",
    ],
  },
  {
    icon: Download,
    title: "Restore data (pulihkan cadangan)",
    body: [
      "Klik tombol “Menu”, lalu pilih “Restore (pulihkan data)”.",
      "Pilih file backup (.json) yang sudah disimpan tadi.",
      "Akan muncul konfirmasi. Data saat ini tetap aman sampai Anda menekan “Ya” untuk memulihkan.",
      "Setelah dipulihkan, semua data kembali persis seperti saat backup dibuat: peserta, pemenang, nama sesi, dan pengaturan.",
    ],
  },
  {
    icon: FileSpreadsheet,
    title: "Rekap CSV (tabel untuk Excel)",
    body: [
      "Klik tombol “Menu”, lalu pilih “Rekap CSV (Excel)”.",
      "File .csv terunduh dan bisa dibuka dengan Excel/Google Sheets.",
      "Isinya: nomor sesi, nama sesi, nama pemenang, jumlah pemenang, waktu undian, dan jumlah peserta.",
    ],
  },
  {
    icon: Wifi,
    title: "Bisa dipakai tanpa internet",
    body: [
      "Cukup buka sekali dengan internet. Setelah itu aplikasi tersimpan di perangkat.",
      "Selanjutnya bisa dibuka tanpa internet, kapan saja, di perangkat yang sama.",
      "Data peserta tersimpan di perangkat itu (LocalStorage), bukan di server.",
    ],
  },
  {
    icon: Volume2,
    title: "Efek suara",
    body: [
      "Suara mesin saat spin & fanfare saat menang, aktif secara bawaan.",
      "Kalau tidak ingin bunyi, matikan “Efek suara” di Pengaturan.",
    ],
  },
  {
    icon: CheckCircle2,
    title: "Catatan penting",
    body: [
      "“Spin Ulang” membatalkan pemenang sesi itu dan mengundinya lagi.",
      "“Reset Acara” menghapus SEMUA peserta & pemenang. Hati-hati, lakukan backup dulu.",
      "“Reset Sesi” mengosongkan satu sesi saja (peserta tetap di sesi sebelumnya).",
    ],
    accent: "amber",
  },
];

export function GuideModal({ open, onClose }: GuideModalProps) {
  return (
    <Modal open={open} title="Panduan Penggunaan" onClose={onClose} wide>
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-primary/40 bg-deep/30 px-4 py-3">
          <MousePointerClick className="mt-0.5 size-5 shrink-0 text-red-200" aria-hidden />
          <p className="text-sm leading-relaxed text-red-100/90">
            Ikuti langkah-langkah di bawah secara urut. Semua tombol disebutkan persis
            seperti yang terlihat di layar. Tidak ada istilah teknis.
          </p>
        </div>

        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className={`rounded-xl border bg-background px-4 py-3.5 ${
                step.accent === "amber" ? "border-amber-500/40" : "border-line"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-black ${
                    step.accent === "amber"
                      ? "bg-amber-400/20 text-amber-200"
                      : "bg-primary/15 text-red-200"
                  }`}
                >
                  {index + 1}
                </span>
                <Icon
                  className={`size-5 shrink-0 ${
                    step.accent === "amber" ? "text-amber-300" : "text-muted"
                  }`}
                  aria-hidden
                />
                <h3 className="text-sm font-black uppercase tracking-wide text-ink">
                  {step.title}
                </h3>
              </div>
              <ul className="mt-3 space-y-2 pl-11">
                {step.body.map((line, lineIndex) => (
                  <li
                    key={lineIndex}
                    className="flex items-start gap-2 text-sm leading-relaxed text-muted"
                  >
                    <ChevronRight
                      className={`mt-0.5 size-4 shrink-0 ${
                        step.accent === "amber" ? "text-amber-400" : "text-primary/70"
                      }`}
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        <p className="rounded-xl border border-line bg-background px-4 py-3 text-center text-xs font-semibold text-muted">
          Masih bingung? Hubungi tim yang menyiapkan aplikasi ini. Jangan sungkan bertanya.
        </p>
      </div>
    </Modal>
  );
}
