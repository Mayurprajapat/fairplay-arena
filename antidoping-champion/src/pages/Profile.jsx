import ProfileCard from "../components/ProfileCard";
import { BadgeGrid } from "../components/Achievement";
import { ACHIEVEMENTS } from "../utils/achievements";

// Profile dashboard page
export default function Profile({ save, go, resetAll }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display font-black text-3xl gold-text text-center">👤 MY PROFILE</h1>
      <div className="mt-5">
        <ProfileCard save={save} />
      </div>
      <div className="glass rounded-3xl p-5 mt-4">
        <h2 className="font-display font-bold tracking-widest text-amber-200">🏅 ACHIEVEMENTS ({(save.achievements || []).length}/{ACHIEVEMENTS.length})</h2>
        <div className="mt-3"><BadgeGrid ownedIds={save.achievements} /></div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        <button onClick={() => go("store")} className="btn-show flex-1 min-w-36 bg-gradient-to-r from-amber-300 to-orange-500 text-black font-bold rounded-xl py-3">🏆 REWARD STORE</button>
        <button onClick={() => go("intro")} className="btn-show flex-1 min-w-36 glass rounded-xl py-3 font-bold">▶ PLAY AGAIN</button>
        <button onClick={() => { if (window.confirm("Reset all progress, points and rewards?")) resetAll(); }} className="btn-show glass rounded-xl px-5 py-3 font-bold text-xs text-slate-400">Reset progress</button>
      </div>
    </div>
  );
}
