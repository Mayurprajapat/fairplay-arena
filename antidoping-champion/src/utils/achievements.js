// Achievement definitions + unlock checks
export const ACHIEVEMENTS = [
  { id: "beginner", name: "Fair Play Beginner", icon: "🏅", desc: "Answer your first question", test: (s) => s.answered >= 1 },
  { id: "learner", name: "Clean Sport Learner", icon: "🏅", desc: "Reach 1,000 FPP", test: (s) => s.fpp >= 1000 },
  { id: "explorer", name: "Anti-Doping Explorer", icon: "🏅", desc: "Reach 2,500 FPP", test: (s) => s.fpp >= 2500 },
  { id: "streak5", name: "Hot Streak", icon: "🔥", desc: "Answer 5 in a row correctly", test: (s, ctx) => (ctx?.bestStreak || 0) >= 5 },
  { id: "perfect", name: "Perfect Score", icon: "🎯", desc: "15/15 correct in one game", test: (s, ctx) => ctx?.gameCorrect === 15 },
  { id: "speed", name: "Speed Champion", icon: "⚡", desc: "Answer correctly within 8 seconds", test: (s, ctx) => (ctx?.fastCorrect || 0) >= 1 },
  { id: "nolifeline", name: "Pure Champion", icon: "💎", desc: "Finish a game using no lifelines", test: (s, ctx) => ctx?.gameDone && (ctx?.lifelinesUsed || 0) === 0 && (ctx?.gameCorrect || 0) >= 10 },
  { id: "champion", name: "Fair Play Champion", icon: "🏅", desc: "Reach 10,000 FPP", test: (s) => s.fpp >= 10000 },
  { id: "master", name: "Clean Sport Master", icon: "🏆", desc: "Reach 20,000 FPP", test: (s) => s.fpp >= 20000 },
  { id: "expert", name: "Anti-Doping Expert", icon: "🧠", desc: "Answer 5 expert questions correctly (all time)", test: (s) => (s.expertCorrect || 0) >= 5 },
  { id: "scholar", name: "Dedicated Scholar", icon: "🎓", desc: "Answer 50 questions in total", test: (s) => s.answered >= 50 },
  { id: "veteran", name: "Show Veteran", icon: "🎬", desc: "Complete 3 full games", test: (s) => s.gamesPlayed >= 3 },
];

export function checkAchievements(save, ctx) {
  const owned = new Set(save.achievements || []);
  const newly = [];
  for (const a of ACHIEVEMENTS) {
    if (!owned.has(a.id)) {
      try {
        if (a.test(save, ctx)) newly.push(a.id);
      } catch { /* ignore */ }
    }
  }
  return newly;
}
