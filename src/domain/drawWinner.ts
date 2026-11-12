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

/**
 * Pilih `count` indeks pemenang yang SEMUA BERBEDA dari pool kandidat
 * (tanpa replacement — satu orang tidak menang dua kali dalam sesi yang sama).
 * Partial Fisher-Yates: tetap berbasis Web Crypto (rejection sampling via
 * `randomIndex`) dan selalu berhenti, bahkan dengan random yang patologis.
 */
export function drawDistinctWinnerIndices(
  candidateCount: number,
  count: number,
  randomIndex: (count: number) => number = secureRandomIndex,
): number[] {
  if (!Number.isInteger(candidateCount) || candidateCount <= 0) {
    throw new Error("Jumlah kandidat harus lebih dari 0");
  }
  const wanted = Math.max(0, Math.min(count, candidateCount));
  if (wanted === 0) return [];
  if (wanted === candidateCount) {
    return Array.from({ length: candidateCount }, (_, i) => i);
  }
  const pool = Array.from({ length: candidateCount }, (_, i) => i);
  for (let i = 0; i < wanted; i += 1) {
    const j = i + randomIndex(candidateCount - i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, wanted);
}
