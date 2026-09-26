import { motion } from "framer-motion";
import { LETTERS } from "../utils/gameLogic";

// Single answer option A–D
export default function AnswerOption({ letter, text, state = "idle", disabled, onClick, poll }) {
  const styles = {
    idle: "glass hover:border-amber-300/70 hover:bg-amber-300/10 cursor-pointer",
    selected: "border-amber-300 bg-amber-300/20 shadow-[0_0_25px_rgba(245,197,24,0.45)] cursor-pointer",
    correct: "border-emerald-300 bg-emerald-400/25 shadow-[0_0_35px_rgba(52,211,153,0.6)]",
    wrong: "border-red-400 bg-red-500/20",
    dimmed: "opacity-30 pointer-events-none border-white/10",
    locked: "pointer-events-none border-white/10",
  }[state];
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.015 }}
      whileTap={disabled ? {} : { scale: 0.985 }}
      disabled={disabled}
      onClick={onClick}
      className={`w-full text-left rounded-2xl border px-4 py-3 md:py-4 flex items-center gap-3 transition-all ${styles}`}
    >
      <span
        className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-display font-bold ${
          state === "correct"
            ? "bg-emerald-400 text-black"
            : state === "wrong"
              ? "bg-red-400 text-black"
              : state === "selected"
                ? "bg-amber-300 text-black"
                : "bg-white/10 text-amber-200"
        }`}
      >
        {letter}
      </span>
      <span className="flex-1 font-semibold text-sm md:text-base">{text}</span>
      {typeof poll === "number" && (
        <span className="text-xs font-bold text-sky-200 bg-sky-400/15 border border-sky-300/30 rounded-full px-2 py-0.5">
          {poll}%
        </span>
      )}
      {state === "correct" && <span className="text-xl">✓</span>}
      {state === "wrong" && <span className="text-xl">✕</span>}
    </motion.button>
  );
}

export { LETTERS };
