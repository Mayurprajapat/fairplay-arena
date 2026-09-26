import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Host from "../components/Host";
import QuestionCard from "../components/QuestionCard";
import Lifelines from "../components/Lifelines";
import PrizeLadder from "../components/PrizeLadder";
import Timer from "../components/Timer";
import PointsDisplay from "../components/PointsDisplay";
import VoiceControls from "../components/VoiceControls";
import Confetti from "../components/Confetti";
import { LETTERS, makePoll, pickGameQuestions, shuffleOptions } from "../utils/gameLogic";
import { LINES, pickLine } from "../data/voiceLines";
import { fmt, levelFor } from "../utils/points";
import { checkAchievements, ACHIEVEMENTS } from "../utils/achievements";
import { sfx } from "../utils/sounds";

export default function Game({ save, onFinish, notifyAchievements, speech, voiceLang = "hi", onLang }) {
  const L = LINES[voiceLang] || LINES.en;
  const [questions] = useState(() => pickGameQuestions());
  const [qi, setQi] = useState(0);
  const [mapping, setMapping] = useState(() => shuffleOptions(questions[0]));
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState("selecting"); // selecting | locked | revealed
  const [eliminated, setEliminated] = useState([]);
  const [used, setUsed] = useState([]);
  const [poll, setPoll] = useState(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [showExpert, setShowExpert] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [earned, setEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [log, setLog] = useState([]);
  const [host, setHost] = useState("speaking");
  const [bursts, setBursts] = useState(0);
  const [ladderKey, setLadderKey] = useState(0);
  const stats = useRef({ correct: 0, bestStreak: 0, fast: 0, lifelines: 0, expert: 0, answered: 0 });
  const lockTimer = useRef(null);

  const q = questions[qi];
  const correctIdx = mapping.correctAnswer;
  const timeUsed = 30 - seconds;

  const speakQ = useCallback(
    (qq, map) => {
      setHost("speaking");
      // Host reads the question + all four options aloud (KBC-style, original voice)
      const opts = map.options.map((t, i) => `${L.opt} ${LETTERS[i]}: ${t}.`).join(" ");
      speech.speak(`${L.nextQ} ${qq.question} ${opts}`, { lang: voiceLang, preset: "host", onend: () => setHost("thinking") });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [speech, voiceLang]
  );

  // present question
  useEffect(() => {
    const m = shuffleOptions(questions[qi]);
    setMapping(m);
    setSelected(null);
    setPhase("selecting");
    setEliminated([]);
    setPoll(null);
    setShowAdvice(false);
    setShowExpert(false);
    setSeconds(30);
    sfx.transition();
    speakQ(questions[qi], m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi]);

  // timer
  useEffect(() => {
    if (phase !== "selecting") return;
    if (seconds <= 0) {
      autoLock();
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, phase]);

  useEffect(() => () => { speech.stop(); clearTimeout(lockTimer.current); }, [speech]);

  const recordAnswer = (isCorrect) => {
    const s = stats.current;
    s.answered += 1;
    if (isCorrect) {
      s.correct += 1;
      const ns = streak + 1;
      setStreak(ns);
      s.bestStreak = Math.max(s.bestStreak, ns);
      if (timeUsed <= 8) s.fast += 1;
      if (q.difficulty === "expert") s.expert += 1;
      const pts = q.ladderPoints;
      setEarned((e) => e + pts);
      setLadderKey((k) => k + 1);
    } else {
      setStreak(0);
    }
    setLog((l) => [...l, { id: q.id, correct: isCorrect, time: timeUsed, lifelines: used.length }]);
  };

  const reveal = (isCorrect, timedOut) => {
    setPhase("revealed");
    setHost(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      sfx.correct();
      sfx.crowd();
      setBursts((b) => b + 1);
      speech.speak(`${pickLine(L.correct, qi)} Plus ${q.ladderPoints} Fair Play Points.`, { lang: voiceLang, preset: "host" });
    } else if (timedOut) {
      sfx.timeout();
      speech.speak(L.timeout, { lang: voiceLang, preset: "host" });
    } else {
      sfx.wrong();
      speech.speak(pickLine(L.wrong, qi), { lang: voiceLang, preset: "host" });
    }
    recordAnswer(isCorrect);
    // live achievement check (streak / speed)
    const fresh = checkAchievements(
      { ...save, fpp: save.fpp + earned + (isCorrect ? q.ladderPoints : 0), answered: save.answered + stats.current.answered },
      { bestStreak: stats.current.bestStreak, fastCorrect: stats.current.fast }
    );
    if (fresh.length) notifyAchievements(fresh);
  };

  const doLock = () => {
    if (phase !== "selecting") return;
    sfx.lock();
    sfx.drumroll();
    setPhase("locked");
    setHost("thinking");
    speech.stop();
    const wasCorrect = selected !== null && selected === correctIdx;
    lockTimer.current = setTimeout(() => reveal(wasCorrect, false), 1400);
  };

  const autoLock = () => {
    if (phase !== "selecting") return;
    sfx.lock();
    sfx.drumroll();
    setPhase("locked");
    setHost("thinking");
    speech.stop();
    const noAnswer = selected === null;
    const wasCorrect = !noAnswer && selected === correctIdx;
    lockTimer.current = setTimeout(() => reveal(wasCorrect, noAnswer), 1400);
  };

  const useLifeline = (id) => {
    if (used.includes(id) || phase !== "selecting") return;
    sfx.lifeline();
    sfx.reveal();
    setHost("lifeline");
    speech.speak(`${L.lifeline} ${id === "advice" ? q.athleteHint : id === "expert" ? q.expertHint : ""}`, { lang: voiceLang, preset: "host" });
    setUsed((u) => [...u, id]);
    stats.current.lifelines += 1;
    if (id === "fifty") {
      const wrongs = [0, 1, 2, 3].filter((i) => i !== correctIdx).sort(() => Math.random() - 0.5).slice(0, 2);
      setEliminated(wrongs);
      if (selected !== null && wrongs.includes(selected)) setSelected(null);
    } else if (id === "advice") {
      setShowAdvice(true);
    } else if (id === "poll") {
      const raw = makePoll({ ...q, correctAnswer: q.correctAnswer });
      // map original order -> display order
      const order = mapping.options.map((_, di) => q.options.indexOf(mapping.options[di]));
      setPoll(order.map((oi) => raw[oi]));
    } else if (id === "expert") {
      setShowExpert(true);
    }
    setTimeout(() => setHost("thinking"), 2500);
  };

  const next = () => {
    sfx.transition();
    if (qi + 1 >= questions.length) {
      finish();
    } else {
      setQi((i) => i + 1);
    }
  };

  const finish = () => {
    const s = stats.current;
    onFinish({
      questions,
      log,
      earned,
      correct: s.correct,
      bestStreak: s.bestStreak,
      fast: s.fast,
      lifelinesUsed: s.lifelines,
      expert: s.expert,
      answered: s.answered,
    });
  };

  const isCorrectReveal = phase === "revealed" && selected !== null && selected === correctIdx;
  const totalFppLive = save.fpp + earned;
  const lvl = levelFor(totalFppLive);

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6">
      <Confetti burst={bursts} />
      {/* TOP BAR */}
      <div className="glass rounded-2xl px-3 md:px-5 py-3 flex flex-wrap items-center gap-2 md:gap-4 justify-between">
        <div className="font-display font-bold tracking-widest text-sm md:text-base">
          QUESTION <span className="gold-text">{qi + 1} / {questions.length}</span>
        </div>
        <PointsDisplay value={totalFppLive} />
        <div className="flex items-center gap-2 md:gap-3">
          <Timer secondsLeft={seconds} running={phase === "selecting"} />
          <VoiceControls speech={speech} onReplayText={`${L.nextQ} ${q.question} ${mapping.options.map((t, i) => `${L.opt} ${LETTERS[i]}: ${t}.`).join(" ")}`} lang={voiceLang} onLang={onLang} />
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-2">
        <div className="h-full bg-gradient-to-r from-amber-300 to-emerald-400 transition-all duration-500" style={{ width: `${((qi + (phase === "revealed" ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>

      <div className="grid lg:grid-cols-[240px_1fr_250px] gap-3 md:gap-4 mt-3 md:mt-4 items-start">
        {/* HOST */}
        <div className="glass rounded-3xl p-3 flex lg:flex-col items-center gap-3 justify-center order-1">
          <Host state={host} size={128} jersey={save.jersey} />
          <div className="text-center">
            <div className="text-[11px] text-slate-300">🔥 Streak <b>{streak}</b></div>
            <div className="text-[11px] text-slate-300">🏅 {lvl.icon} Lv.{lvl.id}</div>
          </div>
        </div>

        {/* QUESTION */}
        <div className="order-2">
          <QuestionCard
            q={q}
            displayOptions={mapping.options}
            correctIdx={correctIdx}
            phase={phase === "selecting" ? "selecting" : phase === "locked" ? "locked" : "revealed"}
            selected={selected}
            eliminated={eliminated}
            onSelect={(i) => {
              if (phase !== "selecting") return;
              sfx.select();
              speech.stop();
              setSelected(i);
            }}
          />

          {/* lifeline panels */}
          <AnimatePresence>
            {showAdvice && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 mt-3 border-amber-300/40 pop-in">
                <div className="text-xs font-bold tracking-widest text-amber-300">🏅 ARJUN'S ADVICE</div>
                <p className="text-sm mt-1">“{q.athleteHint}”</p>
              </motion.div>
            )}
            {showExpert && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 mt-3 border-sky-300/40 pop-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-violet-600 flex items-center justify-center text-2xl">👩‍⚕️</div>
                  <div>
                    <div className="font-bold text-sm">Dr. Meera Sharma</div>
                    <div className="text-[11px] text-slate-400">Sports Anti-Doping Expert (fictional)</div>
                  </div>
                </div>
                <p className="text-sm mt-2">“{q.expertHint}”</p>
              </motion.div>
            )}
            {poll && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 mt-3 pop-in">
                <div className="text-xs font-bold tracking-widest text-sky-200">📊 FAIR PLAY POLL — VIRTUAL AUDIENCE</div>
                <div className="grid gap-1.5 mt-2">
                  {poll.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-bold">
                      <span className="w-5">{LETTERS[i]}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-sky-400 to-violet-500" />
                      </div>
                      <span className="w-9 text-right">{p}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* lock + feedback */}
          <div className="mt-3">
            {phase === "selecting" && (
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  disabled={selected === null}
                  onClick={doLock}
                  className={`flex-1 min-w-40 rounded-2xl py-3.5 font-display font-bold tracking-widest btn-show ${
                    selected === null ? "bg-white/10 text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-amber-300 to-orange-500 text-black animate-glow"
                  }`}
                >
                  🔒 LOCK ANSWER {selected !== null ? `(${LETTERS[selected]})` : ""}
                </button>
                {seconds === 0 && <span className="text-red-300 font-bold text-sm">⏱ TIME'S UP! Locking…</span>}
              </div>
            )}
            {phase === "locked" && (
              <div className="text-center font-display font-bold tracking-widest text-amber-200 animate-pulse">🔒 LOCKING ANSWER…</div>
            )}
            <AnimatePresence>
              {phase === "revealed" && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl p-4 md:p-5 mt-1 border ${isCorrectReveal ? "border-emerald-300/60 bg-emerald-400/10" : "border-red-300/50 bg-red-500/10"}`}>
                  <div className={`font-display font-black text-2xl ${isCorrectReveal ? "text-emerald-300" : "text-red-300"}`}>
                    {seconds === 0 && selected === null ? "⏱ TIME'S UP!" : isCorrectReveal ? "✓ CORRECT!" : "✕ NOT QUITE!"}
                  </div>
                  {isCorrectReveal ? (
                    <div className="font-display font-bold gold-text text-xl mt-1">+{fmt(q.ladderPoints)} FPP</div>
                  ) : (
                    <div className="text-sm mt-1">
                      <b>CORRECT ANSWER:</b> <span className="text-emerald-300 font-bold">{LETTERS[correctIdx]} — {mapping.options[correctIdx]}</span>
                    </div>
                  )}
                  <div className="mt-3 bg-black/30 border border-white/10 rounded-2xl p-3">
                    <div className="text-xs font-bold tracking-widest text-amber-300">💡 LEARN THIS — WHY?</div>
                    <p className="text-sm mt-1 text-slate-100">{q.explanation}</p>
                  </div>
                  <button onClick={next} className="btn-show mt-3 w-full bg-gradient-to-r from-emerald-400 to-sky-500 text-black font-display font-bold tracking-widest rounded-2xl py-3">
                    {qi + 1 >= questions.length ? "SEE FINAL RESULT 🏁" : "CONTINUE →"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* mobile lifelines */}
          <div className="lg:hidden mt-3">
            <Lifelines used={used} onUse={useLifeline} compact />
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div className="order-3 flex flex-col gap-3">
          <div className="hidden lg:block">
            <Lifelines used={used} onUse={useLifeline} />
          </div>
          <details className="lg:hidden glass rounded-2xl p-2">
            <summary className="text-xs font-bold tracking-widest text-amber-200 cursor-pointer px-2 py-1">⭐ LADDER (Q{qi + 1} • {fmt(q.ladderPoints)} FPP)</summary>
            <div className="mt-2"><PrizeLadder current={qi} compact /></div>
          </details>
          <div className="hidden lg:block" key={ladderKey}>
            <PrizeLadder current={phase === "revealed" && isCorrectReveal ? qi : qi} />
          </div>
        </div>
      </div>
    </div>
  );
}
