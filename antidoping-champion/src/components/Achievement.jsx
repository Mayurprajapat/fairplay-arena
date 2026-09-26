import { motion, AnimatePresence } from "framer-motion";
import { ACHIEVEMENTS } from "../utils/achievements";

// Achievement unlock toast + badge grid helper
export function AchievementToast({ queue }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[80] flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {queue.map((a) => (
          <motion.div
            key={a.id + a.at}
            initial={{ y: -60, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="glass gold-frame rounded-2xl px-5 py-3 flex items-center gap-3"
          >
            <span className="text-3xl">{a.icon}</span>
            <span>
              <span className="block text-[10px] tracking-widest text-amber-300 font-bold">ACHIEVEMENT UNLOCKED</span>
              <span className="block font-display font-bold">{a.name}</span>
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function BadgeGrid({ ownedIds }) {
  const owned = new Set(ownedIds || []);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {ACHIEVEMENTS.map((a) => {
        const has = owned.has(a.id);
        return (
          <div
            key={a.id}
            className={`rounded-2xl border p-3 text-center ${has ? "border-amber-300/60 bg-amber-300/10" : "border-white/10 bg-white/5 opacity-40 grayscale"}`}
            title={a.desc}
          >
            <div className="text-3xl">{has ? a.icon : "🔒"}</div>
            <div className="text-xs font-bold mt-1">{a.name}</div>
            <div className="text-[10px] text-slate-400">{a.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
