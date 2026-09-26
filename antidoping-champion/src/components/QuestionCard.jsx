import { motion } from "framer-motion";
import AnswerOption, { LETTERS } from "./AnswerOption";

// Cinematic question panel
export default function QuestionCard({
  q,
  displayOptions,
  correctIdx,
  phase, // selecting | locked | revealed
  selected,
  eliminated,
  onSelect,
}) {
  return (
    <motion.div
      key={q.id + "-" + q.order}
      initial={{ opacity: 0, y: 34, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.3, 1] }}
      className="glass gold-frame rounded-3xl p-4 md:p-7"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-bold tracking-widest uppercase bg-violet-500/25 border border-violet-300/40 text-violet-100 rounded-full px-3 py-1">
          {q.category}
        </span>
        <span className="text-[11px] font-bold tracking-widest uppercase bg-amber-400/15 border border-amber-300/40 text-amber-200 rounded-full px-3 py-1">
          {q.difficulty}
        </span>
      </div>
      <h2 className="font-display text-lg md:text-2xl font-bold leading-snug">
        <span className="gold-text">QUESTION {q.order + 1}</span>
        <span className="block mt-1 text-white">{q.question}</span>
      </h2>
      <div className="grid gap-2.5 md:gap-3 mt-5">
        {displayOptions.map((text, i) => {
          let st = "idle";
          if (eliminated.includes(i)) st = "dimmed";
          else if (phase === "revealed") {
            if (i === correctIdx) st = "correct";
            else if (i === selected) st = "wrong";
            else st = "locked";
          } else if (phase !== "selecting") st = "locked";
          else if (i === selected) st = "selected";
          return (
            <AnswerOption
              key={i}
              letter={LETTERS[i]}
              text={text}
              state={st}
              disabled={phase !== "selecting" || eliminated.includes(i)}
              onClick={() => onSelect(i)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
