// LocalStorage persistence for Anti-Doping Champion
const KEY = "adc_save_v1";

export const defaultSave = () => ({
  name: "",
  fpp: 0,
  answered: 0,
  correct: 0,
  gamesPlayed: 0,
  bestScore: 0,
  lifelinesUsedTotal: 0,
  achievements: [],
  rewards: [],
  jersey: false,
  expertBadge: false,
  muted: false,
  voiceOff: false,
  lastPlayed: null,
});

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    return { ...defaultSave(), ...JSON.parse(raw) };
  } catch {
    return defaultSave();
  }
}

export function persistSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch { /* storage unavailable */ }
}
