import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RewardCard from "../components/RewardCard";
import PointsDisplay from "../components/PointsDisplay";
import Confetti from "../components/Confetti";
import { REWARDS } from "../data/rewards";
import { fmt } from "../utils/points";
import { sfx } from "../utils/sounds";

// Fair Play Reward Store + My Rewards + certificate
export default function RewardStore({ save, redeem, go }) {
  const [confirm, setConfirm] = useState(null);
  const [burst, setBurst] = useState(0);
  const [showCert, setShowCert] = useState(false);
  const owned = new Set(save.rewards || []);

  const doRedeem = () => {
    if (!confirm) return;
    redeem(confirm.id);
    setConfirm(null);
    setBurst((b) => b + 1);
    sfx.redeem();
  };

  const certOwned = owned.has("certificate");
  const lastAcc = save.lastAccuracy ?? null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Confetti burst={burst} />
      <div className="text-center">
        <h1 className="font-display font-black text-3xl md:text-4xl gold-text">🏆 FAIR PLAY REWARD STORE</h1>
        <p className="text-sm text-slate-300 mt-1">Virtual rewards only — no monetary value. Spend the FPP you earned by learning!</p>
        <div className="inline-flex items-center gap-3 glass rounded-full px-5 py-2 mt-3">
          <span className="text-xs font-bold tracking-widest text-slate-400">BALANCE</span>
          <PointsDisplay value={save.fpp} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {REWARDS.map((r) => (
          <RewardCard
            key={r.id}
            reward={r}
            owned={owned.has(r.id)}
            affordable={save.fpp >= r.cost}
            onRedeem={() => { sfx.select(); setConfirm(r); }}
          />
        ))}
      </div>

      {/* MY REWARDS */}
      <div className="glass rounded-3xl p-5 md:p-7 mt-8">
        <h2 className="font-display font-bold text-xl tracking-widest gold-text text-center">🎁 MY REWARDS</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-4 text-sm">
          {REWARDS.map((r) => {
            const has = owned.has(r.id);
            return (
              <div key={r.id} className={`rounded-2xl border px-3 py-2.5 flex items-center gap-2 ${has ? "border-emerald-300/60 bg-emerald-400/10" : "border-white/10 bg-white/5 opacity-50"}`}>
                <span className="text-2xl">{has ? r.icon : "🔒"}</span>
                <span>
                  <span className="block font-bold text-xs">{r.name}</span>
                  <span className={`block text-[10px] font-bold ${has ? "text-emerald-300" : "text-slate-400"}`}>
                    {has ? "UNLOCKED" : `LOCKED • ${fmt(r.cost)} FPP`}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
        {certOwned && (
          <button onClick={() => setShowCert(true)} className="btn-show mt-4 w-full bg-gradient-to-r from-amber-300 to-orange-500 text-black font-bold rounded-xl py-3">
            🎓 VIEW MY DIGITAL CERTIFICATE
          </button>
        )}
        <button onClick={() => go("profile")} className="btn-show mt-2 w-full glass rounded-xl py-3 font-bold">
          👤 GO TO MY PROFILE
        </button>
      </div>

      {/* REDEEM CONFIRM */}
      <AnimatePresence>
        {confirm && (
          <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass gold-frame rounded-3xl p-6 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {save.fpp >= confirm.cost ? (
                <>
                  <div className="text-5xl">{confirm.icon}</div>
                  <h3 className="font-display font-bold mt-2">Redeem “{confirm.name}” for {fmt(confirm.cost)} FPP?</h3>
                  <div className="grid gap-1.5 mt-4 text-sm">
                    <div className="flex justify-between bg-white/5 rounded-xl px-4 py-2"><span>Current Balance</span><b>{fmt(save.fpp)} FPP</b></div>
                    <div className="flex justify-between bg-white/5 rounded-xl px-4 py-2"><span>Reward Cost</span><b>{fmt(confirm.cost)} FPP</b></div>
                    <div className="flex justify-between bg-emerald-400/10 border border-emerald-300/40 rounded-xl px-4 py-2"><span>Remaining Balance</span><b>{fmt(save.fpp - confirm.cost)} FPP</b></div>
                  </div>
                  <button onClick={doRedeem} className="btn-show mt-4 w-full bg-gradient-to-r from-emerald-400 to-sky-500 text-black font-bold rounded-xl py-3">CONFIRM REDEMPTION</button>
                  <button onClick={() => setConfirm(null)} className="mt-2 w-full glass rounded-xl py-2.5 font-bold text-sm">CANCEL</button>
                </>
              ) : (
                <>
                  <div className="text-5xl">🔒</div>
                  <h3 className="font-display font-bold mt-2">NOT ENOUGH POINTS</h3>
                  <p className="text-sm text-slate-300 mt-2">
                    You have <b>{fmt(save.fpp)} FPP</b>.<br />
                    This reward requires <b>{fmt(confirm.cost)} FPP</b>.<br />
                    Earn <b className="text-amber-300">{fmt(confirm.cost - save.fpp)} more FPP</b> to unlock it.
                  </p>
                  <button onClick={() => { setConfirm(null); go("intro"); }} className="btn-show mt-4 w-full bg-gradient-to-r from-amber-300 to-orange-500 text-black font-bold rounded-xl py-3">▶ PLAY & EARN</button>
                  <button onClick={() => setConfirm(null)} className="mt-2 w-full glass rounded-xl py-2.5 font-bold text-sm">CANCEL</button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CERTIFICATE */}
      <AnimatePresence>
        {showCert && (
          <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowCert(false)}>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-gradient-to-b from-[#fffdf4] to-white text-slate-900 rounded-3xl p-8 max-w-xl w-full text-center border-8 border-double border-amber-500"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] tracking-[0.35em] font-bold text-slate-500">ANTI-DOPING CHAMPION • FAIR PLAY ACADEMY</div>
              <div className="font-display font-black text-3xl mt-2">🎓 Fair Play Awareness Champion</div>
              <div className="text-sm text-slate-500 mt-1">This certifies that</div>
              <div className="font-display font-black text-2xl text-emerald-700">{save.name || "Guest Champion"}</div>
              <div className="text-sm text-slate-600 mt-2">completed the Anti-Doping Champion challenge covering WADA Code, Prohibited List, TUE, Testing & Fair Play</div>
              <div className="grid grid-cols-3 gap-2 mt-5 text-xs font-bold text-slate-600">
                <div>⭐ {fmt(save.fpp)} FPP<br />TOTAL POINTS</div>
                <div>🎯 {lastAcc ?? "—"}%<br />ACCURACY</div>
                <div>📅 {new Date().toLocaleDateString("en-IN")}<br />DATE</div>
              </div>
              <div className="mt-4 text-slate-700 font-bold text-sm border-t border-dashed border-slate-300 pt-3">🙏 Fair Play Oath: I will compete clean, respect rivals & never dope.</div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => window.print()} className="flex-1 bg-black text-white rounded-xl py-2.5 font-bold text-sm">🖨️ Print / PDF</button>
                <button onClick={() => setShowCert(false)} className="flex-1 border border-slate-300 rounded-xl py-2.5 font-bold text-sm">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
