import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Host from "../components/Host";
import VoiceControls from "../components/VoiceControls";
import { sfx } from "../utils/sounds";

const INTRO_LINE =
  "Welcome to Anti-Doping Champion. Today, your knowledge of clean sport will be tested. Answer questions, earn Fair Play Points and unlock exclusive achievements.";

// Host introduction stage with name entry
export default function Intro({ save, setName, go, speech }) {
  const [name, setNameLocal] = useState(save.name || "");
  const [hostState, setHostState] = useState("speaking");

  useEffect(() => {
    speech.speak(INTRO_LINE, { onend: () => setHostState("excited") });
    setHostState("speaking");
    return () => speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setHostState(speech.speaking ? "speaking" : "excited");
  }, [speech.speaking]);

  const play = () => {
    const finalName = name.trim().slice(0, 24) || "Guest Champion";
    setName(finalName);
    sfx.start();
    speech.stop();
    go("game");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="glass gold-frame rounded-3xl p-6 md:p-10 relative overflow-hidden">
        <div className="spotlight absolute -top-10 left-[15%] w-32 h-72 bg-gradient-to-b from-violet-500/40 to-transparent" style={{ clipPath: "polygon(35% 0, 65% 0, 100% 100%, 0 100%)" }} />
        <div className="spotlight absolute -top-10 right-[15%] w-32 h-72 bg-gradient-to-b from-sky-400/40 to-transparent" style={{ clipPath: "polygon(35% 0, 65% 0, 100% 100%, 0 100%)", animationDelay: "3s" }} />
        <div className="relative flex flex-col items-center">
          <Host state={hostState} size={190} jersey={save.jersey} />
          <div className="glass rounded-2xl p-4 mt-4 max-w-xl text-left">
            <div className="text-[11px] tracking-widest text-amber-300 font-bold">🎙️ ARJUN SAYS</div>
            <p className="mt-1 text-sm md:text-base">“{INTRO_LINE}”</p>
            <div className="mt-3 flex justify-end">
              <VoiceControls speech={speech} onReplayText={INTRO_LINE} />
            </div>
          </div>
          <div className="w-full max-w-sm mt-5">
            <label className="text-xs font-bold tracking-widest text-slate-300">ENTER YOUR ATHLETE NAME</label>
            <input
              value={name}
              onChange={(e) => setNameLocal(e.target.value)}
              placeholder="e.g. Mayur"
              maxLength={24}
              className="mt-2 w-full glass rounded-2xl px-4 py-3 text-center font-bold outline-none focus:border-amber-300/70"
            />
          </div>
          <button onClick={play} className="btn-show mt-5 bg-gradient-to-r from-amber-300 to-orange-500 text-black font-display font-bold tracking-widest rounded-2xl px-10 py-4 text-lg animate-glow">
            LET'S PLAY ▶
          </button>
          <button onClick={() => { speech.stop(); go("home"); }} className="mt-3 text-xs text-slate-400 underline">
            ← Back to lobby
          </button>
        </div>
      </motion.div>
    </div>
  );
}
