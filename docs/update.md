
## UPDATE REQUIREMENTS — GLOBAL WINNER UNIQUENESS & SESSION HISTORY

Ada dua aturan bisnis wajib yang harus diterapkan:

### 1. Global Unique Winner

- Setiap sesi hanya menghasilkan 1 pemenang.
- Pemenang dari sesi sebelumnya tidak boleh menjadi pemenang lagi di sesi mana pun.
- Sistem harus memeriksa seluruh histori pemenang dari 10 sesi sebelum melakukan pengundian.
- Peserta yang sudah pernah menang harus otomatis berstatus tidak eligible untuk pengundian berikutnya.
- Jika nama peserta yang sudah pernah menang dimasukkan kembali ke sesi lain, tetap tampilkan namanya, tetapi tandai sebagai "Sudah Menang" dan jangan izinkan namanya terpilih.
- Validasi harus dilakukan pada business logic, bukan hanya menyembunyikan nama melalui UI.
- Jangan menggunakan `Math.random()` untuk menentukan pemenang. Gunakan Web Crypto API dengan pemilihan indeks yang unbiased.

### 2. Session History

Setiap sesi wajib memiliki histori pengundian sendiri.

Data histori minimal:

- Nomor sesi.
- Daftar seluruh peserta pada saat pengundian.
- Nama pemenang.
- Tanggal dan waktu pengundian.
- Status sesi.

Histori harus:

- Bisa dilihat kembali melalui halaman atau panel histori setiap sesi.
- Tetap tersedia setelah browser di-refresh atau aplikasi ditutup.
- Tersimpan menggunakan LocalStorage.
- Tidak terhapus ketika berpindah sesi.
- Memiliki konfirmasi sebelum admin melakukan reset sesi.

### 3. Data Model

Sesuaikan arsitektur data agar histori tersimpan secara terstruktur. Contoh:

```ts
interface DrawHistory {
  id: string;
  sessionId: number;
  participants: Participant[];
  winner: Participant;
  drawnAt: string;
}

interface DrawSession {
  id: number;
  participants: Participant[];
  winner: Participant | null;
  history: DrawHistory[];
  status: "empty" | "ready" | "completed";
  drawnAt: string | null;
}
```

Silakan kembangkan struktur tersebut jika diperlukan, selama seluruh aturan bisnis tetap terpenuhi.

### 4. Project Setup dari Nol

Kondisi awal adalah direktori kosong. Kamu bertanggung jawab penuh untuk:

1. Memeriksa environment dan versi Node.js/npm.
2. Menginisialisasi project React + Vite + TypeScript.
3. Menginstal seluruh dependency yang diperlukan.
4. Mengonfigurasi Tailwind CSS, Framer Motion, dan Lucide React.
5. Membuat struktur folder dan arsitektur aplikasi.
6. Mengimplementasikan seluruh fitur berdasarkan PRD dan dokumentasi.
7. Menjalankan aplikasi dan memperbaiki seluruh error.
8. Melakukan pengujian fitur pengundian, histori, persistensi, dan validasi.
9. Memastikan aplikasi siap digunakan saat acara.

Jangan menganggap project, dependency, atau konfigurasi apa pun sudah tersedia. Lakukan setup secara mandiri dari direktori kosong.

### 5. Final Validation

Sebelum menyelesaikan pekerjaan, pastikan:

- Tidak ada pemenang yang sama di antara 10 sesi.
- Peserta yang sudah menang tidak eligible untuk pengundian selanjutnya.
- Histori masing-masing sesi tersimpan dan dapat dibuka kembali.
- Data tidak hilang setelah refresh.
- Tidak terjadi double draw akibat klik berulang.
- Reset sesi tidak menghapus histori tanpa konfirmasi.
- Tampilan tetap optimal untuk layar laptop dan proyektor landscape.
- Gunakan tema RED PREMIUM sesuai design system:
  - Primary: #DC2626
  - Deep Red: #991B1B
  - Background: #18181B
  - Surface: #27272A
  - Text: #FAFAFA
  - Muted: #A1A1AA

**PENTING:** Jangan hanya membuat mockup atau UI statis. Semua fitur harus benar-benar berfungsi dan terintegrasi dengan state management serta LocalStorage.
