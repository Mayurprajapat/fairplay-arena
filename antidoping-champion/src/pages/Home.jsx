import { useState } from "react";
import { motion } from "framer-motion";
import Host from "../components/Host";
import PointsDisplay from "../components/PointsDisplay";
import { levelFor, progressToNext, fmt } from "../utils/points";
import { sfx } from "../utils/sounds";

export default function Home({ save, go, speech }) {
  const [showHow, setShowHow] = useState(false);
  const lvl = levelFor(save.fpp);
  const prog = progressToNext(save.fpp);

  const start = () => {
    sfx.start();
    speech.speak("Welcome to Anti-Doping Champion. Your knowledge of clean sport is about to be tested. Are you ready?");
    go("intro");
  };

  return (
    <div className="relative">
      {/* studio backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="stadium-grid absolute inset-0" />
        <div className="spotlight absolute -top-10 left-[8%] w-40 h-[420px] bg-gradient-to-b from-violet-500/40 to-transparent" style={{ clipPath: "polygon(35% 0, 65% 0, 100% 100%, 0 100%)" }} />
        <div className="spotlight absolute -top-10 right-[8%] w-40 h-[420px] bg-gradient-to-b from-sky-400/40 to-transparent" style={{ clipPath: "polygon(35% 0, 65% 0, 100% 100%, 0 100%)", animationDelay: "2s" }} />
        <div className="spotlight absolute -top-10 left-1/2 -ml-20 w-44 h-[460px] bg-gradient-to-b from-amber-300/30 to-transparent" style={{ clipPath: "polygon(35% 0, 65% 0, 100% 100%, 0 100%)", animationDelay: "4s" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pt-10 md:pt-16 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-block glass rounded-full px-4 py-1.5 text-xs font-bold tracking-widest text-amber-200">
            🏟️ ORIGINAL SPORTS QUIZ SHOW • BUILT FOR CLEAN SPORT EDUCATION
          </div>
          <div className="text-7xl md:text-8xl mt-6 animate-floaty">🏆</div>
          <h1 className="font-display font-black text-4xl md:text-7xl mt-4 leading-tight">
            <span className="gold-text">ANTI-DOPING</span>
            <span className="block text-white tracking-widest">CHAMPION</span>
          </h1>
          <p className="font-display tracking-[0.35em] text-sky-200 text-xs md:text-sm mt-3">
            THE ULTIMATE FAIR PLAY CHALLENGE
          </p>
          <p className="text-slate-300 max-w-xl mx-auto mt-4">
            Test your knowledge. Learn about anti-doping. Earn Fair Play Points. Unlock achievements.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mt-8"
        >
          <button onClick={start} className="btn-show bg-gradient-to-r from-amber-300 to-orange-500 text-black font-display font-bold tracking-widest rounded-2xl px-8 py-4 text-lg animate-glow">
            ▶ START GAME
          </button>
          <button onClick={() => { sfx.select(); setShowHow(true); }} className="btn-show glass rounded-2xl px-6 py-4 font-bold">
            ❓ HOW TO PLAY
          </button>
          <button onClick={() => { sfx.select(); go("about"); }} className="btn-show glass rounded-2xl px-6 py-4 font-bold">
            📖 ABOUT ANTI-DOPING
          </button>
          <button onClick={() => { sfx.select(); go("store"); }} className="btn-show glass rounded-2xl px-6 py-4 font-bold">
            🏆 REWARD STORE
          </button>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mt-10 max-w-4xl mx-auto text-left">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass gold-frame rounded-3xl p-5 flex items-center gap-4">
            <Host state={speech.speaking ? "speaking" : "idle"} size={110} jersey={save.jersey} />
            <div>
              <div className="text-xs tracking-widest text-slate-400 font-bold">YOUR HOST</div>
              <div className="font-display font-bold text-lg">Arjun Verma</div>
              <p className="text-xs text-slate-300 mt-1">A fictional champion athlete guiding you through 15 questions of clean-sport glory.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass rounded-3xl p-5">
            <div className="text-xs tracking-widest text-slate-400 font-bold">CURRENT STANDING</div>
            <div className="mt-1"><PointsDisplay value={save.fpp} size="lg" /></div>
            <div className="mt-2 text-sm font-bold">{lvl.icon} Level {lvl.id} — {lvl.name}</div>
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden mt-2">
              <div className="h-full bg-gradient-to-r from-amber-300 to-emerald-400 transition-all" style={{ width: `${prog.pct}%` }} />
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {prog.next ? `${fmt(prog.remaining)} FPP to ${prog.next.name}` : "Maximum level reached 👑"}
            </div>
            {save.name && <div className="text-xs mt-2 text-slate-300">Playing as <b>{save.name}</b></div>}
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 max-w-4xl mx-auto text-sm">
          {[["🎯", "15 Questions", "Easy → Expert"], ["⭐", "Fair Play Points", "Up to 20,000 FPP"], ["🛟", "4 Lifelines", "50:50 • Poll • Call"], ["🏆", "Rewards", "Badges • Certificate"]].map(([i, t, d]) => (
            <div key={t} className="glass rounded-2xl p-4">
              <div className="text-3xl">{i}</div>
              <div className="font-bold mt-1">{t}</div>
              <div className="text-xs text-slate-400">{d}</div>
            </div>
          ))}
        </div>
      </div>

      {showHow && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4" onClick={() => setShowHow(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass gold-frame rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto scroll-thin"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display font-bold text-xl gold-text">❓ HOW TO PLAY</h2>
            <ol className="text-sm text-slate-200 mt-3 space-y-2 list-decimal ml-5">
              <li>Enter your athlete name and meet host <b>Arjun Verma</b>.</li>
              <li>Answer <b>15 questions</b> (Easy → Expert), 30 seconds each.</li>
              <li>Select an option, then press <b>LOCK ANSWER</b>.</li>
              <li>Correct answers earn <b>Fair Play Points (FPP)</b> — harder questions pay more.</li>
              <li>Use 4 lifelines wisely — each works only once per game.</li>
              <li>Read every <b>💡 LEARN THIS</b> panel — that is where the real education happens.</li>
              <li>Spend FPP in the <b>Reward Store</b> on badges, jerseys and certificates.</li>
            </ol>
            <p className="text-[11px] text-slate-400 mt-3">FPP are virtual educational-game points only. They have no real-world monetary value.</p>
            <button onClick={() => setShowHow(false)} className="mt-4 w-full bg-gradient-to-r from-amber-300 to-orange-500 text-black font-bold rounded-xl py-2.5 btn-show">GOT IT!</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
