/**
 * Pemilihan indeks acak yang unbiased menggunakan Web Crypto API.
 * Menggunakan rejection sampling untuk menghindari modulo bias.
 * JANGAN gunakan Math.random() untuk keputusan pemenang.
 */
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

/**
 * Fungsi murni untuk memilih indeks pemenang dari daftar kandidat.
 * `randomIndex` disuntikkan agar mudah dites; default memakai Web Crypto.
 */
export function drawWinnerIndex(
  candidateCount: number,
  randomIndex: (count: number) => number = secureRandomIndex,
): number {
  return randomIndex(candidateCount);
}
