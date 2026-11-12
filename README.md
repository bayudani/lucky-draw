# Lucky Draw — 10 Sesi Pengundian

Aplikasi web lucky draw untuk acara offline: satu perangkat (laptop/PC panitia), ditampilkan via monitor/proyektor landscape.

## Fitur

- 10 sesi pengundian, tepat satu pemenang per sesi.
- Input peserta massal (satu nama per baris), validasi trim/baris kosong/duplikat/batas maksimal.
- Semua nama tampil sebelum tombol Spin aktif (BR-05).
- **Global unique winner** (update requirement): peserta yang sudah menang ditandai "Sudah Menang" dan tidak bisa terpilih lagi di sesi mana pun.
- Pemilihan pemenang menggunakan Web Crypto API dengan rejection sampling (tanpa `Math.random()`).
- Animasi spin hanya memvisualisasikan hasil yang sudah dipilih; spin terkunci selama animasi.
- Histori pengundian per sesi (peserta saat diundi, pemenang, waktu) — persisten di LocalStorage.
- Backup/restore JSON dan ekspor rekap CSV.
- Reset sesi / reset acara dengan konfirmasi.
- Tema Red Premium: `#DC2626` / `#991B1B` / bg `#18181B` / surface `#27272A`.

## Menjalankan

```bash
npm install
npm run dev       # development
npm test          # unit test (vitest)
npm run build     # typecheck + production build
npm run preview   # preview hasil build
```

## Teknologi

React 19 · Vite · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide React · Web Crypto API · LocalStorage.

## Catatan operasional

- Data disimpan otomatis di LocalStorage perangkat & browser yang sama (key: `lucky-draw:v1`). Jalankan satu tab saja.
- Sebelum acara, unduh backup JSON dan simpan; gunakan Restore bila data hilang.
- Batas maksimal peserta per sesi default 30, dapat diubah di header.
