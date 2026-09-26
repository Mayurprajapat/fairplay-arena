import { useEffect } from "react";
import { motion } from "framer-motion";
import Host from "../components/Host";
import PointsDisplay from "../components/PointsDisplay";
import Confetti from "../components/Confetti";
import { fmt, levelFor } from "../utils/points";
import { sfx } from "../utils/sounds";

// Cinematic final result screen
export default function Results({ result, save, go, speech }) {
  const { earned, correct, lifelinesUsed } = result;
  const total = 15;
  const acc = ((correct / total) * 100).toFixed(1);
  const lvl = levelFor(save.fpp);
  const great = correct >= 12;

  useEffect(() => {
    sfx.victory();
    speech.speak(`Congratulations! You have completed the Anti-Doping Champion challenge. You scored ${correct} out of ${total}, earning ${earned} Fair Play Points.`);
    return () => speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-center">
      <Confetti burst={great ? 2 : 1} />
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="glass gold-frame rounded-3xl p-6 md:p-10">
        <div className="text-7xl">{great ? "🏆" : "🎖️"}</div>
        <h1 className="font-display font-black text-3xl md:text-4xl mt-2 gold-text">FINAL RESULT</h1>
        <div className="flex justify-center mt-3">
          <Host state="celebrate" size={130} jersey={save.jersey} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5 text-sm">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <div className="text-[10px] tracking-widest text-slate-400 font-bold">TOTAL FPP</div>
            <div className="font-display font-bold text-xl gold-text">+{fmt(earned)}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <div className="text-[10px] tracking-widest text-slate-400 font-bold">ACCURACY</div>
            <div className="font-display font-bold text-xl">{acc}%</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <div className="text-[10px] tracking-widest text-slate-400 font-bold">CORRECT</div>
            <div className="font-display font-bold text-xl">{correct} / {total}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <div className="text-[10px] tracking-widest text-slate-400 font-bold">LIFELINES</div>
            <div className="font-display font-bold text-xl">{lifelinesUsed} / 4</div>
          </div>
        </div>

        <div className="mt-5 glass rounded-2xl p-4">
          <div className="text-xs tracking-widest text-slate-400 font-bold">CURRENT LEVEL</div>
          <div className="font-display font-black text-2xl mt-1">{lvl.icon} {lvl.name}</div>
          <div className="mt-2 flex justify-center"><PointsDisplay value={save.fpp} /></div>
        </div>

        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }} className="mt-5 bg-gradient-to-r from-amber-400/20 to-orange-500/20 border border-amber-300/50 rounded-2xl p-4">
          <div className="font-display font-black text-xl">🏆 {lvl.name.toUpperCase()}</div>
          <p className="text-sm text-slate-200 mt-1">
            “Congratulations! Your knowledge of clean sport has earned you the {lvl.name} achievement.”
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
          <button onClick={() => go("intro")} className="btn-show bg-gradient-to-r from-amber-300 to-orange-500 text-black font-bold rounded-xl py-3">↻ PLAY AGAIN</button>
          <button onClick={() => go("store")} className="btn-show glass rounded-xl py-3 font-bold">🏆 REWARD STORE</button>
          <button onClick={() => go("profile")} className="btn-show glass rounded-xl py-3 font-bold">👤 MY PROFILE</button>
          <button onClick={() => go("about")} className="btn-show glass rounded-xl py-3 font-bold">📖 LEARN MORE</button>
        </div>
      </motion.div>
    </div>
  );
}
