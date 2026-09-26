import { useCallback, useEffect, useRef, useState } from "react";
import Home from "./pages/Home";
import Intro from "./pages/Intro";
import Game from "./pages/Game";
import Results from "./pages/Results";
import RewardStore from "./pages/RewardStore";
import Profile from "./pages/Profile";
import About from "./pages/About";
import PointsDisplay from "./components/PointsDisplay";
import { AchievementToast } from "./components/Achievement";
import { loadSave, persistSave, defaultSave } from "./utils/storage";
import { checkAchievements, ACHIEVEMENTS } from "./utils/achievements";
import { levelFor } from "./utils/points";
import { useSpeech, stopSpeech } from "./utils/speech";
import { sfx, setMuted } from "./utils/sounds";

const ROUTES = ["home", "intro", "game", "results", "store", "profile", "about"];

function routeFromHash() {
  const h = (window.location.hash || "#home").replace("#", "");
  return ROUTES.includes(h) ? h : "home";
}

export default function App() {
  const [save, setSave] = useState(() => loadSave());
  const [route, setRoute] = useState(() => routeFromHash());
  const [result, setResult] = useState(null);
  const [toasts, setToasts] = useState([]);
  const speech = useSpeech();
  const toastId = useRef(0);

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    setMuted(save.muted);
  }, [save.muted]);

  const go = useCallback((r) => {
    stopSpeech();
    sfx.transition();
    window.location.hash = r;
    setRoute(r);
    window.scrollTo({ top: 0 });
  }, []);

  const patch = useCallback((p) => {
    setSave((s) => {
      const next = { ...s, ...p };
      persistSave(next);
      return next;
    });
  }, []);

  const notifyAchievements = useCallback((ids) => {
    if (!ids?.length) return;
    sfx.achievement();
    setSave((s) => {
      const merged = Array.from(new Set([...(s.achievements || []), ...ids]));
      const next = { ...s, achievements: merged };
      persistSave(next);
      return next;
    });
    const items = ids
      .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
      .filter(Boolean)
      .map((a) => ({ ...a, at: ++toastId.current }));
    setToasts((t) => [...t, ...items]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => !items.some((n) => n.at === x.at)));
    }, 4200);
  }, []);

  const finishGame = useCallback(
    (res) => {
      setSave((s) => {
        const next = {
          ...s,
          fpp: s.fpp + res.earned,
          answered: s.answered + res.answered,
          correct: s.correct + res.correct,
          gamesPlayed: s.gamesPlayed + 1,
          bestScore: Math.max(s.bestScore, res.earned),
          lifelinesUsedTotal: s.lifelinesUsedTotal + res.lifelinesUsed,
          expertCorrect: (s.expertCorrect || 0) + res.expert,
          lastAccuracy: Number(((res.correct / 15) * 100).toFixed(1)),
          lastPlayed: new Date().toISOString(),
        };
        // post-game achievement sweep
        const fresh = checkAchievements(next, {
          gameCorrect: res.correct,
          gameDone: true,
          lifelinesUsed: res.lifelinesUsed,
          bestStreak: res.bestStreak,
          fastCorrect: res.fast,
        });
        if (fresh.length) {
          next.achievements = Array.from(new Set([...(next.achievements || []), ...fresh]));
          const items = fresh
            .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
            .filter(Boolean)
            .map((a) => ({ ...a, at: ++toastId.current }));
          setToasts((t) => [...t, ...items]);
          setTimeout(() => setToasts((t) => t.filter((x) => !items.some((n) => n.at === x.at))), 5000);
          sfx.achievement();
        }
        // level-up fanfare
        if (levelFor(next.fpp).id > levelFor(s.fpp).id) sfx.levelup();
        persistSave(next);
        return next;
      });
      setResult(res);
      go("results");
    },
    [go]
  );

  const redeem = useCallback((rewardId) => {
    const catalog = { bronze: 1000, silver: 2500, gold: 5000, jersey: 8000, expert: 12000, certificate: 15000, master: 20000 };
    const cost = catalog[rewardId] ?? 0;
    setSave((s) => {
      if ((s.rewards || []).includes(rewardId) || s.fpp < cost) return s;
      const next = {
        ...s,
        fpp: s.fpp - cost,
        rewards: [...(s.rewards || []), rewardId],
        jersey: rewardId === "jersey" ? true : s.jersey,
        expertBadge: rewardId === "expert" ? true : s.expertBadge,
      };
      persistSave(next);
      return next;
    });
  }, []);

  const inGame = route === "game";

  return (
    <div className="min-h-full flex flex-col">
      <AchievementToast queue={toasts} />
      {/* TOP NAV */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-3 md:px-4 py-2.5 flex items-center gap-2 md:gap-4">
          <button onClick={() => go("home")} className="flex items-center gap-2 font-display font-black tracking-widest">
            <span className="text-2xl">🏆</span>
            <span className="hidden sm:inline gold-text text-sm md:text-base">ANTI-DOPING CHAMPION</span>
          </button>
          <div className="flex-1" />
          {!inGame && (
            <div className="hidden md:flex items-center gap-4 text-sm font-bold text-slate-200">
              <button onClick={() => go("intro")} className="hover:text-amber-300">▶ Play</button>
              <button onClick={() => go("store")} className="hover:text-amber-300">🏆 Store</button>
              <button onClick={() => go("profile")} className="hover:text-amber-300">👤 Profile</button>
              <button onClick={() => go("about")} className="hover:text-amber-300">📖 About</button>
            </div>
          )}
          <PointsDisplay value={save.fpp} size="sm" />
          <button
            onClick={() => { const m = !save.muted; patch({ muted: m }); }}
            className="glass rounded-full w-9 h-9 flex items-center justify-center btn-show"
            title={save.muted ? "Unmute sounds" : "Mute sounds"}
          >
            {save.muted ? "🔇" : "🔊"}
          </button>
        </nav>
        {!inGame && (
          <div className="md:hidden flex justify-around text-[11px] font-bold text-slate-200 border-t border-white/10 py-1.5">
            <button onClick={() => go("intro")}>▶ Play</button>
            <button onClick={() => go("store")}>🏆 Store</button>
            <button onClick={() => go("profile")}>👤 Profile</button>
            <button onClick={() => go("about")}>📖 About</button>
          </div>
        )}
      </header>

      <main className="flex-1">
        {route === "home" && <Home save={save} go={go} speech={speech} />}
        {route === "intro" && (
          <Intro save={save} setName={(n) => patch({ name: n })} go={go} speech={speech} voiceLang={save.voiceLang || "hi"} onLang={(l) => patch({ voiceLang: l })} />
        )}
        {route === "game" && (
          <Game save={save} onFinish={finishGame} notifyAchievements={notifyAchievements} speech={speech} voiceLang={save.voiceLang || "hi"} onLang={(l) => patch({ voiceLang: l })} />
        )}
        {route === "results" && result && (
          <Results result={result} save={save} go={go} speech={speech} voiceLang={save.voiceLang || "hi"} />
        )}
        {route === "results" && !result && <Home save={save} go={go} speech={speech} />}
        {route === "store" && <RewardStore save={save} redeem={redeem} go={go} />}
        {route === "profile" && (
          <Profile save={save} go={go} resetAll={() => { const d = defaultSave(); persistSave(d); setSave(d); }} />
        )}
        {route === "about" && <About go={go} />}
      </main>

      <footer className="text-center text-[11px] text-slate-500 px-4 pb-6">
        ANTI-DOPING CHAMPION • An original educational production for a college major project on gamification of anti-doping information.<br />
        Not affiliated with any television quiz show. All hosts, voices, music and graphics are original. Fair Play Points have no monetary value. Sources: WADA • NADA India.
      </footer>
    </div>
  );
}
