import { motion } from "framer-motion";
import { fmt } from "../utils/points";

// Reward store card with redeem / locked states
export default function RewardCard({ reward, owned, affordable, onRedeem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className={`glass rounded-3xl p-5 flex flex-col items-center text-center relative overflow-hidden ${
        owned ? "border-emerald-300/60" : !affordable ? "opacity-90" : "hover:border-amber-300/70"
      }`}
    >
      {owned && (
        <span className="absolute top-3 right-3 text-[10px] font-bold bg-emerald-400 text-black rounded-full px-2 py-0.5">
          OWNED
        </span>
      )}
      <div className="text-6xl">{reward.icon}</div>
      <h3 className="font-display font-bold mt-2">{reward.name}</h3>
      <p className="text-xs text-slate-300 mt-1 min-h-10">{reward.blurb}</p>
      <div className="font-display font-bold gold-text text-xl mt-2">⭐ {fmt(reward.cost)} FPP</div>
      {!owned && (
        <button
          disabled={!affordable}
          onClick={onRedeem}
          className={`mt-3 w-full rounded-xl py-2.5 font-bold btn-show ${
            affordable
              ? "bg-gradient-to-r from-amber-300 to-orange-500 text-black"
              : "bg-white/10 text-slate-400 cursor-not-allowed"
          }`}
        >
          {affordable ? "REDEEM" : "🔒 NOT ENOUGH POINTS"}
        </button>
      )}
      {owned && <div className="mt-3 text-emerald-300 font-bold text-sm">✓ In My Rewards</div>}
    </motion.div>
  );
}
