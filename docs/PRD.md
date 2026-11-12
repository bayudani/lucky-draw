# Product Requirements Document (PRD)

## Aplikasi Lucky Draw 10 Sesi

**Status:** Draft siap implementasi dengan beberapa asumsi yang perlu
dikonfirmasi\
**Target penggunaan:** Acara offline, dijalankan dari satu laptop/PC
panitia dan ditampilkan melalui monitor atau proyektor\
**Deadline proyek:** 12 November 2026, pukul 12.00 WIB

------------------------------------------------------------------------

## 1. Ringkasan Produk

Aplikasi web Lucky Draw digunakan panitia untuk melakukan pengundian
pemenang dalam 10 sesi acara. Total peserta yang diinformasikan adalah
175 orang. Peserta dimasukkan per sesi/batch; seluruh nama pada sesi
aktif harus terlihat sebelum pengundian. Setiap sesi menghasilkan tepat
satu pemenang ketika tombol Spin dijalankan.

Aplikasi ditujukan untuk penggunaan langsung saat acara, sehingga
antarmuka harus jelas dari jarak jauh, berorientasi landscape, mudah
dioperasikan, dan tahan terhadap refresh halaman.

## 2. Tujuan

1.  Mempermudah panitia mengelola daftar peserta untuk 10 sesi.
2.  Menampilkan semua nama peserta pada sesi aktif sebelum undian.
3.  Menghasilkan satu pemenang secara acak untuk setiap sesi.
4.  Mencegah pengundian ganda akibat klik berulang atau refresh.
5.  Menyimpan progres dan hasil agar tidak hilang saat halaman dimuat
    ulang.
6.  Menyediakan rekap hasil yang dapat diekspor.

## 3. Ruang Lingkup MVP

### 3.1 Fitur wajib

-   Dashboard dengan indikator 10 sesi.
-   Input nama peserta secara massal melalui textarea (satu nama per
    baris).
-   Validasi nama kosong dan duplikat dalam satu batch.
-   Batas input default maksimal 30 nama per sesi, dapat diubah melalui
    konfigurasi.
-   Preview seluruh nama peserta sebelum spin.
-   Pemilihan sesi 1 sampai 10.
-   Tombol Spin dengan animasi pengundian.
-   Tepat satu pemenang per sesi.
-   Tampilan pemenang yang menonjol.
-   Status sesi: Belum diisi, Siap diundi, Selesai.
-   Riwayat/rekap pemenang.
-   Penyimpanan otomatis menggunakan LocalStorage.
-   Backup dan restore data melalui file JSON.
-   Reset sesi dan reset seluruh acara dengan konfirmasi.
-   Tampilan landscape untuk laptop/proyektor.

### 3.2 Fitur tambahan jika waktu cukup

-   Export rekap pemenang ke CSV.
-   Mode fullscreen.
-   Efek confetti dan suara yang dapat dimatikan.
-   Print halaman rekap.
-   Indikator jumlah peserta total dan jumlah sesi selesai.

### 3.3 Di luar ruang lingkup

-   Login dan role pengguna.
-   Backend/API.
-   Database server.
-   Multi-device realtime synchronization.
-   Dashboard analitik kompleks.
-   Integrasi pembayaran atau layanan pihak ketiga.

## 4. Pengguna dan Skenario

**Pengguna utama:** panitia/operator acara.

Skenario utama: 1. Operator membuka aplikasi di laptop. 2. Operator
memilih sesi yang akan dijalankan. 3. Operator memasukkan nama peserta
sesi tersebut, satu nama per baris. 4. Aplikasi menampilkan seluruh nama
dan jumlah peserta. 5. Operator memeriksa daftar, lalu menekan tombol
Spin. 6. Aplikasi menjalankan animasi dan mengungkap satu pemenang. 7.
Hasil disimpan otomatis dan sesi ditandai selesai. 8. Operator berpindah
ke sesi berikutnya. 9. Setelah acara, operator mengekspor rekap.

## 5. Aturan Bisnis

  -----------------------------------------------------------------------
  ID                                  Aturan
  ----------------------------------- -----------------------------------
  BR-01                               Acara memiliki tepat 10 sesi.

  BR-02                               Total peserta yang diinformasikan
                                      adalah 175 orang; jumlah per sesi
                                      boleh berbeda.

  BR-03                               Default batas input adalah 30 nama
                                      per sesi.

  BR-04                               Satu sesi hanya menghasilkan satu
                                      pemenang.

  BR-05                               Nama peserta harus terlihat sebelum
                                      tombol Spin dapat digunakan.

  BR-06                               Sesi tanpa peserta tidak dapat
                                      diundi.

  BR-07                               Sesi yang sudah selesai tidak dapat
                                      diundi ulang melalui tombol Spin
                                      biasa.

  BR-08                               Hasil pemenang disimpan segera
                                      setelah proses undian selesai.

  BR-09                               Klik berulang selama animasi harus
                                      diabaikan/dicegah.

  BR-10                               Reset hasil harus meminta
                                      konfirmasi operator.
  -----------------------------------------------------------------------

### Kebijakan duplikasi lintas sesi

**Belum dikonfirmasi oleh pemilik acara.** Rekomendasi awal: peserta dan
pemenang dikelola per sesi; sistem tidak otomatis melarang nama yang
sama muncul di sesi berbeda. Jika panitia memastikan satu orang hanya
boleh menang sekali sepanjang acara, aktifkan aturan
`globalUniqueWinners` dan validasi nama lintas sesi.

Jangan menebak kebijakan ini dalam implementasi. Buat sebagai
konfigurasi yang mudah diubah.

## 6. Kriteria Penerimaan (Acceptance Criteria)

-   [ ] Operator dapat mengisi nama secara massal dengan satu nama per
    baris.
-   [ ] Spasi di awal/akhir nama dibersihkan.
-   [ ] Baris kosong diabaikan.
-   [ ] Nama duplikat dalam sesi yang sama diberi peringatan atau
    ditolak.
-   [ ] Semua nama tampil sebelum spin.
-   [ ] Spin menghasilkan tepat satu pemenang.
-   [ ] Pemilihan pemenang menggunakan Web Crypto API, bukan
    `Math.random()` untuk keputusan final.
-   [ ] Tombol Spin nonaktif selama animasi dan setelah sesi selesai.
-   [ ] Refresh halaman tidak menghilangkan data dan hasil yang
    tersimpan.
-   [ ] Satu sesi yang sudah selesai tidak dapat diundi ulang tanpa
    reset eksplisit.
-   [ ] Operator dapat mengunduh backup JSON dan mengembalikannya.
-   [ ] Layout dapat digunakan pada layar laptop/proyektor landscape.
-   [ ] Tidak ada error kritis di browser console pada alur utama.

## 7. Asumsi dan Pertanyaan Terbuka

1.  Apakah maksimal 30 nama berlaku untuk setiap sesi? **Asumsi
    implementasi: ya.**
2.  Apakah peserta boleh menang lagi di sesi berbeda? **Belum
    diputuskan; default lintas sesi tidak diblokir.**
3.  Apakah 175 nama merupakan total peserta unik yang dibagi ke 10 sesi,
    atau jumlah perkiraan? **Perlu konfirmasi panitia.**
4.  Apakah setiap sesi hanya satu kali undian? **Asumsi: ya, satu
    pemenang per sesi.**
5.  Apakah nama peserta akan disediakan dalam file atau diketik/paste
    oleh operator? **MVP mendukung paste manual.**

## 8. Risiko

  -----------------------------------------------------------------------
  Risiko                              Mitigasi
  ----------------------------------- -----------------------------------
  Browser tertutup/refresh            Autosave LocalStorage dan backup
                                      JSON

  Operator salah memasukkan nama      Preview dan edit daftar sebelum
                                      spin

  Klik Spin berkali-kali              State lock dan disable tombol

  Sesi terundi dua kali               Status selesai dan konfirmasi reset

  Data LocalStorage terhapus          Export/import JSON sebelum acara

  Ukuran layar/proyektor berbeda      CSS responsive dengan prioritas
                                      landscape

  Random modulo bias                  Rejection sampling menggunakan Web
                                      Crypto
  -----------------------------------------------------------------------




## 9. Prioritas

**P0 (wajib):** input peserta, preview, 10 sesi, spin, winner reveal,
persistence, pencegahan double spin.\
**P1 (penting):** backup/restore JSON, export CSV, reset terkonfirmasi.\
**P2 (nice-to-have):** fullscreen, suara, confetti, print.
