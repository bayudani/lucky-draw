# UI/UX Design Specification

## Aplikasi Lucky Draw 10 Sesi

## 1. Arah Visual

-   Orientasi utama: landscape.
-   Target utama: laptop 1366×768 atau lebih besar, ditampilkan melalui
    proyektor.
-   Gaya: premium event, modern, fokus pada keterbacaan dari jarak jauh.
-   Tema yang disarankan: navy/dark charcoal dengan aksen gold atau
    amber.
-   Hindari terlalu banyak ornamen, gradient berat, dan teks kecil.
-   Pastikan kontras tinggi dan tombol Spin sangat mudah ditemukan.

## 2. Struktur Halaman

### Header

-   Nama acara (default: "Lucky Draw").
-   Label "10 Sesi Pengundian".
-   Indikator progres, misalnya "3/10 sesi selesai".
-   Tombol Fullscreen.
-   Menu backup/restore dan pengaturan ditempatkan di area sekunder.

### Navigasi sesi

-   Tampilkan 10 tab/kartu sesi.
-   Setiap sesi memiliki status visual:
    -   Belum diisi: netral.
    -   Siap diundi: aksen biru/amber.
    -   Selesai: hijau atau tanda centang.
-   Sesi aktif harus terlihat jelas.
-   Sesi selesai tetap dapat dibuka untuk melihat pemenang, tetapi tidak
    dapat spin ulang tanpa reset.

### Area utama (landscape)

Gunakan grid dua kolom: - Kolom kiri (sekitar 60--65%): daftar
peserta. - Kolom kanan (sekitar 35--40%): kontrol undian dan hasil.

**Kolom kiri --- Peserta** - Judul "Peserta Sesi X". - Counter "18
peserta". - Grid nama dalam beberapa kolom, bukan daftar panjang satu
kolom. - Nama harus tetap terbaca di layar proyektor. - Sebelum data
tersedia, tampilkan empty state dan tombol "Tambah Peserta". - Operator
dapat membuka editor untuk paste nama satu per baris.

**Kolom kanan --- Pengundian** - Area visual spin/animasi nama. - Tombol
utama besar "SPIN SEKARANG". - Informasi jumlah peserta. - Setelah hasil
keluar, tampilkan winner card yang dominan. - Tombol aksi setelah hasil:
"Lanjut ke Sesi Berikutnya" dan "Lihat Rekap".

## 3. Alur Input Peserta

1.  Operator memilih sesi.
2.  Klik "Tambah/Edit Peserta".
3.  Modal atau panel menampilkan textarea.
4.  Placeholder: "Masukkan satu nama per baris".
5.  Tampilkan jumlah nama valid secara live.
6.  Validasi maksimal 30 nama (nilai konfigurasi).
7.  Tampilkan daftar hasil parsing dan duplikasi.
8.  Operator menekan "Simpan Peserta".
9.  Daftar peserta tampil di grid utama.

Jangan menampilkan textarea besar permanen di layar undian; layar utama
harus fokus pada nama dan proses undian.

## 4. Alur Spin dan Winner Reveal

1.  Operator menekan tombol Spin.
2.  Tombol berubah menjadi disabled dan label "Mengundi...".
3.  Nama/indikator bergerak selama durasi animasi sekitar 3--5 detik.
4.  Animasi berhenti pada pemenang yang sudah dipilih secara acak oleh
    logic aplikasi.
5.  Tampilkan winner reveal dengan nama besar, confetti singkat, dan
    label "PEMENANG SESI X".
6.  Simpan pemenang dan ubah status sesi menjadi selesai.
7.  Tampilkan tombol lanjut.

**Penting:** animasi hanya memvisualisasikan hasil random yang telah
ditentukan. Jangan memilih pemenang berdasarkan posisi animasi atau
mengubah hasil setelah animasi dimulai.

## 5. Komponen UI

-   `AppHeader`
-   `SessionNavigation`
-   `SessionStatusBadge`
-   `ParticipantGrid`
-   `ParticipantInputDialog`
-   `ParticipantCount`
-   `SpinPanel`
-   `SpinAnimation`
-   `WinnerReveal`
-   `WinnerHistory`
-   `ConfirmDialog`
-   `BackupRestoreControls`
-   `FullscreenButton`
-   `Toast/Notification`

## 6. Responsiveness

-   Desktop landscape adalah prioritas utama.
-   Pada lebar di bawah 900px, kolom dapat ditumpuk.
-   Pada portrait/mobile, tampilkan peringatan ringan "Untuk pengalaman
    terbaik, gunakan mode landscape" tetapi tetap fungsional.
-   Jangan mengandalkan hover untuk fungsi penting.
-   Pastikan tombol utama tetap terlihat tanpa scroll pada layar 768px
    tinggi.

## 7. Aksesibilitas dan Operasional

-   Tombol memiliki label yang jelas.
-   Status sesi tidak hanya dibedakan dengan warna; gunakan teks/icon
    juga.
-   Modal dapat ditutup dengan tombol yang jelas.
-   Konfirmasi sebelum reset.
-   Animasi tidak boleh menghalangi operator menggunakan kontrol setelah
    selesai.
-   Sediakan opsi mematikan suara/efek bila sempat.

## 8. Copywriting UI

  Kondisi             Teks
  ------------------- ----------------------------------------------
  Belum ada peserta   "Belum ada peserta di sesi ini"
  Input peserta       "Tempel nama peserta, satu nama per baris"
  Siap spin           "Semua siap? Saatnya menentukan pemenang!"
  Sedang spin         "Sedang mengundi..."
  Pemenang            "SELAMAT KEPADA PEMENANG!"
  Sesi selesai        "Pengundian sesi ini telah selesai"
  Konfirmasi reset    "Reset sesi ini? Hasil undian akan dihapus."


UPDATE DESIGN SYSTEM:

Gunakan Red Premium Theme.
Primary: #DC2626
Deep Red: #991B1B
Background: #18181B
Surface: #27272A
Text: #FAFAFA
Muted: #A1A1AA

Terapkan secara konsisten ke seluruh komponen.
Jangan gunakan navy/blue sebagai warna dominan.
Jadikan tombol SPIN sebagai elemen visual paling menonjol.