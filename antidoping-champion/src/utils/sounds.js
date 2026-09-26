// Original synthesized sound effects (WebAudio, no copyrighted audio)
let ctx = null;
let muted = false;

export function setMuted(m) {
  muted = m;
}
export function isMuted() {
  return muted;
}

function ac() {
  if (muted) return null;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(f0, f1, dur, type = "sine", vol = 0.18, delay = 0) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(dur, vol = 0.2, lp = 1200, delay = 0) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + delay;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = a.createBufferSource();
  s.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = lp;
  const g = a.createGain();
  g.gain.value = vol;
  s.connect(f);
  f.connect(g);
  g.connect(a.destination);
  s.start(t);
}

export const sfx = {
  start() {
    tone(392, 392, 0.12, "triangle", 0.2);
    tone(523, 523, 0.12, "triangle", 0.2, 0.1);
    tone(659, 659, 0.22, "triangle", 0.22, 0.2);
    noise(0.3, 0.05, 5000, 0.1);
  },
  transition() {
    tone(400, 900, 0.18, "sine", 0.12);
  },
  select() {
    tone(700, 700, 0.07, "triangle", 0.14);
  },
  lock() {
    tone(500, 500, 0.09, "square", 0.1);
    tone(750, 750, 0.12, "square", 0.1, 0.08);
  },
  correct() {
    tone(523, 523, 0.12, "triangle", 0.22);
    tone(659, 659, 0.12, "triangle", 0.22, 0.1);
    tone(784, 784, 0.12, "triangle", 0.22, 0.2);
    tone(1046, 1046, 0.3, "triangle", 0.24, 0.3);
    noise(0.5, 0.05, 6000, 0.3);
  },
  wrong() {
    tone(240, 120, 0.35, "sawtooth", 0.18);
    noise(0.25, 0.12, 700);
  },
  lifeline() {
    tone(660, 990, 0.2, "sine", 0.16);
    tone(990, 1320, 0.2, "sine", 0.14, 0.15);
  },
  levelup() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, 0.16, "triangle", 0.2, i * 0.09));
    noise(0.6, 0.05, 7000, 0.3);
  },
  redeem() {
    tone(784, 784, 0.1, "square", 0.12);
    tone(1046, 1046, 0.2, "square", 0.12, 0.09);
  },
  achievement() {
    tone(880, 880, 0.1, "triangle", 0.2);
    tone(1174, 1174, 0.22, "triangle", 0.2, 0.1);
  },
  victory() {
    [523, 523, 659, 784, 784, 1046].forEach((f, i) => tone(f, f, 0.18, "triangle", 0.2, i * 0.13));
    noise(0.9, 0.06, 8000, 0.4);
  },
  tick() {
    tone(1000, 1000, 0.05, "square", 0.07);
  },
};
