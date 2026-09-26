// 4 original lifelines: 50:50, Athlete's Advice, Fair Play Poll, Expert Call
const DEFS = [
  { id: "fifty", icon: "✂️", name: "50:50", desc: "Remove two wrong options" },
  { id: "advice", icon: "🏅", name: "Athlete's Advice", desc: "Arjun gives you a clue" },
  { id: "poll", icon: "📊", name: "Fair Play Poll", desc: "Ask the virtual audience" },
  { id: "expert", icon: "📞", name: "Expert Call", desc: "Call Dr. Meera Sharma" },
];

export default function Lifelines({ used, onUse, compact = false }) {
  return (
    <div className={`glass rounded-2xl ${compact ? "p-2" : "p-3"}`}>
      <div className={`font-display font-bold tracking-widest text-sky-200 ${compact ? "text-[10px]" : "text-xs"} mb-2 text-center`}>
        🛟 LIFELINES
      </div>
      <div className={`grid ${compact ? "grid-cols-4 gap-1.5" : "grid-cols-2 lg:grid-cols-4 gap-2"}`}>
        {DEFS.map((l) => {
          const isUsed = used.includes(l.id);
          return (
            <button
              key={l.id}
              disabled={isUsed}
              onClick={() => onUse(l.id)}
              title={isUsed ? "Already used" : l.desc}
              className={`rounded-xl border px-2 py-2 flex flex-col items-center gap-0.5 transition-all btn-show ${
                isUsed
                  ? "opacity-40 border-white/10 cursor-not-allowed"
                  : "border-sky-300/40 bg-sky-400/10 hover:border-amber-300/70 hover:bg-amber-300/10"
              }`}
            >
              <span className={compact ? "text-lg" : "text-2xl"}>{isUsed ? "🔒" : l.icon}</span>
              <span className={`font-bold ${compact ? "text-[9px]" : "text-[11px]"} text-center leading-tight`}>
                {isUsed ? "USED" : l.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
