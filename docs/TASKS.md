# Development Tasks & Execution Plan

## Target

Aplikasi siap digunakan sebelum 12 November 2026 pukul 12.00 WIB.

## Prioritas P0 --- wajib selesai

### Project setup

-   [ ] Buat project Vite + React + TypeScript.
-   [ ] Pasang Tailwind CSS sesuai versi yang kompatibel.
-   [ ] Pasang Framer Motion dan Lucide React.
-   [ ] Siapkan lint/build script.

### Domain logic

-   [ ] Definisikan TypeScript types.
-   [ ] Buat factory untuk 10 sesi kosong.
-   [ ] Buat parser input nama per baris.
-   [ ] Buat validasi batas 30 nama per sesi.
-   [ ] Buat validasi nama duplikat.
-   [ ] Implementasikan secure random index dengan Web Crypto.
-   [ ] Buat fungsi draw winner yang murni dan mudah dites.

### Persistence

-   [ ] Load initial state dari LocalStorage.
-   [ ] Autosave state.
-   [ ] Tangani data rusak dan schema version.
-   [ ] Buat JSON export/import.

### UI

-   [ ] Header dan progress 10 sesi.
-   [ ] Navigasi sesi.
-   [ ] Dialog input peserta.
-   [ ] Grid semua peserta.
-   [ ] Panel spin.
-   [ ] Animasi spin.
-   [ ] Winner reveal.
-   [ ] Riwayat pemenang.
-   [ ] Konfirmasi reset.

### Quality assurance

-   [ ] Tes sesi kosong tidak dapat di-spin.
-   [ ] Tes satu peserta.
-   [ ] Tes 30 peserta.
-   [ ] Tes nama duplikat.
-   [ ] Tes double click saat spin.
-   [ ] Tes refresh setelah input.
-   [ ] Tes refresh setelah pemenang keluar.
-   [ ] Tes sesi selesai tidak dapat spin ulang.
-   [ ] Tes export/import JSON.
-   [ ] Tes build production.

## Prioritas P1 --- jika P0 selesai

-   [ ] Export CSV.
-   [ ] Fullscreen.
-   [ ] Confetti.
-   [ ] Pengaturan suara.
-   [ ] Print rekap.

## Urutan implementasi yang disarankan

1.  Setup project dan data model.
2.  Implementasi parser, validation, dan random logic.
3.  Implementasi LocalStorage.
4.  Implementasi dashboard dan session navigation.
5.  Implementasi input dan preview nama.
6.  Implementasi spin animation dan winner reveal.
7.  Implementasi backup/export.
8.  Testing end-to-end.
9.  Deployment dan smoke test.

## Definition of Done

Sebuah fitur dianggap selesai jika: - Berfungsi pada alur utama. - Tidak
merusak data sesi lain. - Memiliki validasi/error state yang masuk
akal. - Tidak menghasilkan error console kritis. - Teruji minimal pada
skenario normal dan edge case. - Build production berhasil.

## Catatan untuk AI Agent

-   Baca `AGENTS.md`, `PRD.md`, `DESIGN.md`, dan `ARCHITECTURE.md`
    sebelum coding.
-   Jangan menambahkan backend/database tanpa kebutuhan baru yang
    disetujui.
-   Jangan mengganti stack tanpa alasan teknis yang kuat.
-   Jangan mengarang kebijakan bisnis yang belum dikonfirmasi.
-   Prioritaskan P0. Jangan mengerjakan P1 sebelum alur pengundian utama
    stabil.
-   Setelah setiap tahap, jalankan build dan perbaiki error sebelum
    lanjut.
-   Laporkan file yang diubah, fitur selesai, tes yang dijalankan, dan
    risiko tersisa.
