import { levelFor, progressToNext, fmt } from "../utils/points";

// Player profile dashboard card
export default function ProfileCard({ save }) {
  const lvl = levelFor(save.fpp);
  const prog = progressToNext(save.fpp);
  const acc = save.answered ? ((save.correct / save.answered) * 100).toFixed(1) : "0.0";
  const rows = [
    ["👤 Player", save.name || "Guest Champion"],
    ["⭐ Total Fair Play Points", `${fmt(save.fpp)} FPP`],
    ["🏆 Current Level", `${lvl.icon} Level ${lvl.id} — ${lvl.name}`],
    ["🎯 Questions Answered", save.answered],
    ["✅ Correct Answers", save.correct],
    ["📊 Accuracy", `${acc}%`],
    ["🏅 Badges Earned", (save.achievements || []).length],
    ["🎁 Rewards Redeemed", (save.rewards || []).length],
    ["🎬 Games Completed", save.gamesPlayed],
    ["🌟 Best Single Game", `${fmt(save.bestScore)} FPP`],
  ];
  return (
    <div className="glass gold-frame rounded-3xl p-5 md:p-7">
      <h2 className="font-display font-bold text-xl tracking-widest text-center gold-text">PLAYER PROFILE</h2>
      <div className="mt-4 grid gap-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm">
            <span className="text-slate-300 font-semibold">{k}</span>
            <span className="font-bold text-right">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs font-bold text-slate-300">
          <span>{lvl.icon} {lvl.name}</span>
          {prog.next ? <span>{fmt(prog.remaining)} FPP to {prog.next.name}</span> : <span>MAX LEVEL 👑</span>}
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden mt-1">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-emerald-400 transition-all duration-700"
            style={{ width: `${prog.pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
