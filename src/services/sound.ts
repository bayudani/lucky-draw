/**
 * Efek suara sintesis Web Audio — TANPA file asset, jadi aman offline
 * (PWA precache tetap self-contained). Semua suara dibangkitkan on-the-fly:
 * - spin: tick-tick berkala seperti mesin undian
 * - menang: fanfare "ta-da" naik (C5-E5-G5-C6)
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;
let tickTimer: number | null = null;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Nyalakan/matikan semua efek suara (toggle Pengaturan). */
export function setSoundEnabled(value: boolean): void {
  enabled = value;
  if (!value) stopSpinSound();
}

/** Nada tunggal dengan envelope attack/decay. */
function tone(
  freq: number,
  startAt: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  slideTo?: number,
): void {
  const c = ensureContext();
  if (!c || !master) return;
  const t0 = c.currentTime + startAt;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
  }
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

/** Klik kecil — suara tiap "langkah" drum. */
function tick(): void {
  if (!enabled) return;
  tone(2300, 0, 0.035, "square", 0.1);
}

/** Mulai suara spin: tick-tick berkala seperti mesin undian (tanpa gemuruh/buzz). */
export function startSpinSound(): void {
  if (!enabled) return;
  ensureContext();
  // tick-tick tiap ~150ms seperti bola undian
  tickTimer = window.setInterval(tick, 150);
}

/** Hentikan suara spin (saat pemenang keluar / sesi berubah). */
export function stopSpinSound(): void {
  if (tickTimer !== null) {
    window.clearInterval(tickTimer);
    tickTimer = null;
  }
}

/** Fanfare "ta-da" saat pemenang muncul — C5 E5 G5 C6 + akor penutup. */
export function playWinSound(): void {
  if (!enabled) return;
  const arpeggio = [523.25, 659.25, 783.99, 1046.5];
  arpeggio.forEach((freq, index) => {
    tone(freq, index * 0.13, 0.55, "triangle", 0.22);
  });
  // akor penutup (C6 + G5) lebih panjang
  tone(1046.5, 0.52, 1.1, "triangle", 0.26);
  tone(783.99, 0.52, 1.1, "triangle", 0.2);
  tone(1318.5, 0.52, 1.1, "triangle", 0.12);
}
