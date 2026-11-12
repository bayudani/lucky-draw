# Lucky Draw --- Agent Documentation

Dokumentasi kebutuhan dan implementasi aplikasi Lucky Draw 10 sesi.

## Daftar dokumen

-   `PRD.md` --- tujuan produk, ruang lingkup, aturan bisnis, acceptance
    criteria.
-   `DESIGN.md` --- arahan UI/UX, layout landscape, komponen, alur
    interaksi.
-   `ARCHITECTURE.md` --- stack, struktur folder, data model, random
    logic, persistence.
-   `TASKS.md` --- checklist dan urutan pengerjaan.
-   `AGENTS.md` --- instruksi dan batasan yang wajib diikuti AI coding
    agent.

## Cara menggunakan

1.  Salin seluruh folder dokumen ini ke root project.
2.  Minta coding agent membaca `AGENTS.md` terlebih dahulu.
3.  Minta agent membaca seluruh dokumen referensi sebelum mengubah file.
4.  Kerjakan P0 di `TASKS.md` terlebih dahulu.
5.  Konfirmasi aturan lintas sesi yang masih terbuka sebelum acara.

## Ringkasan keputusan

-   10 sesi pengundian.
-   Total peserta yang diinformasikan: 175.
-   Input nama per sesi/batch.
-   Default maksimal 30 nama per sesi.
-   Satu pemenang untuk setiap sesi.
-   Semua nama ditampilkan sebelum spin.
-   React + Vite + TypeScript.
-   Tanpa backend/database.
-   LocalStorage + backup JSON.
-   Landscape untuk laptop/proyektor.

## Hal yang perlu dikonfirmasi ke panitia

Apakah nama/pemenang yang sama boleh muncul kembali di sesi lain? Saat
ini dokumentasi menetapkan default tidak memblokir duplikasi lintas sesi
sampai ada keputusan.
