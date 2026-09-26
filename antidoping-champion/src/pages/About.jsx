import { motion } from "framer-motion";

// About / project explanation page (important for evaluation)
export default function About({ go }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass gold-frame rounded-3xl p-6 md:p-10">
        <div className="text-xs tracking-widest text-amber-300 font-bold">🎓 MAJOR PROJECT • GAMIFICATION OF ANTI-DOPING INFORMATION</div>
        <h1 className="font-display font-black text-3xl md:text-4xl mt-2 gold-text">ABOUT THIS PROJECT</h1>

        <h2 className="font-display font-bold text-xl mt-6 text-sky-200">What is Gamification?</h2>
        <p className="text-sm md:text-base text-slate-200 mt-2 leading-relaxed">
          “Gamification is the use of game elements such as points, challenges, progression, rewards,
          achievements and feedback in non-game contexts to increase engagement and learning.”
        </p>

        <h2 className="font-display font-bold text-xl mt-6 text-sky-200">Why Anti-Doping Gamification?</h2>
        <p className="text-sm md:text-base text-slate-200 mt-2 leading-relaxed">
          “Traditional anti-doping information can be difficult for young athletes to engage with. This
          project transforms educational information into an interactive quiz experience where users learn,
          answer questions, earn points, unlock achievements and access educational rewards.”
        </p>

        <h2 className="font-display font-bold text-xl mt-6 text-sky-200">The Gamification Cycle</h2>
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs md:text-sm font-bold">
          {["📚 Education", "🎯 Challenge", "💬 Feedback", "⭐ Points", "🏅 Achievement", "🎁 Reward", "🔁 Continued Learning"].map((s, i, arr) => (
            <span key={s} className="flex items-center gap-2">
              <span className="glass rounded-full px-3 py-1.5 border-amber-300/40">{s}</span>
              {i < arr.length - 1 && <span className="text-amber-300">→</span>}
            </span>
          ))}
        </div>

        <h2 className="font-display font-bold text-xl mt-6 text-sky-200">What You Learn Here</h2>
        <div className="grid sm:grid-cols-2 gap-2 mt-3 text-sm">
          {["Anti-Doping Basics & Spirit of Sport", "WADA Code & Prohibited List", "Prohibited Substances (S1–S9, P1)", "Prohibited Methods (M1–M3)", "Doping Control & Sample Testing", "Athlete Rights & Responsibilities", "Therapeutic Use Exemptions (TUE)", "Supplements Safety & Strict Liability", "Consequences, Bans & Ethics"].map((t) => (
            <div key={t} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">✅ {t}</div>
          ))}
        </div>

        <h2 className="font-display font-bold text-xl mt-6 text-sky-200">Official Sources</h2>
        <div className="flex flex-wrap gap-2 mt-3 text-sm font-bold">
          <a href="https://www.wada-ama.org/en/prohibited-list" target="_blank" rel="noreferrer" className="glass rounded-xl px-4 py-2 hover:border-amber-300/60">🌍 WADA Prohibited List →</a>
          <a href="https://nadaindia.yas.gov.in/" target="_blank" rel="noreferrer" className="glass rounded-xl px-4 py-2 hover:border-amber-300/60">🇮🇳 NADA India →</a>
          <a href="https://www.globaldro.com/Home" target="_blank" rel="noreferrer" className="glass rounded-xl px-4 py-2 hover:border-amber-300/60">💊 Global DRO →</a>
        </div>

        <div className="mt-6 text-xs text-slate-400 bg-white/5 border border-white/10 rounded-2xl p-4">
          🛡️ <b>Safety note:</b> This is an educational game. It never explains how to dope, evade tests or
          manipulate samples. It promotes clean sport, fair play, athlete health and sports integrity.
          Fair Play Points are virtual educational points with no monetary value. All characters, voices,
          music and graphics are original creations for this college project.
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          <button onClick={() => go("intro")} className="btn-show bg-gradient-to-r from-amber-300 to-orange-500 text-black font-bold rounded-xl px-6 py-3">▶ PLAY NOW</button>
          <button onClick={() => go("home")} className="btn-show glass rounded-xl px-6 py-3 font-bold">← Lobby</button>
        </div>
      </motion.div>
    </div>
  );
}
