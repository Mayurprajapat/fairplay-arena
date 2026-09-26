// Fair Play Points ladder + level system (virtual points only, no monetary value)
export const LADDER = [100, 200, 300, 500, 700, 1000, 1500, 2000, 3000, 4000, 5000, 7000, 10000, 15000, 20000];

export const LEVELS = [
  { id: 1, name: "Fair Play Beginner", min: 0, max: 999, icon: "🌱" },
  { id: 2, name: "Clean Sport Learner", min: 1000, max: 2499, icon: "📘" },
  { id: 3, name: "Anti-Doping Explorer", min: 2500, max: 4999, icon: "🧭" },
  { id: 4, name: "Clean Sport Defender", min: 5000, max: 9999, icon: "🛡️" },
  { id: 5, name: "Fair Play Champion", min: 10000, max: 19999, icon: "🏆" },
  { id: 6, name: "Anti-Doping Expert", min: 20000, max: Infinity, icon: "🧠" },
];

export function levelFor(fpp) {
  return LEVELS.find((l) => fpp >= l.min && fpp <= l.max) || LEVELS[0];
}

export function progressToNext(fpp) {
  const lvl = levelFor(fpp);
  const idx = LEVELS.indexOf(lvl);
  if (idx === LEVELS.length - 1) return { pct: 100, remaining: 0, next: null };
  const next = LEVELS[idx + 1];
  const span = next.min - lvl.min;
  const pct = Math.min(100, Math.max(0, ((fpp - lvl.min) / span) * 100));
  return { pct, remaining: next.min - fpp, next };
}

export const fmt = (n) => n.toLocaleString("en-IN");
