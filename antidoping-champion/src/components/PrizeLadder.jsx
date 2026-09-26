import { motion } from "framer-motion";
import { LADDER, fmt } from "../utils/points";

// Vertical FPP progression ladder (no real money anywhere)
export default function PrizeLadder({ current = 0, compact = false }) {
  const rows = [...LADDER].reverse();
  return (
    <div className={`glass rounded-2xl ${compact ? "p-2" : "p-3"} w-full`}>
      <div className={`font-display font-bold tracking-widest text-amber-200 ${compact ? "text-[10px]" : "text-xs"} mb-2 text-center`}>
        ⭐ FAIR PLAY LADDER
      </div>
      <div className={`flex flex-col-reverse gap-1 overflow-y-auto scroll-thin ${compact ? "max-h-40 text-[10px]" : "max-h-[420px] text-xs md:text-sm"}`}>
        {rows.map((pts) => {
          const idx = LADDER.indexOf(pts);
          const active = idx === current;
          const passed = idx < current;
          return (
            <motion.div
              key={pts}
              initial={false}
              animate={active ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 0.6 }}
              className={`rounded-lg px-2 py-1 font-bold text-center border ${
                active
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black border-amber-200 animate-glow ladder-up"
                  : passed
                    ? "bg-emerald-400/15 text-emerald-200 border-emerald-300/30"
                    : "bg-white/5 text-slate-300 border-white/10"
              }`}
            >
              <span className="mr-1">{active ? "👉" : passed ? "✓" : `${idx + 1}.`}</span>
              {fmt(pts)} FPP
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
