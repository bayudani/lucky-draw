# Architecture & Technical Specification

## Aplikasi Lucky Draw 10 Sesi

## 1. Keputusan Arsitektur

Gunakan Single Page Application (SPA): - React - Vite - TypeScript
(direkomendasikan untuk mengurangi kesalahan state/data) - Tailwind
CSS - Framer Motion untuk animasi - Lucide React untuk ikon - Browser
Web Crypto API untuk random selection - LocalStorage untuk persistensi -
Vercel untuk deployment static

Tidak diperlukan backend, API server, atau database untuk MVP
single-device.

## 2. Gambaran Arsitektur

``` text
Browser
└── React SPA
    ├── UI Components
    │   ├── Session Navigation
    │   ├── Participant Editor/Grid
    │   ├── Spin Panel/Animation
    │   └── Winner History
    ├── Domain Logic
    │   ├── participantParser
    │   ├── sessionRules
    │   └── secureRandom
    ├── State Layer
    │   └── useLuckyDraw / reducer
    └── Persistence Layer
        ├── LocalStorage adapter
        ├── JSON export/import
        └── CSV export
```

## 3. Struktur Folder yang Disarankan

``` text
src/
├── app/
│   ├── App.tsx
│   └── providers.tsx
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx
│   │   └── SessionNavigation.tsx
│   ├── participants/
│   │   ├── ParticipantGrid.tsx
│   │   └── ParticipantInputDialog.tsx
│   ├── draw/
│   │   ├── SpinPanel.tsx
│   │   ├── SpinAnimation.tsx
│   │   └── WinnerReveal.tsx
│   ├── history/
│   │   └── WinnerHistory.tsx
│   └── common/
│       ├── ConfirmDialog.tsx
│       └── FullscreenButton.tsx
├── hooks/
│   └── useLuckyDraw.ts
├── domain/
│   ├── types.ts
│   ├── participantParser.ts
│   ├── drawWinner.ts
│   └── sessionRules.ts
├── services/
│   ├── storage.ts
│   └── exportImport.ts
├── styles/
│   └── index.css
└── main.tsx
```

Struktur ini rekomendasi; agent boleh menyederhanakan jika mempercepat
delivery, tetapi pisahkan logic random dan persistence dari komponen UI.

## 4. Data Model

``` ts
type SessionStatus = "empty" | "ready" | "completed";

interface Participant {
  id: string;
  name: string;
}

interface DrawSession {
  id: number;                 // 1..10
  participants: Participant[];
  winner: Participant | null;
  status: SessionStatus;
  drawnAt: string | null;      // ISO timestamp
}

interface LuckyDrawState {
  schemaVersion: 1;
  eventName: string;
  sessions: DrawSession[];
  settings: {
    maxParticipantsPerSession: number; // default 30
    globalUniqueWinners: boolean;       // default false sampai dikonfirmasi
  };
  updatedAt: string;
}
```

## 5. State dan Transisi

State utama disimpan dalam satu reducer atau custom hook. Jangan
menyebar sumber kebenaran ke banyak `useState` yang saling tidak
sinkron.

Transisi sesi: - `empty` → `ready`: peserta valid disimpan. - `ready` →
`completed`: satu pemenang berhasil dipilih dan disimpan. - `completed`
→ `ready`/`empty`: hanya melalui reset eksplisit.

Selama animasi, gunakan state UI sementara `isSpinning`; state ini tidak
perlu menjadi status bisnis sesi.

## 6. Random Selection yang Aman

Gunakan Web Crypto API, bukan `Math.random()` untuk keputusan pemenang.

Pseudocode unbiased integer: 1. Untuk `n` peserta, tentukan
`range = 2^32`. 2. Hitung `limit = floor(range / n) * n`. 3. Ambil
`Uint32Array(1)` menggunakan `crypto.getRandomValues`. 4. Jika angka \>=
limit, ambil ulang. 5. Kembalikan `angka % n`.

Contoh implementasi:

``` ts
export function secureRandomIndex(length: number): number {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("Jumlah peserta harus lebih dari 0");
  }

  const range = 0x1_0000_0000;
  const limit = Math.floor(range / length) * length;
  const value = new Uint32Array(1);

  do {
    crypto.getRandomValues(value);
  } while (value[0] >= limit);

  return value[0] % length;
}
```

Pemilihan pemenang dilakukan satu kali ketika operator menekan Spin.
Simpan kandidat pemenang di state proses, kemudian jalankan animasi
menuju hasil tersebut. Jangan melakukan random berulang selama animasi.

## 7. Persistence

Gunakan satu key versioned, misalnya `lucky-draw:v1`.

Ketentuan: - Load state saat aplikasi pertama dibuka. - Jika belum ada
data, buat 10 sesi kosong. - Autosave setiap perubahan state yang
valid. - Tangani JSON rusak dengan pesan error dan opsi reset; jangan
diam-diam menimpa data. - Validasi schema saat load/import. - Simpan
timestamp ISO. - Jangan menyimpan state `isSpinning` sebagai sesi
completed. - Export JSON sebelum acara sebagai backup.

LocalStorage hanya tersedia pada browser/perangkat yang sama dan origin
yang sama. Data tidak otomatis sinkron antar perangkat atau browser.

## 8. Import/Export

### JSON backup

-   Export seluruh `LuckyDrawState` beserta `schemaVersion`.
-   Import harus memvalidasi struktur, 10 sesi, tipe data, dan batas
    peserta.
-   Tampilkan konfirmasi sebelum menimpa data saat ini.
-   Jangan menerima file yang tidak valid.

### CSV hasil

Kolom minimal:
`session_number, session_name, winner_name, drawn_at, participant_count`

Lakukan escaping CSV dengan benar untuk koma, tanda kutip, dan newline.

## 9. Aturan Validasi

-   Trim nama.
-   Abaikan baris kosong.
-   Batasi panjang nama secara wajar, misalnya 100 karakter.
-   Deteksi nama duplikat dalam sesi setelah normalisasi trim +
    lowercase.
-   Jangan mengubah kapitalisasi nama yang ditampilkan.
-   Batasi maksimal 30 nama per sesi secara default.
-   Sesi harus memiliki minimal satu peserta untuk dapat diundi.
-   Jika `globalUniqueWinners=true`, validasi nama pemenang terhadap
    sesi lain.

## 10. Keamanan dan Integritas Operasional

-   Tidak ada secret/API key di frontend.
-   Jangan mengklaim LocalStorage sebagai database yang aman atau tahan
    manipulasi.
-   Nonaktifkan tombol selama proses spin.
-   Pastikan hasil ditulis ke state/persistence sekali saja.
-   Reset memerlukan konfirmasi.
-   Untuk acara penting, operator harus mengunduh backup JSON sebelum
    acara.
-   Jalankan pada satu perangkat dan satu tab browser untuk menghindari
    konflik LocalStorage antartab.

## 11. Deployment

-   Build: `npm run build`.
-   Preview lokal: `npm run preview`.
-   Deploy folder build ke Vercel atau static hosting.
-   Tidak membutuhkan environment variables.
-   Tes URL production di perangkat yang akan digunakan.
-   Pastikan fullscreen dan audio (jika ada) diuji di browser target.
